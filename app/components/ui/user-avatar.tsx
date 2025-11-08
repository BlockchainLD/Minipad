import Image from "next/image";
import type { FarcasterUser } from "../../lib/types";

interface UserAvatarProps {
  author: string;
  authorAvatar?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  size?: number;
  className?: string;
}

/**
 * Reusable component for rendering user avatars with fallback to colored initials
 */
export function UserAvatar({
  author,
  authorAvatar,
  authorDisplayName,
  authorUsername,
  size = 24,
  className = "",
}: UserAvatarProps) {
  const getInitial = () => {
    if (authorDisplayName) {
      return authorDisplayName.charAt(0).toUpperCase();
    }
    if (authorUsername) {
      return authorUsername.charAt(0).toUpperCase();
    }
    return author?.charAt(0).toUpperCase() || "?";
  };

  const backgroundColor = `hsl(${author?.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`;

  return (
    <>
      {authorAvatar && (
        <Image
          src={authorAvatar}
          alt={authorDisplayName || authorUsername || "Author avatar"}
          width={size}
          height={size}
          className={`${size === 24 ? "w-6 h-6" : size === 32 ? "w-8 h-8" : "w-12 h-12"} rounded-full object-cover ${className}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      )}
      <div
        className={`${size === 24 ? "w-6 h-6 text-xs" : size === 32 ? "w-8 h-8 text-xs" : "w-12 h-12 text-lg"} rounded-full flex items-center justify-center font-semibold ${
          authorAvatar ? "hidden" : "flex"
        } ${className}`}
        style={{
          backgroundColor,
          color: "white",
        }}
      >
        {getInitial()}
      </div>
    </>
  );
}

