"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "../lib/auth-client"; 
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"; 
import { sdk } from '@farcaster/miniapp-sdk';

// Create Convex client with proper URL handling
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://standing-egret-76.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

(async () => {
  try {
    const isMiniApp = await sdk.isInMiniApp();
    if (isMiniApp) {
      await sdk.actions.ready({ disableNativeGestures: true });
    }
  } catch (error) {
    console.error('Error initializing mini app:', error);
  }
})();

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
