"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Heart, Flash, Hammer, LightBulb, OpenNewWindow, Medal1stSolid } from "iconoir-react";
import { SectionOption } from "./idea-filter";
import { CompletionForm } from "./completion-form";
import { UserAvatar } from "./ui/user-avatar";
import { StandardButton, ClaimButton, SubmitBuildButton } from "./ui/standard-button";
import { handleError } from "../lib/error-handler";
import { IdeaDetailModal } from "./idea-detail-modal";
import { ErrorBoundary } from "./error-boundary";
import { useFarcasterData } from "../hooks/use-farcaster-data";
import { useEAS, createClaimAttestation, revokeAttestation, SCHEMAS } from "../lib/eas";
import { type Idea } from "../lib/types";
import { handleButtonClick } from "../lib/utils";

const TABS: { value: SectionOption; label: string }[] = [
  { value: "ideasboard", label: "Ideasboard" },
  { value: "buildboard", label: "Buildboard" },
  { value: "miniapps", label: "Miniapps" },
];

// Inline upvote button for the card list
const CardUpvoteButton = ({
  ideaId,
  upvotes,
  onUpvote,
  onRemoveUpvote,
  address,
  onConnectWallet,
}: {
  ideaId: Id<"ideas">;
  upvotes: number;
  onUpvote: (id: Id<"ideas">) => void;
  onRemoveUpvote: (id: Id<"ideas">) => void;
  address: string | undefined;
  onConnectWallet?: () => void;
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

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!address) {
      onConnectWallet?.();
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
  const isLoading = (hasUpvoted === undefined && address !== undefined) || isProcessing;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`relative flex items-center gap-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
        isUpvoted ? "text-red-500 hover:text-red-400" : "text-gray-400 hover:text-red-400"
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
      <span className="text-sm font-semibold">{optimisticCount ?? upvotes}</span>
      {isLoading && <span className="text-xs text-gray-400">...</span>}
    </button>
  );
};

const EndorsementCountBadge = ({ ideaId }: { ideaId: Id<"ideas"> }) => {
  const count = useQuery(api.endorsements.getEndorsementCount, { ideaId });
  if (!count) return null;
  return (
    <span className="flex items-center gap-1">
      <Medal1stSolid width={15} height={15} className="text-yellow-500" />
      <span className="text-xs font-semibold text-gray-600">{count}</span>
    </span>
  );
};

interface IdeasBoardProps {
  onViewChange?: (view: "board" | "submit" | "confirmation") => void;
  onClaimSuccess?: () => void;
  onProfileClick?: (user: { address: string; avatarUrl?: string; displayName?: string; username?: string; fid?: number }) => void;
  openIdeaId?: string | null;
  onIdeaOpened?: () => void;
  isGridView?: boolean;
  onToggleGrid?: () => void;
  isAllFeed?: boolean;
  onConnectWallet?: () => void;
}

export const IdeasBoard = ({ onViewChange, onClaimSuccess, onProfileClick, openIdeaId, onIdeaOpened, isGridView = false, onToggleGrid, isAllFeed = false, onConnectWallet }: IdeasBoardProps) => {
  const { address } = useAccount();
  const farcasterData = useFarcasterData();
  const { eas, isEASConfigured } = useEAS();

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [showEditBuildForm, setShowEditBuildForm] = useState(false);
  const [claimingIdeaId, setClaimingIdeaId] = useState<Id<"ideas"> | null>(null);
  // autoOpenRemixForm: when set, IdeaDetailModal opens its remix form immediately
  const [autoOpenRemixForm, setAutoOpenRemixForm] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionOption>("ideasboard");
  const [currentSort, setCurrentSort] = useState<"newest" | "most-popular">("most-popular");

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
    if (!address) { onConnectWallet?.(); return; }
    try {
      await upvoteIdea({ ideaId, voter: address });
    } catch (error) {
      handleError(error, { operation: "upvote idea", component: "IdeasBoard" });
    }
  };

  const handleRemoveUpvote = async (ideaId: Id<"ideas">) => {
    if (!address) { onConnectWallet?.(); return; }
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
    if (!address) { onConnectWallet?.(); return; }
    const original = ideas?.find((i) => i._id === ideaId);
    if (!original) { toast.error("Original idea not found"); return; }
    setSelectedIdea(original as Idea);
    setIsModalOpen(true);
    setAutoOpenRemixForm(true);
  };

  const handleClaim = async (ideaId: Id<"ideas">) => {
    if (!address) { onConnectWallet?.(); return; }
    if (!eas || !isEASConfigured) { toast.error("Wallet not ready or EAS not configured"); return; }
    if (claimingIdeaId) return;
    setClaimingIdeaId(ideaId);
    try {
      // EAS attestation first (required/blocking)
      const attestationUid = await createClaimAttestation(
        eas,
        ideaId,
        address,
        farcasterData?.fid?.toString()
      );
      await claimIdea({
        ideaId,
        claimer: address,
        attestationUid,
        claimerFid: farcasterData?.fid,
        claimerAvatar: farcasterData?.pfp?.url,
        claimerDisplayName: farcasterData?.displayName,
        claimerUsername: farcasterData?.username,
      });
      toast.success("Idea claimed! Start building.");
      setIsModalOpen(false);
      onClaimSuccess?.();
    } catch (error) {
      handleError(error, { operation: "claim idea", component: "IdeasBoard" });
    } finally {
      setClaimingIdeaId(null);
    }
  };

  const handleUnclaim = async (ideaId: Id<"ideas">) => {
    if (!address) { onConnectWallet?.(); return; }
    try {
      // Convex first — returns the claim's attestation UID
      const attestationUid = await unclaimIdea({ ideaId, claimer: address });
      toast.success("Idea unclaimed.");
      // Best-effort EAS revocation after Convex succeeds
      if (attestationUid && eas) {
        revokeAttestation(eas, attestationUid, SCHEMAS.CLAIM).catch(() => {
          toast.warning("Unclaimed, but failed to revoke on-chain attestation.");
        });
      }
    } catch (error) {
      handleError(error, { operation: "unclaim idea", component: "IdeasBoard" });
    }
  };

  const handleDelete = async (ideaId: Id<"ideas">) => {
    if (!address) { onConnectWallet?.(); return; }
    // Capture attestation UID before deletion (selectedIdea holds current state)
    const attestationUid = selectedIdea?.attestationUid;
    try {
      await deleteIdea({ ideaId, author: address });
      toast.success("Idea deleted.");
      closeModal();
      // Best-effort EAS revocation after Convex succeeds
      if (attestationUid && eas) {
        revokeAttestation(eas, attestationUid, SCHEMAS.IDEA).catch(() => {
          toast.warning("Deleted, but failed to revoke on-chain attestation.");
        });
      }
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
    setShowEditBuildForm(false);
    setSelectedIdea(null);
  };

  const handleClaimIdeaRandom = () => {
    if (!ideas) return;
    const open = ideas.filter((i) => !i.isRemix && i.status === "open");
    if (!open.length) { toast.error("No open ideas available"); return; }
    const withUpvotes = open.filter((i) => i.upvotes > 0);
    const pool = withUpvotes.length > 0
      ? [...withUpvotes].sort((a, b) => b.upvotes - a.upvotes).slice(0, 10)
      : [...open].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    openModal(pool[Math.floor(Math.random() * pool.length)] as Idea);
  };

  const handleTestRandom = () => {
    if (!ideas) return;
    const completed = ideas.filter((i) => !i.isRemix && i.status === "completed");
    if (!completed.length) { toast.error("No completed miniapps yet"); return; }
    const top10 = [...completed].sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
    openModal(top10[Math.floor(Math.random() * top10.length)] as Idea);
  };

  const filteredAndSortedIdeas = React.useMemo(() => {
    if (!ideas) return [];
    let filtered = ideas.filter((idea) => !idea.isRemix);
    if (!isAllFeed) {
      if (currentSection === "ideasboard") filtered = filtered.filter((i) => i.status === "open");
      else if (currentSection === "buildboard") filtered = filtered.filter((i) => i.status === "claimed");
      else if (currentSection === "miniapps") filtered = filtered.filter((i) => i.status === "completed");
    }

    if (currentSort === "most-popular") {
      // miniapps (when not all-feed): upvotes only; everything else: upvotes + remixCount tiebreaker
      const useRemixTiebreaker = isAllFeed || currentSection !== "miniapps";
      return [...filtered].sort((a, b) => {
        if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
        if (useRemixTiebreaker) return (b.remixCount ?? 0) - (a.remixCount ?? 0);
        return 0;
      });
    } else {
      // "newest" — sort by the most relevant timestamp per status
      return [...filtered].sort((a, b) => {
        const tsA = a.status === "completed" ? (a.completedAt ?? a.timestamp)
          : a.status === "claimed" ? (a.claimedAt ?? a.timestamp)
          : a.timestamp;
        const tsB = b.status === "completed" ? (b.completedAt ?? b.timestamp)
          : b.status === "claimed" ? (b.claimedAt ?? b.timestamp)
          : b.timestamp;
        return tsB - tsA;
      });
    }
  }, [ideas, currentSection, currentSort, isAllFeed]);

  if (!ideas) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              {/* Title + badge row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="h-5 bg-gray-200 rounded-md w-3/5" />
                <div className="h-6 bg-gray-200 rounded-full w-20 flex-shrink-0" />
              </div>
              {/* Author row */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="h-3.5 bg-gray-200 rounded-md w-28" />
              </div>
              {/* Description lines */}
              <div className="space-y-2 mb-5">
                <div className="h-3.5 bg-gray-200 rounded-md w-full" />
                <div className="h-3.5 bg-gray-200 rounded-md w-5/6" />
                <div className="h-3.5 bg-gray-200 rounded-md w-2/3" />
              </div>
              {/* Action row */}
              <div className="flex items-center gap-3">
                <div className="h-4 bg-gray-200 rounded-md w-8" />
                <div className="h-4 bg-gray-200 rounded-md w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 sm:px-8 pb-6 sm:pb-8">
      {/* Grid toggle + sort toggle + action button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleGrid}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
            title={isGridView ? "Switch to list view" : "Switch to grid view"}
          >
            {isGridView ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="3" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="3" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            )}
          </button>
          <button
            onClick={() => setCurrentSort((s) => s === "most-popular" ? "newest" : "most-popular")}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            {currentSort === "most-popular" ? "Popular" : "New"}
          </button>
        </div>

        {(isAllFeed || currentSection === "ideasboard") && (
          <StandardButton
            variant="primary"
            size="sm"
            onClick={() => {
              if (!address) { onConnectWallet?.(); return; }
              onViewChange?.("submit");
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            + New Idea
          </StandardButton>
        )}
        {!isAllFeed && currentSection === "buildboard" && (
          <StandardButton variant="primary" size="sm" onClick={handleClaimIdeaRandom}>
            Claim Idea
          </StandardButton>
        )}
        {!isAllFeed && currentSection === "miniapps" && (
          <StandardButton variant="primary" size="sm" onClick={handleTestRandom}>
            Test App
          </StandardButton>
        )}
      </div>

      {/* Tab bar — hidden when all-feed is active */}
      {!isAllFeed && (
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCurrentSection(value)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentSection === value
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/70 hover:shadow-sm"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className={isGridView ? "grid grid-cols-2 gap-3" : "space-y-4"}>
        {filteredAndSortedIdeas.map((idea) => isGridView ? (
          // Compact grid card
          <div
            key={idea._id}
            onClick={() => openModal(idea as Idea)}
            className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md hover:border-violet-200 transition-colors duration-200 cursor-pointer group flex flex-col gap-2"
          >
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug flex-1">
              {idea.title}
            </h3>
            {/* Avatar + username left, claimer avatar right if claimed */}
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => { e.stopPropagation(); onProfileClick?.({ address: idea.author, avatarUrl: idea.authorAvatar, displayName: idea.authorDisplayName, username: idea.authorUsername, fid: idea.authorFid }); }}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity min-w-0"
              >
                <UserAvatar
                  author={idea.author}
                  authorAvatar={idea.authorAvatar}
                  authorDisplayName={idea.authorDisplayName}
                  authorUsername={idea.authorUsername}
                  size={20}
                />
                <span className="text-xs text-gray-500 truncate">
                  {idea.authorUsername || idea.authorDisplayName || "anon"}
                </span>
              </button>
              {(idea.status === "claimed" || idea.status === "completed") && idea.claimedBy && (
                <button
                  onClick={(e) => { e.stopPropagation(); onProfileClick?.({ address: idea.claimedBy!, avatarUrl: idea.claimedByAvatar, displayName: idea.claimedByDisplayName, username: idea.claimedByUsername, fid: idea.claimedByFid }); }}
                  className="hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  <UserAvatar
                    author={idea.claimedBy}
                    authorAvatar={idea.claimedByAvatar}
                    authorDisplayName={idea.claimedByDisplayName}
                    authorUsername={idea.claimedByUsername}
                    size={20}
                  />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 break-words leading-snug">{idea.description}</p>
            {/* Bottom row: upvote, remix, + section action on the right */}
            <div className="flex items-center gap-2 mt-auto">
              <CardUpvoteButton
                ideaId={idea._id}
                upvotes={idea.upvotes}
                onUpvote={handleUpvote}
                onRemoveUpvote={handleRemoveUpvote}
                address={address}
                onConnectWallet={onConnectWallet}
              />
              {idea.status !== "completed" ? (
                <button
                  onClick={(e) => handleButtonClick(e, () => handleRemix(idea._id))}
                  className="flex items-center gap-1 transition-colors cursor-pointer text-gray-400 hover:text-yellow-500"
                  title="Remix this idea"
                >
                  <Flash width={15} height={15} />
                  <span className="text-xs font-semibold">{idea.remixCount ?? 0}</span>
                </button>
              ) : (
                <EndorsementCountBadge ideaId={idea._id} />
              )}
              {/* Ideasboard: claim hammer */}
              {idea.status === "open" && (
                <button
                  onClick={(e) => handleButtonClick(e, () => handleClaim(idea._id))}
                  disabled={claimingIdeaId === idea._id}
                  className="ml-auto text-gray-400 hover:text-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Claim this idea"
                >
                  <Hammer width={15} height={15} />
                </button>
              )}
              {/* Miniapps: deployment link */}
              {idea.status === "completed" && idea.deploymentUrl && (
                <a
                  href={idea.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="ml-auto text-gray-400 hover:text-violet-600 transition-colors"
                  title="View live app"
                >
                  <OpenNewWindow width={15} height={15} />
                </a>
              )}
            </div>
          </div>
        ) : (
          // Full list card
          <div
            key={idea._id}
            onClick={() => openModal(idea as Idea)}
            className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 hover:shadow-md hover:border-violet-200 transition-colors duration-200 cursor-pointer group"
          >
            <div className="mb-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 min-w-0">
                  {idea.title}
                </h3>
                {/* Avatar stack: creator behind (left, z-0), claimer in front (right, z-10) */}
                <div className="flex items-center -space-x-2 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onProfileClick?.({ address: idea.author, avatarUrl: idea.authorAvatar, displayName: idea.authorDisplayName, username: idea.authorUsername, fid: idea.authorFid }); }}
                    className="hover:opacity-80 transition-opacity cursor-pointer relative z-0 ring-1 ring-white rounded-full"
                  >
                    <UserAvatar
                      author={idea.author}
                      authorAvatar={idea.authorAvatar}
                      authorDisplayName={idea.authorDisplayName}
                      authorUsername={idea.authorUsername}
                      size={24}
                    />
                  </button>
                  {(idea.status === "claimed" || idea.status === "completed") && idea.claimedBy && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onProfileClick?.({ address: idea.claimedBy!, avatarUrl: idea.claimedByAvatar, displayName: idea.claimedByDisplayName, username: idea.claimedByUsername, fid: idea.claimedByFid }); }}
                      className="hover:opacity-80 transition-opacity cursor-pointer relative z-10 ring-1 ring-white rounded-full"
                    >
                      <UserAvatar
                        author={idea.claimedBy}
                        authorAvatar={idea.claimedByAvatar}
                        authorDisplayName={idea.claimedByDisplayName}
                        authorUsername={idea.claimedByUsername}
                        size={24}
                      />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onProfileClick?.({ address: idea.author, avatarUrl: idea.authorAvatar, displayName: idea.authorDisplayName, username: idea.authorUsername, fid: idea.authorFid }); }}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span className="text-sm text-gray-600">
                    By {idea.authorDisplayName || idea.authorUsername || "Anonymous"}
                  </span>
                </button>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3 break-words">{idea.description}</p>
            </div>

            <div className="flex items-center gap-2 flex-nowrap">
              <CardUpvoteButton
                ideaId={idea._id}
                upvotes={idea.upvotes}
                onUpvote={handleUpvote}
                onRemoveUpvote={handleRemoveUpvote}
                address={address}
                onConnectWallet={onConnectWallet}
              />

              {idea.status !== "completed" ? (
                <button
                  onClick={(e) => handleButtonClick(e, () => handleRemix(idea._id))}
                  className="flex items-center gap-1.5 transition-colors cursor-pointer text-gray-400 hover:text-yellow-500"
                  title="Remix this idea"
                >
                  <Flash width={18} height={18} />
                  <span className="text-sm font-semibold">{idea.remixCount ?? 0}</span>
                </button>
              ) : (
                <EndorsementCountBadge ideaId={idea._id} />
              )}

              {idea.status === "completed" && (idea.deploymentUrl || idea.githubUrl) && (
                <div className="ml-auto flex items-center gap-1.5">
                  {idea.githubUrl && (
                    <a
                      href={idea.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-1 bg-white text-green-600 hover:bg-green-50 border border-green-600 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                      title="View source code"
                    >
                      <OpenNewWindow width={12} height={12} />
                      View Code
                    </a>
                  )}
                  {idea.deploymentUrl && (
                    <a
                      href={idea.deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-1 bg-white text-black hover:bg-gray-50 border border-black rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                      title="View live app"
                    >
                      <OpenNewWindow width={12} height={12} />
                      View App
                    </a>
                  )}
                </div>
              )}

              {idea.status === "open" && (
                <div className="ml-auto">
                  <ClaimButton
                    onClick={(e) => handleButtonClick(e, () => handleClaim(idea._id))}
                    loading={claimingIdeaId === idea._id}
                    disabled={!!claimingIdeaId}
                  />
                </div>
              )}

              {idea.status === "claimed" && idea.claimedBy === address && (
                <div className="ml-auto">
                  <SubmitBuildButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedIdea(idea as Idea);
                      setShowCompletionForm(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredAndSortedIdeas.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-slate-50 rounded-3xl p-12 border border-gray-100">
              {currentSection === "buildboard" ? (
                <>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hammer width={32} height={32} className="text-yellow-600" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">No ideas being built yet</p>
                  <p className="text-gray-500">Ideas that have been claimed will appear here.</p>
                </>
              ) : currentSection === "miniapps" ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <OpenNewWindow width={32} height={32} className="text-green-600" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">No completed miniapps yet</p>
                  <p className="text-gray-500">Ideas that have been built and deployed will appear here.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LightBulb width={32} height={32} className="text-violet-600" />
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

      {/* Edit Build Form Modal */}
      {showEditBuildForm && selectedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CompletionForm
              ideaId={selectedIdea._id}
              mode="edit"
              initialGithubUrl={selectedIdea.githubUrl ?? ""}
              initialDeploymentUrl={selectedIdea.deploymentUrl ?? ""}
              oldAttestationUid={selectedIdea.completionAttestationUid}
              onSuccess={() => {
                setShowEditBuildForm(false);
              }}
              onCancel={() => setShowEditBuildForm(false)}
            />
          </div>
        </div>
      )}

      {/* Idea Detail Modal — RemixForm is now rendered inside IdeaDetailModal
          as a z-[60] overlay so RemixesSection stays mounted and its Convex
          subscription delivers new remixes the moment createRemix completes. */}
      {selectedIdea && !showCompletionForm && !showEditBuildForm && (
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
            onOpenEditBuildForm={() => setShowEditBuildForm(true)}
            onProfileClick={onProfileClick}
            address={address}
            autoOpenRemixForm={autoOpenRemixForm}
            isClaimLoading={claimingIdeaId === selectedIdea?._id}
            onConnectWallet={onConnectWallet}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
