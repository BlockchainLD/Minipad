import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const claimIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
    attestationUid: v.optional(v.string()),
    claimerFid: v.optional(v.number()),
    claimerAvatar: v.optional(v.string()),
    claimerDisplayName: v.optional(v.string()),
    claimerUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");
    if (idea.status !== "open") throw new ConvexError("Idea is not available for claiming");

    await ctx.db.insert("claims", {
      ideaId: args.ideaId,
      claimer: args.claimer,
      attestationUid: args.attestationUid,
      timestamp: Date.now(),
      status: "claimed",
    });

    await ctx.db.patch(args.ideaId, {
      status: "claimed",
      claimedBy: args.claimer,
      claimedByFid: args.claimerFid,
      claimedByAvatar: args.claimerAvatar,
      claimedByDisplayName: args.claimerDisplayName,
      claimedByUsername: args.claimerUsername,
      claimedAt: Date.now(),
    });
  },
});

export const completeIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
    githubUrl: v.string(),
    deploymentUrl: v.string(),
    attestationUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");
    if (idea.status !== "claimed" || idea.claimedBy !== args.claimer) {
      throw new ConvexError("Idea is not claimed by this user");
    }

    await ctx.db.patch(args.ideaId, {
      status: "completed",
      githubUrl: args.githubUrl,
      deploymentUrl: args.deploymentUrl,
      completedAt: Date.now(),
      completionAttestationUid: args.attestationUid,
    });
  },
});

export const unclaimIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");
    if (idea.status !== "claimed" || idea.claimedBy !== args.claimer) {
      throw new ConvexError("Idea is not claimed by this user");
    }

    const claim = await ctx.db
      .query("claims")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .filter((q) => q.eq(q.field("claimer"), args.claimer))
      .first();

    let attestationUid: string | null = null;
    if (claim) {
      attestationUid = claim.attestationUid ?? null;
      await ctx.db.delete(claim._id);
    }

    await ctx.db.patch(args.ideaId, {
      status: "open",
      claimedBy: undefined,
      claimedByFid: undefined,
      claimedByAvatar: undefined,
      claimedByDisplayName: undefined,
      claimedByUsername: undefined,
      claimedAt: undefined,
    });

    return attestationUid;
  },
});
