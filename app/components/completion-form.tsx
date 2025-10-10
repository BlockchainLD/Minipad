"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { useEAS, createCompletionAttestation } from "../lib/eas";
import { Button, Input } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface CompletionFormProps {
  ideaId: Id<"ideas">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CompletionForm = ({ ideaId, onSuccess, onCancel }: CompletionFormProps) => {
  const [miniappUrl, setMiniappUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { address } = useAccount();
  const { eas, isInitialized } = useEAS();
  const completeIdea = useMutation(api.claims.completeIdea);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }
    
    if (!miniappUrl.trim()) {
      toast.error("Please provide the miniapp URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(miniappUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    if (!eas || !isInitialized) {
      toast.error("EAS not initialized. Please ensure you're connected to Base network.");
      return;
    }

    setIsSubmitting(true);

    try {
      const attestationTx = await createCompletionAttestation(
        eas,
        ideaId,
        address,
        miniappUrl.trim()
      );

      // Wait for the transaction to be mined
      await attestationTx.wait();
      const attestationUid = (attestationTx as unknown as { uid: string }).uid;

      // Mark the idea as completed
      await completeIdea({
        ideaId,
        claimer: address,
        miniappUrl: miniappUrl.trim(),
        attestationUid,
      });

      toast.success("Idea marked as completed and attested to blockchain! (Gasless transaction)");
      setMiniappUrl("");
      onSuccess?.();
    } catch (error) {
      console.error("Error completing idea:", error);
      if (error instanceof Error && error.message.includes("EAS schemas not configured")) {
        toast.error("EAS not properly configured. Please contact support.");
      } else {
        toast.error("Failed to complete idea. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Complete Your Miniapp
        </h2>
        <p className="text-gray-600">
          Provide the URL to your completed miniapp to mark this idea as finished.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="miniappUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Miniapp URL *
          </label>
          <Input
            id="miniappUrl"
            type="url"
            value={miniappUrl}
            onChange={(e) => setMiniappUrl(e.target.value)}
            required
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">Completion Requirements:</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Your miniapp should be deployed and accessible</li>
            <li>• It should implement the core idea described</li>
            <li>• The URL will be publicly visible to all users</li>
            <li>• Your completion will be attested to the blockchain</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Completing..." : "Mark as Complete"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

