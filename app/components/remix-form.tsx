"use client";

import React, { useState } from "react";
import { Input, TextArea } from "@worldcoin/mini-apps-ui-kit-react";
import { StandardButton } from "./ui/standard-button";
import { handleError, handleSuccess } from "../lib/error-handler";

interface RemixFormProps {
  originalTitle: string;
  originalDescription: string;
  onSubmit: (args: { title: string; description: string }) => Promise<void> | void;
  onCancel: () => void;
}

export const RemixForm = ({ originalTitle, originalDescription, onSubmit, onCancel }: RemixFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      handleError("Please fill in both title and description", { operation: "validate remix", component: "RemixForm" });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ title: trimmedTitle, description: trimmedDescription });
      handleSuccess("Remix created successfully!");
    } catch (error) {
      handleError(error, { operation: "create remix", component: "RemixForm" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <div className="text-sm text-gray-500">Remixing:</div>
        <div className="text-base font-semibold text-gray-900 break-words">{originalTitle}</div>
        <div className="text-sm text-gray-600 break-words">{originalDescription}</div>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            id="remix-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="mt-1 text-xs text-gray-500">Title</div>
        </div>

        <div>
          <TextArea
            id="remix-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="mt-1 text-xs text-gray-500">Description</div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <StandardButton
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          size="md"
        >
          Cancel
        </StandardButton>
        <StandardButton
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          size="md"
        >
          Create Remix
        </StandardButton>
      </div>
    </form>
  );
};


