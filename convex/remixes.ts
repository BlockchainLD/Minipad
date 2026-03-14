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
    await ctx.db.delete(args.remixId);
    return null;
  },
});

export const getRemixesForIdea = query({
  args: { ideaId: v.id("ideas") },
  returns: v.array(remixType),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("remixes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    return results.sort((a, b) => b.timestamp - a.timestamp);
  },
});
