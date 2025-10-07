"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { easService } from "../lib/eas";
import { Button, Input, TextArea } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface RemixFormProps {
  originalIdeaId: Id<"ideas">;
  originalTitle: string;
  originalDescription: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RemixForm = ({ 
  originalIdeaId, 
  originalTitle, 
  originalDescription, 
  onSuccess, 
  onCancel 
}: RemixFormProps) => {
  const [title, setTitle] = useState(`Remix: ${originalTitle}`);
  const [description, setDescription] = useState(`Building on: ${originalDescription}\n\nMy additions:\n`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { address } = useAccount();
  const submitIdea = useMutation(api.ideas.submitIdea);
  const updateIdeaAttestation = useMutation(api.ideas.updateIdeaAttestation);
  const createRemix = useMutation(api.remixes.createRemix);

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
      // First, submit the remix idea to Convex
      const remixIdeaId = await submitIdea({
        title: title.trim(),
        description: description.trim(),
        author: address,
      });

      // Create the EAS attestation for the remix idea
      const attestationTx = await easService.createIdeaAttestation(
        title.trim(),
        description.trim(),
        address
      );

      // Wait for the transaction to be mined
      await attestationTx.wait();

      // Update the remix idea with the attestation UID
      await updateIdeaAttestation({
        ideaId: remixIdeaId,
        attestationUid: attestationTx.uid,
      });

      // Create the remix relationship
      const remixAttestationTx = await easService.createRemixAttestation(
        originalIdeaId,
        remixIdeaId,
        address
      );

      await remixAttestationTx.wait();

      await createRemix({
        originalIdeaId,
        remixIdeaId,
        remixer: address,
        attestationUid: remixAttestationTx.uid,
      });

      toast.success("Remix submitted successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting remix:", error);
      toast.error("Failed to submit remix. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Remix an Idea
        </h2>
        <p className="text-gray-600 mb-4">
          Build upon this idea with your own additions and improvements.
        </p>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-2">Original Idea:</h3>
          <p className="text-sm text-gray-700 font-medium">{originalTitle}</p>
          <p className="text-sm text-gray-600 mt-1">{originalDescription}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Your Remix Title *
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
            Your Remix Description *
          </label>
          <TextArea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
          />
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">Remix Guidelines:</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Build upon the original idea with new features or improvements</li>
            <li>• Give credit to the original idea in your description</li>
            <li>• Your remix will be linked to the original idea</li>
            <li>• Both ideas will be attested to the blockchain</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Submitting Remix..." : "Submit Remix"}
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

