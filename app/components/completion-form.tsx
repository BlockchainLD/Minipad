"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { handleError, handleSuccess } from "../lib/error-handler";
import { Id } from "../../convex/_generated/dataModel";
import { Tools, Xmark } from "iconoir-react";
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
  const completeIdea = useMutation(api.claims.completeIdea);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    const trimmedDeploymentUrl = deploymentUrl.trim();
    const trimmedGithubUrl = githubUrl.trim();

    if (!trimmedDeploymentUrl) {
      toast.error("Please provide a live app URL");
      return;
    }

    try {
      new URL(trimmedDeploymentUrl);
    } catch {
      toast.error("Please enter a valid deployment URL");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeIdea({
        ideaId,
        claimer: address,
        githubUrl: trimmedGithubUrl,
        deploymentUrl: trimmedDeploymentUrl,
      });
      handleSuccess("Build submitted! This idea is now marked as complete.");
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
          className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Xmark width={18} height={18} />
        </button>
      )}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Build</h2>
        <p className="text-gray-500 text-sm">
          Share the GitHub repo and live URL for your completed miniapp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="deploymentUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Live App URL
          </label>
          <input
            id="deploymentUrl"
            type="text"
            value={deploymentUrl}
            onChange={(e) => setDeploymentUrl(e.target.value)}
            required
            placeholder="https://your-app.vercel.app"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">e.g. https://your-app.vercel.app</p>
        </div>

        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="githubUrl"
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">e.g. https://github.com/username/repo — leave blank if repo is private</p>
        </div>

        <div className="flex gap-3 pt-2">
          <StandardButton
            type="submit"
            disabled={isSubmitting || !deploymentUrl.trim()}
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
