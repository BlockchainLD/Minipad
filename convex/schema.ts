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
    claimedByFid: v.optional(v.number()), // Farcaster FID of claimer
    claimedByAvatar: v.optional(v.string()), // Farcaster avatar URL of claimer
    claimedByDisplayName: v.optional(v.string()), // Farcaster display name of claimer
    claimedByUsername: v.optional(v.string()), // Farcaster username of claimer
    claimedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    githubUrl: v.optional(v.string()),
    deploymentUrl: v.optional(v.string()),
    completionAttestationUid: v.optional(v.string()), // EAS attestation UID for completion
    remixCount: v.optional(v.number()), // denormalized count of remixes for this idea
  })
    .index("by_author", ["author"])
    .index("by_claimed_by", ["claimedBy"]),

  // Remixes / additions / edits / comments on ideas
  remixes: defineTable({
    ideaId: v.id("ideas"),
    author: v.string(), // wallet address
    authorFid: v.optional(v.number()),
    authorAvatar: v.optional(v.string()),
    authorDisplayName: v.optional(v.string()),
    authorUsername: v.optional(v.string()),
    content: v.string(),
    type: v.union(v.literal("addition"), v.literal("edit"), v.literal("comment")),
    timestamp: v.number(),
    upvotes: v.number(),
    attestationUid: v.optional(v.string()), // EAS attestation UID for this community take
  })
    .index("by_idea", ["ideaId"]),

  // Upvotes for remixes
  remixUpvotes: defineTable({
    remixId: v.id("remixes"),
    voter: v.string(),
    timestamp: v.number(),
  })
    .index("by_remix", ["remixId"])
    .index("by_remix_voter", ["remixId", "voter"]),

  // Upvotes for ideas (no EAS attestations)
  upvotes: defineTable({
    ideaId: v.id("ideas"),
    voter: v.string(), // wallet address
    timestamp: v.number(),
  })
    .index("by_idea", ["ideaId"])
    .index("by_idea_voter", ["ideaId", "voter"]),

  // User profiles (tagline / public nickname)
  users: defineTable({
    address: v.string(), // wallet address (primary key)
    tagline: v.optional(v.string()), // max 16 chars public tagline
  }).index("by_address", ["address"]),

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
    .index("by_idea", ["ideaId"]),

  // Build endorsements — users attesting they've tried a completed build
  buildEndorsements: defineTable({
    ideaId: v.id("ideas"),
    builderId: v.string(), // builder's wallet address (denormalized from idea.claimedBy)
    endorser: v.string(), // endorser's wallet address
    endorserFid: v.optional(v.number()),
    attestationUid: v.optional(v.string()), // EAS attestation UID
    timestamp: v.number(),
  })
    .index("by_idea", ["ideaId"])
    .index("by_idea_endorser", ["ideaId", "endorser"]),

  // Per-user activity notifications (claim, build, like, remix, endorsement)
  notifications: defineTable({
    recipient: v.string(), // wallet address, lowercased
    type: v.union(
      v.literal("idea_claimed"),
      v.literal("build_submitted"),
      v.literal("like"),
      v.literal("remix"),
      v.literal("endorsement"),
    ),
    ideaId: v.optional(v.id("ideas")),
    ideaTitle: v.optional(v.string()), // denormalized for display
    actor: v.string(), // wallet address that triggered the event
    actorFid: v.optional(v.number()),
    actorAvatar: v.optional(v.string()),
    actorDisplayName: v.optional(v.string()),
    actorUsername: v.optional(v.string()),
    read: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_recipient", ["recipient"]),

  // Per-user notification preferences (master + per-type toggles)
  notificationPrefs: defineTable({
    address: v.string(), // wallet address, lowercased
    enabled: v.boolean(),
    ideaClaimed: v.boolean(),
    buildSubmitted: v.boolean(),
    like: v.boolean(),
    remix: v.boolean(),
    endorsement: v.boolean(),
  }).index("by_address", ["address"]),

});

export default schema;
