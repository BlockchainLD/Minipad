import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a remix of an idea
export const createRemix = mutation({
  args: {
    originalIdeaId: v.id("ideas"),
    remixIdeaId: v.id("ideas"),
    remixer: v.string(),
    remixerFid: v.optional(v.string()),
    attestationUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify both ideas exist
    const originalIdea = await ctx.db.get(args.originalIdeaId);
    const remixIdea = await ctx.db.get(args.remixIdeaId);
    
    if (!originalIdea || !remixIdea) {
      throw new Error("One or both ideas not found");
    }
    
    // Create remix relationship
    await ctx.db.insert("remixes", {
      originalIdeaId: args.originalIdeaId,
      remixIdeaId: args.remixIdeaId,
      remixer: args.remixer,
      remixerFid: args.remixerFid,
      attestationUid: args.attestationUid,
      timestamp: Date.now(),
    });
  },
});

// Get remixes of an idea
export const getRemixesForIdea = query({
  args: {
    originalIdeaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const remixes = await ctx.db
      .query("remixes")
      .withIndex("by_original", (q) => q.eq("originalIdeaId", args.originalIdeaId))
      .collect();
    
    // Get the actual remix ideas
    const remixIdeas = await Promise.all(
      remixes.map(async (remix) => {
        const idea = await ctx.db.get(remix.remixIdeaId);
        return {
          ...remix,
          remixIdea: idea,
        };
      })
    );
    
    return remixIdeas;
  },
});

// Get ideas that are remixes of a specific idea
export const getIdeasRemixedFrom = query({
  args: {
    originalIdeaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const remixes = await ctx.db
      .query("remixes")
      .withIndex("by_original", (q) => q.eq("originalIdeaId", args.originalIdeaId))
      .collect();
    
    const remixIdeas = await Promise.all(
      remixes.map(async (remix) => {
        return await ctx.db.get(remix.remixIdeaId);
      })
    );
    
    return remixIdeas.filter(Boolean);
  },
});

