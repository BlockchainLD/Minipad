import { useState, useEffect } from "react";
import { useFarcaster } from "../components/auto-connect-wrapper";
import type { FarcasterUser } from "../lib/types";

/**
 * Custom hook to fetch Farcaster user data.
 * Tries the Warpcast API first; falls back to the SDK context data
 * (available when running inside the Farcaster mini-app) so the profile
 * always renders even when the external API is unavailable.
 */
export function useFarcasterData(): FarcasterUser | null {
  const { fid, isInMiniApp, sdkUser } = useFarcaster();
  const [farcasterData, setFarcasterData] = useState<FarcasterUser | null>(null);

  useEffect(() => {
    const fetchFarcasterData = async () => {
      if (!fid || !isInMiniApp) {
        setFarcasterData(null);
        return;
      }

      try {
        const response = await fetch(`/api/farcaster/${fid}`);
        if (response.ok) {
          const data = await response.json();
          const user = data?.result?.user;
          // Sanitize: the Warpcast API can return null for any field
          if (user && typeof user.fid === "number") {
            setFarcasterData({
              fid: user.fid,
              displayName: user.displayName || user.username || `FID ${user.fid}`,
              username: user.username || `fid${user.fid}`,
              profile: user.profile ? {
                bio: user.profile.bio ? { text: user.profile.bio.text || "" } : { text: "" },
                location: user.profile.location || undefined,
                url: user.profile.url || undefined,
                bannerImageUrl: user.profile.bannerImageUrl || undefined,
              } : { bio: { text: "" } },
              followerCount: typeof user.followerCount === "number" ? user.followerCount : 0,
              followingCount: typeof user.followingCount === "number" ? user.followingCount : 0,
              pfp: user.pfp ? {
                url: user.pfp.url || "",
                verified: !!user.pfp.verified,
              } : { url: "", verified: false },
              connectedAccounts: Array.isArray(user.connectedAccounts) ? user.connectedAccounts : undefined,
            });
            return;
          }
        }
      } catch {
        // Fall through to SDK fallback
      }

      // API failed — use data from SDK context if available
      if (sdkUser) {
        setFarcasterData({
          fid: sdkUser.fid,
          displayName: sdkUser.displayName || sdkUser.username || `FID ${sdkUser.fid}`,
          username: sdkUser.username || `fid${sdkUser.fid}`,
          profile: { bio: { text: "" } },
          followerCount: 0,
          followingCount: 0,
          pfp: { url: sdkUser.pfpUrl || "", verified: false },
        });
      } else {
        setFarcasterData(null);
      }
    };

    fetchFarcasterData();
  }, [fid, isInMiniApp, sdkUser]);

  return farcasterData;
}
