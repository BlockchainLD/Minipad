import React from "react";
import { Hammer, Tools } from "iconoir-react";

interface StandardButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "black";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const StandardButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  icon,
  fullWidth = false,
}: StandardButtonProps) => {
  const baseClasses =
    "rounded-xl font-medium transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    xs: "px-2 py-1 text-xs min-h-[28px]",
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-4 py-2.5 text-sm min-h-[44px]",
    lg: "px-6 py-3 text-base min-h-[52px]",
  };

  const variantClasses = {
    primary: "bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 text-slate-700 hover:bg-gray-200",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
    success: "bg-green-500 hover:bg-green-600 text-white shadow-sm",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
    black: "bg-black hover:bg-gray-800 text-white shadow-sm",
  };

  const widthClasses = fullWidth ? "w-full justify-center" : "";
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
    >
      <div className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {icon}
            {children && <span>{children}</span>}
          </>
        )}
      </div>
    </button>
  );
};

export const ClaimButton = ({
  onClick,
  disabled = false,
  loading = false,
}: {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl text-gray-900 bg-transparent hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Hammer width={16} height={16} strokeWidth={2} />
    <span>{loading ? "..." : "Claim"}</span>
  </button>
);

export const SubmitBuildButton = ({
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  size = "sm",
}: {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) => (
  <StandardButton
    onClick={onClick}
    disabled={disabled}
    loading={loading}
    variant="success"
    size={size}
    fullWidth={fullWidth}
    icon={<Tools width={size === "xs" ? 12 : 16} height={size === "xs" ? 12 : 16} strokeWidth={2} />}
  >
    Submit Build
  </StandardButton>
);

export const UnclaimButton = ({
  onClick,
  disabled = false,
  loading = false,
  size = "sm",
}: {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) => (
  <StandardButton
    onClick={onClick}
    disabled={disabled}
    loading={loading}
    variant="warning"
    size={size}
    icon={<Hammer width={size === "xs" ? 12 : 16} height={size === "xs" ? 12 : 16} strokeWidth={2} />}
  >
    Unclaim
  </StandardButton>
);

