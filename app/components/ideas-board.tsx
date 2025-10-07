"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { easService } from "../lib/eas";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
// import { RemixForm } from "../remix-form";

interface IdeasBoardProps {
  onIdeaClick?: (ideaId: Id<"ideas">) => void;
  onViewChange?: (view: "board" | "submit" | "complete") => void;
}

export const IdeasBoard = ({ onIdeaClick, onViewChange }: IdeasBoardProps) => {
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const { address } = useAccount();
  
  const ideas = useQuery(api.ideas.getIdeas, { limit: 50 });
  const upvoteIdea = useMutation(api.upvotes.upvoteIdea);
  const claimIdea = useMutation(api.claims.claimIdea);

  const handleUpvote = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // Create EAS attestation for upvote
      const attestationTx = await easService.createUpvoteAttestation(
        ideaId,
        address
      );
      
      await attestationTx.wait();

      // Add upvote to Convex
      await upvoteIdea({
        ideaId,
        voter: address,
        attestationUid: attestationTx.uid,
      });

      toast.success("Upvoted!");
    } catch (error) {
      console.error("Error upvoting:", error);
      toast.error("Failed to upvote. Please try again.");
    }
  };

  const handleClaim = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // Create EAS attestation for claim
      const attestationTx = await easService.createClaimAttestation(
        ideaId,
        address
      );
      
      await attestationTx.wait();

      // Claim the idea
      await claimIdea({
        ideaId,
        claimer: address,
        attestationUid: attestationTx.uid,
      });

      toast.success("Idea claimed! Start building!");
    } catch (error) {
      console.error("Error claiming idea:", error);
      toast.error("Failed to claim idea. Please try again.");
    }
  };


  const sortedIdeas = ideas?.sort((a, b) => {
    if (sortBy === "newest") {
      return b.timestamp - a.timestamp;
    } else {
      return b.upvotes - a.upvotes;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "claimed":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Open";
      case "claimed":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  if (!ideas) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Miniapp Ideas Board
          </h1>
          <Button
            variant="primary"
            onClick={() => {
              // Ensure main view switches to Ideas (home) and opens submit
              onViewChange?.("submit");
              if (typeof window !== 'undefined') {
                // scroll to top for a seamless transition
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            size="sm"
          >
            Submit Idea
          </Button>
        </div>
        
        <div className="flex gap-2 mb-6">
          <Button
            variant={sortBy === "newest" ? "primary" : "secondary"}
            onClick={() => setSortBy("newest")}
            size="sm"
          >
            Newest
          </Button>
          <Button
            variant={sortBy === "popular" ? "primary" : "secondary"}
            onClick={() => setSortBy("popular")}
            size="sm"
          >
            Most Popular
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedIdeas?.map((idea) => (
          <div key={idea._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {idea.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {idea.description}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                {getStatusText(idea.status)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>👤 {idea.author.slice(0, 6)}...{idea.author.slice(-4)}</span>
                <span>👍 {idea.upvotes}</span>
                <span>🕒 {new Date(idea.timestamp).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2">
                {idea.status === "open" && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpvote(idea._id)}
                    >
                      Upvote
                    </Button>
                    {/* <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemix(idea)}
                    >
                      Remix
                    </Button> */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleClaim(idea._id)}
                    >
                      Claim to Build
                    </Button>
                  </>
                )}
                
                {idea.status === "claimed" && idea.claimedBy === address && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onIdeaClick?.(idea._id)}
                  >
                    Mark Complete
                  </Button>
                )}
                
                {idea.status === "completed" && idea.miniappUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(idea.miniappUrl, '_blank')}
                  >
                    View App
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {sortedIdeas?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No ideas submitted yet.</p>
            <p className="text-gray-400">Be the first to submit a miniapp idea!</p>
          </div>
        )}
      </div>

      {/* Remix form temporarily disabled */}
    </div>
  );
};
