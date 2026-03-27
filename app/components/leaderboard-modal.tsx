"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Xmark, Medal1stSolid } from "iconoir-react";
import { useEffect } from "react";
import { UserAvatar } from "./ui/user-avatar";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick?: (user: { address: string; avatarUrl?: string; displayName?: string; username?: string; fid?: number }) => void;
}

const RANK_STYLES = [
  "bg-yellow-50 border-yellow-200 text-yellow-700", // 1st
  "bg-gray-50 border-gray-200 text-gray-600",       // 2nd
  "bg-orange-50 border-orange-200 text-orange-700", // 3rd
];

const RANK_LABELS = ["🥇", "🥈", "🥉"];

export const LeaderboardModal = ({ isOpen, onClose, onProfileClick }: LeaderboardModalProps) => {
  const leaderboard = useQuery(api.endorsements.getLeaderboard, isOpen ? { limit: 10 } : "skip");

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-violet-950 bg-opacity-60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Medal1stSolid width={22} height={22} className="text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Xmark width={20} height={20} />
          </button>
        </div>

        <div className="p-6">
          {leaderboard === undefined ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Medal1stSolid width={40} height={40} className="text-yellow-300 mx-auto mb-3" />
              <p className="text-sm">No endorsements yet.</p>
              <p className="text-xs mt-1">Try a completed build and endorse it!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((builder, index) => {
                const rankStyle = RANK_STYLES[index] ?? "bg-white border-gray-100 text-gray-500";
                const rankLabel = RANK_LABELS[index] ?? `#${index + 1}`;
                const displayName = builder.displayName || builder.username || builder.builderId.slice(0, 6) + "…";

                return (
                  <button
                    key={builder.builderId}
                    onClick={() => {
                      onProfileClick?.({
                        address: builder.builderId,
                        displayName: builder.displayName,
                        username: builder.username,
                        fid: builder.fid,
                        avatarUrl: builder.avatar,
                      });
                      onClose();
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm cursor-pointer text-left ${rankStyle}`}
                  >
                    <span className="text-xl w-8 text-center flex-shrink-0">{rankLabel}</span>
                    <UserAvatar
                      author={builder.builderId}
                      authorAvatar={builder.avatar}
                      authorDisplayName={builder.displayName}
                      authorUsername={builder.username}
                      size={36}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500">
                        {builder.buildCount} build{builder.buildCount !== 1 ? "s" : ""} completed
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Medal1stSolid width={16} height={16} className="text-yellow-500" />
                      <span className="font-bold text-gray-900">{builder.endorsementCount}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
