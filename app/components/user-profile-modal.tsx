"use client";

import { useEffect } from "react";
import { Xmark } from "iconoir-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sdk } from "@farcaster/miniapp-sdk";
import { StatusBadge } from "./ui/status-badge";
import { UserAvatar } from "./ui/user-avatar";

export interface UserProfile {
  address: string;
  avatarUrl?: string;
  displayName?: string;
  username?: string;
  fid?: number;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onIdeaClick: (id: string) => void;
}

type IdeaLike = { _id: string; title: string; status: "open" | "claimed" | "completed" };

function IdeaTile({ idea, onIdeaClick }: { idea: IdeaLike; onIdeaClick: (id: string) => void }) {
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

function UserIdeas({ address, onIdeaClick }: { address: string; onIdeaClick: (id: string) => void }) {
  const submittedIdeas = useQuery(api.userIdeas.getUserSubmittedIdeas, { author: address });
  const rawClaimedIdeas = useQuery(api.userIdeas.getUserClaimedIdeas, { claimer: address });

  if (submittedIdeas === undefined || rawClaimedIdeas === undefined) {
    return (
      <div className="space-y-2 animate-pulse">
        {[0, 1, 2].map((i) => <div key={i} className="bg-gray-200 h-10 rounded-lg" />)}
      </div>
    );
  }

  const claimedIdeas = rawClaimedIdeas.filter((i) => i.status === "claimed");
  const completedIdeas = rawClaimedIdeas.filter((i) => i.status === "completed");
  const hasAnything = submittedIdeas.length > 0 || claimedIdeas.length > 0 || completedIdeas.length > 0;

  if (!hasAnything) {
    return <p className="text-sm text-gray-400 text-center py-8">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      {submittedIdeas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ideas</p>
          <div className="flex flex-wrap gap-2">
            {submittedIdeas.map((idea) => (
              <IdeaTile key={idea._id} idea={idea} onIdeaClick={onIdeaClick} />
            ))}
          </div>
        </div>
      )}
      {claimedIdeas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Claims</p>
          <div className="flex flex-wrap gap-2">
            {claimedIdeas.map((idea) => (
              <IdeaTile key={idea._id} idea={idea} onIdeaClick={onIdeaClick} />
            ))}
          </div>
        </div>
      )}
      {completedIdeas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Miniapps</p>
          <div className="flex flex-wrap gap-2">
            {completedIdeas.map((idea) => (
              <IdeaTile key={idea._id} idea={idea} onIdeaClick={onIdeaClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const UserProfileModal = ({ isOpen, onClose, user, onIdeaClick }: UserProfileModalProps) => {
  const tagline = useQuery(
    api.users.getTagline,
    user?.address ? { address: user.address } : "skip"
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const displayName = user.displayName || user.username || "Anonymous";
  const username = user.username;

  const handleAvatarClick = () => {
    if (user.fid) {
      sdk.actions.viewProfile({ fid: user.fid });
    }
  };

  const handleIdeaClick = (id: string) => {
    onClose();
    onIdeaClick(id);
  };

  return (
    <div
      className="fixed inset-0 bg-violet-950 bg-opacity-60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAvatarClick}
              className={user.fid ? "hover:opacity-80 transition-opacity cursor-pointer" : "cursor-default"}
              aria-label={user.fid ? "View Farcaster profile" : undefined}
            >
              <UserAvatar
                author={user.address}
                authorAvatar={user.avatarUrl}
                authorDisplayName={user.displayName}
                authorUsername={user.username}
                size={48}
              />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{displayName}</p>
                {tagline && (
                  <span className="text-[11px] text-violet-500 font-medium bg-violet-50 px-1.5 py-0.5 rounded-md">
                    {tagline}
                  </span>
                )}
              </div>
              {username && <p className="text-sm text-gray-500">@{username}</p>}
              <p className="text-[11px] italic text-gray-400 mt-0.5">Developer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Xmark width={20} height={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <UserIdeas address={user.address} onIdeaClick={handleIdeaClick} />
        </div>
      </div>
    </div>
  );
};
