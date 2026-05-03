import { ConvexError } from "convex/values";
import { toast } from "sonner";

export interface ErrorContext {
  operation: string;
  component: string;
}

function getErrorMessage(error: unknown): string {
  // ConvexError stores the user-facing message in .data
  if (error instanceof ConvexError) {
    return typeof error.data === "string" ? error.data : JSON.stringify(error.data);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export const handleError = (error: unknown, context: ErrorContext) => {
  console.error(`Error in ${context.component} during ${context.operation}:`, error);

  const msg = getErrorMessage(error);

  if (msg === "Idea not found") {
    toast.error("Idea not found");
  } else if (msg === "Idea is not available for claiming") {
    toast.error("This idea has already been claimed");
  } else if (msg === "Idea is not claimed by this user") {
    toast.error("You can only unclaim ideas you have claimed");
  } else if (msg === "Only the author can delete their idea") {
    toast.error("You can only delete your own ideas");
  } else if (msg === "Cannot delete a claimed or completed idea") {
    toast.error("Cannot delete an idea that has been claimed or completed");
  } else if (msg === "Only the builder can edit their completed build") {
    toast.error("Only the builder can edit this build");
  } else if (msg === "Only the builder can rename their completed build") {
    toast.error("Only the builder can rename this build");
  } else if (msg === "Title cannot be empty") {
    toast.error("Title cannot be empty");
  } else if (msg === "Only the author can delete their remix") {
    toast.error("You can only delete your own remixes");
  } else if (msg === "Cannot upvote your own idea") {
    toast.error("You cannot upvote your own idea");
  } else if (msg.includes("EAS schemas not configured")) {
    toast.error("EAS not properly configured. Please contact support.");
  } else if (msg.includes("User rejected") || msg.includes("rejected the request") || msg.includes("UserRejectedRequestError")) {
    toast.error("Transaction cancelled.");
  } else if (msg.includes("FeeTooLow") || msg.includes("fee too low")) {
    toast.error("Attestation fee too low. Please try again — your wallet may have a stale fee estimate.");
  } else if (msg.includes("insufficient funds")) {
    toast.error("Insufficient funds for transaction. Please add ETH to your wallet.");
  } else if (msg.includes("network")) {
    toast.error("Network error. Please check your connection and try again.");
  } else {
    toast.error(`Failed to ${context.operation}: ${msg}`);
  }
};

export const handleSuccess = (message: string) => {
  toast.success(message);
};
