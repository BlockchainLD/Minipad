"use client";

import { SignInForm } from "./components/sign-in-form";
import { LoggedIn } from "./components/logged-in";
import { AutoConnectWrapper, useFarcaster } from "./components/auto-connect-wrapper";
import { useAccount } from "wagmi";

// Inline lightbulb icon — renders immediately without a network request.
const AppIcon = () => (
  <svg width="80" height="80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#7c3aed" rx="40" />
    <path d="M100 28 C76 28 57 47 57 71 C57 86 64.5 99 76 107.5 L76 134 L124 134 L124 107.5 C135.5 99 143 86 143 71 C143 47 124 28 100 28 Z"
      fill="none" stroke="white" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="80" y1="144" x2="120" y2="144" stroke="white" strokeWidth="7.5" strokeLinecap="round" />
    <line x1="86" y1="157" x2="114" y2="157" stroke="white" strokeWidth="7.5" strokeLinecap="round" />
    <line x1="100" y1="55" x2="100" y2="80" stroke="white" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

function AppContent() {
  const { isConnected } = useAccount();
  const { isInMiniApp, isCheckingContext, connectingTimedOut } = useFarcaster();

  // Still determining context — show the app icon so branding is visible
  // and the transition from the Farcaster splash into app content is seamless.
  if (isCheckingContext) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="animate-pulse"><AppIcon /></div>
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
        <div className="animate-pulse"><AppIcon /></div>
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
