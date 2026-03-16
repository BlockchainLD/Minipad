import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUserSubmittedIdeas = query({
  args: {
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_author", (q) => q.eq("author", args.author))
      .filter((q) => q.neq(q.field("isRemix"), true))
      .order("desc")
      .collect();
    return ideas.map(({ _creationTime, ...idea }) => idea);
  },
});

export const getUserClaimedIdeas = query({
  args: { claimer: v.string() },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_claimer", (q) => q.eq("claimer", args.claimer))
      .collect();

    const ideas = await Promise.all(
      claims.map((claim) => ctx.db.get(claim.ideaId))
    );

    return ideas.filter((idea): idea is NonNullable<typeof idea> => idea !== null);
  },
});
