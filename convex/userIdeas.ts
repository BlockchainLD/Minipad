import { query } from "./_generated/server";
import { v } from "convex/values";
import { ideaType } from "./types";

export const getUserSubmittedIdeas = query({
  args: {
    author: v.string(),
  },
  returns: v.array(ideaType),
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("ideas")
      .withIndex("by_author", (q) => q.eq("author", args.author))
      .collect();
    return all
      .filter(idea => !idea.isRemix)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
});

export const getUserClaimedIdeas = query({
  args: {
    claimer: v.string(),
  },
  returns: v.array(ideaType),
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_claimer", (q) => q.eq("claimer", args.claimer))
      .collect();

    const ideas = await Promise.all(
      claims.map(async (claim) => ctx.db.get(claim.ideaId))
    );

    return ideas
      .filter((idea): idea is NonNullable<typeof idea> => idea !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
});

export const getUserCompletedIdeas = query({
  args: {
    claimer: v.string(),
  },
  returns: v.array(ideaType),
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_claimer", (q) => q.eq("claimer", args.claimer))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const ideas = await Promise.all(
      claims.map(async (claim) => ctx.db.get(claim.ideaId))
    );

    return ideas
      .filter((idea): idea is NonNullable<typeof idea> => idea !== null)
      .sort((a, b) => {
        const aTime = a.completedAt ?? a.timestamp;
        const bTime = b.completedAt ?? b.timestamp;
        return bTime - aTime;
      });
  },
});
