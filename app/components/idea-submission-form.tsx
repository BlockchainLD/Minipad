"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { useFarcasterData } from "../hooks/use-farcaster-data";
import { handleError } from "../lib/error-handler";
import { StandardButton } from "./ui/standard-button";
import { Xmark } from "iconoir-react";
import { toast } from "sonner";

interface IdeaSubmissionFormProps {
  onSuccess?: (title: string) => void;
  onCancel?: () => void;
}

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors";

export const IdeaSubmissionForm = ({ onSuccess, onCancel }: IdeaSubmissionFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const farcasterData = useFarcasterData();
  const { address } = useAccount();
  const submitIdea = useMutation(api.ideas.submitIdea);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const submittedTitle = title.trim();
      await submitIdea({
        title: submittedTitle,
        description: description.trim(),
        author: address,
        authorFid: farcasterData?.fid,
        authorAvatar: farcasterData?.pfp?.url,
        authorDisplayName: farcasterData?.displayName,
        authorUsername: farcasterData?.username,
      });
      toast.success("Idea submitted!");
      setTitle("");
      setDescription("");
      onSuccess?.(submittedTitle);
    } catch (error) {
      handleError(error, { operation: "submit idea", component: "IdeaSubmissionForm" });
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Submit an Idea</h1>
        <p className="text-slate-500 text-sm">
          Share your miniapp idea. Others can upvote it, remix it, or claim it to build.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
            placeholder="A great miniapp idea..."
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className={inputClass}
            placeholder="Describe what this miniapp would do and why people would use it..."
          />
        </div>

        <StandardButton
          type="submit"
          disabled={isSubmitting || !title.trim() || !description.trim()}
          loading={isSubmitting}
          variant="primary"
          fullWidth
        >
          Submit Idea
        </StandardButton>
      </form>
    </div>
  );
};
