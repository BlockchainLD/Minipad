import { useState, useEffect } from "react";
import { useFarcaster } from "../components/auto-connect-wrapper";
import type { FarcasterUser } from "../lib/types";

/**
 * Custom hook to fetch Farcaster user data
 * Returns the Farcaster user data if available, null otherwise
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
          setFarcasterData(data.result.user);
          return;
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

