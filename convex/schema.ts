import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  // Ideas submitted by users
  ideas: defineTable({
    title: v.string(),
    description: v.string(),
    author: v.string(), // wallet address
    authorFid: v.optional(v.string()), // Farcaster ID
    attestationUid: v.optional(v.string()), // EAS attestation UID
    timestamp: v.number(),
    upvotes: v.number(),
    status: v.union(v.literal("open"), v.literal("claimed"), v.literal("completed")),
    claimedBy: v.optional(v.string()), // wallet address of claimer
    claimedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    miniappUrl: v.optional(v.string()),
    completionAttestationUid: v.optional(v.string()),
  })
    .index("by_author", ["author"])
    .index("by_status", ["status"])
    .index("by_timestamp", ["timestamp"])
    .index("by_upvotes", ["upvotes"]),

  // Upvotes/attestations for ideas
  upvotes: defineTable({
    ideaId: v.id("ideas"),
    voter: v.string(), // wallet address
    voterFid: v.optional(v.string()), // Farcaster ID
    attestationUid: v.optional(v.string()), // EAS attestation UID
    timestamp: v.number(),
  })
    .index("by_idea", ["ideaId"])
    .index("by_voter", ["voter"])
    .index("by_timestamp", ["timestamp"]),

  // Claims by builders
  claims: defineTable({
    ideaId: v.id("ideas"),
    claimer: v.string(), // wallet address
    claimerFid: v.optional(v.string()), // Farcaster ID
    attestationUid: v.optional(v.string()), // EAS attestation UID
    timestamp: v.number(),
    status: v.union(v.literal("claimed"), v.literal("completed")),
    completedAt: v.optional(v.number()),
    miniappUrl: v.optional(v.string()),
    completionAttestationUid: v.optional(v.string()),
  })
    .index("by_idea", ["ideaId"])
    .index("by_claimer", ["claimer"])
    .index("by_status", ["status"]),

  // Remixes/expansions of ideas
  remixes: defineTable({
    originalIdeaId: v.id("ideas"),
    remixIdeaId: v.id("ideas"),
    remixer: v.string(), // wallet address
    remixerFid: v.optional(v.string()), // Farcaster ID
    attestationUid: v.optional(v.string()), // EAS attestation UID
    timestamp: v.number(),
  })
    .index("by_original", ["originalIdeaId"])
    .index("by_remixer", ["remixer"])
    .index("by_timestamp", ["timestamp"]),
});

export default schema;
