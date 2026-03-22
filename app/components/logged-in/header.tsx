"use client";
import { LightBulb, Medal1stSolid } from "iconoir-react";

interface HeaderProps {
  avatarUrl: string | null;
  onLogoClick: () => void;
  onAvatarClick: () => void;
  onTrophyClick: () => void;
  isGridView?: boolean;
  onToggleGrid?: () => void;
  showGridToggle?: boolean;
}

export const Header = ({ avatarUrl, onLogoClick, onAvatarClick, onTrophyClick, isGridView, onToggleGrid, showGridToggle }: HeaderProps) => (
  <div className="flex items-center justify-center px-6 py-4 border-b border-violet-100 bg-white">
    <div className="flex items-center gap-3 w-full justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <LightBulb width={24} height={24} className="text-gray-900" />
          <span className="text-xl font-bold text-gray-900">Minipad</span>
        </button>
        {showGridToggle && (
          <button
            onClick={onToggleGrid}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
            title={isGridView ? "Switch to list view" : "Switch to grid view"}
          >
            {isGridView ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="3" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="3" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onTrophyClick}
          className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
          aria-label="Leaderboard"
          title="Leaderboard"
        >
          <Medal1stSolid width={22} height={22} className="text-yellow-500" />
        </button>

        {avatarUrl && (
          <button
            onClick={onAvatarClick}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-violet-300 hover:ring-2 hover:ring-violet-300 transition-all"
            aria-label="Open settings"
            title="Settings"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="Profile"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </button>
        )}
      </div>
    </div>
  </div>
);
