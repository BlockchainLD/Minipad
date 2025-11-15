"use client";

import { LightBulb } from "iconoir-react";
import Image from "next/image";

interface HeaderProps {
  avatarUrl: string | null;
  onLogoClick: () => void;
  onAvatarClick: () => void;
}

export const Header = ({ avatarUrl, onLogoClick, onAvatarClick }: HeaderProps) => {
  return (
    <div className="flex items-center justify-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center gap-3 w-full justify-between">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <LightBulb width={24} height={24} className="text-black" />
          <span className="text-xl font-bold text-gray-900">Minipad</span>
        </button>
        {avatarUrl && (
          <button
            onClick={onAvatarClick}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 hover:ring-2 hover:ring-blue-200 transition-all"
            aria-label="Open profile"
          >
            <Image
              src={avatarUrl}
              alt="Profile avatar"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full"
            />
          </button>
        )}
      </div>
    </div>
  );
};

