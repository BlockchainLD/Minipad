"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { useEAS, createBuildEndorsementAttestation, revokeAttestation, SCHEMAS } from "../lib/eas";
import { useFarcasterData } from "./use-farcaster-data";
import { handleError } from "../lib/error-handler";
import type { Idea } from "../lib/types";

// Centralizes the EAS+Convex orchestration for endorse / revoke. Two callers
// today (CardEndorsementButton in IdeasBoard, inline in IdeaDetailModal); any
// future endorsement surface gets the orchestration for free.
export function useEndorseBuild(idea: Idea, componentName: string) {
  const { address } = useAccount();
  const { eas, isEASConfigured } = useEAS();
  const farcasterData = useFarcasterData();
  const [isEndorsing, setIsEndorsing] = useState(false);

  const endorseMutation = useMutation(api.endorsements.endorseBuild);
  const removeMutation = useMutation(api.endorsements.removeEndorsement);

  const hasEndorsed = useQuery(
    api.endorsements.hasUserEndorsedBuild,
    address ? { ideaId: idea._id, endorser: address } : "skip"
  );
  const count = useQuery(api.endorsements.getEndorsementCount, { ideaId: idea._id });

  const endorse = async (onConnectWallet?: () => void) => {
    if (!address) { onConnectWallet?.(); return; }
    if (!eas || !isEASConfigured) { toast.error("Wallet not ready or EAS not configured"); return; }
    if (isEndorsing) return;
    setIsEndorsing(true);
    try {
      if (hasEndorsed) {
        const attestationUid = await removeMutation({ ideaId: idea._id, endorser: address });
        toast.success("Endorsement removed.");
        if (attestationUid && eas) {
          revokeAttestation(eas, attestationUid, SCHEMAS.BUILD_ENDORSEMENT).catch(() => {
            toast.warning("Removed, but failed to revoke on-chain attestation.");
          });
        }
      } else {
        if (!idea.deploymentUrl) { toast.error("This build has no deployment URL"); return; }
        const attestationUid = await createBuildEndorsementAttestation(
          eas,
          idea._id.toString(),
          idea.deploymentUrl,
          address,
          farcasterData?.fid?.toString(),
          idea.claimedBy,
        );
        await endorseMutation({
          ideaId: idea._id,
          endorser: address,
          endorserFid: farcasterData?.fid,
          attestationUid,
        });
        toast.success("Build endorsed!");
      }
    } catch (error) {
      handleError(error, { operation: "endorse build", component: componentName });
    } finally {
      setIsEndorsing(false);
    }
  };

  return { hasEndorsed, count, isEndorsing, endorse };
}
