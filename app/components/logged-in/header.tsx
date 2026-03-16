"use client";
import { LightBulb } from "iconoir-react";

interface HeaderProps {
  avatarUrl: string | null;
  onLogoClick: () => void;
  onAvatarClick: () => void;
}

export const Header = ({ avatarUrl, onLogoClick, onAvatarClick }: HeaderProps) => (
  <div className="flex items-center justify-center px-6 py-4 border-b border-violet-100 bg-white">
    <div className="flex items-center gap-3 w-full justify-between">
      <button
        onClick={onLogoClick}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <LightBulb width={24} height={24} className="text-violet-600" />
        <span className="text-xl font-bold text-violet-600">Minipad</span>
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
);
