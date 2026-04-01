"use client";

import { StatusBadge } from "./status-badge";
import { type Idea } from "../../lib/types";

type IdeaTileLike = Pick<Idea, "_id" | "title" | "status">;

export function IdeaTile({
  idea,
  onIdeaClick,
}: {
  idea: IdeaTileLike;
  onIdeaClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onIdeaClick(idea._id)}
      title={idea.title}
      className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2.5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-colors duration-150 min-w-0 cursor-pointer"
      style={{ flexBasis: "calc(50% - 0.25rem)", maxWidth: "calc(50% - 0.25rem)" }}
    >
      <span className="font-medium text-gray-900 text-xs truncate flex-1 min-w-0">{idea.title}</span>
      <StatusBadge status={idea.status} className="px-1.5 py-0.5 text-[10px] flex-shrink-0" />
    </button>
  );
}
