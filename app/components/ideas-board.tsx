"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Heart, Hammer, Flash, Xmark, Trash, LightBulb } from "iconoir-react";
import { IdeaFilter, FilterOption } from "./idea-filter";
import { CompletionForm } from "./completion-form";
import { RemixForm } from "./remix-form";
import { UserAvatar } from "./ui/user-avatar";
import { StatusBadge } from "./ui/status-badge";
import { ClaimButton, UnclaimButton, SubmitBuildButton } from "./ui/standard-button";
import { handleError } from "../lib/error-handler";

// Types
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

// Helper function to handle button clicks with event prevention
const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
  e.preventDefault();
  e.stopPropagation();
  callback();
};


// Idea Detail Modal Component
const IdeaDetailModal = ({ 
  idea, 
  isOpen, 
  onClose, 
  onUpvote, 
  onRemoveUpvote, 
  onRemix, 
  onClaim, 
  onUnclaim,
  onDelete,
  onRemixUpvote,
  onRemixDelete,
  onOpenCompletionForm,
  onProfileClick,
  address 
}: {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
  onUpvote: (ideaId: Id<"ideas">) => void;
  onRemoveUpvote: (ideaId: Id<"ideas">) => void;
  onRemix: (ideaId: Id<"ideas">) => void;
  onClaim: (ideaId: Id<"ideas">) => void;
  onUnclaim: (ideaId: Id<"ideas">) => void;
  onDelete: (ideaId: Id<"ideas">) => void;
  onRemixUpvote: (remixId: Id<"ideas">) => void;
  onRemixDelete: (remixId: Id<"ideas">) => void;
  onOpenCompletionForm: () => void;
  onProfileClick?: (authorAddress: string) => void;
  address: string | undefined;
}) => {
  // Fetch remixes for this idea
  const remixes = useQuery(api.remixes.getRemixesForIdea, 
    idea ? { originalIdeaId: idea._id } : "skip"
  );
  
  // Remixes are automatically fetched via Convex reactivity
  
  // Optimistic upvote count state
  const [optimisticUpvotes, setOptimisticUpvotes] = useState<number | null>(null);
  
  // Reset optimistic upvote count when idea changes
  useEffect(() => {
    if (idea) {
      setOptimisticUpvotes(null);
    }
  }, [idea]);
  
  // Handle ESC key and click outside to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !idea) return null;



  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 flex flex-col border border-gray-100">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900">Idea Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          >
            <Xmark width={18} height={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{idea.title}</h1>
            
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onProfileClick?.(idea.author);
                }}
                className="hover:opacity-80 transition-opacity"
              >
                <UserAvatar
                  author={idea.author}
                  authorAvatar={idea.authorAvatar}
                  authorDisplayName={idea.authorDisplayName}
                  authorUsername={idea.authorUsername}
                  size={48}
                />
              </button>
              <div className="min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfileClick?.(idea.author);
                  }}
                  className="text-lg font-medium text-gray-900 hover:opacity-80 transition-opacity"
                >
                  {idea.authorDisplayName || idea.authorUsername || "Anonymous"}
                </button>
              </div>
            </div>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Heart width={16} height={16} />
                <span>{optimisticUpvotes ?? idea.upvotes} upvotes</span>
              </div>
              <div className="flex items-center gap-2">
                <Flash width={16} height={16} />
                <span>{remixes?.length || 0} remixes</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-8">
              <StatusBadge status={idea.status} className="px-4 py-2 text-sm" />
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
              </div>
            </div>

            {/* Build Links - Only show for completed ideas */}
            {idea.status === "completed" && (idea.githubUrl || idea.deploymentUrl) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Build Links</h3>
                <div className="space-y-3">
                  {idea.deploymentUrl && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Flash width={20} height={20} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-900">Live App</p>
                        <a 
                          href={idea.deploymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-sm break-all"
                        >
                          {idea.deploymentUrl}
                        </a>
                      </div>
                      <a
                        href={idea.deploymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                      >
                        View App
                      </a>
                    </div>
                  )}
                  
                  {idea.githubUrl && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg width={20} height={20} className="text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Source Code</p>
                        <a 
                          href={idea.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-700 text-sm break-all"
                        >
                          {idea.githubUrl}
                        </a>
                      </div>
                      <a
                        href={idea.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                      >
                        View Code
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remixes Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Flash width={20} height={20} className="text-yellow-500" />
                Remixes ({remixes?.length || 0})
              </h3>
              
              {remixes && remixes.length > 0 ? (
                <div className="space-y-4">
                  {remixes.map((remix) => (
                      <div key={remix._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <UserAvatar
                              author={remix.author}
                              authorAvatar={remix.authorAvatar}
                              authorDisplayName={remix.authorDisplayName}
                              authorUsername={remix.authorUsername}
                              size={32}
                            />
                          </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">{remix.title}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(remix.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">
                              by {remix.authorDisplayName || remix.authorUsername || "Anonymous"}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {remix.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Heart width={12} height={12} />
                                <span>{remix.upvotes} upvotes</span>
                              </div>
                            <StatusBadge status={remix.status} className="px-2 py-1 text-xs" />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Upvote button for remix */}
                              <RemixUpvoteButton
                                remixId={remix._id}
                                onUpvote={onRemixUpvote}
                                address={address}
                              />
                              
                              {/* Delete button - only show for the remix author */}
                              {address && remix.author === address && (
                                <button
                                  onClick={(e) => handleButtonClick(e, () => onRemixDelete(remix._id))}
                                  className="flex items-center justify-center p-1 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-105"
                                  title="Delete this remix (only you can see this)"
                                >
                                  <Trash width={14} height={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Flash width={32} height={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No remixes yet</p>
                  <p className="text-sm">Be the first to remix this idea!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50 p-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <UpvoteButton
              ideaId={idea._id}
              upvotes={idea.upvotes}
              onUpvote={onUpvote}
              onRemoveUpvote={onRemoveUpvote}
              address={address}
              optimisticUpvotes={optimisticUpvotes}
              onOptimisticUpvoteChange={setOptimisticUpvotes}
            />
            
            <button
              onClick={(e) => handleButtonClick(e, () => onRemix(idea._id))}
              className="flex items-center justify-center p-2 text-yellow-500 hover:text-yellow-600 transition-all duration-200 hover:scale-105"
              title="Remix this idea"
            >
              <Flash width={20} height={20} />
            </button>
            
            {idea.status === "open" && (
              <ClaimButton
                onClick={(e) => handleButtonClick(e, () => onClaim(idea._id))}
              />
            )}
            
            {idea.status === "claimed" && address && idea.claimedBy === address && (
              <>
                <SubmitBuildButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenCompletionForm();
                  }}
                />
                
                <UnclaimButton
                  onClick={(e) => handleButtonClick(e, () => onUnclaim(idea._id))}
                />
              </>
            )}
            
            {/* Delete button - only show for the author */}
            {address && idea.author === address && (
              <button
                onClick={(e) => handleButtonClick(e, () => onDelete(idea._id))}
                className="flex items-center justify-center p-2 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-105"
                title="Delete this idea (only you can see this)"
              >
                <Trash width={20} height={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for upvote button
const UpvoteButton = ({ 
  ideaId, 
  upvotes, 
  onUpvote, 
  onRemoveUpvote,
  address,
  optimisticUpvotes,
  onOptimisticUpvoteChange
}: { 
  ideaId: Id<"ideas">; 
  upvotes: number; 
  onUpvote: (ideaId: Id<"ideas">) => void; 
  onRemoveUpvote: (ideaId: Id<"ideas">) => void;
  address: string | undefined;
  optimisticUpvotes?: number | null;
  onOptimisticUpvoteChange?: (count: number | null) => void;
}) => {
  const [optimisticUpvoted, setOptimisticUpvoted] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const hasUpvoted = useQuery(api.upvotes.hasUserUpvoted, 
    address ? { ideaId, voter: address } : "skip"
  );

  const isConnected = !!address;
  const canInteract = isConnected; // Allow users to upvote their own ideas
  
  // Use optimistic state if available, otherwise use query result
  const currentUpvotedState = optimisticUpvoted !== null ? optimisticUpvoted : hasUpvoted;
  
  // Reset optimistic state when query result changes
  useEffect(() => {
    if (hasUpvoted !== undefined && optimisticUpvoted !== null) {
      setOptimisticUpvoted(null);
    }
  }, [hasUpvoted, optimisticUpvoted]);
  
  // Clear optimistic state after timeout as fallback
  useEffect(() => {
    if (optimisticUpvoted !== null) {
      const timeout = setTimeout(() => {
        setOptimisticUpvoted(null);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [optimisticUpvoted]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isConnected) {
      toast.error("Please connect your wallet to upvote");
      return;
    }
    
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Handle the upvote toggle with optimistic updates
      if (currentUpvotedState === true) {
        setOptimisticUpvoted(false); // Optimistic update
        // Optimistically decrease upvote count
        if (onOptimisticUpvoteChange) {
          onOptimisticUpvoteChange((optimisticUpvotes ?? upvotes) - 1);
        }
        await onRemoveUpvote(ideaId);
      } else {
        setOptimisticUpvoted(true); // Optimistic update
        // Optimistically increase upvote count
        if (onOptimisticUpvoteChange) {
          onOptimisticUpvoteChange((optimisticUpvotes ?? upvotes) + 1);
        }
        await onUpvote(ideaId);
      }
    } catch (error) {
      handleError(error, { operation: "handle click", component: "IdeasBoard" });
      // Revert optimistic updates on error
      setOptimisticUpvoted(null);
      if (onOptimisticUpvoteChange) {
        onOptimisticUpvoteChange(upvotes); // Revert to original count
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine visual state
  const isUpvoted = currentUpvotedState === true;
  const isLoading = (hasUpvoted === undefined && isConnected) || isProcessing;

  return (
    <button
      onClick={handleClick}
      disabled={!canInteract || isLoading}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group ${
        isUpvoted 
          ? "text-red-500 hover:text-red-600 hover:bg-red-50" 
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
      title={
        !isConnected ? "Connect wallet to upvote" :
        isUpvoted ? "Remove upvote" : "Add upvote"
      }
    >
      <Heart 
        width={18} 
        height={18} 
        fill={isUpvoted ? "currentColor" : "none"}
        stroke="currentColor"
        className={`group-hover:scale-110 transition-transform ${isUpvoted ? "text-red-500" : "text-gray-500"}`}
      />
      <span className="text-sm font-semibold">{optimisticUpvotes ?? upvotes}</span>
      {isLoading && <span className="text-xs text-gray-400">...</span>}
    </button>
  );
};

// Helper component for remix upvote button
const RemixUpvoteButton = ({ 
  remixId, 
  onUpvote, 
  address
}: { 
  remixId: Id<"ideas">; 
  onUpvote: (remixId: Id<"ideas">) => void; 
  address: string | undefined;
}) => {
  const [optimisticUpvoted, setOptimisticUpvoted] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const hasUpvoted = useQuery(api.upvotes.hasUserUpvoted, 
    address ? { ideaId: remixId, voter: address } : "skip"
  );

  const isConnected = !!address;
  const canInteract = isConnected;
  
  // Use optimistic state if available, otherwise use query result
  const currentUpvotedState = optimisticUpvoted !== null ? optimisticUpvoted : hasUpvoted;
  
  // Reset optimistic state when query result changes
  useEffect(() => {
    if (hasUpvoted !== undefined && optimisticUpvoted !== null) {
      setOptimisticUpvoted(null);
    }
  }, [hasUpvoted, optimisticUpvoted]);
  
  // Clear optimistic state after timeout as fallback
  useEffect(() => {
    if (optimisticUpvoted !== null) {
      const timeout = setTimeout(() => {
        setOptimisticUpvoted(null);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [optimisticUpvoted]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isConnected) {
      toast.error("Please connect your wallet to upvote");
      return;
    }
    
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Handle the upvote toggle with optimistic updates
      if (currentUpvotedState === true) {
        setOptimisticUpvoted(false); // Optimistic update
        await onUpvote(remixId); // This will remove the upvote
      } else {
        setOptimisticUpvoted(true); // Optimistic update
        await onUpvote(remixId); // This will add the upvote
      }
    } catch (error) {
      handleError(error, { operation: "handle click", component: "IdeasBoard" });
      // Revert optimistic updates on error
      setOptimisticUpvoted(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine visual state
  const isUpvoted = currentUpvotedState === true;
  const isLoading = (hasUpvoted === undefined && isConnected) || isProcessing;

  return (
    <button
      onClick={handleClick}
      disabled={!canInteract || isLoading}
      className={`flex items-center justify-center p-1 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
        isUpvoted 
          ? "text-red-500 hover:text-red-600" 
          : "text-gray-500 hover:text-gray-700"
      }`}
      title={
        !isConnected ? "Connect wallet to upvote" :
        isUpvoted ? "Remove upvote" : "Add upvote"
      }
    >
      <Heart 
        width={14} 
        height={14}
        fill={isUpvoted ? "currentColor" : "none"}
        stroke="currentColor"
        className={`transition-transform ${isUpvoted ? "text-red-500" : "text-gray-500"}`}
      />
      {isLoading && <span className="text-xs text-gray-400 ml-1">...</span>}
    </button>
  );
};

interface IdeasBoardProps {
  onViewChange?: (view: "board" | "submit" | "complete" | "confirmation") => void;
  onProfileClick?: (authorAddress: string) => void;
}

export const IdeasBoard = ({ onViewChange, onProfileClick }: IdeasBoardProps) => {
  const { address } = useAccount();
  
  // Modal state
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter state
  const [currentFilter, setCurrentFilter] = useState<FilterOption>("newest");
  
  // Completion form state
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  // Remix form state
  const [showRemixForm, setShowRemixForm] = useState(false);
  
  const ideas = useQuery(api.ideas.getIdeas, { limit: 50 });
  const upvoteIdea = useMutation(api.upvotes.upvoteIdea);
  const removeUpvote = useMutation(api.upvotes.removeUpvote);
  const claimIdea = useMutation(api.claims.claimIdea);
  const unclaimIdea = useMutation(api.claims.unclaimIdea);
  const createRemix = useMutation(api.remixes.createRemix);
  const deleteRemix = useMutation(api.remixes.deleteRemix);
  const deleteIdea = useMutation(api.ideas.deleteIdea);

  // Keep selectedIdea in sync with the latest data from the query
  useEffect(() => {
    if (selectedIdea && ideas) {
      const updatedIdea = ideas.find(i => i._id === selectedIdea._id);
      if (updatedIdea) {
        setSelectedIdea(updatedIdea as Idea);
      }
    }
  }, [ideas, selectedIdea?._id]);

  const handleUpvote = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      await upvoteIdea({
        ideaId,
        voter: address,
      });
    } catch (error) {
      handleError(error, { operation: "upvote idea", component: "IdeasBoard" });
    }
  };

  const handleRemoveUpvote = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      await removeUpvote({
        ideaId,
        voter: address,
      });
    } catch (error) {
      handleError(error, { operation: "remove upvote", component: "IdeasBoard" });
    }
  };

  const handleRemix = (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }
    const originalIdea = ideas?.find(idea => idea._id === ideaId);
    
    if (!originalIdea) {
      toast.error("Original idea not found");
      return;
    }
    
    setSelectedIdea(originalIdea);
    setIsModalOpen(true); // Ensure modal is open
    setShowRemixForm(true);
  };

  const submitRemix = async ({ 
    title, 
    description, 
    authorFid, 
    authorAvatar, 
    authorDisplayName, 
    authorUsername 
  }: { 
    title: string; 
    description: string;
    authorFid?: number;
    authorAvatar?: string;
    authorDisplayName?: string;
    authorUsername?: string;
  }) => {
    if (!address || !selectedIdea) {
      toast.error("Missing wallet connection or selected idea");
      return;
    }
    
    try {
      const remixId = await createRemix({
        originalIdeaId: selectedIdea._id,
        remixer: address,
        title,
        description,
        authorFid,
        authorAvatar,
        authorDisplayName,
        authorUsername,
      });

      if (!remixId) {
        throw new Error("Failed to create remix");
      }

      toast.success("Remix created!");
      setShowRemixForm(false);
      setIsModalOpen(true);
    } catch (error) {
      handleError(error, { operation: "create remix", component: "IdeasBoard" });
      setShowRemixForm(false);
      setIsModalOpen(true);
    }
  };

  const handleClaim = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      await claimIdea({
        ideaId,
        claimer: address,
      });

      toast.success("Idea claimed! Start building.");
    } catch (error) {
      handleError(error, { operation: "claim idea", component: "IdeasBoard" });
    }
  };

  const handleUnclaim = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    const confirmed = window.confirm(
      "Unclaim this idea? It will become available for others to claim."
    );

    if (!confirmed) {
      return;
    }

    try {
      await unclaimIdea({
        ideaId,
        claimer: address,
      });

      toast.success("Idea unclaimed.");
    } catch (error) {
      handleError(error, { operation: "unclaim idea", component: "IdeasBoard" });
    }
  };

  const handleDelete = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    const confirmed = window.confirm(
      "Delete this idea? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteIdea({
        ideaId,
        author: address,
      });

      toast.success("Idea deleted.");
      closeModal();
    } catch (error) {
      handleError(error, { operation: "delete idea", component: "IdeasBoard" });
    }
  };

  const handleRemixUpvote = async (remixId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      try {
        await upvoteIdea({
          ideaId: remixId,
          voter: address,
        });
      } catch (upvoteError) {
        if (upvoteError instanceof Error && upvoteError.message.includes("already upvoted")) {
          await removeUpvote({
            ideaId: remixId,
            voter: address,
          });
        } else {
          throw upvoteError;
        }
      }
    } catch (error) {
      handleError(error, { operation: "toggle remix upvote", component: "IdeasBoard" });
    }
  };


  const handleRemixDelete = async (remixId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    const confirmed = window.confirm("Delete this remix? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    try {
      await deleteRemix({
        remixId,
        author: address,
      });
      toast.success("Remix deleted.");
    } catch (error) {
      handleError(error, { operation: "delete remix", component: "IdeasBoard" });
    }
  };

  // Modal handlers
  const openModal = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowRemixForm(false);
    setShowCompletionForm(false);
    setSelectedIdea(null);
  };

  // Filter and sort ideas based on current filter
  const filteredAndSortedIdeas = React.useMemo(() => {
    if (!ideas) return [];
    
    let filtered = [...ideas];
    
    // Always filter out remixes - they should only appear in the remixes section
    filtered = filtered.filter(idea => !idea.isRemix);
    
    // Apply filter
    switch (currentFilter) {
      case "newest":
        // Show all ideas, sorted by newest first
        filtered = filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case "most-popular":
        // Show all ideas, sorted by upvotes (most popular first)
        filtered = filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case "claimed":
        // Show only claimed ideas, sorted by newest first
        filtered = filtered
          .filter(idea => idea.status === "claimed")
          .sort((a, b) => b.timestamp - a.timestamp);
        break;
    }
    
    return filtered;
  }, [ideas, currentFilter]);


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
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8">
      <div className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Ideas</h1>
          <Button
            variant="primary"
            onClick={() => {
              onViewChange?.("submit");
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            size="sm"
            className="rounded-xl"
          >
            + New Idea
          </Button>
        </div>

        <IdeaFilter
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
      </div>

      <div className="space-y-4">
        {filteredAndSortedIdeas?.map((idea) => (
          <div 
            key={idea._id} 
            onClick={() => openModal(idea)}
            className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 group"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 break-words">
                    {idea.title}
                  </h3>
                  {idea.isRemix && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Remix
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProfileClick?.(idea.author);
                    }}
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
                <p className="text-gray-600 mb-4 line-clamp-3 break-words">
                  {idea.description}
                </p>
              </div>
              <StatusBadge status={idea.status} className="px-3 py-1.5" />
            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <UpvoteButton
                  ideaId={idea._id}
                  upvotes={idea.upvotes}
                  onUpvote={handleUpvote}
                  onRemoveUpvote={handleRemoveUpvote}
                  address={address}
                />
                
                {/* Remix button */}
                <button
                  onClick={(e) => handleButtonClick(e, () => handleRemix(idea._id))}
                  className="flex items-center justify-center p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 hover:scale-105 group"
                  title="Remix this idea"
                >
                  <Flash width={18} height={18} className="group-hover:scale-110 transition-transform" />
                </button>
                
                
                {idea.status === "open" && (
                  <ClaimButton
                    onClick={(e) => handleButtonClick(e, () => handleClaim(idea._id))}
                  />
                )}
                
                {idea.status === "claimed" && idea.claimedBy === address && (
                  <SubmitBuildButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCompletionForm(true);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredAndSortedIdeas?.length === 0 && (
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

        {/* Idea Detail Modal — keep mounted while remix form is open so the
           Convex useQuery subscription stays alive and remixes appear instantly */}
        {selectedIdea && !showCompletionForm && (
          <IdeaDetailModal
            idea={selectedIdea}
            isOpen={isModalOpen && !showRemixForm}
            onClose={closeModal}
            onUpvote={handleUpvote}
            onRemoveUpvote={handleRemoveUpvote}
            onRemix={handleRemix}
            onClaim={handleClaim}
            onUnclaim={handleUnclaim}
            onDelete={handleDelete}
            onRemixUpvote={handleRemixUpvote}
            onRemixDelete={handleRemixDelete}
            onOpenCompletionForm={() => setShowCompletionForm(true)}
            onProfileClick={onProfileClick}
            address={address}
          />
        )}

        {/* Remix Form Modal */}
        {showRemixForm && selectedIdea && (
          <RemixForm
            originalTitle={selectedIdea.title}
            originalDescription={selectedIdea.description}
            onSubmit={submitRemix}
            onCancel={() => {
              setShowRemixForm(false);
              // Ensure modal is open when canceling remix form
              setIsModalOpen(true);
            }}
          />
        )}
      </div>
    );
  };
