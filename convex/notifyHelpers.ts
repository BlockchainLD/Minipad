import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type NotificationType =
  | "idea_claimed"
  | "build_submitted"
  | "like"
  | "remix"
  | "endorsement";

interface Actor {
  address: string;
  fid?: number;
  avatar?: string;
  displayName?: string;
  username?: string;
}

interface CreateArgs {
  recipient: string; // wallet address (any case) of the user being notified
  type: NotificationType;
  actor: Actor;
  ideaId?: Id<"ideas">;
  ideaTitle?: string;
}

// Inserts a notification row, skipping self-notifications and missing recipients.
// Pref filtering happens on read; we always store events so toggling a category
// back on restores history.
export async function createNotification(ctx: MutationCtx, args: CreateArgs) {
  const recipient = (args.recipient || "").toLowerCase();
  if (!recipient) return;
  if (recipient === args.actor.address.toLowerCase()) return;

  await ctx.db.insert("notifications", {
    recipient,
    type: args.type,
    ideaId: args.ideaId,
    ideaTitle: args.ideaTitle,
    actor: args.actor.address,
    actorFid: args.actor.fid,
    actorAvatar: args.actor.avatar,
    actorDisplayName: args.actor.displayName,
    actorUsername: args.actor.username,
    read: false,
    timestamp: Date.now(),
  });
}
