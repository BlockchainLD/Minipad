"use client";

import { ReactNode, useEffect, useState, createContext, useContext, useRef } from "react";
import { useAccount, useConnect } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import { AUTO_CONNECT_TIMEOUT } from "../lib/constants";

interface FarcasterContextType {
  fid: number | null;
  isInMiniApp: boolean;
  sdkUser: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
  fid: null,
  isInMiniApp: false,
  sdkUser: null,
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
  const [sdkUser, setSdkUser] = useState<FarcasterContextType["sdkUser"]>(null);
  const [connectingTimedOut, setConnectingTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isConnected) {
      setConnectingTimedOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected && autoConnectAttempted) {
      const checkAndReset = async () => {
        try {
          const inMiniApp = await sdk.isInMiniApp();
          if (inMiniApp) {
            setAutoConnectAttempted(false);
            setConnectingTimedOut(false);
          }
        } catch {
          // ignore
        }
      };
      checkAndReset();
    }
  }, [isConnected, autoConnectAttempted]);

  // Call ready() exactly once on mount to dismiss the splash screen.
  // This must happen as early as possible regardless of wallet/auth state.
  useEffect(() => {
    sdk.actions.ready({ disableNativeGestures: true }).catch(() => {});
  }, []);

  useEffect(() => {
    const checkMiniApp = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(inMiniApp);

        if (inMiniApp) {
          try {
            const context = await sdk.context;
            if (context?.user?.fid) {
              setFid(context.user.fid);
              setSdkUser({
                fid: context.user.fid,
                username: context.user.username,
                displayName: context.user.displayName,
                pfpUrl: context.user.pfpUrl,
              });
            }
          } catch {
            // ignore
          }
        }

        if (inMiniApp && !isConnected && !autoConnectAttempted) {
          setAutoConnectAttempted(true);

          const farcasterConnector = connectors.find(
            (c) => c.type === "farcasterMiniApp" || c.name.toLowerCase().includes("farcaster")
          );

          if (farcasterConnector) {
            try {
              setConnectingTimedOut(false);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(() => {
                setConnectingTimedOut(true);
                timeoutRef.current = null;
              }, AUTO_CONNECT_TIMEOUT);

              await connectAsync({ connector: farcasterConnector });

              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            } catch {
              setConnectingTimedOut(true);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            }
          } else {
            setConnectingTimedOut(true);
          }
        }
      } catch {
        setIsInMiniApp(false);
      }
    };

    checkMiniApp();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isConnected, autoConnectAttempted, connectAsync, connectors]);

  if (isInMiniApp && isConnecting && !connectingTimedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-7 space-y-7 text-center">
          <div className="space-y-3">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto" />
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

  return (
    <FarcasterContext.Provider value={{ fid, isInMiniApp, sdkUser }}>
      <div>{children}</div>
    </FarcasterContext.Provider>
  );
}
