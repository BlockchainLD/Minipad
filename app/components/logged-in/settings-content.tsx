"use client";
import React from "react";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { Copy, LogOut, CheckCircle, Wallet } from "iconoir-react";
import { FarcasterProfile } from "../farcaster-profile";
import { ErrorBoundary } from "../error-boundary";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAccount } from "wagmi";
import { StatusBadge } from "../ui/status-badge";
import { Id } from "../../../convex/_generated/dataModel";

interface SettingsContentProps {
  walletAddress: string;
  copied: boolean;
  onCopyAddress: () => void;
  onSignOut: () => void;
  onIdeaClick: (ideaId: Id<"ideas">) => void;
}

// useQuery lives inside this component so the ErrorBoundary wrapping it
// can actually catch Convex server errors.
function ProfileIdeas({ onIdeaClick }: { onIdeaClick: (id: Id<"ideas">) => void }) {
  const { address } = useAccount();

  const ideas = useQuery(
    api.userIdeas.getUserSubmittedIdeas,
    address ? { author: address } : "skip"
  );

  if (!address || ideas === undefined) {
    return (
      <div className="space-y-2 animate-pulse">
        {[0, 1].map((i) => (
          <div key={i} className="bg-gray-200 h-10 rounded-lg" />
        ))}
      </div>
    );
  }

  if (ideas.length === 0) {
    return <p className="text-sm text-gray-500">No ideas submitted yet.</p>;
  }

  return (
    <div className="space-y-2">
      {ideas.map((idea) => (
        <button
          key={idea._id}
          onClick={() => onIdeaClick(idea._id as Id<"ideas">)}
          className="w-full text-left bg-white rounded-lg px-3 py-2.5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150 flex items-center justify-between gap-2"
        >
          <span className="font-medium text-gray-900 text-sm truncate">{idea.title}</span>
          <StatusBadge status={idea.status} className="px-2 py-0.5 text-xs flex-shrink-0" />
        </button>
      ))}
    </div>
  );
}

export const SettingsContent = ({
  walletAddress,
  copied,
  onCopyAddress,
  onSignOut,
  onIdeaClick,
}: SettingsContentProps) => {
  return (
    <div className="space-y-6">
      <ErrorBoundary>
        <FarcasterProfile />
      </ErrorBoundary>

      <div className="space-y-3">
        <p className="font-semibold text-black">Your Ideas</p>
        <ErrorBoundary fallback={<p className="text-sm text-gray-500">Could not load ideas.</p>}>
          <ProfileIdeas onIdeaClick={onIdeaClick} />
        </ErrorBoundary>
      </div>

      <div className="space-y-3">
        <p className="font-semibold text-black">Wallet</p>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Wallet width={18} height={18} className="text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="overflow-x-auto">
                  <p className="text-gray-600 whitespace-nowrap text-sm">
                    {walletAddress || "Loading..."}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onCopyAddress}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Copy address"
            >
              {copied ? (
                <CheckCircle width={16} height={16} className="text-green-500" />
              ) : (
                <Copy width={16} height={16} />
              )}
            </button>
          </div>
        </div>
        <div className="pt-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={onSignOut}
            className="!bg-red-500 !text-white hover:!bg-red-600 flex items-center justify-center space-x-2"
          >
            <LogOut width={18} height={18} />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
