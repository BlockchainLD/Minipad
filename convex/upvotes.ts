import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upvote an idea
export const upvoteIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    voter: v.string(),
    voterFid: v.optional(v.string()),
    attestationUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already upvoted this idea
    const existingUpvote = await ctx.db
      .query("upvotes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .filter((q) => q.eq(q.field("voter"), args.voter))
      .first();
    
    if (existingUpvote) {
      throw new Error("User has already upvoted this idea");
    }
    
    // Add upvote
    await ctx.db.insert("upvotes", {
      ideaId: args.ideaId,
      voter: args.voter,
      voterFid: args.voterFid,
      attestationUid: args.attestationUid,
      timestamp: Date.now(),
    });
    
    // Update idea upvote count
    const idea = await ctx.db.get(args.ideaId);
    if (idea) {
      await ctx.db.patch(args.ideaId, {
        upvotes: idea.upvotes + 1,
      });
    }
  },
});

// Remove upvote
export const removeUpvote = mutation({
  args: {
    ideaId: v.id("ideas"),
    voter: v.string(),
  },
  handler: async (ctx, args) => {
    const upvote = await ctx.db
      .query("upvotes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .filter((q) => q.eq(q.field("voter"), args.voter))
      .first();
    
    if (upvote) {
      await ctx.db.delete(upvote._id);
      
      // Update idea upvote count
      const idea = await ctx.db.get(args.ideaId);
      if (idea) {
        await ctx.db.patch(args.ideaId, {
          upvotes: Math.max(0, idea.upvotes - 1),
        });
      }
    }
  },
});

// Check if user has upvoted an idea
export const hasUserUpvoted = query({
  args: {
    ideaId: v.id("ideas"),
    voter: v.string(),
  },
  handler: async (ctx, args) => {
    const upvote = await ctx.db
      .query("upvotes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .filter((q) => q.eq(q.field("voter"), args.voter))
      .first();
    
    return !!upvote;
  },
});

// Get upvotes for an idea
export const getUpvotesForIdea = query({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const upvotes = await ctx.db
      .query("upvotes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    
    return upvotes;
  },
});

