interface UserAvatarProps {
  author: string;
  authorAvatar?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  size?: number;
  className?: string;
}

export function UserAvatar({
  author,
  authorAvatar,
  authorDisplayName,
  authorUsername,
  size = 24,
  className = "",
}: UserAvatarProps) {
  const getInitial = () => {
    if (authorDisplayName) return authorDisplayName.charAt(0).toUpperCase();
    if (authorUsername) return authorUsername.charAt(0).toUpperCase();
    return author?.charAt(0).toUpperCase() || "?";
  };

  const backgroundColor = `hsl(${(author?.charCodeAt(0) ?? 0) * 137.5 % 360}, 70%, 50%)`;
  const sizeClass = size <= 20 ? "w-5 h-5 text-xs" : size <= 24 ? "w-6 h-6 text-xs" : size <= 28 ? "w-7 h-7 text-xs" : size <= 32 ? "w-8 h-8 text-xs" : size <= 36 ? "w-9 h-9 text-xs" : "w-12 h-12 text-lg";

  return (
    <>
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
    </>
  );
}
