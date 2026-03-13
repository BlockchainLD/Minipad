import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const claimIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
    attestationUid: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.status !== "open") throw new Error("Idea is not available for claiming");

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
  returns: v.null(),
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.status !== "claimed" || idea.claimedBy !== args.claimer) {
      throw new Error("Idea is not claimed by this user");
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
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.status !== "claimed" || idea.claimedBy !== args.claimer) {
      throw new Error("Idea is not claimed by this user");
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
      claimedAt: undefined,
    });

    return attestationUid;
  },
});
