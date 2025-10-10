import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// MINIMAL: Upvote an idea
export const upvoteIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    voter: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Verify the idea exists
      const targetIdea = await ctx.db.get(args.ideaId);
      if (!targetIdea) {
        throw new Error("Idea not found");
      }

      // Allow users to upvote their own ideas
      // if (targetIdea.author === args.voter) {
      //   throw new Error("Cannot upvote your own idea");
      // }

      // Check if user already upvoted
      const existingUpvote = await ctx.db
        .query("upvotes")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
        .filter((q) => q.eq(q.field("voter"), args.voter))
        .first();

      if (existingUpvote) {
        // User already upvoted, do nothing
        return;
      }

      // Create upvote record
      await ctx.db.insert("upvotes", {
        ideaId: args.ideaId,
        voter: args.voter,
        timestamp: Date.now(),
      });

      // Update idea upvote count
      await ctx.db.patch(args.ideaId, {
        upvotes: targetIdea.upvotes + 1,
      });
    } catch (error) {
      console.error("Error in upvoteIdea:", error);
      throw error;
    }
  },
});

// Remove an upvote from an idea
export const removeUpvote = mutation({
  args: {
    ideaId: v.id("ideas"),
    voter: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Verify the idea exists
      const targetIdea = await ctx.db.get(args.ideaId);
      if (!targetIdea) {
        throw new Error("Idea not found");
      }

      // Find the existing upvote
      const existingUpvote = await ctx.db
        .query("upvotes")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
        .filter((q) => q.eq(q.field("voter"), args.voter))
        .first();

      if (!existingUpvote) {
        // User hasn't upvoted, do nothing
        return;
      }

      // Remove the upvote record
      await ctx.db.delete(existingUpvote._id);

      // Update idea upvote count (ensure it doesn't go below 0)
      const newUpvoteCount = Math.max(0, targetIdea.upvotes - 1);
      await ctx.db.patch(args.ideaId, {
        upvotes: newUpvoteCount,
      });
    } catch (error) {
      console.error("Error in removeUpvote:", error);
      throw error;
    }
  },
});

// Check if a user has already upvoted an idea
export const hasUserUpvoted = query({
  args: {
    ideaId: v.id("ideas"),
    voter: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    try {
      const existingUpvote = await ctx.db
        .query("upvotes")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
        .filter((q) => q.eq(q.field("voter"), args.voter))
        .first();
      
      return !!existingUpvote;
    } catch (error) {
      console.error("Error in hasUserUpvoted:", error);
      return false;
    }
  },
});

// Get upvote count for an idea
export const getUpvoteCount = query({
  args: {
    ideaId: v.id("ideas"),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    try {
      const idea = await ctx.db.get(args.ideaId);
      return idea?.upvotes || 0;
    } catch (error) {
      console.error("Error in getUpvoteCount:", error);
      return 0;
    }
  },
});

