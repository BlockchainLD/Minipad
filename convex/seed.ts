import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const ADMIN_ADDRESS = "0x6A0bA3707dF9D13A4445cD7E04274B2725930cD7";

const SEED_IDEAS = [
  {
    title: "Tip Investor",
    description: "Automatically invest tokens received as tips into long-term holdings. Set your preferred assets — ETH, BTC, or others — and let the app handle the swaps.",
    username: "hellno.eth",
  },
  {
    title: "Karaoke",
    description: "A karaoke mini app for Farcaster. Browse songs, follow along with scrolling lyrics, and sing directly in the app.",
    username: "dummie.eth",
  },
  {
    title: "Top Cast",
    description: "See which of your casts got the most engagement — likes, recasts, and replies — ranked and displayed in a clean feed.",
    username: "bombaymalayali",
  },
  {
    title: "Mini App Quiz",
    description: "A quiz that tests how many Farcaster mini apps you can recognize. A fun way to discover the ecosystem.",
    username: "patriciaxlee.eth",
  },
  {
    title: "Sudoku",
    description: "Classic Sudoku puzzles as a Farcaster mini app. Daily challenges with multiple difficulty levels.",
    username: "kimmy",
  },
  {
    title: "Onchain Notify",
    description: "Subscribe to any smart contract event and receive a Farcaster notification the moment it fires. No more manually monitoring transactions.",
    username: "horsefacts.eth",
  },
  {
    title: "Farcaster Passport",
    description: "Visualize your Farcaster journey as an interactive world map. Your activity, connections, and milestones become destinations you've visited.",
    username: "elvi",
  },
  {
    title: "Space Cards",
    description: "A deck-building card game set in space, inspired by Magic: The Gathering. Collect cards, build your deck, and battle other Farcaster users.",
    username: "dwr.eth",
  },
  {
    title: "FarCiv",
    description: "A Civilization-style strategy game as a Farcaster mini app. Build cities, research technologies, and compete with others in a turn-based world.",
    username: "dwr.eth",
  },
  {
    title: "Subcast",
    description: "Discover and manage Farcaster subcasts — topic-focused communities within channels. Subscribe, browse, and engage with the ones that match your interests.",
    username: "esteez.eth",
  },
];

type ResolvedUser = {
  fid: number;
  username: string;
  displayName: string;
  avatarUrl: string | undefined;
  custodyAddress: string;
};

async function resolveUsername(username: string): Promise<ResolvedUser | null> {
  try {
    const res = await fetch(
      `https://client.warpcast.com/v2/user-by-username?username=${encodeURIComponent(username)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.result?.user;
    if (!user || !user.custodyAddress) return null;
    return {
      fid: user.fid,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.pfp?.url,
      custodyAddress: user.custodyAddress,
    };
  } catch {
    return null;
  }
}

export const seedIdeas = action({
  args: { adminAddress: v.string() },
  handler: async (ctx, args) => {
    if (args.adminAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
      throw new Error("Unauthorized");
    }

    // Resolve each unique username once
    const cache = new Map<string, ResolvedUser | null>();
    for (const idea of SEED_IDEAS) {
      if (!cache.has(idea.username)) {
        const resolved = await resolveUsername(idea.username);
        cache.set(idea.username, resolved);
      }
    }

    const toInsert: {
      title: string;
      description: string;
      author: string;
      authorFid: number;
      authorUsername: string;
      authorDisplayName: string;
      authorAvatar: string | undefined;
    }[] = [];

    for (const idea of SEED_IDEAS) {
      const user = cache.get(idea.username);
      if (!user) {
        console.log(`Skipping "${idea.title}" — could not resolve username: ${idea.username}`);
        continue;
      }
      toInsert.push({
        title: idea.title,
        description: idea.description,
        author: user.custodyAddress,
        authorFid: user.fid,
        authorUsername: user.username,
        authorDisplayName: user.displayName,
        authorAvatar: user.avatarUrl,
      });
    }

    await ctx.runMutation(internal.seed.insertSeededIdeas, { ideas: toInsert });
    return `Seeded ${toInsert.length} of ${SEED_IDEAS.length} ideas`;
  },
});

export const insertSeededIdeas = internalMutation({
  args: {
    ideas: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        author: v.string(),
        authorFid: v.number(),
        authorUsername: v.string(),
        authorDisplayName: v.string(),
        authorAvatar: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
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
  },
});
