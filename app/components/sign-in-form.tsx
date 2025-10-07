"use client";

import { useState } from "react";
import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { useConnect } from "wagmi";
import { 
  Typography, 
  Spinner
} from "@worldcoin/mini-apps-ui-kit-react";

export function SignInForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { connectAsync, connectors } = useConnect();

  const handleWalletConnect = async () => {
    setIsLoading(true);
    
    try {
      // Prefer Base Smart Wallet connector for web
      const baseConnector = connectors.find(c => c.name.toLowerCase().includes('base')) || connectors[0];
      const result = await connectAsync({ connector: baseConnector });
      console.log('Connected to wallet:', result.accounts[0]);
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-7 space-y-7">
      <div className="text-center space-y-3">
        <div className="space-y-3">
          <Typography variant="heading" className="text-gray-900">
            Minipad
          </Typography>
          <Typography variant="body" className="text-gray-600">
            Connect your wallet to continue
          </Typography>
        </div>
      </div>
      <div className="space-y-4">        
        {isLoading ? (
          <div className="flex items-center justify-center space-x-3 py-4">
            <Spinner />
            <Typography variant="body" className="text-gray-600">
              Connecting...
            </Typography>
          </div>
        ) : 
        <SignInWithBaseButton 
          align="center"
          variant="solid"
          colorScheme="light"
          onClick={handleWalletConnect}
        />}
      </div>
    </div>
  );
}
