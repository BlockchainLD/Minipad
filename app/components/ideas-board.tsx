"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { useEAS, createClaimAttestation, createRemixAttestation, revokeAttestation, SCHEMAS } from "../lib/eas";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Heart, Hammer, Flash, Xmark, Trash, User } from "iconoir-react";
import { IdeaFilter, FilterOption } from "./idea-filter";

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
  address 
}: {
  idea: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isOpen: boolean;
  onClose: () => void;
  onUpvote: (ideaId: Id<"ideas">) => void;
  onRemoveUpvote: (ideaId: Id<"ideas">) => void;
  onRemix: (ideaId: Id<"ideas">) => void;
  onClaim: (ideaId: Id<"ideas">) => void;
  onUnclaim: (ideaId: Id<"ideas">) => void;
  onDelete: (ideaId: Id<"ideas">) => void;
  address: string | undefined;
}) => {
  // Fetch remixes for this idea
  const remixes = useQuery(api.remixes.getRemixesForIdea, 
    idea ? { originalIdeaId: idea._id } : "skip"
  );
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
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Idea Details</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <Xmark width={14} height={14} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{idea.title}</h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Heart width={16} height={16} />
                <span>{idea.upvotes} upvotes</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                idea.status === "open" ? "bg-green-100 text-green-800" :
                idea.status === "claimed" ? "bg-yellow-100 text-yellow-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {idea.status === "open" ? "Open" : 
                 idea.status === "claimed" ? "In Progress" : "Completed"}
              </span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
              </div>
            </div>

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
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Heart width={12} height={12} />
                              <span>{remix.upvotes} upvotes</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              remix.status === "open" ? "bg-green-100 text-green-800" :
                              remix.status === "claimed" ? "bg-yellow-100 text-yellow-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {remix.status === "open" ? "Open" : 
                               remix.status === "claimed" ? "In Progress" : "Completed"}
                            </span>
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
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-6">
          <div className="flex flex-wrap gap-3">
            <UpvoteButton
              ideaId={idea._id}
              upvotes={idea.upvotes}
              onUpvote={onUpvote}
              onRemoveUpvote={onRemoveUpvote}
              address={address}
            />
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemix(idea._id);
              }}
              className="flex items-center justify-center p-2 text-yellow-500 hover:text-yellow-600 transition-all duration-200 hover:scale-105"
              title="Remix this idea"
            >
              <Flash width={20} height={20} />
            </button>
            
            {idea.status === "open" && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClaim(idea._id);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                title="Claim this idea to build it"
              >
                <Hammer width={16} height={16} />
                <span className="text-sm font-medium">Claim</span>
              </button>
            )}
            
            {idea.status === "claimed" && address && idea.claimedBy === address && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUnclaim(idea._id);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                title="Unclaim this idea"
              >
                <Hammer width={16} height={16} />
                <span className="text-sm font-medium">Unclaim</span>
              </button>
            )}
            
            {/* Delete button - only show for the author */}
            {address && idea.author === address && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(idea._id);
                }}
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
  address 
}: { 
  ideaId: Id<"ideas">; 
  upvotes: number; 
  onUpvote: (ideaId: Id<"ideas">) => void; 
  onRemoveUpvote: (ideaId: Id<"ideas">) => void;
  address: string | undefined;
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
        await onRemoveUpvote(ideaId);
      } else {
        setOptimisticUpvoted(true); // Optimistic update
        await onUpvote(ideaId);
      }
    } catch (error) {
      console.error('Error in handleClick:', error);
      // Revert optimistic update on error
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
      className={`relative flex items-center gap-1.5 px-2 py-1 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
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
        width={20} 
        height={20} 
        fill={isUpvoted ? "currentColor" : "none"}
        stroke="currentColor"
        className={isUpvoted ? "text-red-500" : "text-gray-500"}
      />
      <span className="text-sm font-medium">{upvotes}</span>
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
  const [selectedIdea, setSelectedIdea] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter state
  const [currentFilter, setCurrentFilter] = useState<FilterOption>("newest");
  
  // MINIMAL: Only use the most basic query
  const ideas = useQuery(api.ideas.getIdeas, { limit: 50 });
  const upvoteIdea = useMutation(api.upvotes.upvoteIdea);
  const removeUpvote = useMutation(api.upvotes.removeUpvote);
  const claimIdea = useMutation(api.claims.claimIdea);
  const unclaimIdea = useMutation(api.claims.unclaimIdea);
  const createRemix = useMutation(api.remixes.createRemix);
  const deleteIdea = useMutation(api.ideas.deleteIdea);
  const updateIdeaAttestation = useMutation(api.ideas.updateIdeaAttestation);

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

    if (!eas || !isInitialized) {
      toast.error("EAS not initialized. Please ensure you're connected to Base network.");
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
      // First create the remix in Convex
      const remixId = await createRemix({
        originalIdeaId: ideaId,
        remixer: address,
        title: title.trim(),
        description: description.trim(),
        attestationUid: undefined, // Will be updated after attestation
      });

      // Create EAS attestation for the remix
      const attestationTx = await createRemixAttestation(
        eas,
        title.trim(),
        description.trim(),
        address,
        ideaId,
        remixId
      );

      // Wait for the transaction to be mined
      await attestationTx.wait();
      const attestationUid = (attestationTx as unknown as { uid: string }).uid;

      // Update the remix with the attestation UID
      await updateIdeaAttestation({
        ideaId: remixId,
        attestationUid,
      });

      toast.success("Remix created and attested successfully! (Gasless transaction)");
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

    if (!eas || !isInitialized) {
      toast.error("EAS not initialized. Please ensure you're connected to Base network.");
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

    if (!eas || !isInitialized) {
      toast.error("EAS not initialized. Please ensure you're connected to Base network.");
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to unclaim this idea? This will revoke your claim attestation."
    );
    
    if (!confirmed) {
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

  // Modal handlers
  const openModal = (idea: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
            className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(idea.status)}`}>
                {getStatusText(idea.status)}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemix(idea._id);
                  }}
                  className="flex items-center justify-center p-1 text-yellow-500 hover:text-yellow-600 transition-all duration-200 hover:scale-105"
                  title="Remix this idea"
                >
                  <Flash width={20} height={20} />
                </button>
                
                
                {idea.status === "open" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClaim(idea._id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105"
                  >
                    <Hammer width={16} height={16} />
                    <span className="text-sm font-medium">Claim</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredAndSortedIdeas?.length === 0 && (
          <div className="text-center py-12">
            {currentFilter === "claimed" ? (
              <>
                <p className="text-gray-500 text-lg">No claimed ideas found.</p>
                <p className="text-gray-400">Try a different filter or submit a new idea!</p>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-lg">No ideas submitted yet.</p>
                <p className="text-gray-400">Be the first to submit a miniapp idea!</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Idea Detail Modal */}
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
        address={address}
      />
        </div>
      );
    };
