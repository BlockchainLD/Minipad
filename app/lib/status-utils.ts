export type IdeaStatus = "open" | "claimed" | "completed";

export const STATUS_CONFIG: Record<IdeaStatus, { color: string; text: string }> = {
  open: { color: "bg-green-100 text-green-800", text: "Open" },
  claimed: { color: "bg-yellow-100 text-yellow-800", text: "Building..." },
  completed: { color: "bg-violet-100 text-violet-800", text: "Completed" },
};
