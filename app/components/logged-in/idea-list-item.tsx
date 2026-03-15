"use client";

import { StatusBadge } from "../ui/status-badge";
import { Id } from "../../../convex/_generated/dataModel";

type UserIdea = {
  _id: Id<"ideas">;
  title: string;
  description: string;
  status: "open" | "claimed" | "completed";
  timestamp: number;
  deploymentUrl?: string;
};

interface IdeaListItemProps {
  idea: UserIdea;
  onIdeaClick: (ideaId: Id<"ideas">) => void;
}

export const IdeaListItem = ({ idea, onIdeaClick }: IdeaListItemProps) => (
  <button
    onClick={() => onIdeaClick(idea._id)}
    className="w-full text-left bg-white rounded-lg px-3 py-2.5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
  >
    <div className="flex items-center justify-between gap-2">
      <span className="font-medium text-gray-900 text-sm truncate">{idea.title}</span>
      <StatusBadge status={idea.status} className="px-2 py-0.5 text-xs flex-shrink-0" />
    </div>
  </button>
);
