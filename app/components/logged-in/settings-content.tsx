"use client";
import React from "react";
import { Copy, LogOut, CheckCircle, Wallet } from "iconoir-react";
import { FarcasterProfile } from "../farcaster-profile";
import { ErrorBoundary } from "../error-boundary";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAccount } from "wagmi";
import { StatusBadge } from "../ui/status-badge";

interface SettingsContentProps {
  walletAddress: string;
  copied: boolean;
  onCopyAddress: () => void;
  onSignOut: () => void;
  onIdeaClick: (ideaId: string) => void;
}

// Uses api.ideas.getIdeas — the same proven query the board uses —
// and filters by address client-side. No separate Convex function needed.
// useQuery lives inside this component so the ErrorBoundary above it catches errors.
function ProfileIdeas({ onIdeaClick }: { onIdeaClick: (id: string) => void }) {
  const { address } = useAccount();
  const allIdeas = useQuery(api.ideas.getIdeas, { limit: 50 });

  const ideas = allIdeas?.filter(
    (idea) => idea.author === address && !idea.isRemix
  );

  if (!address || allIdeas === undefined) {
    return (
      <div className="space-y-2 animate-pulse">
        {[0, 1].map((i) => <div key={i} className="bg-gray-200 h-10 rounded-lg" />)}
      </div>
    );
  }

  if (!ideas || ideas.length === 0) {
    return <p className="text-sm text-gray-500">No ideas submitted yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ideas.map((idea) => (
        <button
          key={idea._id}
          onClick={() => onIdeaClick(idea._id)}
          title={idea.title}
          className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2.5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-colors duration-150 min-w-0 cursor-pointer"
          style={{ flexBasis: "calc(50% - 0.25rem)", maxWidth: "calc(50% - 0.25rem)" }}
        >
          <span className="font-medium text-gray-900 text-xs truncate flex-1 min-w-0">{idea.title}</span>
          <StatusBadge status={idea.status} className="px-1.5 py-0.5 text-[10px] flex-shrink-0" />
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
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 cursor-pointer"
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
          <button
            onClick={onSignOut}
            className="w-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center space-x-2 rounded-xl py-3 font-medium transition-colors"
          >
            <LogOut width={18} height={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
