"use client";

import React, { useState } from "react";
import { Xmark } from "iconoir-react";
import { useFarcasterData } from "../hooks/use-farcaster-data";

interface RemixFormProps {
  originalTitle: string;
  originalDescription: string;
  onSubmit: (data: { 
    title: string; 
    description: string;
    authorFid?: number;
    authorAvatar?: string;
    authorDisplayName?: string;
    authorUsername?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export const RemixForm = ({ originalTitle, originalDescription, onSubmit, onCancel }: RemixFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const farcasterData = useFarcasterData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    
    if (!trimmedTitle || !trimmedDescription) {
      alert("Please fill in both title and description");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Submit with or without Farcaster data - don't block on it
      const submissionData = { 
        title: trimmedTitle, 
        description: trimmedDescription,
        authorFid: farcasterData?.fid || undefined,
        authorAvatar: farcasterData?.pfp?.url || undefined,
        authorDisplayName: farcasterData?.displayName || undefined,
        authorUsername: farcasterData?.username || undefined,
      };
      
      await onSubmit(submissionData);
      // Success handling is done in the parent component
    } catch (error) {
      // Error handling is done in the parent component
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Remix</h2>
              <p className="text-gray-600 mt-1">Build upon this idea</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Xmark width={24} height={24} />
            </button>
          </div>

          {/* Original Idea Context */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Original Idea:</h3>
            <h4 className="text-lg font-medium text-gray-800 mb-2">{originalTitle}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{originalDescription}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Remix Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your remix"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Remix Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your remix and how it builds upon the original idea"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Remix"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
