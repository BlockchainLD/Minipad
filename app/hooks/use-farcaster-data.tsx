import { useState, useEffect } from "react";
import { useFarcaster } from "../components/auto-connect-wrapper";
import type { FarcasterUser } from "../lib/types";

/**
 * Custom hook to fetch Farcaster user data
 * Returns the Farcaster user data if available, null otherwise
 */
export function useFarcasterData(): FarcasterUser | null {
  const { fid, isInMiniApp } = useFarcaster();
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
        } else {
          setFarcasterData(null);
        }
      } catch (error) {
        // Silently fail - Farcaster data is optional
        setFarcasterData(null);
      }
    };

    fetchFarcasterData();
  }, [fid, isInMiniApp]);

  return farcasterData;
}

