import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a remix of an existing idea
export const createRemix = mutation({
  args: {
    originalIdeaId: v.id("ideas"),
    remixer: v.string(), // wallet address
    title: v.string(),
    description: v.string(),
    attestationUid: v.optional(v.string()),
    // Farcaster profile data for the remix author
    authorFid: v.optional(v.number()),
    authorAvatar: v.optional(v.string()),
    authorDisplayName: v.optional(v.string()),
    authorUsername: v.optional(v.string()),
  },
  returns: v.id("ideas"),
  handler: async (ctx, args) => {
    try {
      // Get the original idea
      const originalIdea = await ctx.db.get(args.originalIdeaId);
      if (!originalIdea) {
        throw new Error("Original idea not found");
      }

      // Create the remix idea
      const remixId = await ctx.db.insert("ideas", {
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
        status: "open" as const,
        isRemix: true,
        originalIdeaId: args.originalIdeaId,
        remixAttestationUid: args.attestationUid,
      });

      return remixId;
    } catch (error) {
      console.error("Error in createRemix:", error);
      throw error;
    }
  },
});


// Delete a remix (only by the author)
export const deleteRemix = mutation({
  args: {
    remixId: v.id("ideas"),
    author: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const remix = await ctx.db.get(args.remixId);
      if (!remix) {
        throw new Error("Remix not found");
      }
      
      if (remix.author !== args.author) {
        throw new Error("Only the author can delete their remix");
      }
      
      if (!remix.isRemix) {
        throw new Error("This is not a remix");
      }
      
      // Delete all related upvotes first
      const upvotes = await ctx.db
        .query("upvotes")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.remixId))
        .collect();
      
      for (const upvote of upvotes) {
        await ctx.db.delete(upvote._id);
      }
      
      // Delete all related claims
      const claims = await ctx.db
        .query("claims")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.remixId))
        .collect();
      
      for (const claim of claims) {
        await ctx.db.delete(claim._id);
      }
      
      // Finally delete the remix
      await ctx.db.delete(args.remixId);
    } catch (error) {
      console.error("Error in deleteRemix:", error);
      throw error;
    }
  },
});

// Get remixes for a specific idea
export const getRemixesForIdea = query({
  args: {
    originalIdeaId: v.id("ideas"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    try {
      const remixes = await ctx.db
        .query("ideas")
        .withIndex("by_original_idea", (q) => q.eq("originalIdeaId", args.originalIdeaId))
        .filter((q) => q.eq(q.field("isRemix"), true))
        .collect();
      
      return remixes;
    } catch (error) {
      console.error("Error in getRemixesForIdea:", error);
      return [];
    }
  },
});
