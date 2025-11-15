import { query } from "./_generated/server";
import { v } from "convex/values";
import { ideaType } from "./types";

// Get ideas submitted by a user
export const getUserSubmittedIdeas = query({
  args: {
    author: v.string(),
  },
  returns: v.array(ideaType),
  handler: async (ctx, args) => {
    try {
      const ideas = await ctx.db
        .query("ideas")
        .withIndex("by_author", (q) => q.eq("author", args.author))
        .filter((q) => q.eq(q.field("isRemix"), false)) // Only non-remix ideas
        .collect();
      
      return ideas.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error in getUserSubmittedIdeas:", error);
      return [];
    }
  },
});

// Get ideas claimed by a user
export const getUserClaimedIdeas = query({
  args: {
    claimer: v.string(),
  },
  returns: v.array(ideaType),
  handler: async (ctx, args) => {
    try {
      // Get all claims by this user
      const claims = await ctx.db
        .query("claims")
        .withIndex("by_claimer", (q) => q.eq("claimer", args.claimer))
        .collect();
      
      // Get the ideas for these claims
      const ideas = await Promise.all(
        claims.map(async (claim) => {
          const idea = await ctx.db.get(claim.ideaId);
          return idea;
        })
      );
      
      // Filter out nulls and sort by timestamp
      return ideas
        .filter((idea) => idea !== null)
        .sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));
    } catch (error) {
      console.error("Error in getUserClaimedIdeas:", error);
      return [];
    }
  },
});

// Get ideas completed/deployed by a user
export const getUserCompletedIdeas = query({
  args: {
    claimer: v.string(),
  },
  returns: v.array(ideaType),
  handler: async (ctx, args) => {
    try {
      // Get all claims by this user that are completed
      const claims = await ctx.db
        .query("claims")
        .withIndex("by_claimer", (q) => q.eq("claimer", args.claimer))
        .filter((q) => q.eq(q.field("status"), "completed"))
        .collect();
      
      // Get the ideas for these claims
      const ideas = await Promise.all(
        claims.map(async (claim) => {
          const idea = await ctx.db.get(claim.ideaId);
          return idea;
        })
      );
      
      // Filter out nulls and sort by completedAt or timestamp
      return ideas
        .filter((idea) => idea !== null)
        .sort((a, b) => {
          const aTime = a?.completedAt || a?.timestamp || 0;
          const bTime = b?.completedAt || b?.timestamp || 0;
          return bTime - aTime;
        });
    } catch (error) {
      console.error("Error in getUserCompletedIdeas:", error);
      return [];
    }
  },
});

