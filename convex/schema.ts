import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  // Ideas submitted by users
  ideas: defineTable({
    title: v.string(),
    description: v.string(),
    author: v.string(), // wallet address
    authorFid: v.optional(v.number()), // Farcaster FID
    authorAvatar: v.optional(v.string()), // Farcaster avatar URL
    authorDisplayName: v.optional(v.string()), // Farcaster display name
    authorUsername: v.optional(v.string()), // Farcaster username
    attestationUid: v.optional(v.string()), // EAS attestation UID
    timestamp: v.number(),
    upvotes: v.number(),
    status: v.union(v.literal("open"), v.literal("claimed"), v.literal("completed")),
    claimedBy: v.optional(v.string()), // wallet address of claimer
    claimedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    githubUrl: v.optional(v.string()),
    deploymentUrl: v.optional(v.string()),
    completionAttestationUid: v.optional(v.string()), // EAS attestation UID for completion
    // Remix-specific fields
    isRemix: v.optional(v.boolean()), // true if this is a remix
    originalIdeaId: v.optional(v.id("ideas")), // ID of the original idea being remixed
    remixAttestationUid: v.optional(v.string()), // EAS attestation UID for remix
  })
    .index("by_author", ["author"])
    .index("by_status", ["status"])
    .index("by_timestamp", ["timestamp"])
    .index("by_upvotes", ["upvotes"])
    .index("by_original_idea", ["originalIdeaId"]),

  // Upvotes for ideas (no EAS attestations)
  upvotes: defineTable({
    ideaId: v.id("ideas"),
    voter: v.string(), // wallet address
    timestamp: v.number(),
  })
    .index("by_idea", ["ideaId"])
    .index("by_voter", ["voter"])
    .index("by_timestamp", ["timestamp"]),

  // Claims by builders
  claims: defineTable({
    ideaId: v.id("ideas"),
    claimer: v.string(), // wallet address
    attestationUid: v.optional(v.string()), // EAS attestation UID
    timestamp: v.number(),
    status: v.union(v.literal("claimed"), v.literal("completed")),
    completedAt: v.optional(v.number()),
    miniappUrl: v.optional(v.string()),
  })
    .index("by_idea", ["ideaId"])
    .index("by_claimer", ["claimer"])
    .index("by_status", ["status"]),

});

export default schema;
