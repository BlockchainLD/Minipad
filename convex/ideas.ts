import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit a new idea
export const submitIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    author: v.string(),
    authorFid: v.optional(v.string()),
    attestationUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ideaId = await ctx.db.insert("ideas", {
      title: args.title,
      description: args.description,
      author: args.author,
      authorFid: args.authorFid,
      attestationUid: args.attestationUid,
      timestamp: Date.now(),
      upvotes: 0,
      status: "open",
    });
    return ideaId;
  },
});

// Get all ideas with pagination
export const getIdeas = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("open"), v.literal("claimed"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    if (args.status) {
      const ideas = await ctx.db
        .query("ideas")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
      return ideas;
    } else {
      const ideas = await ctx.db
        .query("ideas")
        .order("desc")
        .take(limit);
      return ideas;
    }
  },
});

// Get ideas sorted by upvotes
export const getTopIdeas = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_upvotes")
      .order("desc")
      .take(limit);
    
    return ideas;
  },
});

// Get a specific idea
export const getIdea = query({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ideaId);
  },
});

// Update idea with attestation UID
export const updateIdeaAttestation = mutation({
  args: {
    ideaId: v.id("ideas"),
    attestationUid: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ideaId, {
      attestationUid: args.attestationUid,
    });
  },
});

