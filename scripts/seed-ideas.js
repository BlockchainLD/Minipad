#!/usr/bin/env node
// Run from your Mac: node scripts/seed-ideas.js
// Requires Node 18+ (native fetch). Set CONVEX_URL if different from default.

const CONVEX_URL = process.env.CONVEX_URL || "https://standing-egret-76.convex.cloud";
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

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ...headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    console.log(`    [debug] ${url} → ${res.status}: ${text.slice(0, 200)}`);
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    console.log(`    [debug] ${url} → invalid JSON: ${text.slice(0, 200)}`);
    return null;
  }
}

async function resolveViaWarpcast(uname) {
  for (const base of ["https://client.warpcast.com", "https://api.warpcast.com"]) {
    const url = `${base}/v2/user-by-username?username=${encodeURIComponent(uname)}`;
    try {
      const data = await fetchJson(url, { "Origin": "https://warpcast.com", "Referer": "https://warpcast.com/" });
      const user = data?.result?.user;
      if (user?.custodyAddress) {
        return {
          fid: user.fid,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.pfp?.url,
          custodyAddress: user.custodyAddress,
        };
      }
      if (data) console.log(`    [debug] ${url} → unexpected shape: ${JSON.stringify(data).slice(0, 200)}`);
    } catch (e) {
      console.log(`    [debug] fetch error for ${url}: ${e.message}`);
    }
  }
  return null;
}

async function resolveViaFnamesAndHub(uname) {
  // Step 1: get FID + owner from fnames registry
  const fname = uname.endsWith(".eth") ? uname.slice(0, -4) : uname;
  const fnamesUrl = `https://fnames.farcaster.xyz/transfers?name=${encodeURIComponent(fname)}`;
  let fid, custodyAddress;
  try {
    const data = await fetchJson(fnamesUrl);
    const transfers = data?.transfers;
    if (!transfers?.length) return null;
    // Last transfer = current owner
    const latest = transfers[transfers.length - 1];
    fid = latest.to;
    custodyAddress = latest.owner;
    if (!fid || !custodyAddress) return null;
  } catch (e) {
    console.log(`    [debug] fetch error for ${fnamesUrl}: ${e.message}`);
    return null;
  }

  // Step 2: get display name + avatar from Pinata Hub
  let displayName = uname, avatarUrl;
  try {
    const hub = "https://hub.pinata.cloud";
    const [nameData, pfpData] = await Promise.all([
      fetchJson(`${hub}/v1/userDataByFid?fid=${fid}&user_data_type=2`), // display name
      fetchJson(`${hub}/v1/userDataByFid?fid=${fid}&user_data_type=1`), // pfp
    ]);
    if (nameData?.data?.userDataBody?.value) displayName = nameData.data.userDataBody.value;
    if (pfpData?.data?.userDataBody?.value) avatarUrl = pfpData.data.userDataBody.value;
  } catch (e) {
    console.log(`    [debug] hub error for fid ${fid}: ${e.message}`);
  }

  return { fid, username: fname, displayName, avatarUrl, custodyAddress };
}

async function resolveUsername(username) {
  // Try Warpcast API first (with and without .eth suffix)
  const usernames = [username];
  if (username.endsWith(".eth")) usernames.push(username.slice(0, -4));

  for (const uname of usernames) {
    const result = await resolveViaWarpcast(uname);
    if (result) return result;
  }

  // Fallback: fnames.farcaster.xyz + Pinata Hub
  console.log(`    [debug] Warpcast failed for ${username}, trying fnames registry...`);
  return resolveViaFnamesAndHub(username);
}

async function main() {
  console.log("Resolving Farcaster usernames...\n");

  const cache = {};
  const ideas = [];

  for (const idea of SEED_IDEAS) {
    if (!cache[idea.username]) {
      cache[idea.username] = await resolveUsername(idea.username);
    }
    const user = cache[idea.username];
    if (!user) {
      console.log(`  ✗ Skipping "${idea.title}" — could not resolve: ${idea.username}`);
      continue;
    }
    console.log(`  ✓ "${idea.title}" → @${user.username} (FID ${user.fid})`);
    ideas.push({
      title: idea.title,
      description: idea.description,
      author: user.custodyAddress,
      authorFid: user.fid,
      authorUsername: user.username,
      authorDisplayName: user.displayName,
      authorAvatar: user.avatarUrl,
    });
  }

  if (ideas.length === 0) {
    console.error("\nNo ideas resolved. Check your internet connection.");
    process.exit(1);
  }

  console.log(`\nSeeding ${ideas.length} ideas to ${CONVEX_URL}...\n`);

  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: "seed:seedIdeas",
      args: { adminAddress: ADMIN_ADDRESS, ideas },
      format: "json",
    }),
  });

  const result = await res.json();

  if (result.status === "success") {
    console.log(`✓ ${result.value}`);
  } else {
    console.error("✗ Convex error:", JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
