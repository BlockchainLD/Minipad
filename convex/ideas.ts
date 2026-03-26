import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

const ADMIN_ADDRESS = "0x6A0bA3707dF9D13A4445cD7E04274B2725930cD7";

export const submitIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    author: v.string(),
    authorFid: v.optional(v.number()),
    authorAvatar: v.optional(v.string()),
    authorDisplayName: v.optional(v.string()),
    authorUsername: v.optional(v.string()),
    attestationUid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const doc: Record<string, unknown> = {
      title: args.title,
      description: args.description,
      author: args.author,
      timestamp: Date.now(),
      upvotes: 0,
      status: "open" as const,
    };
    if (args.authorFid !== undefined) doc.authorFid = args.authorFid;
    if (args.authorAvatar !== undefined) doc.authorAvatar = args.authorAvatar;
    if (args.authorDisplayName !== undefined) doc.authorDisplayName = args.authorDisplayName;
    if (args.authorUsername !== undefined) doc.authorUsername = args.authorUsername;
    if (args.attestationUid !== undefined) doc.attestationUid = args.attestationUid;

    return await ctx.db.insert("ideas", doc as any);
  },
});

export const getIdeas = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const ideas = await ctx.db.query("ideas").order("desc").take(limit);
    const filtered = ideas.filter(idea => !idea.isRemix);
    return Promise.all(
      filtered.map(async ({ _creationTime, ...idea }) => {
        const remixes = await ctx.db
          .query("remixes")
          .withIndex("by_idea", (q) => q.eq("ideaId", idea._id))
          .collect();
        return { ...idea, upvotes: idea.upvotes ?? 0, remixCount: remixes.length };
      })
    );
  },
});

export const updateIdeaAttestation = mutation({
  args: {
    ideaId: v.id("ideas"),
    attestationUid: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ideaId, { attestationUid: args.attestationUid });
  },
});

export const deleteIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new ConvexError("Idea not found");
    if (idea.author !== args.author) throw new ConvexError("Only the author can delete their idea");

    const upvotes = await ctx.db
      .query("upvotes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    for (const upvote of upvotes) {
      await ctx.db.delete(upvote._id);
    }

    const claims = await ctx.db
      .query("claims")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
    for (const claim of claims) {
      await ctx.db.delete(claim._id);
    }

    await ctx.db.delete(args.ideaId);
  },
});

export const adminDeleteAllIdeas = mutation({
  args: { adminAddress: v.string() },
  handler: async (ctx, args) => {
    if (args.adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase())
      throw new ConvexError("Unauthorized");

    for (const u of await ctx.db.query("upvotes").collect()) await ctx.db.delete(u._id);
    for (const ru of await ctx.db.query("remixUpvotes").collect()) await ctx.db.delete(ru._id);
    for (const r of await ctx.db.query("remixes").collect()) await ctx.db.delete(r._id);
    for (const c of await ctx.db.query("claims").collect()) await ctx.db.delete(c._id);
    for (const i of await ctx.db.query("ideas").collect()) await ctx.db.delete(i._id);
  },
});
