import { useState, useEffect } from "react";
import { useFarcaster } from "../components/auto-connect-wrapper";
import type { FarcasterUser } from "../lib/types";

export function useFarcasterData(): FarcasterUser | null {
  const { fid, isInMiniApp, sdkUser } = useFarcaster();
  const [farcasterData, setFarcasterData] = useState<FarcasterUser | null>(null);

  useEffect(() => {
    if (!fid || !isInMiniApp) {
      setFarcasterData(null);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/farcaster/${fid}`);
        if (res.ok) {
          const data = await res.json();
          const u = data?.result?.user;
          if (u && typeof u.fid === "number") {
            setFarcasterData({
              fid: u.fid,
              displayName: u.displayName || u.username || `FID ${u.fid}`,
              username: u.username || `fid${u.fid}`,
              profile: u.profile ? {
                bio: { text: u.profile?.bio?.text || "" },
                location: u.profile?.location || undefined,
                url: u.profile?.url || undefined,
                bannerImageUrl: u.profile?.bannerImageUrl || undefined,
              } : { bio: { text: "" } },
              followerCount: typeof u.followerCount === "number" ? u.followerCount : 0,
              followingCount: typeof u.followingCount === "number" ? u.followingCount : 0,
              pfp: { url: u.pfp?.url || "", verified: !!u.pfp?.verified },
              connectedAccounts: Array.isArray(u.connectedAccounts) ? u.connectedAccounts : undefined,
            });
            return;
          }
        }
      } catch {
        // fall through to SDK fallback
      }
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

    fetchData();
  }, [fid, isInMiniApp, sdkUser]);

  return farcasterData;
}
