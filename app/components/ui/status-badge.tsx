import { STATUS_CONFIG, type IdeaStatus } from "../../lib/status-utils";

interface StatusBadgeProps {
  status: IdeaStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${config.color} ${className}`}>
      {config.text}
    </span>
  );
}
