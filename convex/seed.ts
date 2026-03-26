import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

const ADMIN_ADDRESS = "0x6A0bA3707dF9D13A4445cD7E04274B2725930cD7";

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
      const doc: Record<string, unknown> = {
        title: idea.title,
        description: idea.description,
        author: idea.author,
        authorFid: idea.authorFid,
        authorUsername: idea.authorUsername,
        authorDisplayName: idea.authorDisplayName,
        timestamp: Date.now(),
        upvotes: 0,
        status: "open" as const,
      };
      if (idea.authorAvatar) doc.authorAvatar = idea.authorAvatar;
      await ctx.db.insert("ideas", doc as any);
    }

    return `Seeded ${args.ideas.length} ideas`;
  },
});
