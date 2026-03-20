"use client";

import React, { useState } from "react";
import { Xmark } from "iconoir-react";
import { useFarcasterData } from "../hooks/use-farcaster-data";
import { toast } from "sonner";

type RemixType = "addition" | "edit" | "comment";

interface RemixFormProps {
  originalTitle: string;
  onSubmit: (data: {
    content: string;
    type: RemixType;
    authorFid?: number;
    authorAvatar?: string;
    authorDisplayName?: string;
    authorUsername?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const REMIX_TYPES: { value: RemixType; label: string }[] = [
  { value: "addition", label: "Addition" },
  { value: "edit", label: "Edit Suggestion" },
  { value: "comment", label: "Comment" },
];

const PLACEHOLDERS: Record<RemixType, string> = {
  addition: "Describe a feature or capability you'd add to this idea...",
  edit: "Describe what you'd change or improve...",
  comment: "Share your thoughts on this idea...",
};

const LABELS: Record<RemixType, string> = {
  addition: "What would you add?",
  edit: "What would you change?",
  comment: "Your thoughts",
};

export const RemixForm = ({ originalTitle, onSubmit, onCancel }: RemixFormProps) => {
  const [content, setContent] = useState("");
  const [type, setType] = useState<RemixType>("addition");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const farcasterData = useFarcasterData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("Please enter your content");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        content: trimmed,
        type,
        authorFid: farcasterData?.fid || undefined,
        authorAvatar: farcasterData?.pfp?.url || undefined,
        authorDisplayName: farcasterData?.displayName || undefined,
        authorUsername: farcasterData?.username || undefined,
      });
      // Only clear on success — error toast already shown by handleSubmitRemix
      setContent("");
    } catch (err) {
      // Show the error inline so it's visible even if the toast is obscured
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Your Take</h2>
              <p className="text-gray-500 text-sm mt-1 truncate max-w-xs">on: {originalTitle}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Xmark width={24} height={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex gap-2">
                {REMIX_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors duration-200 cursor-pointer ${
                      type === t.value
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                {LABELS[type]}
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={PLACEHOLDERS[type]}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isSubmitting}
              />
            </div>

            {submitError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
