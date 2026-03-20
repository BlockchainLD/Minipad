import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getTagline = query({
  args: { address: v.string() },
  handler: async (ctx, { address }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_address", (q) => q.eq("address", address))
      .first();
    return user?.tagline ?? null;
  },
});

export const setTagline = mutation({
  args: { address: v.string(), tagline: v.string() },
  handler: async (ctx, { address, tagline }) => {
    const trimmed = tagline.trim().slice(0, 16);
    const user = await ctx.db
      .query("users")
      .withIndex("by_address", (q) => q.eq("address", address))
      .first();
    if (user) {
      await ctx.db.patch(user._id, { tagline: trimmed });
    } else {
      await ctx.db.insert("users", { address, tagline: trimmed });
    }
  },
});
