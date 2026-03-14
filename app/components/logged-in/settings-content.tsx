"use client";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { Copy, LogOut, CheckCircle, Wallet, LightBulb, Hammer, Tools } from "iconoir-react";
import { FarcasterProfile } from "../farcaster-profile";
import { ErrorBoundary } from "../error-boundary";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAccount } from "wagmi";
import { IdeaListItem } from "./idea-list-item";
import { Id } from "../../../convex/_generated/dataModel";
import { IDEAS_PER_SECTION } from "../../lib/constants";

type UserIdea = {
  _id: Id<"ideas">;
  title: string;
  description: string;
  status: "open" | "claimed" | "completed";
  timestamp: number;
  deploymentUrl?: string;
};

interface SettingsContentProps {
  walletAddress: string;
  copied: boolean;
  onCopyAddress: () => void;
  onSignOut: () => void;
}

function IdeasSection() {
  const { address } = useAccount();

  const submittedIdeas = useQuery(
    api.userIdeas.getUserSubmittedIdeas,
    address ? { author: address } : "skip"
  );
  const claimedIdeas = useQuery(
    api.userIdeas.getUserClaimedIdeas,
    address ? { claimer: address } : "skip"
  );
  const completedIdeas = useQuery(
    api.userIdeas.getUserCompletedIdeas,
    address ? { claimer: address } : "skip"
  );

  return (
    <div className="space-y-4">
      <p className="font-semibold text-black">Your Ideas</p>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <LightBulb width={20} height={20} className="text-blue-600" />
          <p className="text-sm font-semibold text-black">
            Submitted ({submittedIdeas?.length ?? 0})
          </p>
        </div>
        {submittedIdeas && submittedIdeas.length > 0 ? (
          <div className="space-y-2">
            {submittedIdeas.slice(0, IDEAS_PER_SECTION).map((idea: UserIdea) => (
              <IdeaListItem key={idea._id} idea={idea} />
            ))}
            {submittedIdeas.length > IDEAS_PER_SECTION && (
              <p className="text-xs text-gray-500 text-center mt-2">
                +{submittedIdeas.length - IDEAS_PER_SECTION} more
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No ideas submitted yet</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hammer width={20} height={20} className="text-yellow-600" />
          <p className="text-sm font-semibold text-black">
            Claimed ({claimedIdeas?.length ?? 0})
          </p>
        </div>
        {claimedIdeas && claimedIdeas.length > 0 ? (
          <div className="space-y-2">
            {claimedIdeas.slice(0, IDEAS_PER_SECTION).map((idea: UserIdea) => (
              <IdeaListItem key={idea._id} idea={idea} />
            ))}
            {claimedIdeas.length > IDEAS_PER_SECTION && (
              <p className="text-xs text-gray-500 text-center mt-2">
                +{claimedIdeas.length - IDEAS_PER_SECTION} more
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No ideas claimed yet</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tools width={20} height={20} className="text-green-600" />
          <p className="text-sm font-semibold text-black">
            Deployed ({completedIdeas?.length ?? 0})
          </p>
        </div>
        {completedIdeas && completedIdeas.length > 0 ? (
          <div className="space-y-2">
            {completedIdeas.slice(0, IDEAS_PER_SECTION).map((idea: UserIdea) => (
              <IdeaListItem key={idea._id} idea={idea} />
            ))}
            {completedIdeas.length > IDEAS_PER_SECTION && (
              <p className="text-xs text-gray-500 text-center mt-2">
                +{completedIdeas.length - IDEAS_PER_SECTION} more
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No ideas deployed yet</p>
        )}
      </div>
    </div>
  );
}

export const SettingsContent = ({
  walletAddress,
  copied,
  onCopyAddress,
  onSignOut,
}: SettingsContentProps) => {
  return (
    <div className="space-y-6">
      <ErrorBoundary>
        <FarcasterProfile />
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            Could not load your ideas. Please try again.
          </div>
        }
      >
        <IdeasSection />
      </ErrorBoundary>

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
