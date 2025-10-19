"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { useEAS, createIdeaAttestation } from "../lib/eas";
import { useFarcaster } from "./auto-connect-wrapper";
import { Button, Input, TextArea } from "@worldcoin/mini-apps-ui-kit-react";
import { toast } from "sonner";

interface IdeaSubmissionFormProps {
  onSuccess?: (title: string) => void;
  onCancel?: () => void;
}

interface FarcasterUser {
  fid: number;
  displayName: string;
  username: string;
  pfp: {
    url: string;
    verified: boolean;
  };
}

export const IdeaSubmissionForm = ({ onSuccess, onCancel }: IdeaSubmissionFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farcasterData, setFarcasterData] = useState<FarcasterUser | null>(null);
  
  const { address } = useAccount();
  const { fid, isInMiniApp } = useFarcaster();
  const { eas, isInitialized } = useEAS();
  const submitIdea = useMutation(api.ideas.submitIdea);
  const updateIdeaAttestation = useMutation(api.ideas.updateIdeaAttestation);

  // Fetch Farcaster data when component mounts
  useEffect(() => {
    const fetchFarcasterData = async () => {
      if (!fid || !isInMiniApp) return;

      try {
        const response = await fetch(`/api/farcaster/${fid}`);
        if (response.ok) {
          const data = await response.json();
          setFarcasterData(data.result.user);
        }
      } catch (error) {
        console.error('Error fetching Farcaster data:', error);
        // Continue without Farcaster data - not critical for submission
      }
    };

    fetchFarcasterData();
  }, [fid, isInMiniApp]);


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
        authorFid: farcasterData?.fid,
        authorAvatar: farcasterData?.pfp?.url,
        authorDisplayName: farcasterData?.displayName,
        authorUsername: farcasterData?.username,
      });

      // Create the EAS attestation
      if (!eas || !isInitialized) {
        toast.error("EAS not initialized. Please ensure you're connected to Base network.");
        return;
      }

      try {
        // Show wallet confirmation message
        toast.info("Please confirm the transaction in your wallet to attest your idea to the blockchain...");

        const attestationTx = await createIdeaAttestation(
          eas,
          title.trim(),
          description.trim(),
          address,
          undefined,
          ideaId
        );

        // Show transaction pending message
        toast.info("Transaction submitted! Waiting for confirmation...");

        // Wait for the transaction to be mined
        await attestationTx.wait();
        
        const attestationUid = (attestationTx as unknown as { uid: string }).uid;
        
        // Update the idea with the attestation UID
        await updateIdeaAttestation({
          ideaId,
          attestationUid,
        });

        toast.success("🎉 Idea submitted and attested to blockchain successfully! Your idea is now live and ready for votes and claims.");
      } catch (easError) {
        console.error("EAS attestation failed:", easError);
        if (easError instanceof Error && easError.message.includes("EAS schemas not configured")) {
          toast.error("EAS not properly configured. Please contact support.");
        } else {
          toast.error("Blockchain attestation failed. Please check your wallet connection and try again.");
        }
        return;
      }
      
      // Store the title before clearing the form
      const submittedTitle = title.trim();
      
      // Clear form
      setTitle("");
      setDescription("");
      
      // Call onSuccess with the submitted title
      onSuccess?.(submittedTitle);
    } catch (error) {
      console.error("Error submitting idea:", error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("User rejected") || error.message.includes("rejected")) {
          toast.error("Transaction was rejected. Please try again.");
        } else if (error.message.includes("insufficient funds")) {
          toast.error("Insufficient funds for transaction. Please add ETH to your wallet.");
        } else if (error.message.includes("network")) {
          toast.error("Network error. Please check your connection and try again.");
        } else {
          toast.error(`Failed to submit idea: ${error.message}`);
        }
      } else {
        toast.error("Failed to submit idea. Please try again.");
      }
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

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-blue-900 mb-3">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Your idea will be attested to the blockchain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Other users can vote on your idea</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Developers can claim ideas to build them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>You can remix and expand on existing ideas</span>
            </li>
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

