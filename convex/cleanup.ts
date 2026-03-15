import { internalMutation } from "./_generated/server";

// Temporary cleanup: delete old-schema remixes documents that are missing required fields
export const deleteInvalidRemixes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("remixes").collect();
    let deleted = 0;
    for (const doc of all) {
      // Old schema documents are missing required fields like author, content, type
      if (!("author" in doc) || !("content" in doc) || !("type" in doc)) {
        await ctx.db.delete(doc._id);
        deleted++;
      }
    }
    return { deleted };
  },
});
