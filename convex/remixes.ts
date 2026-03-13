import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ideaType } from "./types";

export const createRemix = mutation({
  args: {
    originalIdeaId: v.id("ideas"),
    remixer: v.string(),
    title: v.string(),
    description: v.string(),
    attestationUid: v.optional(v.string()),
    authorFid: v.optional(v.number()),
    authorAvatar: v.optional(v.string()),
    authorDisplayName: v.optional(v.string()),
    authorUsername: v.optional(v.string()),
  },
  returns: v.id("ideas"),
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.originalIdeaId);
    if (!original) throw new Error("Original idea not found");

    return await ctx.db.insert("ideas", {
      title: args.title,
      description: args.description,
      author: args.remixer,
      authorFid: args.authorFid,
      authorAvatar: args.authorAvatar,
      authorDisplayName: args.authorDisplayName,
      authorUsername: args.authorUsername,
      attestationUid: args.attestationUid,
      timestamp: Date.now(),
      upvotes: 0,
      status: "open",
      isRemix: true,
      originalIdeaId: args.originalIdeaId,
      remixAttestationUid: args.attestationUid,
    });
  },
});

export const deleteRemix = mutation({
  args: {
    remixId: v.id("ideas"),
    author: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const remix = await ctx.db.get(args.remixId);
    if (!remix) throw new Error("Remix not found");
    if (remix.author !== args.author) throw new Error("Only the author can delete their remix");
    if (!remix.isRemix) throw new Error("This is not a remix");

    const upvotes = await ctx.db
      .query("upvotes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.remixId))
      .collect();
    for (const upvote of upvotes) {
      await ctx.db.delete(upvote._id);
    }

    await ctx.db.delete(args.remixId);
  },
});

export const updateRemixAttestation = mutation({
  args: {
    remixId: v.id("ideas"),
    attestationUid: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const remix = await ctx.db.get(args.remixId);
    if (!remix || !remix.isRemix) throw new Error("Remix not found");
    await ctx.db.patch(args.remixId, {
      attestationUid: args.attestationUid,
      remixAttestationUid: args.attestationUid,
    });
  },
});

export const getRemixesForIdea = query({
  args: {
    originalIdeaId: v.id("ideas"),
  },
  returns: v.array(ideaType),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("ideas")
      .withIndex("by_original_idea", (q) => q.eq("originalIdeaId", args.originalIdeaId))
      .collect();
    return results
      .filter(idea => idea.isRemix)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
});
