"use client";
import { Medal1stSolid } from "iconoir-react";
import { MINIPAD_TOKEN } from "../../lib/constants";

// SWAP INTEGRATION — when MINIPAD_TOKEN.contractAddress is set:
//   1. Replace `onLogoClick` with `onSwapClick` in HeaderProps
//   2. In logged-in/index.tsx, set onLogoClick to open a swap modal
//   3. Add Coinbase OnchainKit <Swap> with:
//        fromToken = ETH (native)
//        toToken   = MINIPAD_TOKEN.contractAddress
// The isSwapEnabled flag below gates the future behaviour automatically.
const isSwapEnabled = MINIPAD_TOKEN.contractAddress !== null;

const MinipadLogo = () => (
  <div style={{
    width: 32, height: 32, background: '#7c3aed', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <svg width="19" height="21" viewBox="0 0 200 225" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 8C68 8 17 38 17 88C17 126 40 158 68 170L68 182L132 182L132 170C160 158 183 126 183 88C183 38 132 8 100 8Z" stroke="white" strokeWidth="10" strokeLinejoin="round"/>
      <line x1="55" y1="196" x2="145" y2="196" stroke="white" strokeWidth="10" strokeLinecap="round"/>
      <line x1="65" y1="214" x2="135" y2="214" stroke="white" strokeWidth="10" strokeLinecap="round"/>
      <path d="M52 60L148 60L148 76L124 76L124 136C108 106 92 106 76 136L76 76L52 76Z" fill="white"/>
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
