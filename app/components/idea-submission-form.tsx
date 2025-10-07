"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { easService } from "../lib/eas";
import { Button, Input, TextArea } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";

interface IdeaSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const IdeaSubmissionForm = ({ onSuccess, onCancel }: IdeaSubmissionFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { address } = useAccount();
  const submitIdea = useMutation(api.ideas.submitIdea);
  const updateIdeaAttestation = useMutation(api.ideas.updateIdeaAttestation);

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
      // First, submit the idea to Convex
      const ideaId = await submitIdea({
        title: title.trim(),
        description: description.trim(),
        author: address,
      });

      // Then create the EAS attestation
      const attestationTx = await easService.createIdeaAttestation(
        title.trim(),
        description.trim(),
        address
      );

      // Wait for the transaction to be mined
      await attestationTx.wait();

      // Update the idea with the attestation UID
      await updateIdeaAttestation({
        ideaId,
        attestationUid: attestationTx.uid,
      });

      toast.success("Idea submitted successfully!");
      setTitle("");
      setDescription("");
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast.error("Failed to submit idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 relative">
      {onCancel && (
        <button
          aria-label="Close"
          onClick={onCancel}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Submit Your Miniapp Idea
        </h1>
        <p className="text-gray-600">
          Share your idea for a miniapp that could be built on Base. 
          Other users can vote on it, and developers can claim it to build.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Idea Title *
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <TextArea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your idea will be attested to the blockchain</li>
            <li>• Other users can vote on your idea</li>
            <li>• Developers can claim ideas to build them</li>
            <li>• You can remix and expand on existing ideas</li>
          </ul>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !address}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Idea"}
        </Button>
      </form>
    </div>
  );
};

