import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const createRemix = mutation({
  args: {
    ideaId: v.id("ideas"),
    author: v.string(),
    content: v.string(),
    type: v.union(v.literal("addition"), v.literal("edit"), v.literal("comment")),
    authorFid: v.optional(v.number()),
    authorAvatar: v.optional(v.string()),
    authorDisplayName: v.optional(v.string()),
    authorUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");

    const remixId = await ctx.db.insert("remixes", {
      ideaId: args.ideaId,
      author: args.author,
      authorFid: args.authorFid,
      authorAvatar: args.authorAvatar,
      authorDisplayName: args.authorDisplayName,
      authorUsername: args.authorUsername,
      content: args.content,
      type: args.type,
      timestamp: Date.now(),
      upvotes: 0,
    });
    await ctx.db.patch(args.ideaId, { remixCount: (idea.remixCount ?? 0) + 1 });
    return remixId;
  },
});

export const deleteRemix = mutation({
  args: {
    remixId: v.id("remixes"),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const remix = await ctx.db.get(args.remixId);
    if (!remix) throw new ConvexError("Remix not found");
    if (remix.author.toLowerCase() !== args.author.toLowerCase()) throw new ConvexError("Only the author can delete their remix");

    const attestationUid = remix.attestationUid ?? null;

    const upvotes = await ctx.db
      .query("remixUpvotes")
      .withIndex("by_remix", (q) => q.eq("remixId", args.remixId))
      .collect();
    for (const upvote of upvotes) {
      await ctx.db.delete(upvote._id);
    }
    await ctx.db.delete(args.remixId);

    const idea = await ctx.db.get(remix.ideaId);
    if (idea) {
      await ctx.db.patch(remix.ideaId, { remixCount: Math.max(0, (idea.remixCount ?? 0) - 1) });
    }

    return attestationUid;
  },
});

export const updateRemixAttestation = mutation({
  args: {
    remixId: v.id("remixes"),
    attestationUid: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.remixId, { attestationUid: args.attestationUid });
  },
});

export const getRemixesForIdea = query({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("remixes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    return results
      .map(({ _creationTime, ...r }) => ({ ...r, upvotes: r.upvotes ?? 0 }))
      .sort((a, b) => b.upvotes - a.upvotes || b.timestamp - a.timestamp);
  },
});

export const upvoteRemix = mutation({
  args: {
    remixId: v.id("remixes"),
    voter: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("remixUpvotes")
      .withIndex("by_remix_voter", (q) => q.eq("remixId", args.remixId).eq("voter", args.voter))
      .first();
    if (existing) throw new ConvexError("Already upvoted this remix");

    await ctx.db.insert("remixUpvotes", {
      remixId: args.remixId,
      voter: args.voter,
      timestamp: Date.now(),
    });
    const remix = await ctx.db.get(args.remixId);
    if (remix) await ctx.db.patch(args.remixId, { upvotes: (remix.upvotes ?? 0) + 1 });
  },
});

export const removeRemixUpvote = mutation({
  args: {
    remixId: v.id("remixes"),
    voter: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("remixUpvotes")
      .withIndex("by_remix_voter", (q) => q.eq("remixId", args.remixId).eq("voter", args.voter))
      .first();
    if (!existing) throw new ConvexError("No upvote found");

    await ctx.db.delete(existing._id);
    const remix = await ctx.db.get(args.remixId);
    if (remix) await ctx.db.patch(args.remixId, { upvotes: Math.max(0, (remix.upvotes ?? 0) - 1) });
  },
});

export const hasUserUpvotedRemix = query({
  args: {
    remixId: v.id("remixes"),
    voter: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("remixUpvotes")
      .withIndex("by_remix_voter", (q) => q.eq("remixId", args.remixId).eq("voter", args.voter))
      .first();
    return existing !== null;
  },
});
