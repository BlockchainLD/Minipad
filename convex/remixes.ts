import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { remixType } from "./types";

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
  returns: v.id("remixes"),
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");

    return await ctx.db.insert("remixes", {
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
  },
});

export const deleteRemix = mutation({
  args: {
    remixId: v.id("remixes"),
    author: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const remix = await ctx.db.get(args.remixId);
    if (!remix) throw new Error("Remix not found");
    if (remix.author !== args.author) throw new Error("Only the author can delete their remix");

    const upvotes = await ctx.db
      .query("remixUpvotes")
      .withIndex("by_remix", (q) => q.eq("remixId", args.remixId))
      .collect();
    for (const upvote of upvotes) {
      await ctx.db.delete(upvote._id);
    }
    await ctx.db.delete(args.remixId);
    return null;
  },
});

export const getRemixesForIdea = query({
  args: {
    ideaId: v.id("ideas"),
  },
  returns: v.array(remixType),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("remixes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    return results.sort((a, b) => b.timestamp - a.timestamp);
  },
});

export const upvoteRemix = mutation({
  args: {
    remixId: v.id("remixes"),
    voter: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("remixUpvotes")
      .withIndex("by_remix_voter", (q) => q.eq("remixId", args.remixId).eq("voter", args.voter))
      .first();
    if (existing) throw new Error("Already upvoted this remix");

    await ctx.db.insert("remixUpvotes", {
      remixId: args.remixId,
      voter: args.voter,
      timestamp: Date.now(),
    });
    const remix = await ctx.db.get(args.remixId);
    if (remix) await ctx.db.patch(args.remixId, { upvotes: remix.upvotes + 1 });
    return null;
  },
});

export const removeRemixUpvote = mutation({
  args: {
    remixId: v.id("remixes"),
    voter: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("remixUpvotes")
      .withIndex("by_remix_voter", (q) => q.eq("remixId", args.remixId).eq("voter", args.voter))
      .first();
    if (!existing) throw new Error("No upvote found");

    await ctx.db.delete(existing._id);
    const remix = await ctx.db.get(args.remixId);
    if (remix) await ctx.db.patch(args.remixId, { upvotes: Math.max(0, remix.upvotes - 1) });
    return null;
  },
});

export const hasUserUpvotedRemix = query({
  args: {
    remixId: v.id("remixes"),
    voter: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("remixUpvotes")
      .withIndex("by_remix_voter", (q) => q.eq("remixId", args.remixId).eq("voter", args.voter))
      .first();
    return existing !== null;
  },
});
