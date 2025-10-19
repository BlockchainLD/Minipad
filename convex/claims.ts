import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// MINIMAL: Claim an idea as in progress
export const claimIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
    attestationUid: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const idea = await ctx.db.get(args.ideaId);
      if (!idea) {
        throw new Error("Idea not found");
      }
      
      if (idea.status !== "open") {
        throw new Error("Idea is not available for claiming");
      }

      // Create claim record
      await ctx.db.insert("claims", {
        ideaId: args.ideaId,
        claimer: args.claimer,
        attestationUid: args.attestationUid,
        timestamp: Date.now(),
        status: "claimed",
      });

      // Update idea status
      await ctx.db.patch(args.ideaId, {
        status: "claimed",
        claimedBy: args.claimer,
        claimedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error in claimIdea:", error);
      throw error;
    }
  },
});

// MINIMAL: Complete a claimed idea
export const completeIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
    miniappUrl: v.string(),
    attestationUid: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const idea = await ctx.db.get(args.ideaId);
      if (!idea) {
        throw new Error("Idea not found");
      }
      
      if (idea.status !== "claimed" || idea.claimedBy !== args.claimer) {
        throw new Error("Idea is not claimed by this user");
      }

      // Update idea status
      await ctx.db.patch(args.ideaId, {
        status: "completed",
        miniappUrl: args.miniappUrl,
        completedAt: Date.now(),
        completionAttestationUid: args.attestationUid,
      });
    } catch (error) {
      console.error("Error in completeIdea:", error);
      throw error;
    }
  },
});

// Unclaim an idea (only by the claimer)
export const unclaimIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
  },
  returns: v.union(v.string(), v.null()), // Return attestation UID if found
  handler: async (ctx, args) => {
    try {
      const idea = await ctx.db.get(args.ideaId);
      if (!idea) {
        throw new Error("Idea not found");
      }
      
      if (idea.status !== "claimed" || idea.claimedBy !== args.claimer) {
        throw new Error("Idea is not claimed by this user");
      }

      // Find and delete the claim record
      const claim = await ctx.db
        .query("claims")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
        .filter((q) => q.eq(q.field("claimer"), args.claimer))
        .first();
      
      let attestationUid = null;
      if (claim) {
        attestationUid = claim.attestationUid;
        await ctx.db.delete(claim._id);
      }

      // Update idea status back to open
      await ctx.db.patch(args.ideaId, {
        status: "open",
        claimedBy: undefined,
        claimedAt: undefined,
      });

      return attestationUid;
    } catch (error) {
      console.error("Error in unclaimIdea:", error);
      throw error;
    }
  },
});

