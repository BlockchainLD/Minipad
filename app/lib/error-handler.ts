import { toast } from "sonner";

export interface ErrorContext {
  operation: string;
  component: string;
}

/**
 * Centralized error handling function
 * Handles common error messages and displays user-friendly toast notifications
 */
export const handleError = (error: unknown, context: ErrorContext) => {
  console.error(`Error in ${context.component} during ${context.operation}:`, error);
  
  if (error instanceof Error) {
    // Handle specific error messages
    if (error.message === "Idea not found") {
      toast.error("Idea not found");
    } else if (error.message === "Idea is not available for claiming") {
      toast.error("This idea has already been claimed");
    } else if (error.message === "Idea is not claimed by this user") {
      toast.error("You can only unclaim ideas you have claimed");
    } else if (error.message === "Only the author can delete their idea") {
      toast.error("You can only delete your own ideas");
    } else if (error.message === "Only the author can delete their remix") {
      toast.error("You can only delete your own remixes");
    } else if (error.message === "Cannot upvote your own idea") {
      toast.error("You cannot upvote your own idea");
    } else if (error.message.includes("EAS schemas not configured")) {
      toast.error("EAS not properly configured. Please contact support.");
    } else if (error.message.includes("User rejected") || error.message.includes("rejected")) {
      toast.error("Transaction was rejected. Please try again.");
    } else if (error.message.includes("insufficient funds")) {
      toast.error("Insufficient funds for transaction. Please add ETH to your wallet.");
    } else if (error.message.includes("network")) {
      toast.error("Network error. Please check your connection and try again.");
    } else {
      toast.error(`Failed to ${context.operation}: ${error.message}`);
    }
  } else {
    toast.error(`Failed to ${context.operation}. Please try again.`);
  }
};

export const handleSuccess = (message: string) => {
  toast.success(message);
};

export const handleWarning = (message: string) => {
  toast.warning(message);
};

export const handleInfo = (message: string) => {
  toast.info(message);
};

