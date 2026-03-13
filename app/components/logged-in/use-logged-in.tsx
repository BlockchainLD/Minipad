import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { TABS, COPY_NOTIFICATION_TIMEOUT } from "../../lib/constants";

type TabName = typeof TABS.HOME | typeof TABS.SETTINGS;

export const useLoggedIn = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>(TABS.HOME);

  const walletAddress = address || "";

  const handleSignOut = () => {
    try {
      disconnect();
    } catch {
      // non-critical
    }
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_NOTIFICATION_TIMEOUT);
    }
  };

  return {
    copied,
    activeTab,
    setActiveTab,
    handleSignOut,
    walletAddress,
    handleCopyAddress,
  };
};
