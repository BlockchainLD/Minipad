"use client";
import { useState } from "react";
import { useFarcaster } from "./auto-connect-wrapper";
import { useFarcasterData } from "../hooks/use-farcaster-data";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount } from "wagmi";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function FarcasterProfile() {
  const { fid, isInMiniApp } = useFarcaster();
  const data = useFarcasterData();
  const { address } = useAccount();
  const tagline = useQuery(api.users.getTagline, address ? { address } : "skip");
  const setTagline = useMutation(api.users.setTagline);

  const [isEditing, setIsEditing] = useState(false);
  const [taglineInput, setTaglineInput] = useState("");

  if (!isInMiniApp || !fid || !data) return null;

  const displayName = data.displayName || data.username || "Unknown";
  const username = data.username || "unknown";
  const avatarUrl = data.pfp?.url || "";

  const handleTaglineSave = async () => {
    if (!address) return;
    await setTagline({ address, tagline: taglineInput.trim() });
    setIsEditing(false);
  };

  const handleTaglineEdit = () => {
    setTaglineInput(tagline ?? "");
    setIsEditing(true);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4 relative">
      {/* Developer tagline — top right */}
      <div className="absolute top-4 right-4 text-right">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={taglineInput}
              onChange={(e) => setTaglineInput(e.target.value.slice(0, 12))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTaglineSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              maxLength={12}
              placeholder="12 chars max"
              className="w-28 text-xs border border-violet-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400 text-gray-700"
            />
            <button
              onClick={handleTaglineSave}
              className="text-xs text-violet-600 font-medium hover:text-violet-800 transition-colors"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={handleTaglineEdit}
            className="group flex flex-col items-end gap-0.5"
            title="Click to set your tagline"
          >
            <span className="italic text-xs text-gray-400 group-hover:text-violet-500 transition-colors">
              Developer
            </span>
            {tagline ? (
              <span className="text-[11px] text-violet-500 font-medium">{tagline}</span>
            ) : (
              <span className="text-[10px] text-gray-300 group-hover:text-gray-400 transition-colors">
                + add tag
              </span>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => sdk.actions.viewProfile({ fid })}
          className="hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
          aria-label="View Farcaster profile"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </button>
        <div className="flex-1 pr-24">
          <div className="flex items-center space-x-2">
            <p className="font-semibold text-gray-900">{displayName}</p>
            {data.pfp?.verified && (
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="text-violet-600 flex-shrink-0" aria-label="Verified">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <polyline points="7,12 10.5,15.5 17,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-600">@{username}</p>
        </div>
      </div>

      {data.profile?.bio?.text ? (
        <p className="text-sm text-gray-700 line-clamp-3">{data.profile.bio.text}</p>
      ) : null}

      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>
          <span className="font-medium">{(data.followerCount ?? 0).toLocaleString()}</span> followers
        </span>
        <span>
          <span className="font-medium">{(data.followingCount ?? 0).toLocaleString()}</span> following
        </span>
      </div>

      {data.profile?.location?.description ? (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>📍</span>
          <span>{data.profile.location.description}</span>
        </div>
      ) : null}

      {data.profile?.url ? (
        <div className="flex items-center space-x-2 text-sm min-w-0">
          <span className="flex-shrink-0">🔗</span>
          <a
            href={data.profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:text-violet-800 truncate min-w-0"
          >
            {data.profile.url}
          </a>
        </div>
      ) : null}
    </div>
  );
}
