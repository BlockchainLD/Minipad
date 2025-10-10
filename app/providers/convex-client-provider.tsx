"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "../lib/auth-client"; 
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"; 
import { sdk } from '@farcaster/miniapp-sdk';

// Create Convex client with proper URL handling
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://striped-dolphin-138.convex.cloud';

let convex: ConvexReactClient;
try {
  convex = new ConvexReactClient(convexUrl);
} catch (error) {
  console.error('Error creating Convex client:', error);
  // Fallback to a basic client
  convex = new ConvexReactClient('https://striped-dolphin-138.convex.cloud');
}

// Only initialize SDK on client-side
if (typeof window !== 'undefined') {
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
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  try {
    return (
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        {children}
      </ConvexBetterAuthProvider>
    );
  } catch (error) {
    console.error('Error in ConvexClientProvider:', error);
    return <div>Error loading application. Please refresh the page.</div>;
  }
}
