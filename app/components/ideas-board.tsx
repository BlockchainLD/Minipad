"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Heart, Flash, Hammer, LightBulb, OpenNewWindow } from "iconoir-react";
import { IdeaFilter, FilterOption } from "./idea-filter";
import { CompletionForm } from "./completion-form";
import { UserAvatar } from "./ui/user-avatar";
import { StatusBadge } from "./ui/status-badge";
import { ClaimButton, SubmitBuildButton } from "./ui/standard-button";
import { handleError } from "../lib/error-handler";
import { IdeaDetailModal } from "./idea-detail-modal";
import { ErrorBoundary } from "./error-boundary";

type Idea = {
  _id: Id<"ideas">;
  title: string;
  description: string;
  author: string;
  authorFid?: number;
  authorAvatar?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  timestamp: number;
  upvotes: number;
  status: "open" | "claimed" | "completed";
  claimedBy?: string;
  isRemix?: boolean;
  originalIdeaId?: Id<"ideas">;
  attestationUid?: string;
  githubUrl?: string;
  deploymentUrl?: string;
};

const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
  e.preventDefault();
  e.stopPropagation();
  callback();
};

// Inline upvote button for the card list
const CardUpvoteButton = ({
  ideaId,
  upvotes,
  onUpvote,
  onRemoveUpvote,
  address,
}: {
  ideaId: Id<"ideas">;
  upvotes: number;
  onUpvote: (id: Id<"ideas">) => void;
  onRemoveUpvote: (id: Id<"ideas">) => void;
  address: string | undefined;
}) => {
  const [optimisticUpvoted, setOptimisticUpvoted] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const hasUpvoted = useQuery(
    api.upvotes.hasUserUpvoted,
    address ? { ideaId, voter: address } : "skip"
  );

  const currentUpvotedState = optimisticUpvoted !== null ? optimisticUpvoted : hasUpvoted;

  useEffect(() => {
    if (hasUpvoted !== undefined && optimisticUpvoted !== null) {
      setOptimisticUpvoted(null);
      setOptimisticCount(null);
    }
  }, [hasUpvoted, optimisticUpvoted]);

  useEffect(() => {
    if (optimisticUpvoted !== null) {
      const t = setTimeout(() => {
        setOptimisticUpvoted(null);
        setOptimisticCount(null);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [optimisticUpvoted]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!address) {
      toast.error("Please connect your wallet to upvote");
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (currentUpvotedState === true) {
        setOptimisticUpvoted(false);
        setOptimisticCount((optimisticCount ?? upvotes) - 1);
        await onRemoveUpvote(ideaId);
      } else {
        setOptimisticUpvoted(true);
        setOptimisticCount((optimisticCount ?? upvotes) + 1);
        await onUpvote(ideaId);
      }
    } catch (error) {
      handleError(error, { operation: "upvote", component: "IdeasBoard" });
      setOptimisticUpvoted(null);
      setOptimisticCount(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const isUpvoted = currentUpvotedState === true;
  const isLoading = (hasUpvoted === undefined && !!address) || isProcessing;

  return (
    <button
      onClick={handleClick}
      disabled={!address || isLoading}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group ${
        isUpvoted
          ? "text-red-500 hover:text-red-600 hover:bg-red-50"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
      title={!address ? "Connect wallet to upvote" : isUpvoted ? "Remove upvote" : "Add upvote"}
    >
      <Heart
        width={18}
        height={18}
        fill={isUpvoted ? "currentColor" : "none"}
        stroke="currentColor"
        className={`group-hover:scale-110 transition-transform ${isUpvoted ? "text-red-500" : "text-gray-500"}`}
      />
      <span className="text-sm font-semibold">{optimisticCount ?? upvotes}</span>
      {isLoading && <span className="text-xs text-gray-400">...</span>}
    </button>
  );
};

interface IdeasBoardProps {
  onViewChange?: (view: "board" | "submit" | "complete" | "confirmation") => void;
  onProfileClick?: (authorAddress: string) => void;
  openIdeaId?: string | null;
  onIdeaOpened?: () => void;
}

export const IdeasBoard = ({ onViewChange, onProfileClick, openIdeaId, onIdeaOpened }: IdeasBoardProps) => {
  const { address } = useAccount();

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  // autoOpenRemixForm: when set, IdeaDetailModal opens its remix form immediately
  const [autoOpenRemixForm, setAutoOpenRemixForm] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterOption>("newest");

  const ideas = useQuery(api.ideas.getIdeas, { limit: 50 });
  const upvoteIdea = useMutation(api.upvotes.upvoteIdea);
  const removeUpvote = useMutation(api.upvotes.removeUpvote);
  const claimIdea = useMutation(api.claims.claimIdea);
  const unclaimIdea = useMutation(api.claims.unclaimIdea);
  const deleteIdea = useMutation(api.ideas.deleteIdea);

  // Keep selectedIdea in sync with latest data
  useEffect(() => {
    if (selectedIdea && ideas) {
      const updated = ideas.find((i) => i._id === selectedIdea._id);
      if (updated) setSelectedIdea(updated as Idea);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas, selectedIdea?._id]);

  // Open modal for a specific idea when navigated from another view (e.g. profile)
  useEffect(() => {
    if (openIdeaId && ideas) {
      const idea = ideas.find((i) => i._id === openIdeaId);
      if (idea) {
        setSelectedIdea(idea as Idea);
        setIsModalOpen(true);
        setAutoOpenRemixForm(false);
        onIdeaOpened?.();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIdeaId, ideas]);

  const handleUpvote = async (ideaId: Id<"ideas">) => {
    if (!address) { toast.error("Please connect your wallet"); return; }
    try {
      await upvoteIdea({ ideaId, voter: address });
    } catch (error) {
      handleError(error, { operation: "upvote idea", component: "IdeasBoard" });
    }
  };

  const handleRemoveUpvote = async (ideaId: Id<"ideas">) => {
    if (!address) { toast.error("Please connect your wallet"); return; }
    try {
      await removeUpvote({ ideaId, voter: address });
    } catch (error) {
      handleError(error, { operation: "remove upvote", component: "IdeasBoard" });
    }
  };

  // Opens the modal and immediately shows the inline remix form.
  // Remix submission is now handled entirely within IdeaDetailModal so
  // RemixesSection stays mounted and its Convex subscription stays alive.
  const handleRemix = (ideaId: Id<"ideas">) => {
    if (!address) { toast.error("Please connect your wallet"); return; }
    const original = ideas?.find((i) => i._id === ideaId);
    if (!original) { toast.error("Original idea not found"); return; }
    setSelectedIdea(original as Idea);
    setIsModalOpen(true);
    setAutoOpenRemixForm(true);
  };

  const handleClaim = async (ideaId: Id<"ideas">) => {
    if (!address) { toast.error("Please connect your wallet"); return; }
    try {
      await claimIdea({ ideaId, claimer: address });
      toast.success("Idea claimed! Start building.");
    } catch (error) {
      handleError(error, { operation: "claim idea", component: "IdeasBoard" });
    }
  };

  const handleUnclaim = async (ideaId: Id<"ideas">) => {
    if (!address) { toast.error("Please connect your wallet"); return; }
    if (!window.confirm("Unclaim this idea? It will become available for others to claim.")) return;
    try {
      await unclaimIdea({ ideaId, claimer: address });
      toast.success("Idea unclaimed.");
    } catch (error) {
      handleError(error, { operation: "unclaim idea", component: "IdeasBoard" });
    }
  };

  const handleDelete = async (ideaId: Id<"ideas">) => {
    if (!address) { toast.error("Please connect your wallet"); return; }
    if (!window.confirm("Delete this idea? This cannot be undone.")) return;
    try {
      await deleteIdea({ ideaId, author: address });
      toast.success("Idea deleted.");
      closeModal();
    } catch (error) {
      handleError(error, { operation: "delete idea", component: "IdeasBoard" });
    }
  };

  const openModal = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
    setAutoOpenRemixForm(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAutoOpenRemixForm(false);
    setShowCompletionForm(false);
    setSelectedIdea(null);
  };

  const filteredAndSortedIdeas = React.useMemo(() => {
    if (!ideas) return [];
    const filtered = ideas.filter((idea) => !idea.isRemix);
    switch (currentFilter) {
      case "newest":
        return filtered.sort((a, b) => b.timestamp - a.timestamp);
      case "most-popular":
        return filtered.sort((a, b) => b.upvotes - a.upvotes);
      case "claimed":
        return filtered
          .filter((idea) => idea.status === "claimed")
          .sort((a, b) => b.timestamp - a.timestamp);
      case "completed":
        return filtered
          .filter((idea) => idea.status === "completed")
          .sort((a, b) => b.timestamp - a.timestamp);
      default:
        return filtered;
    }
  }, [ideas, currentFilter]);

  if (!ideas) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8">
      <div className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Ideas</h1>
          <Button
            variant="primary"
            onClick={() => {
              onViewChange?.("submit");
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            size="sm"
            className="rounded-xl"
          >
            + New Idea
          </Button>
        </div>
        <IdeaFilter currentFilter={currentFilter} onFilterChange={setCurrentFilter} />
      </div>

      <div className="space-y-4">
        {filteredAndSortedIdeas.map((idea) => (
          <div
            key={idea._id}
            onClick={() => openModal(idea as Idea)}
            className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 group"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 break-words mb-2">
                  {idea.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onProfileClick?.(idea.author); }}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <UserAvatar
                      author={idea.author}
                      authorAvatar={idea.authorAvatar}
                      authorDisplayName={idea.authorDisplayName}
                      authorUsername={idea.authorUsername}
                      size={24}
                    />
                    <span className="text-sm text-gray-600">
                      {idea.authorDisplayName || idea.authorUsername || "Anonymous"}
                    </span>
                  </button>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3 break-words">{idea.description}</p>
              </div>
              <StatusBadge status={idea.status} className="px-3 py-1.5" />
            </div>

            <div className="flex items-center gap-2">
              <CardUpvoteButton
                ideaId={idea._id}
                upvotes={idea.upvotes}
                onUpvote={handleUpvote}
                onRemoveUpvote={handleRemoveUpvote}
                address={address}
              />

              {idea.status !== "completed" && (
                <button
                  onClick={(e) => handleButtonClick(e, () => handleRemix(idea._id))}
                  className="flex items-center justify-center p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 hover:scale-105 group"
                  title="Add your take"
                >
                  <Flash width={18} height={18} className="group-hover:scale-110 transition-transform" />
                </button>
              )}

              {idea.status === "completed" && idea.deploymentUrl && (
                <a
                  href={idea.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                  title="View live app"
                >
                  <OpenNewWindow width={14} height={14} />
                  View App
                </a>
              )}

              {idea.status === "open" && (
                <ClaimButton onClick={(e) => handleButtonClick(e, () => handleClaim(idea._id))} />
              )}

              {idea.status === "claimed" && idea.claimedBy === address && (
                <SubmitBuildButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedIdea(idea as Idea);
                    setShowCompletionForm(true);
                  }}
                />
              )}
            </div>
          </div>
        ))}

        {filteredAndSortedIdeas.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-3xl p-12 border border-gray-100">
              {currentFilter === "claimed" ? (
                <>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hammer width={32} height={32} className="text-yellow-600" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">No claimed ideas found</p>
                  <p className="text-gray-500">Try a different filter or submit a new idea!</p>
                </>
              ) : currentFilter === "completed" ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <OpenNewWindow width={32} height={32} className="text-green-600" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">No completed ideas yet</p>
                  <p className="text-gray-500">Ideas that have been built and deployed will appear here.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LightBulb width={32} height={32} className="text-black" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">No ideas submitted yet</p>
                  <p className="text-gray-500">Be the first to submit a miniapp idea!</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion Form Modal */}
      {showCompletionForm && selectedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CompletionForm
              ideaId={selectedIdea._id}
              onSuccess={() => {
                setShowCompletionForm(false);
                setSelectedIdea(null);
                setIsModalOpen(false);
                toast.success("Build submitted successfully!");
              }}
              onCancel={() => setShowCompletionForm(false)}
            />
          </div>
        </div>
      )}

      {/* Idea Detail Modal — RemixForm is now rendered inside IdeaDetailModal
          as a z-[60] overlay so RemixesSection stays mounted and its Convex
          subscription delivers new remixes the moment createRemix completes. */}
      {selectedIdea && !showCompletionForm && (
        <ErrorBoundary
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                <p className="text-gray-700 font-medium mb-2">Could not load idea details</p>
                <p className="text-sm text-gray-500 mb-4">Please try again.</p>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <IdeaDetailModal
            idea={selectedIdea}
            isOpen={isModalOpen}
            onClose={closeModal}
            onUpvote={handleUpvote}
            onRemoveUpvote={handleRemoveUpvote}
            onClaim={handleClaim}
            onUnclaim={handleUnclaim}
            onDelete={handleDelete}
            onOpenCompletionForm={() => setShowCompletionForm(true)}
            onProfileClick={onProfileClick}
            address={address}
            autoOpenRemixForm={autoOpenRemixForm}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
