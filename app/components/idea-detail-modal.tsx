"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Heart, Flash, Xmark, Trash, Plus, EditPencil, MessageText } from "iconoir-react";
import { UserAvatar } from "./ui/user-avatar";
import { StatusBadge } from "./ui/status-badge";
import { ClaimButton, UnclaimButton, SubmitBuildButton } from "./ui/standard-button";
import { handleError } from "../lib/error-handler";
import { toast } from "sonner";
import { ErrorBoundary } from "./error-boundary";
import { RemixForm } from "./remix-form";
import { useFarcasterData } from "../hooks/use-farcaster-data";

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
  claimedByFid?: number;
  claimedByAvatar?: string;
  claimedByDisplayName?: string;
  claimedByUsername?: string;
  isRemix?: boolean;
  originalIdeaId?: Id<"ideas">;
  attestationUid?: string;
  githubUrl?: string;
  deploymentUrl?: string;
};

type Remix = {
  _id: Id<"remixes">;
  _creationTime: number;
  ideaId: Id<"ideas">;
  author: string;
  authorFid?: number;
  authorAvatar?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  content: string;
  type: "addition" | "edit" | "comment";
  timestamp: number;
  upvotes: number;
};

const TYPE_CONFIG = {
  addition: {
    label: "Addition",
    icon: Plus,
    className: "text-green-700 bg-green-50 border border-green-200",
  },
  edit: {
    label: "Edit",
    icon: EditPencil,
    className: "text-blue-700 bg-blue-50 border border-blue-200",
  },
  comment: {
    label: "Comment",
    icon: MessageText,
    className: "text-gray-700 bg-gray-50 border border-gray-200",
  },
} as const;

const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
  e.preventDefault();
  e.stopPropagation();
  callback();
};

// Upvote button for the main idea
const UpvoteButton = ({
  ideaId,
  upvotes,
  onUpvote,
  onRemoveUpvote,
  address,
  optimisticUpvotes,
  onOptimisticUpvoteChange,
}: {
  ideaId: Id<"ideas">;
  upvotes: number;
  onUpvote: (id: Id<"ideas">) => void;
  onRemoveUpvote: (id: Id<"ideas">) => void;
  address: string | undefined;
  optimisticUpvotes?: number | null;
  onOptimisticUpvoteChange?: (count: number | null) => void;
}) => {
  const [optimisticUpvoted, setOptimisticUpvoted] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const hasUpvoted = useQuery(
    api.upvotes.hasUserUpvoted,
    address ? { ideaId, voter: address } : "skip"
  );

  const currentUpvotedState = optimisticUpvoted !== null ? optimisticUpvoted : hasUpvoted;

  useEffect(() => {
    if (hasUpvoted !== undefined && optimisticUpvoted !== null) {
      setOptimisticUpvoted(null);
    }
  }, [hasUpvoted, optimisticUpvoted]);

  useEffect(() => {
    if (optimisticUpvoted !== null) {
      const t = setTimeout(() => setOptimisticUpvoted(null), 5000);
      return () => clearTimeout(t);
    }
  }, [optimisticUpvoted]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!address) { toast.error("Please connect your wallet to upvote"); return; }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (currentUpvotedState === true) {
        setOptimisticUpvoted(false);
        onOptimisticUpvoteChange?.((optimisticUpvotes ?? upvotes) - 1);
        await onRemoveUpvote(ideaId);
      } else {
        setOptimisticUpvoted(true);
        onOptimisticUpvoteChange?.((optimisticUpvotes ?? upvotes) + 1);
        await onUpvote(ideaId);
      }
    } catch (error) {
      handleError(error, { operation: "upvote", component: "IdeaDetailModal" });
      setOptimisticUpvoted(null);
      onOptimisticUpvoteChange?.(upvotes);
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
      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
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
        className={isUpvoted ? "text-red-500" : "text-gray-500"}
      />
      <span className="text-sm font-semibold">{optimisticUpvotes ?? upvotes}</span>
      {isLoading && <span className="text-xs text-gray-400">...</span>}
    </button>
  );
};

// Upvote button for individual remix entries.
const RemixUpvoteButton = ({
  remix,
  address,
}: {
  remix: Remix;
  address: string | undefined;
}) => {
  const [optimisticUpvoted, setOptimisticUpvoted] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const upvoteRemix = useMutation(api.remixes.upvoteRemix);
  const removeRemixUpvote = useMutation(api.remixes.removeRemixUpvote);

  const hasUpvotedQuery = useQuery(
    api.remixes.hasUserUpvotedRemix,
    address ? { remixId: remix._id, voter: address } : "skip"
  );

  const currentUpvotedState = optimisticUpvoted !== null ? optimisticUpvoted : (hasUpvotedQuery ?? false);

  useEffect(() => {
    if (hasUpvotedQuery !== undefined && optimisticUpvoted !== null) {
      setOptimisticUpvoted(null);
      setOptimisticCount(null);
    }
  }, [hasUpvotedQuery, optimisticUpvoted]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!address) { toast.error("Please connect your wallet to upvote"); return; }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (currentUpvotedState) {
        setOptimisticUpvoted(false);
        setOptimisticCount((optimisticCount ?? remix.upvotes) - 1);
        await removeRemixUpvote({ remixId: remix._id, voter: address });
      } else {
        setOptimisticUpvoted(true);
        setOptimisticCount((optimisticCount ?? remix.upvotes) + 1);
        await upvoteRemix({ remixId: remix._id, voter: address });
      }
    } catch (error) {
      handleError(error, { operation: "upvote remix", component: "IdeaDetailModal" });
      setOptimisticUpvoted(null);
      setOptimisticCount(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const isUpvoted = currentUpvotedState === true;
  const count = optimisticCount ?? remix.upvotes;

  return (
    <button
      onClick={handleClick}
      disabled={!address || isProcessing}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
        isUpvoted ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-600"
      }`}
      title={!address ? "Connect wallet to upvote" : isUpvoted ? "Remove upvote" : "Upvote"}
    >
      <Heart width={12} height={12} fill={isUpvoted ? "currentColor" : "none"} stroke="currentColor" />
      {count > 0 && <span>{count}</span>}
      {isProcessing && <span className="text-gray-300">...</span>}
    </button>
  );
};

interface IdeaDetailModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
  onUpvote: (id: Id<"ideas">) => void;
  onRemoveUpvote: (id: Id<"ideas">) => void;
  onClaim: (id: Id<"ideas">) => void;
  onUnclaim: (id: Id<"ideas">) => void;
  onDelete: (id: Id<"ideas">) => void;
  onOpenCompletionForm: () => void;
  onProfileClick?: (user: { address: string; avatarUrl?: string; displayName?: string; username?: string; fid?: number }) => void;
  address: string | undefined;
  // When true, the remix form opens immediately (e.g. from card Flash button)
  autoOpenRemixForm?: boolean;
}

// Isolated component so useQuery errors are caught by ErrorBoundary
const RemixesSection = ({
  idea,
  address,
}: {
  idea: Idea;
  address: string | undefined;
}) => {
  const remixes = useQuery(
    api.remixes.getRemixesForIdea,
    { ideaId: idea._id }
  ) as Remix[] | undefined;

  const deleteRemix = useMutation(api.remixes.deleteRemix);
  const [deleteConfirmingRemixId, setDeleteConfirmingRemixId] = useState<Id<"remixes"> | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"remixes"> | null>(null);

  const handleRemixDelete = async (remixId: Id<"remixes">) => {
    if (!address || deletingId) return;
    setDeleteConfirmingRemixId(null);
    setDeletingId(remixId);
    try {
      await deleteRemix({ remixId, author: address });
      toast.success("Deleted.");
    } catch (error) {
      handleError(error, { operation: "delete remix", component: "IdeaDetailModal" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Flash width={20} height={20} className="text-yellow-500" />
        Community Takes ({remixes?.length || 0})
      </h3>

      {remixes === undefined ? (
        <div className="text-center py-8 text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-gray-200 rounded-full border-t-violet-500 mx-auto mb-2" />
          <p className="text-sm">Loading...</p>
        </div>
      ) : remixes.length > 0 ? (
        <div className="space-y-3">
          {remixes.map((remix) => {
            const cfg = TYPE_CONFIG[remix.type];
            const Icon = cfg.icon;
            return (
              <div
                key={remix._id}
                className="border border-gray-100 rounded-2xl p-4 bg-gray-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <UserAvatar
                      author={remix.author}
                      authorAvatar={remix.authorAvatar}
                      authorDisplayName={remix.authorDisplayName}
                      authorUsername={remix.authorUsername}
                      size={28}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">
                        {remix.authorDisplayName || remix.authorUsername || "Anonymous"}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                        <Icon width={10} height={10} />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(remix.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {remix.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <RemixUpvoteButton remix={remix} address={address} />
                      {address && remix.author.toLowerCase() === address.toLowerCase() && (
                        deleteConfirmingRemixId === remix._id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <span className="text-xs text-red-600">Delete?</span>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemixDelete(remix._id); }}
                              disabled={deletingId === remix._id}
                              className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {deletingId === remix._id ? "..." : "Yes"}
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmingRemixId(null); }}
                              disabled={deletingId === remix._id}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmingRemixId(remix._id); }}
                            className="flex items-center justify-center p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash width={12} height={12} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export const IdeaDetailModal = ({
  idea,
  isOpen,
  onClose,
  onUpvote,
  onRemoveUpvote,
  onClaim,
  onUnclaim,
  onDelete,
  onOpenCompletionForm,
  onProfileClick,
  address,
  autoOpenRemixForm = false,
}: IdeaDetailModalProps) => {
  const [optimisticUpvotes, setOptimisticUpvotes] = useState<number | null>(null);
  const [showRemixForm, setShowRemixForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnclaimConfirm, setShowUnclaimConfirm] = useState(false);

  const createRemix = useMutation(api.remixes.createRemix);
  const farcasterData = useFarcasterData();

  // Reset all transient UI state when the idea changes
  useEffect(() => {
    setShowRemixForm(false);
    setOptimisticUpvotes(null);
    setShowDeleteConfirm(false);
    setShowUnclaimConfirm(false);
  }, [idea?._id]);

  // Open remix form immediately when requested — declared after reset so it wins on mount
  useEffect(() => {
    if (isOpen && autoOpenRemixForm) setShowRemixForm(true);
  }, [isOpen, autoOpenRemixForm]);

  const handleSubmitRemix = async (data: {
    content: string;
    type: "addition" | "edit" | "comment";
    authorFid?: number;
    authorAvatar?: string;
    authorDisplayName?: string;
    authorUsername?: string;
  }) => {
    if (!address) { toast.error("Please connect your wallet"); return; }
    try {
      await createRemix({
        ideaId: idea._id,
        author: address,
        content: data.content,
        type: data.type,
        authorFid: data.authorFid ?? farcasterData?.fid ?? undefined,
        authorAvatar: data.authorAvatar ?? farcasterData?.pfp?.url ?? undefined,
        authorDisplayName: data.authorDisplayName ?? farcasterData?.displayName ?? undefined,
        authorUsername: data.authorUsername ?? farcasterData?.username ?? undefined,
      });
      toast.success("Added!");
      setShowRemixForm(false);
      // No need to manually refresh — RemixesSection's Convex subscription
      // auto-delivers the new remix because it never unmounted.
    } catch (error) {
      handleError(error, { operation: "create remix", component: "IdeaDetailModal" });
      throw error; // rethrow so RemixForm knows submission failed and keeps the text
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showRemixForm) { setShowRemixForm(false); return; }
        if (showDeleteConfirm) { setShowDeleteConfirm(false); return; }
        if (showUnclaimConfirm) { setShowUnclaimConfirm(false); return; }
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, showRemixForm, showDeleteConfirm, showUnclaimConfirm]);

  if (!isOpen || !idea) return null;

  const isClaimedByMe = idea.status === "claimed" && !!address && idea.claimedBy === address;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-violet-950 bg-opacity-60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 flex flex-col border border-gray-100">
        {/* Fixed Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-violet-100 flex-shrink-0 bg-white">
          {/* Claimer/builder avatar top left, inline with status badge */}
          <div className="flex items-center">
            {(idea.status === "claimed" || idea.status === "completed") && idea.claimedBy ? (
              <button
                onClick={(e) => { e.stopPropagation(); onProfileClick?.({ address: idea.claimedBy!, avatarUrl: idea.claimedByAvatar, displayName: idea.claimedByDisplayName, username: idea.claimedByUsername, fid: idea.claimedByFid }); }}
                className="hover:opacity-80 transition-opacity cursor-pointer ring-1 ring-white rounded-full"
              >
                <UserAvatar
                  author={idea.claimedBy}
                  authorAvatar={idea.claimedByAvatar}
                  authorDisplayName={idea.claimedByDisplayName}
                  authorUsername={idea.claimedByUsername}
                  size={28}
                />
              </button>
            ) : (
              <div className="w-7 h-7" />
            )}
          </div>
          {/* Status badge absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <StatusBadge status={idea.status} />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <Xmark width={18} height={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{idea.title}</h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={(e) => { e.stopPropagation(); onProfileClick?.({ address: idea.author, avatarUrl: idea.authorAvatar, displayName: idea.authorDisplayName, username: idea.authorUsername, fid: idea.authorFid }); }}
                className="hover:opacity-80 transition-opacity cursor-pointer ring-1 ring-white rounded-full"
              >
                <UserAvatar
                  author={idea.author}
                  authorAvatar={idea.authorAvatar}
                  authorDisplayName={idea.authorDisplayName}
                  authorUsername={idea.authorUsername}
                  size={28}
                />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onProfileClick?.({ address: idea.author, avatarUrl: idea.authorAvatar, displayName: idea.authorDisplayName, username: idea.authorUsername, fid: idea.authorFid }); }}
                className="text-lg font-medium text-gray-900 hover:opacity-80 transition-opacity cursor-pointer"
              >
                {idea.authorDisplayName || idea.authorUsername || "Anonymous"}
              </button>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Description</h3>
              <p className="text-xs text-gray-400 mb-3">{new Date(idea.timestamp).toLocaleDateString()}</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
            </div>

            {/* Build Links */}
            {idea.status === "completed" && (idea.githubUrl || idea.deploymentUrl) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Build Links</h3>
                <div className="space-y-3">
                  {idea.deploymentUrl && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Flash width={20} height={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Live App</p>
                        <a
                          href={idea.deploymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-700 text-sm break-all"
                        >
                          {idea.deploymentUrl}
                        </a>
                      </div>
                      <a
                        href={idea.deploymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
                      >
                        View App
                      </a>
                    </div>
                  )}
                  {idea.githubUrl && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg width={20} height={20} className="text-green-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-900">Source Code</p>
                        <a
                          href={idea.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-sm break-all"
                        >
                          {idea.githubUrl}
                        </a>
                      </div>
                      <a
                        href={idea.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                      >
                        View Code
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remixes / Additions / Comments */}
            <ErrorBoundary fallback={null}>
              <RemixesSection idea={idea} address={address} />
            </ErrorBoundary>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="flex-shrink-0 border-t border-violet-100 bg-white p-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {/* Upvote: first unless idea is claimed by current user (moved to right side there) */}
            {!isClaimedByMe && (
              <UpvoteButton
                ideaId={idea._id}
                upvotes={idea.upvotes}
                onUpvote={onUpvote}
                onRemoveUpvote={onRemoveUpvote}
                address={address}
                optimisticUpvotes={optimisticUpvotes}
                onOptimisticUpvoteChange={setOptimisticUpvotes}
              />
            )}

            {idea.status !== "completed" && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRemixForm(true); }}
                className={`flex items-center gap-1 text-yellow-500 bg-transparent hover:bg-yellow-50 border border-transparent hover:border-yellow-200 rounded-xl transition-all duration-200 font-medium cursor-pointer active:scale-95 ${
                  isClaimedByMe ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
                }`}
                title="Remix this idea"
              >
                <Flash width={isClaimedByMe ? 12 : 16} height={isClaimedByMe ? 12 : 16} />
                Remix
              </button>
            )}

            {idea.status === "open" && (
              <ClaimButton onClick={(e) => handleButtonClick(e, () => onClaim(idea._id))} />
            )}

            {isClaimedByMe && (
              <>
                <SubmitBuildButton
                  size="xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenCompletionForm();
                  }}
                />
                {showUnclaimConfirm ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-amber-700">Unclaim?</span>
                    <button
                      onClick={(e) => handleButtonClick(e, () => onUnclaim(idea._id))}
                      className="text-sm px-3 py-1.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium cursor-pointer"
                    >
                      Unclaim
                    </button>
                    <button
                      onClick={(e) => handleButtonClick(e, () => setShowUnclaimConfirm(false))}
                      className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <UnclaimButton size="xs" onClick={(e) => handleButtonClick(e, () => setShowUnclaimConfirm(true))} />
                )}
                {/* Upvote moved here so Remix+SubmitBuild+Unclaim share one line */}
                <UpvoteButton
                  ideaId={idea._id}
                  upvotes={idea.upvotes}
                  onUpvote={onUpvote}
                  onRemoveUpvote={onRemoveUpvote}
                  address={address}
                  optimisticUpvotes={optimisticUpvotes}
                  onOptimisticUpvoteChange={setOptimisticUpvotes}
                />
              </>
            )}

            {address && idea.author === address && (
              showDeleteConfirm ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-red-600">Delete idea?</span>
                  <button
                    onClick={(e) => handleButtonClick(e, () => onDelete(idea._id))}
                    className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => handleButtonClick(e, () => setShowDeleteConfirm(false))}
                    className="text-sm px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => handleButtonClick(e, () => setShowDeleteConfirm(true))}
                  className="flex items-center justify-center p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete this idea"
                >
                  <Trash width={20} height={20} />
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Remix form renders as a z-60 overlay ON TOP of this modal.
          This keeps RemixesSection mounted so its Convex subscription
          remains active — the new remix arrives via subscription the
          moment createRemix completes, no remount needed. */}
      {showRemixForm && (
        <RemixForm
          originalTitle={idea.title}
          onSubmit={handleSubmitRemix}
          onCancel={() => setShowRemixForm(false)}
        />
      )}
    </div>
  );
};
