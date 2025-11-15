"use client";

import { ReactNode, useEffect, useState, createContext, useContext, useRef } from "react";
import { useAccount, useConnect } from "wagmi";
import { sdk } from '@farcaster/miniapp-sdk';
import { AUTO_CONNECT_TIMEOUT } from "../lib/constants";

interface FarcasterContextType {
  fid: number | null;
  isInMiniApp: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  fid: null,
  isInMiniApp: false,
});

export const useFarcaster = () => useContext(FarcasterContext);

interface AutoConnectWrapperProps {
  children: ReactNode;
}

export function AutoConnectWrapper({ children }: AutoConnectWrapperProps) {
  const { isConnected, isConnecting } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
  const [fid, setFid] = useState<number | null>(null);
  const [connectingTimedOut, setConnectingTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset connectingTimedOut when connection succeeds
  useEffect(() => {
    if (isConnected) {
      setConnectingTimedOut(false);
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isConnected]);

  // Reset autoConnectAttempted when user disconnects to allow retry
  useEffect(() => {
    if (!isConnected && autoConnectAttempted) {
      // Only reset if we're still in mini app, otherwise keep the flag
      // This prevents infinite retry loops if user manually disconnects
      const checkAndReset = async () => {
        try {
          const inMiniApp = await sdk.isInMiniApp();
          if (inMiniApp) {
            setAutoConnectAttempted(false);
            setConnectingTimedOut(false);
          }
        } catch (error) {
          console.log('Error checking mini app status for reset:', error);
        }
      };
      checkAndReset();
    }
  }, [isConnected, autoConnectAttempted]);

  useEffect(() => {
    const checkMiniApp = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(inMiniApp);
        
        // Get FID from Farcaster context if available
        if (inMiniApp) {
          try {
            const context = await sdk.context;
            if (context?.user?.fid) {
              setFid(context.user.fid);
            }
          } catch (error) {
            console.log('Error getting Farcaster context:', error);
          }

          // Signal readiness to host before attempting wallet connect
          try {
            await sdk.actions.ready({ disableNativeGestures: true });
          } catch (error) {
            console.log('Error signaling ready to mini app host:', error);
          }
        }
        
        // If we're in a mini app and not connected, try to auto-connect
        if (inMiniApp && !isConnected && !autoConnectAttempted) {
          setAutoConnectAttempted(true);
          
          // Find Farcaster connector - check both type and name
          const farcasterConnector = connectors.find(connector => {
            const typeMatch = connector.type === 'farcasterMiniApp';
            const nameMatch = connector.name.toLowerCase().includes('farcaster');
            return typeMatch || nameMatch;
          });
          
          if (farcasterConnector) {
            console.log('Found Farcaster connector:', farcasterConnector.name, farcasterConnector.type);
            try {
              // Add a timeout so we never get stuck on loading
              setConnectingTimedOut(false);
              
              // Clear any existing timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              
              // Set new timeout
              timeoutRef.current = setTimeout(() => {
                console.log(`Auto-connect timeout after ${AUTO_CONNECT_TIMEOUT}ms`);
                setConnectingTimedOut(true);
                timeoutRef.current = null;
              }, AUTO_CONNECT_TIMEOUT);
              
              await connectAsync({ connector: farcasterConnector });
              
              // Clear timeout on success
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              console.log('Auto-connect succeeded');
            } catch (error) {
              console.log('Auto-connect failed:', error);
              setConnectingTimedOut(true);
              // Clear timeout on error
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            }
          } else {
            console.warn('Farcaster connector not found. Available connectors:', 
              connectors.map(c => ({ name: c.name, type: c.type }))
            );
            // If we're in mini app but connector not found, still mark as attempted
            // to prevent infinite retries
            setConnectingTimedOut(true);
          }
        }
      } catch (error) {
        console.log('Error checking mini app status:', error);
        setIsInMiniApp(false);
      }
    };

    checkMiniApp();

    // Cleanup function to clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isConnected, autoConnectAttempted, connectAsync, connectors]);

  // If we're in a mini app and connecting, show loading state
  if (isInMiniApp && isConnecting && !connectingTimedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-7 space-y-7 text-center">
          <div className="space-y-3">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
            <h2 className="font-sans antialiased font-semibold leading-narrow tracking-[-0.01em] text-2xl text-gray-900">
              Connecting Wallet...
            </h2>
            <p className="font-sans antialiased font-normal leading-compact text-base text-gray-600">
              Auto-connecting to your wallet in the Mini App
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show the main app content
  return (
    <FarcasterContext.Provider value={{ fid, isInMiniApp }}>
      <div>{children}</div>
    </FarcasterContext.Provider>
  );
}
