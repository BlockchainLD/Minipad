"use client";

import { useState } from "react";
import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { useConnect } from "wagmi";

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { connectAsync, connectors } = useConnect();

  const handleWalletConnect = async () => {
    setIsLoading(true);
    try {
      const baseConnector =
        connectors.find((c) => c.name.toLowerCase().includes("base")) || connectors[0];
      await connectAsync({ connector: baseConnector });
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-gray-100">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">Minipad</h1>
        <p className="text-base text-gray-600">
          Submit ideas, vote, remix, and build Farcaster miniapps.
        </p>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-3 py-4">
            <div className="animate-spin w-5 h-5 border-2 border-gray-300 rounded-full border-t-gray-600" />
            <span className="text-base text-gray-600">Connecting...</span>
          </div>
        ) : (
          <SignInWithBaseButton
            align="center"
            variant="solid"
            colorScheme="light"
            onClick={handleWalletConnect}
          />
        )}
      </div>
    </div>
  );
}
