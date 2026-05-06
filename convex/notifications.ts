import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

// Default prefs — used when a user has no row yet, or for un-stored fields.
const DEFAULT_PREFS = {
  enabled: true,
  ideaClaimed: true,
  buildSubmitted: true,
  like: true,
  remix: true,
  endorsement: true,
};

type Prefs = typeof DEFAULT_PREFS;

const prefKeyFor = (type: Doc<"notifications">["type"]): keyof Prefs => {
  switch (type) {
    case "idea_claimed": return "ideaClaimed";
    case "build_submitted": return "buildSubmitted";
    case "like": return "like";
    case "remix": return "remix";
    case "endorsement": return "endorsement";
  }
};

const norm = (addr: string) => addr.toLowerCase();

const filterByPrefs = (
  notifs: Doc<"notifications">[],
  prefs: Prefs,
): Doc<"notifications">[] => {
  if (!prefs.enabled) return [];
  return notifs.filter((n) => prefs[prefKeyFor(n.type)]);
};

// Internal-style helper: callable directly inside this file's mutations only.
// Other Convex modules duplicate the same lightweight insert (see claims.ts,
// upvotes.ts, remixes.ts, endorsements.ts) since cross-file internal calls
// would require additional plumbing.
export const listForUser = query({
  args: { recipient: v.string() },
  handler: async (ctx, args) => {
    const recipient = norm(args.recipient);
    const [notifs, prefsRow] = await Promise.all([
      ctx.db
        .query("notifications")
        .withIndex("by_recipient", (q) => q.eq("recipient", recipient))
        .order("desc")
        .take(50),
      ctx.db
        .query("notificationPrefs")
        .withIndex("by_address", (q) => q.eq("address", recipient))
        .first(),
    ]);
    const prefs: Prefs = prefsRow
      ? {
          enabled: prefsRow.enabled,
          ideaClaimed: prefsRow.ideaClaimed,
          buildSubmitted: prefsRow.buildSubmitted,
          like: prefsRow.like,
          remix: prefsRow.remix,
          endorsement: prefsRow.endorsement,
        }
      : DEFAULT_PREFS;
    return filterByPrefs(notifs, prefs);
  },
});

export const unreadCountForUser = query({
  args: { recipient: v.string() },
  handler: async (ctx, args) => {
    const recipient = norm(args.recipient);
    const [notifs, prefsRow] = await Promise.all([
      ctx.db
        .query("notifications")
        .withIndex("by_recipient", (q) => q.eq("recipient", recipient))
        .collect(),
      ctx.db
        .query("notificationPrefs")
        .withIndex("by_address", (q) => q.eq("address", recipient))
        .first(),
    ]);
    const prefs: Prefs = prefsRow
      ? {
          enabled: prefsRow.enabled,
          ideaClaimed: prefsRow.ideaClaimed,
          buildSubmitted: prefsRow.buildSubmitted,
          like: prefsRow.like,
          remix: prefsRow.remix,
          endorsement: prefsRow.endorsement,
        }
      : DEFAULT_PREFS;
    return filterByPrefs(notifs.filter((n) => !n.read), prefs).length;
  },
});

export const markAllRead = mutation({
  args: { recipient: v.string() },
  handler: async (ctx, args) => {
    const recipient = norm(args.recipient);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipient", recipient))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});

export const getPrefs = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    const address = norm(args.address);
    const row = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_address", (q) => q.eq("address", address))
      .first();
    if (!row) return DEFAULT_PREFS;
    return {
      enabled: row.enabled,
      ideaClaimed: row.ideaClaimed,
      buildSubmitted: row.buildSubmitted,
      like: row.like,
      remix: row.remix,
      endorsement: row.endorsement,
    };
  },
});

export const updatePrefs = mutation({
  args: {
    address: v.string(),
    enabled: v.optional(v.boolean()),
    ideaClaimed: v.optional(v.boolean()),
    buildSubmitted: v.optional(v.boolean()),
    like: v.optional(v.boolean()),
    remix: v.optional(v.boolean()),
    endorsement: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const address = norm(args.address);
    const existing = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_address", (q) => q.eq("address", address))
      .first();
    const patch = {
      ...(args.enabled !== undefined && { enabled: args.enabled }),
      ...(args.ideaClaimed !== undefined && { ideaClaimed: args.ideaClaimed }),
      ...(args.buildSubmitted !== undefined && { buildSubmitted: args.buildSubmitted }),
      ...(args.like !== undefined && { like: args.like }),
      ...(args.remix !== undefined && { remix: args.remix }),
      ...(args.endorsement !== undefined && { endorsement: args.endorsement }),
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("notificationPrefs", { address, ...DEFAULT_PREFS, ...patch });
    }
  },
});
