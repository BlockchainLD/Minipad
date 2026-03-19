"use client";

import { useState } from "react";
import { useConnect } from "wagmi";
import { LightBulb } from "iconoir-react";

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
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
            <LightBulb width={28} height={28} className="text-violet-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Minipad</h1>
        <p className="text-base text-slate-500">
          Submit ideas, vote, remix, and build Farcaster miniapps.
        </p>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-3 py-4">
            <div className="animate-spin w-5 h-5 border-2 border-gray-200 rounded-full border-t-violet-600" />
            <span className="text-base text-slate-600">Connecting...</span>
          </div>
        ) : (
          <button
            onClick={handleWalletConnect}
            className="w-full py-3 px-6 bg-[#0052FF] hover:bg-[#0040CC] text-white font-semibold rounded-xl transition-colors duration-150"
          >
            Sign in with Base
          </button>
        )}
      </div>
    </div>
  );
}
