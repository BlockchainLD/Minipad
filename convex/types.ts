import { v } from "convex/values";

/**
 * Type definitions for Convex query/mutation returns
 * These match the schema defined in schema.ts
 */

// Idea type matching the schema
export const ideaType = v.object({
  _id: v.id("ideas"),
  title: v.string(),
  description: v.string(),
  author: v.string(),
  authorFid: v.optional(v.number()),
  authorAvatar: v.optional(v.string()),
  authorDisplayName: v.optional(v.string()),
  authorUsername: v.optional(v.string()),
  attestationUid: v.optional(v.string()),
  timestamp: v.number(),
  upvotes: v.number(),
  status: v.union(v.literal("open"), v.literal("claimed"), v.literal("completed")),
  claimedBy: v.optional(v.string()),
  claimedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  githubUrl: v.optional(v.string()),
  deploymentUrl: v.optional(v.string()),
  completionAttestationUid: v.optional(v.string()),
  isRemix: v.optional(v.boolean()),
  originalIdeaId: v.optional(v.id("ideas")),
  remixAttestationUid: v.optional(v.string()),
});

// Claim type matching the schema
export const claimType = v.object({
  _id: v.id("claims"),
  ideaId: v.id("ideas"),
  claimer: v.string(),
  attestationUid: v.optional(v.string()),
  timestamp: v.number(),
  status: v.union(v.literal("claimed"), v.literal("completed")),
  completedAt: v.optional(v.number()),
  miniappUrl: v.optional(v.string()),
});

