"use client";

import { SignInForm } from "./components/sign-in-form";
import { LoggedIn } from "./components/logged-in";
import { AutoConnectWrapper, useFarcaster } from "./components/auto-connect-wrapper";
import { SafeAreaView } from "@worldcoin/mini-apps-ui-kit-react";
import { useAccount } from "wagmi";

function AppContent() {
  const { isConnected } = useAccount();
  const { isInMiniApp, isCheckingContext, connectingTimedOut } = useFarcaster();

  // Still determining whether we're inside a Farcaster mini app.
  // Render nothing to avoid a flash of the wrong UI.
  if (isCheckingContext) {
    return null;
  }

  // Inside Farcaster mini app: the farcasterMiniApp connector auto-connects.
  // Never show WalletConnect or the Base sign-in button here.
  // Show a spinner while connecting; the connector resolves in <1s on mobile.
  if (isInMiniApp && !isConnected) {
    if (connectingTimedOut) {
      // Auto-connect failed — let the user know without showing WalletConnect.
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">Could not connect to Farcaster.</p>
            <p className="text-xs text-gray-400">Please close and reopen the app.</p>
          </div>
        </div>
      );
    }
    // Auto-connect in progress — show a minimal spinner, not a sign-in form.
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  // Outside Farcaster (regular browser): show sign-in or app content.
  return (
    <SafeAreaView className="min-h-screen bg-white">
      {isConnected ? (
        <LoggedIn />
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      )}
    </SafeAreaView>
  );
}

export default function Home() {
  return (
    <AutoConnectWrapper>
      <AppContent />
    </AutoConnectWrapper>
  );
}
