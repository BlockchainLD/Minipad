import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { ADMIN_ADDRESS } from "./constants";

const ideaArg = v.object({
  title: v.string(),
  description: v.string(),
  author: v.string(),
  authorFid: v.number(),
  authorUsername: v.string(),
  authorDisplayName: v.string(),
  authorAvatar: v.optional(v.string()),
});

export const seedIdeas = mutation({
  args: {
    adminAddress: v.string(),
    ideas: v.array(ideaArg),
  },
  handler: async (ctx, args) => {
    if (args.adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase())
      throw new ConvexError("Unauthorized");

    for (const idea of args.ideas) {
      await ctx.db.insert("ideas", {
        title: idea.title,
        description: idea.description,
        author: idea.author,
        authorFid: idea.authorFid,
        authorUsername: idea.authorUsername,
        authorDisplayName: idea.authorDisplayName,
        ...(idea.authorAvatar ? { authorAvatar: idea.authorAvatar } : {}),
        timestamp: Date.now(),
        upvotes: 0,
        status: "open",
      });
    }

    return `Seeded ${args.ideas.length} ideas`;
  },
});
