"use client";
import { Medal1stSolid } from "iconoir-react";

const MinipadLogo = () => (
  <div style={{
    width: 32, height: 32, background: '#7c3aed', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <svg width="18" height="21" viewBox="57 25 86 138" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 28 C76 28 57 47 57 71 C57 86 64.5 99 76 107.5 L76 134 L124 134 L124 107.5 C135.5 99 143 86 143 71 C143 47 124 28 100 28 Z" stroke="white" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="80" y1="144" x2="120" y2="144" stroke="white" strokeWidth="7.5" strokeLinecap="round" />
      <line x1="86" y1="157" x2="114" y2="157" stroke="white" strokeWidth="7.5" strokeLinecap="round" />
      <line x1="100" y1="55" x2="100" y2="80" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </div>
);

interface HeaderProps {
  avatarUrl: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  onLogoClick: () => void;
  onAvatarClick: () => void;
  onTrophyClick: () => void;
  onConnectWallet: () => void;
}

export const Header = ({ avatarUrl, isConnected, isConnecting, onLogoClick, onAvatarClick, onTrophyClick, onConnectWallet }: HeaderProps) => (
  <div className="flex items-center justify-center px-6 py-4 border-b border-violet-100 bg-white">
    <div className="flex items-center gap-3 w-full justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <MinipadLogo />
          <span className="text-xl font-bold text-gray-900">Minipad</span>
        </button>
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

        {isConnected && avatarUrl ? (
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
        ) : isConnected ? (
          <button
            onClick={onAvatarClick}
            className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-violet-300 hover:ring-2 hover:ring-violet-300 transition-all"
            aria-label="Open settings"
            title="Settings"
          >
            <span className="text-xs text-violet-600 font-medium">•••</span>
          </button>
        ) : (
          <button
            onClick={onConnectWallet}
            disabled={isConnecting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0052FF] hover:bg-[#0040CC] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors duration-150"
          >
            {isConnecting ? (
              <>
                <span className="animate-spin w-3.5 h-3.5 border-2 border-white/40 rounded-full border-t-white" />
                <span>Connecting...</span>
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        )}
      </div>
    </div>
  </div>
);
