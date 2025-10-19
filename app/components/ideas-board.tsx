"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { useEAS, createClaimAttestation, revokeAttestation, SCHEMAS } from "../lib/eas";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Heart, Hammer, Flash, Xmark, Trash, User, LightBulb, Tools } from "iconoir-react";
import { IdeaFilter, FilterOption } from "./idea-filter";
import { CompletionForm } from "./completion-form";

// Types
type Idea = {
  _id: Id<"ideas">;
  title: string;
  description: string;
  author: string;
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

// Status configuration
const STATUS_CONFIG = {
  open: { color: "bg-green-100 text-green-800", text: "Open" },
  claimed: { color: "bg-yellow-100 text-yellow-800", text: "In Progress" },
  completed: { color: "bg-blue-100 text-blue-800", text: "Completed" },
} as const;

const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || { 
    color: "bg-gray-100 text-gray-800", 
    text: status 
  };
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
  address: string | undefined;
}) => {
  // Fetch remixes for this idea
  const remixes = useQuery(api.remixes.getRemixesForIdea, 
    idea ? { originalIdeaId: idea._id } : "skip"
  );
  
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
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusConfig(idea.status).color}`}>
              {getStatusConfig(idea.status).text}
            </span>
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
                    <div key={remix._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <User width={16} height={16} className="text-yellow-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 truncate">{remix.title}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(remix.timestamp).toLocaleDateString()}
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(remix.status).color}`}>
                              {getStatusConfig(remix.status).text}
                            </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Upvote button for remix */}
                              <button
                                onClick={(e) => handleButtonClick(e, () => onRemixUpvote(remix._id))}
                                className="flex items-center justify-center p-1 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-105"
                                title="Upvote this remix"
                              >
                                <Heart width={14} height={14} />
                              </button>
                              
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
        <div className="flex-shrink-0 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50 p-8">
          <div className="flex flex-wrap gap-3">
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
              <button
                onClick={(e) => handleButtonClick(e, () => onClaim(idea._id))}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                title="Claim this idea to build it"
              >
                <Hammer width={16} height={16} />
                <span className="text-sm font-medium">Claim</span>
              </button>
            )}
            
            {idea.status === "claimed" && address && idea.claimedBy === address && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenCompletionForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[44px]"
                  title="Submit your build for this idea"
                >
                  <Tools width={16} height={16} className="pointer-events-none" />
                  <span className="text-sm font-medium pointer-events-none">Submit Build</span>
                </button>
                
                <button
                  onClick={(e) => handleButtonClick(e, () => onUnclaim(idea._id))}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[44px]"
                  title="Unclaim this idea"
                >
                  <Hammer width={16} height={16} className="pointer-events-none" />
                  <span className="text-sm font-medium pointer-events-none">Unclaim</span>
                </button>
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
      console.error('Error in handleClick:', error);
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

interface IdeasBoardProps {
  onViewChange?: (view: "board" | "submit" | "complete" | "confirmation") => void;
}

export const IdeasBoard = ({ onViewChange }: IdeasBoardProps) => {
  const { address } = useAccount();
  const { eas, isInitialized } = useEAS();
  
  // Modal state
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter state
  const [currentFilter, setCurrentFilter] = useState<FilterOption>("newest");
  
  // Completion form state
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  
  const ideas = useQuery(api.ideas.getIdeas, { limit: 50 });
  const upvoteIdea = useMutation(api.upvotes.upvoteIdea);
  const removeUpvote = useMutation(api.upvotes.removeUpvote);
  const claimIdea = useMutation(api.claims.claimIdea);
  const unclaimIdea = useMutation(api.claims.unclaimIdea);
  const createRemix = useMutation(api.remixes.createRemix);
  const deleteRemix = useMutation(api.remixes.deleteRemix);
  const deleteIdea = useMutation(api.ideas.deleteIdea);

  const handleUpvote = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // Simple upvote without EAS attestation
      await upvoteIdea({
        ideaId,
        voter: address,
      });

      toast.success("Upvoted successfully!");
    } catch (error) {
      console.error("Error upvoting:", error);
      
      if (error instanceof Error) {
        if (error.message === "Cannot upvote your own idea") {
          toast.error("You cannot upvote your own idea");
        } else if (error.message === "Idea not found") {
          toast.error("Idea not found");
        } else {
          toast.error(`Failed to upvote: ${error.message}`);
        }
      } else {
        toast.error("Failed to upvote. Please try again.");
      }
    }
  };

  const handleRemoveUpvote = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // Remove upvote from Convex
      await removeUpvote({
        ideaId,
        voter: address,
      });

      toast.success("Upvote removed successfully!");
    } catch (error) {
      console.error("Error removing upvote:", error);
      if (error instanceof Error) {
        if (error.message === "Idea not found") {
          toast.error("Idea not found");
        } else {
          toast.error(`Failed to remove upvote: ${error.message}`);
        }
      } else {
        toast.error("Failed to remove upvote. Please try again.");
      }
    }
  };

  const handleRemix = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    // Get the original idea for context
    const originalIdea = ideas?.find(idea => idea._id === ideaId);
    if (!originalIdea) {
      toast.error("Original idea not found");
      return;
    }

    // Simple prompt for remix details
    const title = prompt(`Remix: ${originalIdea.title}\n\nEnter a title for your remix:`);
    if (!title || title.trim() === "") {
      return;
    }

    const description = prompt(`Enter a description for your remix:\n\nOriginal: ${originalIdea.description}`);
    if (!description || description.trim() === "") {
      return;
    }

    try {
      // Create the remix in Convex (without EAS for now)
      await createRemix({
        originalIdeaId: ideaId,
        remixer: address,
        title: title.trim(),
        description: description.trim(),
        attestationUid: undefined, // No EAS attestation for now
      });

      toast.success("Remix created successfully!");
    } catch (error) {
      console.error("Error creating remix:", error);
      if (error instanceof Error) {
        toast.error(`Failed to create remix: ${error.message}`);
      } else {
        toast.error("Failed to create remix. Please try again.");
      }
    }
  };

  const handleClaim = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    // Temporary workaround: Allow claiming without EAS for testing
    if (!eas || !isInitialized) {
      toast.warning("EAS not configured - claiming without blockchain attestation (for testing)");
      
      try {
        // Update Convex without EAS attestation
        await claimIdea({
          ideaId,
          claimer: address,
          attestationUid: undefined, // No attestation for testing
        });

        toast.success("Idea claimed successfully! (Testing mode - no blockchain attestation)");
      } catch (error) {
        console.error("Error claiming idea:", error);
        if (error instanceof Error) {
          if (error.message === "Idea is not available for claiming") {
            toast.error("This idea has already been claimed");
          } else if (error.message === "Idea not found") {
            toast.error("Idea not found");
          } else {
            toast.error(`Failed to claim idea: ${error.message}`);
          }
        } else {
          toast.error("Failed to claim idea. Please try again.");
        }
      }
      return;
    }

    try {
      // Create EAS attestation first
      const attestationTx = await createClaimAttestation(
        eas,
        ideaId,
        address
      );

      let attestationUid: string | undefined;
      if (attestationTx) {
        await attestationTx.wait();
        attestationUid = (attestationTx as unknown as { uid: string }).uid;
      }

      // Update Convex with the attestation
      await claimIdea({
        ideaId,
        claimer: address,
        attestationUid,
      });

      toast.success("Idea claimed successfully! (Attested to blockchain)");
    } catch (error) {
      console.error("Error claiming idea:", error);
      if (error instanceof Error) {
        if (error.message === "Idea is not available for claiming") {
          toast.error("This idea has already been claimed");
        } else if (error.message === "Idea not found") {
          toast.error("Idea not found");
        } else if (error.message.includes("EAS schemas not configured")) {
          toast.error("EAS not properly configured. Please contact support.");
        } else {
          toast.error(`Failed to claim idea: ${error.message}`);
        }
      } else {
        toast.error("Failed to claim idea. Please try again.");
      }
    }
  };

  const handleUnclaim = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to unclaim this idea? This will make it available for others to claim."
    );
    
    if (!confirmed) {
      return;
    }

    // Temporary workaround: Allow unclaiming without EAS for testing
    if (!eas || !isInitialized) {
      toast.warning("EAS not configured - unclaiming without blockchain attestation (for testing)");
      
      try {
        // Unclaim the idea from Convex without EAS
        await unclaimIdea({
          ideaId,
          claimer: address,
        });
        
        toast.success("Idea unclaimed successfully! (Testing mode - no blockchain attestation)");
      } catch (error) {
        console.error("Error unclaiming idea:", error);
        if (error instanceof Error) {
          if (error.message === "Idea is not claimed by this user") {
            toast.error("You can only unclaim ideas you have claimed");
          } else if (error.message === "Idea not found") {
            toast.error("Idea not found");
          } else {
            toast.error(`Failed to unclaim idea: ${error.message}`);
          }
        } else {
          toast.error("Failed to unclaim idea. Please try again.");
        }
      }
      return;
    }

    try {
      // Unclaim the idea from Convex and get the attestation UID
      const attestationUid = await unclaimIdea({
        ideaId,
        claimer: address,
      });
      
      // Revoke the claim attestation if it exists
      if (attestationUid) {
        try {
          const revokeTx = await revokeAttestation(eas, attestationUid, SCHEMAS.CLAIM);
          await revokeTx.wait();
          toast.success("Idea unclaimed and attestation revoked successfully!");
        } catch (revokeError) {
          console.error("Error revoking claim attestation:", revokeError);
          toast.error("Failed to revoke claim attestation, but idea was unclaimed successfully");
        }
      } else {
        toast.success("Idea unclaimed successfully!");
      }
    } catch (error) {
      console.error("Error unclaiming idea:", error);
      if (error instanceof Error) {
        if (error.message === "Idea is not claimed by this user") {
          toast.error("You can only unclaim ideas you have claimed");
        } else if (error.message === "Idea not found") {
          toast.error("Idea not found");
        } else if (error.message.includes("EAS schemas not configured")) {
          toast.error("EAS not properly configured. Please contact support.");
        } else {
          toast.error(`Failed to unclaim idea: ${error.message}`);
        }
      } else {
        toast.error("Failed to unclaim idea. Please try again.");
      }
    }
  };

  const handleDelete = async (ideaId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete this idea? This action cannot be undone and will revoke your attestation."
    );
    
    if (!confirmed) {
      return;
    }

    try {
      // Get the idea to check for attestation UID
      const idea = ideas?.find(i => i._id === ideaId);
      
      // Revoke attestation if it exists
      if (idea?.attestationUid && eas && isInitialized) {
        try {
          // Determine schema UID based on whether it's a remix or regular idea
          const schemaUid = idea.isRemix ? SCHEMAS.REMIX : SCHEMAS.IDEA;
          const revokeTx = await revokeAttestation(eas, idea.attestationUid, schemaUid);
          await revokeTx.wait();
          toast.success("Attestation revoked successfully!");
        } catch (revokeError) {
          console.error("Error revoking attestation:", revokeError);
          toast.error("Failed to revoke attestation, but idea will still be deleted");
        }
      }

      // Delete the idea from Convex
      await deleteIdea({
        ideaId,
        author: address,
      });

      toast.success("Idea deleted successfully!");
      closeModal(); // Close modal after successful deletion
    } catch (error) {
      console.error("Error deleting idea:", error);
      if (error instanceof Error) {
        if (error.message === "Only the author can delete their idea") {
          toast.error("You can only delete your own ideas");
        } else if (error.message === "Idea not found") {
          toast.error("Idea not found");
        } else {
          toast.error(`Failed to delete idea: ${error.message}`);
        }
      } else {
        toast.error("Failed to delete idea. Please try again.");
      }
    }
  };

  const handleRemixUpvote = async (remixId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      await upvoteIdea({
        ideaId: remixId,
        voter: address,
      });
      toast.success("Remix upvoted successfully!");
    } catch (error) {
      console.error("Error upvoting remix:", error);
      if (error instanceof Error) {
        if (error.message === "Cannot upvote your own idea") {
          toast.error("You cannot upvote your own remix");
        } else if (error.message === "Idea not found") {
          toast.error("Remix not found");
        } else {
          toast.error(`Failed to upvote remix: ${error.message}`);
        }
      } else {
        toast.error("Failed to upvote remix. Please try again.");
      }
    }
  };


  const handleRemixDelete = async (remixId: Id<"ideas">) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete this remix? This action cannot be undone."
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await deleteRemix({
        remixId,
        author: address,
      });
      toast.success("Remix deleted successfully!");
    } catch (error) {
      console.error("Error deleting remix:", error);
      if (error instanceof Error) {
        if (error.message === "Only the author can delete their remix") {
          toast.error("You can only delete your own remixes");
        } else if (error.message === "Remix not found") {
          toast.error("Remix not found");
        } else {
          toast.error(`Failed to delete remix: ${error.message}`);
        }
      } else {
        toast.error("Failed to delete remix. Please try again.");
      }
    }
  };

  // Modal handlers
  const openModal = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIdea(null);
  };

  // Filter and sort ideas based on current filter
  const filteredAndSortedIdeas = React.useMemo(() => {
    if (!ideas) return [];
    
    let filtered = [...ideas];
    
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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Miniapp Ideas Board
          </h1>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="primary"
            onClick={() => {
              onViewChange?.("submit");
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            size="sm"
            className="rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Submit Idea
          </Button>
          
          <IdeaFilter 
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
          />
        </div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                  {idea.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3 break-words">
                  {idea.description}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${getStatusConfig(idea.status).color}`}>
                {getStatusConfig(idea.status).text}
              </span>
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
                  <button
                    onClick={(e) => handleButtonClick(e, () => handleClaim(idea._id))}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                  >
                    <Hammer width={16} height={16} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold">Claim</span>
                  </button>
                )}
                
                {idea.status === "claimed" && idea.claimedBy === address && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCompletionForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group active:scale-95 cursor-pointer min-h-[44px] w-full justify-center"
                  >
                    <Tools width={16} height={16} className="group-hover:scale-110 transition-transform pointer-events-none" />
                    <span className="text-sm font-semibold pointer-events-none">Submit Build</span>
                  </button>
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

      {/* Idea Detail Modal */}
      {selectedIdea && !showCompletionForm && (
        <IdeaDetailModal
          idea={selectedIdea}
          isOpen={isModalOpen}
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
          address={address}
        />
      )}
        </div>
      );
    };
