"use client";

import { useQuery } from "convex/react";
import { Bell } from "iconoir-react";
import { api } from "../../convex/_generated/api";

interface Props {
  walletAddress: string;
  onClick: () => void;
}

// Isolated component so a Convex query failure (e.g. when the deployed
// Next.js bundle is ahead of the deployed Convex schema) is contained
// by an ErrorBoundary in the parent and can't take down the page.
export const NotificationBell = ({ walletAddress, onClick }: Props) => {
  const unread = useQuery(
    api.notifications.unreadCountForUser,
    walletAddress ? { recipient: walletAddress } : "skip",
  );
  const count = unread ?? 0;
  return (
    <button
      onClick={onClick}
      className="relative p-1.5 rounded-lg hover:bg-violet-50 transition-colors"
      aria-label="Notifications"
      title="Notifications"
    >
      <Bell width={20} height={20} className="text-violet-500" />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
          aria-label={`${count} unread notifications`}
        >
          {count >= 10 ? "10+" : count}
        </span>
      )}
    </button>
  );
};
