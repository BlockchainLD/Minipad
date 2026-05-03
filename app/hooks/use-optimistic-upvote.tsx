"use client";

import { useState, useEffect } from "react";
import { handleError } from "../lib/error-handler";

interface Args {
  // `undefined` = still loading from server. `true`/`false` = known.
  serverHasUpvoted: boolean | undefined;
  serverCount: number;
  address: string | undefined;
  upvote: () => Promise<void>;
  removeUpvote: () => Promise<void>;
  componentName: string;
  // When provided, the optimistic count is parent-controlled (used by the
  // modal where two UpvoteButtons share state across re-renders). When
  // omitted, the count is tracked internally.
  controlledCount?: number | null;
  onControlledCountChange?: (count: number | null) => void;
  onConnectWallet?: () => void;
}

// Optimistic-state machine shared by the three upvote buttons (idea card,
// idea modal, remix entry). Handles: optimistic toggle, optimistic count,
// reset when server resolves, 5-second timeout fallback, rollback on error.
export function useOptimisticUpvote({
  serverHasUpvoted,
  serverCount,
  address,
  upvote,
  removeUpvote,
  componentName,
  controlledCount,
  onControlledCountChange,
  onConnectWallet,
}: Args) {
  const [optimisticUpvoted, setOptimisticUpvoted] = useState<boolean | null>(null);
  const [localCount, setLocalCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isControlled = onControlledCountChange !== undefined;
  const optimisticCount = isControlled ? controlledCount : localCount;
  const setOptimisticCount = (v: number | null) =>
    isControlled ? onControlledCountChange!(v) : setLocalCount(v);

  const isUpvoted = optimisticUpvoted !== null
    ? optimisticUpvoted
    : (serverHasUpvoted ?? false);
  const displayedCount = optimisticCount ?? serverCount;
  const isLoading = (serverHasUpvoted === undefined && address !== undefined) || isProcessing;

  // When server query resolves, drop optimistic state.
  useEffect(() => {
    if (serverHasUpvoted !== undefined && optimisticUpvoted !== null) {
      setOptimisticUpvoted(null);
      setOptimisticCount(null);
    }
    // setOptimisticCount is stable enough for this purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverHasUpvoted, optimisticUpvoted]);

  // Fallback: never let optimistic state outlive a stuck round-trip.
  useEffect(() => {
    if (optimisticUpvoted !== null) {
      const t = setTimeout(() => {
        setOptimisticUpvoted(null);
        setOptimisticCount(null);
      }, 5000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimisticUpvoted]);

  const click = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!address) { onConnectWallet?.(); return; }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (isUpvoted) {
        setOptimisticUpvoted(false);
        setOptimisticCount((optimisticCount ?? serverCount) - 1);
        await removeUpvote();
      } else {
        setOptimisticUpvoted(true);
        setOptimisticCount((optimisticCount ?? serverCount) + 1);
        await upvote();
      }
    } catch (error) {
      handleError(error, { operation: "upvote", component: componentName });
      setOptimisticUpvoted(null);
      setOptimisticCount(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return { isUpvoted, displayedCount, isLoading, isProcessing, click };
}
