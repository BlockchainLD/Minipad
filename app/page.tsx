"use client";

import { SignInForm } from "./components/sign-in-form";
import { LoggedIn } from "./components/logged-in";
import { AutoConnectWrapper } from "./components/auto-connect-wrapper";
import { SafeAreaView } from "@worldcoin/mini-apps-ui-kit-react";
import { useAccount } from "wagmi";

function AppContent() {
  const { isConnected } = useAccount();


  // Always show content - don't rely on mobile detection for now
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