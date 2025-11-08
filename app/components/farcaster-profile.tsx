"use client";

import Image from "next/image";
import { useFarcaster } from "./auto-connect-wrapper";
import { useFarcasterData } from "../hooks/use-farcaster-data";
import { Typography, Spinner } from "@worldcoin/mini-apps-ui-kit-react";

export function FarcasterProfile() {
  const { fid, isInMiniApp } = useFarcaster();
  const farcasterData = useFarcasterData();

  if (!isInMiniApp || !fid || !farcasterData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-3">
        <Image
          src={farcasterData.pfp.url}
          alt={farcasterData.displayName}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Typography variant="heading" className="text-gray-900">
              {farcasterData.displayName}
            </Typography>
            {farcasterData.pfp.verified && (
              <span className="text-blue-500">✓</span>
            )}
          </div>
          <Typography variant="body" className="text-gray-600">
            @{farcasterData.username}
          </Typography>
        </div>
      </div>

      {farcasterData.profile.bio.text && (
        <div>
          <Typography variant="body" className="text-gray-700">
            {farcasterData.profile.bio.text}
          </Typography>
        </div>
      )}

      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <span className="font-medium">{farcasterData.followerCount.toLocaleString()}</span>
          <span>followers</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="font-medium">{farcasterData.followingCount.toLocaleString()}</span>
          <span>following</span>
        </div>
      </div>

      {farcasterData.profile.location && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>📍</span>
          <span>{farcasterData.profile.location.description}</span>
        </div>
      )}

      {farcasterData.profile.url && (
        <div className="flex items-center space-x-2 text-sm">
          <span>🔗</span>
          <a 
            href={farcasterData.profile.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            {farcasterData.profile.url}
          </a>
        </div>
      )}

      {farcasterData.connectedAccounts && farcasterData.connectedAccounts.length > 0 && (
        <div className="space-y-2">
          <Typography variant="body" className="text-gray-700 font-medium">
            Connected Accounts:
          </Typography>
          <div className="space-y-1">
            {farcasterData.connectedAccounts.map((account, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="capitalize">{account.platform}:</span>
                <span>@{account.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
