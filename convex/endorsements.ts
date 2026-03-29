import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const endorseBuild = mutation({
  args: {
    ideaId: v.id("ideas"),
    endorser: v.string(),
    endorserFid: v.optional(v.number()),
    attestationUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");
    if (idea.status !== "completed") throw new ConvexError("Can only endorse completed builds");

    // Idempotency check — prevent duplicate endorsements
    const existing = await ctx.db
      .query("buildEndorsements")
      .withIndex("by_idea_endorser", (q) =>
        q.eq("ideaId", args.ideaId).eq("endorser", args.endorser)
      )
      .first();
    if (existing) throw new ConvexError("Already endorsed this build");

    await ctx.db.insert("buildEndorsements", {
      ideaId: args.ideaId,
      builderId: idea.claimedBy ?? "",
      endorser: args.endorser,
      endorserFid: args.endorserFid,
      attestationUid: args.attestationUid,
      timestamp: Date.now(),
    });
  },
});

export const removeEndorsement = mutation({
  args: {
    ideaId: v.id("ideas"),
    endorser: v.string(),
  },
  handler: async (ctx, args) => {
    const endorsement = await ctx.db
      .query("buildEndorsements")
      .withIndex("by_idea_endorser", (q) =>
        q.eq("ideaId", args.ideaId).eq("endorser", args.endorser)
      )
      .first();

    if (!endorsement) throw new ConvexError("Endorsement not found");

    const attestationUid = endorsement.attestationUid ?? null;
    await ctx.db.delete(endorsement._id);
    return attestationUid;
  },
});

export const hasUserEndorsedBuild = query({
  args: {
    ideaId: v.id("ideas"),
    endorser: v.string(),
  },
  handler: async (ctx, args) => {
    const endorsement = await ctx.db
      .query("buildEndorsements")
      .withIndex("by_idea_endorser", (q) =>
        q.eq("ideaId", args.ideaId).eq("endorser", args.endorser)
      )
      .first();
    return !!endorsement;
  },
});

export const getEndorsementCount = query({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const endorsements = await ctx.db
      .query("buildEndorsements")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    return endorsements.length;
  },
});

export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Fetch all endorsements
    const allEndorsements = await ctx.db.query("buildEndorsements").collect();

    // Group by builderId and count
    const builderCounts = new Map<string, number>();
    for (const endorsement of allEndorsements) {
      const count = builderCounts.get(endorsement.builderId) ?? 0;
      builderCounts.set(endorsement.builderId, count + 1);
    }

    // Sort by count descending and take top N
    const sorted = [...builderCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // Fetch builder metadata from their completed ideas (single query per builder)
    const leaderboard = await Promise.all(
      sorted.map(async ([builderId, endorsementCount]) => {
        const completedIdeas = await ctx.db
          .query("ideas")
          .withIndex("by_claimed_by", (q) => q.eq("claimedBy", builderId))
          .filter((q) => q.eq(q.field("status"), "completed"))
          .collect();

        const builderIdea = completedIdeas[0];
        return {
          builderId,
          endorsementCount,
          buildCount: completedIdeas.length,
          displayName: builderIdea?.claimedByDisplayName,
          username: builderIdea?.claimedByUsername,
          avatar: builderIdea?.claimedByAvatar,
          fid: builderIdea?.claimedByFid,
        };
      })
    );

    return leaderboard;
  },
});
