import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { TABS, COPY_NOTIFICATION_TIMEOUT } from "../../lib/constants";

export const useLoggedIn = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedUserId, setCopiedUserId] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(TABS.HOME);

  const handleSignOut = async () => {
    try {
      disconnect();
    } catch (error) {
      // Disconnect errors are usually non-critical (user cancelled, etc.)
      // Silently handle to avoid unnecessary error messages
    }
  };

  const walletAddress = address || '';

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_NOTIFICATION_TIMEOUT);
    }
  };

  const handleCopyUserId = async () => {
    const userId = walletAddress; // Use wallet address as user ID for now
    if (userId) {
      await navigator.clipboard.writeText(userId);
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), COPY_NOTIFICATION_TIMEOUT);
    }
  };

  return {
    copied,
    copiedUserId,
    activeTab,
    setActiveTab,
    handleSignOut,
    walletAddress,
    handleCopyAddress,
    handleCopyUserId,
    userId: walletAddress, // Use wallet address as user ID for now
  };
};
