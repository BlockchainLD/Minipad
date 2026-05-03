"use client";

import { LoggedIn } from "./components/logged-in";
import { AutoConnectWrapper, useFarcaster } from "./components/auto-connect-wrapper";
import { useAccount } from "wagmi";

const AppIcon = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/icon.png" alt="Minipad" width={80} height={80} style={{ borderRadius: 16 }} />
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

  // Outside Farcaster (regular browser): always show the app interface.
  // Wallet connection is available via the header button.
  return (
    <div className="min-h-dvh bg-white">
      <LoggedIn />
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
