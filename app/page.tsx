"use client";

import { SignInForm } from "./components/sign-in-form";
import { LoggedIn } from "./components/logged-in";
import { AutoConnectWrapper, useFarcaster } from "./components/auto-connect-wrapper";
import { useAccount } from "wagmi";

function AppContent() {
  const { isConnected } = useAccount();
  const { isInMiniApp, isCheckingContext, connectingTimedOut } = useFarcaster();

  // Still determining context — show a white screen with a spinner so the
  // transition from the Farcaster splash isn't a jarring white flash.
  if (isCheckingContext) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-gray-200 rounded-full border-t-gray-500" />
      </div>
    );
  }

  // Inside Farcaster mini app: the farcasterMiniApp connector auto-connects.
  // Never show WalletConnect or the Base sign-in button here.
  if (isInMiniApp && !isConnected) {
    if (connectingTimedOut) {
      return (
        <div className="flex min-h-dvh items-center justify-center p-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">Could not connect to Farcaster.</p>
            <p className="text-xs text-gray-400">Please close and reopen the app.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-gray-200 rounded-full border-t-gray-500" />
      </div>
    );
  }

  // Outside Farcaster (regular browser): show sign-in or app content.
  return (
    <div className="min-h-dvh bg-white">
      {isConnected ? (
        <LoggedIn />
      ) : (
        <div className="flex items-center justify-center min-h-dvh p-4">
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AutoConnectWrapper>
      <AppContent />
    </AutoConnectWrapper>
  );
}
