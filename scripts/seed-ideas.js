#!/usr/bin/env node
// Seed Farcaster community ideas into the app.
// Usage: node scripts/seed-ideas.js [--verbose]
// Requires Node 18+ (native fetch). Set CONVEX_URL env var to override the default deployment.

const CONVEX_URL = process.env.CONVEX_URL || "https://standing-egret-76.convex.cloud";
const ADMIN_ADDRESS = "0x6A0bA3707dF9D13A4445cD7E04274B2725930cD7";
const VERBOSE = process.argv.includes("--verbose");

// ─── Add new ideas here ──────────────────────────────────────────────────────
// Each entry needs: title, description, and the creator's Farcaster username.
// The script resolves the username to a FID + custody address automatically.
//
// NOTE: The seedIdeas mutation just inserts — it does NOT dedupe. Anything
// listed here is ADDED to prod when the script runs. Comment out (or remove)
// entries that have already been seeded before running again.
const SEED_IDEAS = [
  {
    title: "Operation",
    description: "Classic Operation game in your Farcaster client. Carefully extract pieces without touching the sides — haptic feedback brings the buzz to life on mobile.",
    username: "linda",
  },
  {
    title: "Backgammon",
    description: "Play backgammon on Farcaster. Match with friends or random opponents, complete daily challenges, and track your stats over time.",
    username: "northchop",
  },
  {
    title: "Tower Defense",
    description: "A tower defense strategy game as a Farcaster mini app. Place towers, upgrade your arsenal, and survive escalating waves of enemies.",
    username: "stevedv.eth",
  },
  {
    title: "Meditations",
    description: "Short guided meditations available right inside Farcaster. Daily sessions for focus, sleep, and stress relief — no separate app required.",
    username: "eriks",
  },
  {
    title: "Fishing",
    description: "A casual fishing minigame for Farcaster. Cast your line, build a collection of rare catches, and climb the leaderboard.",
    username: "horsefacts.eth",
  },
  {
    title: "Fario Party",
    description: "Multiplayer party-style minigames played directly inside Farcaster casts. Compete with friends in dozens of quick, chaotic challenges.",
    username: "ccarella.eth",
  },
  {
    title: "LP Watch",
    description: "Watch your liquidity positions on Aerodrome (and other Base DEXes) and get a Farcaster notification the moment any position falls out of range.",
    username: "svvvg3.eth",
  },
  {
    title: "MealGuesser",
    description: "Like FarGuesser, but for food. See a photo of a dish and guess what cuisine or country it comes from — daily challenges and a global leaderboard.",
    username: "dylsteck.eth",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function log(...args) {
  if (VERBOSE) console.log("  [debug]", ...args);
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ...headers,
    },
  });
  const text = await res.text();
  if (!res.ok) { log(`${url} → ${res.status}`); return null; }
  try { return JSON.parse(text); }
  catch { log(`${url} → invalid JSON`); return null; }
}

async function resolveViaWarpcast(uname) {
  for (const base of ["https://client.warpcast.com", "https://api.warpcast.com"]) {
    const url = `${base}/v2/user-by-username?username=${encodeURIComponent(uname)}`;
    try {
      const data = await fetchJson(url, { "Origin": "https://warpcast.com", "Referer": "https://warpcast.com/" });
      const user = data?.result?.user;
      if (user?.fid) {
        const avatarUrl =
          user.pfp?.url ||
          (typeof user.pfp === "string" ? user.pfp : undefined) ||
          user.avatarUrl ||
          user.avatar?.url ||
          user.profile?.pfp?.url;
        log(`Warpcast resolved ${uname}: FID ${user.fid}, avatar: ${avatarUrl || "none"}`);
        return { fid: user.fid, username: user.username || uname, displayName: user.displayName, avatarUrl, custodyAddress: user.custodyAddress || null };
      }
    } catch (e) { log(`fetch error for ${url}: ${e.message}`); }
  }
  return null;
}

async function getCustodyFromFnames(username) {
  const attempts = username.endsWith(".eth") ? [username, username.slice(0, -4)] : [username, username + ".eth"];
  for (const fname of attempts) {
    try {
      const data = await fetchJson(`https://fnames.farcaster.xyz/transfers?name=${encodeURIComponent(fname)}`);
      const latest = data?.transfers?.at(-1);
      if (latest?.to && latest?.owner) { log(`fnames resolved ${fname}: FID ${latest.to}`); return { fid: latest.to, custodyAddress: latest.owner }; }
    } catch (e) { log(`fnames error for ${fname}: ${e.message}`); }
  }
  return null;
}

async function getProfileFromHub(fid) {
  const hub = "https://hub.pinata.cloud";
  try {
    const [pfpData, nameData] = await Promise.all([
      fetchJson(`${hub}/v1/userDataByFid?fid=${fid}&user_data_type=1`),
      fetchJson(`${hub}/v1/userDataByFid?fid=${fid}&user_data_type=2`),
    ]);
    const avatarUrl = pfpData?.data?.userDataBody?.value;
    const displayName = nameData?.data?.userDataBody?.value;
    log(`Hub FID ${fid}: display="${displayName}", avatar=${avatarUrl || "none"}`);
    return { displayName, avatarUrl };
  } catch (e) { log(`hub error for fid ${fid}: ${e.message}`); return {}; }
}

async function resolveUsername(username) {
  const variants = username.endsWith(".eth") ? [username, username.slice(0, -4)] : [username];

  // Try Warpcast first
  let partial = null;
  for (const uname of variants) {
    partial = await resolveViaWarpcast(uname);
    if (partial) break;
  }

  // Get custody address from fnames if Warpcast didn't return it
  if (partial && !partial.custodyAddress) {
    const fnames = await getCustodyFromFnames(username);
    if (fnames) partial.custodyAddress = fnames.custodyAddress;
  }

  // Fill missing display name / avatar from Hub
  if (partial && (!partial.displayName || !partial.avatarUrl)) {
    const profile = await getProfileFromHub(partial.fid);
    partial.displayName = partial.displayName || profile.displayName || username;
    partial.avatarUrl = partial.avatarUrl || profile.avatarUrl;
  }

  // Full fallback: fnames + Hub (no Warpcast)
  if (!partial) {
    log(`Warpcast unavailable for ${username}, trying fnames...`);
    const fnames = await getCustodyFromFnames(username);
    if (!fnames) return null;
    const profile = await getProfileFromHub(fnames.fid);
    partial = {
      fid: fnames.fid,
      username: username.endsWith(".eth") ? username.slice(0, -4) : username,
      displayName: profile.displayName || username,
      avatarUrl: profile.avatarUrl,
      custodyAddress: fnames.custodyAddress,
    };
  }

  return partial.custodyAddress ? partial : null;
}

async function main() {
  console.log("Resolving Farcaster usernames...\n");

  const cache = {};
  const ideas = [];

  for (const idea of SEED_IDEAS) {
    if (!cache[idea.username]) cache[idea.username] = await resolveUsername(idea.username);
    const user = cache[idea.username];
    if (!user) { console.log(`  ✗ Skipping "${idea.title}" — could not resolve: ${idea.username}`); continue; }
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

  if (!ideas.length) { console.error("\nNo ideas resolved. Check your internet connection or run with --verbose."); process.exit(1); }

  console.log(`\nSeeding ${ideas.length} ideas to ${CONVEX_URL}...\n`);
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: "seed:seedIdeas", args: { adminAddress: ADMIN_ADDRESS, ideas }, format: "json" }),
  });

  const result = await res.json();
  if (result.status === "success") console.log(`✓ ${result.value}`);
  else { console.error("✗ Convex error:", JSON.stringify(result, null, 2)); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
