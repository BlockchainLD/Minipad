"use client";

import { useCallback, useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useFarcaster } from "../components/auto-connect-wrapper";

// Reads `sdk.context.client.added` and exposes a prompt() that triggers the
// Farcaster client's native "Add this app?" sheet. Two consumers today:
//   - IdeaSubmissionConfirmation: prompts after the user's first idea
//   - SettingsContent: renders a Save Minipad button when canAdd is true
export function useAddMiniApp() {
  const { isInMiniApp, isCheckingContext } = useFarcaster();
  const [added, setAdded] = useState<boolean | null>(null);

  useEffect(() => {
    if (isCheckingContext || !isInMiniApp) { setAdded(null); return; }
    sdk.context
      .then((ctx) => setAdded(ctx?.client?.added ?? false))
      .catch(() => setAdded(null));
  }, [isInMiniApp, isCheckingContext]);

  // Stable across renders so consumers can put it in useEffect deps without
  // thrashing (relevant for the post-first-idea prompt's delayed timer).
  // Only references setAdded (stable) and sdk.actions.* (stable).
  const prompt = useCallback(async (): Promise<boolean> => {
    try {
      await sdk.actions.addMiniApp();
      setAdded(true);
      return true;
    } catch {
      // User declined, domain mismatch, or non-prod environment — silent.
      return false;
    }
  }, []);

  return {
    canAdd: isInMiniApp && added === false,
    isAdded: added === true,
    prompt,
  };
}
