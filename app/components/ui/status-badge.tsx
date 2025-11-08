import { getStatusConfig } from "../../lib/status-utils";

interface StatusBadgeProps {
  status: "open" | "claimed" | "completed";
  className?: string;
}

/**
 * Reusable status badge component
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${config.color} ${className}`}>
      {config.text}
    </span>
  );
}

