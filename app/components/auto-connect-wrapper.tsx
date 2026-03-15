"use client";

import { ReactNode, useEffect, useState, createContext, useContext, useRef } from "react";
import { useAccount, useConnect } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import { AUTO_CONNECT_TIMEOUT } from "../lib/constants";

interface FarcasterContextType {
  fid: number | null;
  isInMiniApp: boolean;
  isCheckingContext: boolean;
  connectingTimedOut: boolean;
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
  isCheckingContext: true,
  connectingTimedOut: false,
  sdkUser: null,
});

export const useFarcaster = () => useContext(FarcasterContext);

interface AutoConnectWrapperProps {
  children: ReactNode;
}

export function AutoConnectWrapper({ children }: AutoConnectWrapperProps) {
  const { isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isCheckingContext, setIsCheckingContext] = useState(true);
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

  // Call ready() exactly once on mount to dismiss the Farcaster splash screen.
  useEffect(() => {
    sdk.actions
      .ready()
      .catch((e) => console.error("[MiniApp] sdk.actions.ready() failed (AutoConnectWrapper):", e));
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
      } finally {
        setIsCheckingContext(false);
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

  return (
    <FarcasterContext.Provider
      value={{ fid, isInMiniApp, isCheckingContext, connectingTimedOut, sdkUser }}
    >
      {children}
    </FarcasterContext.Provider>
  );
}
