import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { ADMIN_ADDRESS } from "./constants";

export const submitIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    author: v.string(),
    authorFid: v.optional(v.number()),
    authorAvatar: v.optional(v.string()),
    authorDisplayName: v.optional(v.string()),
    authorUsername: v.optional(v.string()),
    attestationUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ideas", {
      title: args.title,
      description: args.description,
      author: args.author,
      authorFid: args.authorFid,
      authorAvatar: args.authorAvatar,
      authorDisplayName: args.authorDisplayName,
      authorUsername: args.authorUsername,
      attestationUid: args.attestationUid,
      timestamp: Date.now(),
      upvotes: 0,
      status: "open",
    });
  },
});

export const getIdeas = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const ideas = await ctx.db.query("ideas").order("desc").take(limit);
    return ideas.map(({ _creationTime, ...idea }) => ({
      ...idea,
      upvotes: idea.upvotes ?? 0,
      remixCount: idea.remixCount ?? 0,
    }));
  },
});

export const updateIdeaAttestation = mutation({
  args: {
    ideaId: v.id("ideas"),
    attestationUid: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ideaId, { attestationUid: args.attestationUid });
  },
});

// Builder rename: only the claimer of a completed idea can edit its title.
export const updateIdeaTitle = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");
    if (idea.status !== "completed" || idea.claimedBy !== args.claimer) {
      throw new ConvexError("Only the builder can rename their completed build");
    }
    const trimmed = args.title.trim();
    if (!trimmed) throw new ConvexError("Title cannot be empty");
    await ctx.db.patch(args.ideaId, { title: trimmed });
  },
});

export const deleteIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");
    if (idea.author !== args.author) throw new ConvexError("Only the author can delete their idea");
    if (idea.status !== "open") throw new ConvexError("Cannot delete a claimed or completed idea");

    const upvotes = await ctx.db
      .query("upvotes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    for (const upvote of upvotes) {
      await ctx.db.delete(upvote._id);
    }

    const claims = await ctx.db
      .query("claims")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    for (const claim of claims) {
      await ctx.db.delete(claim._id);
    }

    const remixes = await ctx.db
      .query("remixes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    for (const remix of remixes) {
      const remixUpvotes = await ctx.db
        .query("remixUpvotes")
        .withIndex("by_remix", (q) => q.eq("remixId", remix._id))
        .collect();
      for (const upvote of remixUpvotes) {
        await ctx.db.delete(upvote._id);
      }
      await ctx.db.delete(remix._id);
    }

    await ctx.db.delete(args.ideaId);
  },
});

export const adminDeleteAllIdeas = mutation({
  args: { adminAddress: v.string() },
  handler: async (ctx, args) => {
    if (args.adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase())
      throw new ConvexError("Unauthorized");

    for (const u of await ctx.db.query("upvotes").collect()) await ctx.db.delete(u._id);
    for (const ru of await ctx.db.query("remixUpvotes").collect()) await ctx.db.delete(ru._id);
    for (const r of await ctx.db.query("remixes").collect()) await ctx.db.delete(r._id);
    for (const c of await ctx.db.query("claims").collect()) await ctx.db.delete(c._id);
    for (const e of await ctx.db.query("buildEndorsements").collect()) await ctx.db.delete(e._id);
    for (const i of await ctx.db.query("ideas").collect()) await ctx.db.delete(i._id);
  },
});
