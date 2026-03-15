"use client";

import { ReactNode, useEffect, useRef, useState, createContext, useContext } from "react";
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
  const [fid, setFid] = useState<number | null>(null);
  const [sdkUser, setSdkUser] = useState<FarcasterContextType["sdkUser"]>(null);
  const [connectingTimedOut, setConnectingTimedOut] = useState(false);

  // Stable refs so the one-shot effect always sees the latest wagmi values
  const connectAsyncRef = useRef(connectAsync);
  const connectorsRef = useRef(connectors);
  connectAsyncRef.current = connectAsync;
  connectorsRef.current = connectors;

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(inMiniApp);

        if (inMiniApp) {
          // Fetch Farcaster user context
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

          // Auto-connect the Farcaster wallet connector
          const farcasterConnector = connectorsRef.current.find(
            (c) => c.type === "farcasterMiniApp" || c.name.toLowerCase().includes("farcaster")
          );

          if (farcasterConnector) {
            const timeoutId = setTimeout(() => {
              setConnectingTimedOut(true);
            }, AUTO_CONNECT_TIMEOUT);

            try {
              await connectAsyncRef.current({ connector: farcasterConnector });
            } catch {
              setConnectingTimedOut(true);
            } finally {
              clearTimeout(timeoutId);
            }
          } else {
            setConnectingTimedOut(true);
          }
        }
      } catch {
        setIsInMiniApp(false);
      } finally {
        // Call ready() here — after we know what to show — so the Farcaster
        // splash screen is dismissed only when the app UI is actually ready.
        sdk.actions
          .ready()
          .catch((e) => console.error("[MiniApp] sdk.actions.ready() failed:", e));
        setIsCheckingContext(false);
      }
    };

    init();
  }, []); // Run exactly once on mount

  // Clear timeout state if user connects (e.g. reconnects externally)
  useEffect(() => {
    if (isConnected) {
      setConnectingTimedOut(false);
    }
  }, [isConnected]);

  return (
    <FarcasterContext.Provider
      value={{ fid, isInMiniApp, isCheckingContext, connectingTimedOut, sdkUser }}
    >
      {children}
    </FarcasterContext.Provider>
  );
}
