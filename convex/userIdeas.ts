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
    return ctx.db
      .query("ideas")
      .withIndex("by_claimed_by", (q) => q.eq("claimedBy", args.claimer))
      .order("desc")
      .collect();
  },
});
