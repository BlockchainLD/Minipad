"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { useEAS, createCompletionAttestation } from "../lib/eas";
import { Input } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";
import { handleError, handleSuccess, handleWarning } from "../lib/error-handler";
import { Id } from "../../convex/_generated/dataModel";
import { Tools } from "iconoir-react";
import { StandardButton } from "./ui/standard-button";

interface CompletionFormProps {
  ideaId: Id<"ideas">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CompletionForm = ({ ideaId, onSuccess, onCancel }: CompletionFormProps) => {
  const [githubUrl, setGithubUrl] = useState("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
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
    
    if (!githubUrl.trim() || !deploymentUrl.trim()) {
      toast.error("Please provide both GitHub and deployment URLs");
      return;
    }

    // Basic URL validation
    try {
      new URL(githubUrl);
      new URL(deploymentUrl);
    } catch {
      toast.error("Please enter valid URLs");
      return;
    }

    // Temporary workaround: Allow completion without EAS for testing
    if (!eas || !isInitialized) {
      handleWarning("EAS not configured - submitting build without blockchain attestation (for testing)");
      
      try {
        // Mark the idea as completed without EAS attestation
        await completeIdea({
          ideaId,
          claimer: address,
          githubUrl: githubUrl.trim(),
          deploymentUrl: deploymentUrl.trim(),
          attestationUid: undefined, // No attestation for testing
        });

        handleSuccess("🎉 Build submitted successfully! (Testing mode - no blockchain attestation)");
        setGithubUrl("");
        setDeploymentUrl("");
        onSuccess?.();
      } catch (error) {
        handleError(error, { operation: "complete idea", component: "CompletionForm" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const attestationTx = await createCompletionAttestation(
        eas,
        ideaId,
        address,
        deploymentUrl.trim()
      );

      // Wait for the transaction to be mined
      await attestationTx.wait();
      const attestationUid = (attestationTx as unknown as { uid: string }).uid;

      // Mark the idea as completed
      await completeIdea({
        ideaId,
        claimer: address,
        githubUrl: githubUrl.trim(),
        deploymentUrl: deploymentUrl.trim(),
        attestationUid,
      });

      handleSuccess("🎉 Build submitted successfully! Your idea is now marked as complete.");
      setGithubUrl("");
      setDeploymentUrl("");
      onSuccess?.();
    } catch (error) {
      handleError(error, { operation: "complete idea", component: "CompletionForm" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 relative">
      {onCancel && (
        <button
          aria-label="Close"
          onClick={onCancel}
          className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">✕</span>
        </button>
      )}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Submit Your Build
        </h2>
        <p className="text-gray-600">
          Provide the GitHub repository and deployment links for your completed miniapp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL *
          </label>
          <Input
            id="githubUrl"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="deploymentUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Deployment URL *
          </label>
          <Input
            id="deploymentUrl"
            type="url"
            value={deploymentUrl}
            onChange={(e) => setDeploymentUrl(e.target.value)}
            required
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-green-900 mb-3">Build Requirements:</h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Your miniapp should be deployed and accessible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>It should implement the core idea described</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Both URLs will be publicly visible to all users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Your completion will be attested to the blockchain</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <StandardButton
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="success"
            size="md"
            fullWidth={true}
            icon={<Tools width={16} height={16} />}
          >
            Submit Build
          </StandardButton>
          <StandardButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            size="md"
            fullWidth={true}
          >
            Cancel
          </StandardButton>
        </div>
      </form>
    </div>
  );
};
