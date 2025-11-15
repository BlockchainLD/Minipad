"use client";

import { Typography } from "@worldcoin/mini-apps-ui-kit-react";
import { StatusBadge } from "../ui/status-badge";
import { Id } from "../../../convex/_generated/dataModel";

// Type for idea in user ideas section
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
}

export const IdeaListItem = ({ idea }: IdeaListItemProps) => {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate">{idea.title}</h4>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{idea.description}</p>
          {idea.deploymentUrl && (
            <a 
              href={idea.deploymentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-1 block"
            >
              View Deployment →
            </a>
          )}
        </div>
        <StatusBadge status={idea.status} className="px-2 py-0.5 text-xs flex-shrink-0" />
      </div>
    </div>
  );
};

