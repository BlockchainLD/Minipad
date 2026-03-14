"use client";
import { useFarcaster } from "./auto-connect-wrapper";
import { useFarcasterData } from "../hooks/use-farcaster-data";

export function FarcasterProfile() {
  const { fid, isInMiniApp } = useFarcaster();
  const data = useFarcasterData();

  if (!isInMiniApp || !fid || !data) return null;

  const displayName = data.displayName || data.username || "Unknown";
  const username = data.username || "unknown";
  const avatarUrl = data.pfp?.url || "";

  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-3">
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
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="font-semibold text-gray-900">{displayName}</p>
            {data.pfp?.verified && <span className="text-blue-500 text-sm">✓</span>}
          </div>
          <p className="text-sm text-gray-600">@{username}</p>
        </div>
      </div>

      {data.profile?.bio?.text ? (
        <p className="text-sm text-gray-700">{data.profile.bio.text}</p>
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
        <div className="flex items-center space-x-2 text-sm">
          <span>🔗</span>
          <a
            href={data.profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 break-all"
          >
            {data.profile.url}
          </a>
        </div>
      ) : null}
    </div>
  );
}
