import React from "react";
import { Hammer, Tools, Trash } from "iconoir-react";

interface StandardButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg";
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
  const baseClasses = "rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-4 py-2.5 text-sm min-h-[44px]",
    lg: "px-6 py-3 text-base min-h-[52px]",
  };
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
    secondary: "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white",
    success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white",
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

// Specialized button components for common use cases
export const ClaimButton = ({ onClick, disabled = false, loading = false }: { onClick: (e: React.MouseEvent) => void; disabled?: boolean; loading?: boolean }) => (
  <StandardButton
    onClick={onClick}
    disabled={disabled}
    loading={loading}
    variant="primary"
    size="md"
    icon={<Hammer width={16} height={16} strokeWidth={2} />}
  >
    Claim
  </StandardButton>
);

export const SubmitBuildButton = ({ onClick, disabled = false, loading = false, fullWidth = false }: { onClick: (e: React.MouseEvent) => void; disabled?: boolean; loading?: boolean; fullWidth?: boolean }) => (
  <StandardButton
    onClick={onClick}
    disabled={disabled}
    loading={loading}
    variant="success"
    size="md"
    fullWidth={fullWidth}
    icon={<Tools width={16} height={16} strokeWidth={2} />}
  >
    Submit Build
  </StandardButton>
);

export const UnclaimButton = ({ onClick, disabled = false, loading = false }: { onClick: (e: React.MouseEvent) => void; disabled?: boolean; loading?: boolean }) => (
  <StandardButton
    onClick={onClick}
    disabled={disabled}
    loading={loading}
    variant="warning"
    size="md"
    icon={<Hammer width={16} height={16} strokeWidth={2} />}
  >
    Unclaim
  </StandardButton>
);

export const DeleteButton = ({ onClick, disabled = false, loading = false }: { onClick: (e: React.MouseEvent) => void; disabled?: boolean; loading?: boolean }) => (
  <StandardButton
    onClick={onClick}
    disabled={disabled}
    loading={loading}
    variant="danger"
    size="sm"
    icon={<Trash width={16} height={16} strokeWidth={2} />}
  />
);
