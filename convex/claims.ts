import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Claim an idea as in progress
export const claimIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
    claimerFid: v.optional(v.string()),
    attestationUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }
    
    if (idea.status !== "open") {
      throw new Error("Idea is not available for claiming");
    }
    
    // Create claim
    await ctx.db.insert("claims", {
      ideaId: args.ideaId,
      claimer: args.claimer,
      claimerFid: args.claimerFid,
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
  },
});

// Complete a claimed idea
export const completeIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    claimer: v.string(),
    miniappUrl: v.string(),
    completionAttestationUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }
    
    if (idea.claimedBy !== args.claimer) {
      throw new Error("Only the claimer can complete this idea");
    }
    
    if (idea.status !== "claimed") {
      throw new Error("Idea is not in claimed status");
    }
    
    // Update claim
    const claim = await ctx.db
      .query("claims")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .filter((q) => q.eq(q.field("claimer"), args.claimer))
      .first();
    
    if (claim) {
      await ctx.db.patch(claim._id, {
        status: "completed",
        completedAt: Date.now(),
        miniappUrl: args.miniappUrl,
        completionAttestationUid: args.completionAttestationUid,
      });
    }
    
    // Update idea status
    await ctx.db.patch(args.ideaId, {
      status: "completed",
      completedAt: Date.now(),
      miniappUrl: args.miniappUrl,
      completionAttestationUid: args.completionAttestationUid,
    });
  },
});

// Get claims for an idea
export const getClaimsForIdea = query({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    
    return claims;
  },
});

// Get claims by a user
export const getClaimsByUser = query({
  args: {
    claimer: v.string(),
  },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_claimer", (q) => q.eq("claimer", args.claimer))
      .collect();
    
    return claims;
  },
});

