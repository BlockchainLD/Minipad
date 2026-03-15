import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUserSubmittedIdeas = query({
  args: {
    author: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ideas")
      .withIndex("by_author", (q) => q.eq("author", args.author))
      .filter((q) => q.neq(q.field("isRemix"), true))
      .order("desc")
      .collect();
  },
});
