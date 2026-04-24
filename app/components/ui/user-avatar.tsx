interface UserAvatarProps {
  author: string;
  authorAvatar?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  size?: number;
  className?: string;
  showPurpleCheck?: boolean;
}

export function UserAvatar({
  author,
  authorAvatar,
  authorDisplayName,
  authorUsername,
  size = 24,
  className = "",
  showPurpleCheck = false,
}: UserAvatarProps) {
  const getInitial = () => {
    if (authorDisplayName) return authorDisplayName.charAt(0).toUpperCase();
    if (authorUsername) return authorUsername.charAt(0).toUpperCase();
    return author?.charAt(0).toUpperCase() || "?";
  };

  const backgroundColor = `hsl(${(author?.charCodeAt(0) ?? 0) * 137.5 % 360}, 70%, 50%)`;
  const sizeClass = size <= 20 ? "w-5 h-5 text-xs" : size <= 24 ? "w-6 h-6 text-xs" : size <= 28 ? "w-7 h-7 text-xs" : size <= 32 ? "w-8 h-8 text-xs" : size <= 36 ? "w-9 h-9 text-xs" : "w-12 h-12 text-lg";
  const badgeSize = Math.max(10, Math.round(size * 0.38));
  const checkSize = Math.round(badgeSize * 0.55);

  return (
    <div className="relative inline-flex flex-shrink-0">
      {authorAvatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={authorAvatar}
          alt={authorDisplayName || authorUsername || "Author avatar"}
          width={size}
          height={size}
          className={`${sizeClass} rounded-full object-cover ${className}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      )}
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-semibold ${
          authorAvatar ? "hidden" : "flex"
        } ${className}`}
        style={{ backgroundColor, color: "white" }}
      >
        {getInitial()}
      </div>
      {showPurpleCheck && (
        <span
          className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-violet-600 ring-1 ring-white"
          style={{ width: badgeSize, height: badgeSize }}
          title="Minipad token holder"
        >
          <svg width={checkSize} height={checkSize} viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}
