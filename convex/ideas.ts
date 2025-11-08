import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// MINIMAL: Submit a new idea
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
  returns: v.id("ideas"),
  handler: async (ctx, args) => {
    const ideaId = await ctx.db.insert("ideas", {
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
    return ideaId;
  },
});

// MINIMAL: Get all ideas (simple and safe)
export const getIdeas = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    try {
      const limit = args.limit ?? 20;
      const ideas = await ctx.db
        .query("ideas")
        .order("desc")
        .take(limit);
      
      // Filter out remixes - remixes should only appear in the remixes section of the original idea
      const filteredIdeas = ideas.filter(idea => {
        return !idea.isRemix; // Exclude remixes from main ideas list
      });
      
      return filteredIdeas;
    } catch (error) {
      console.error("Error in getIdeas:", error);
      return []; // Return empty array on error
    }
  },
});

// MINIMAL: Update idea with attestation UID
export const updateIdeaAttestation = mutation({
  args: {
    ideaId: v.id("ideas"),
    attestationUid: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.ideaId, {
        attestationUid: args.attestationUid,
      });
    } catch (error) {
      console.error("Error in updateIdeaAttestation:", error);
    }
  },
});

// Delete an idea (only by the author)
export const deleteIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    author: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const idea = await ctx.db.get(args.ideaId);
      if (!idea) {
        throw new Error("Idea not found");
      }
      
      if (idea.author !== args.author) {
        throw new Error("Only the author can delete their idea");
      }
      
      // Delete all related upvotes first
      const upvotes = await ctx.db
        .query("upvotes")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
        .collect();
      
      for (const upvote of upvotes) {
        await ctx.db.delete(upvote._id);
      }
      
      // Delete all related claims
      const claims = await ctx.db
        .query("claims")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
        .collect();
      
      for (const claim of claims) {
        await ctx.db.delete(claim._id);
      }
      
      // Finally delete the idea
      await ctx.db.delete(args.ideaId);
    } catch (error) {
      console.error("Error in deleteIdea:", error);
      throw error;
    }
  },
});
