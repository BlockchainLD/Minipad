import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { createNotification } from "./notifyHelpers";

export const upvoteIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    voter: v.string(),
    voterFid: v.optional(v.number()),
    voterAvatar: v.optional(v.string()),
    voterDisplayName: v.optional(v.string()),
    voterUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");

    const existing = await ctx.db
      .query("upvotes")
      .withIndex("by_idea_voter", (q) => q.eq("ideaId", args.ideaId).eq("voter", args.voter))
      .first();

    if (existing) return;

    await ctx.db.insert("upvotes", {
      ideaId: args.ideaId,
      voter: args.voter,
      timestamp: Date.now(),
    });

    await ctx.db.patch(args.ideaId, { upvotes: (idea.upvotes ?? 0) + 1 });

    await createNotification(ctx, {
      recipient: idea.author,
      type: "like",
      ideaId: args.ideaId,
      ideaTitle: idea.title,
      actor: {
        address: args.voter,
        fid: args.voterFid,
        avatar: args.voterAvatar,
        displayName: args.voterDisplayName,
        username: args.voterUsername,
      },
    });
  },
});

export const removeUpvote = mutation({
  args: {
    ideaId: v.id("ideas"),
    voter: v.string(),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");

    const existing = await ctx.db
      .query("upvotes")
      .withIndex("by_idea_voter", (q) => q.eq("ideaId", args.ideaId).eq("voter", args.voter))
      .first();

    if (!existing) return;

    await ctx.db.delete(existing._id);
    await ctx.db.patch(args.ideaId, { upvotes: Math.max(0, (idea.upvotes ?? 0) - 1) });
  },
});

export const hasUserUpvoted = query({
  args: {
    ideaId: v.id("ideas"),
    voter: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("upvotes")
      .withIndex("by_idea_voter", (q) => q.eq("ideaId", args.ideaId).eq("voter", args.voter))
      .first();
    return !!existing;
  },
});
