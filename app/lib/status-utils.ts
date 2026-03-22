export const STATUS_CONFIG = {
  open: { color: "bg-green-100 text-green-800", text: "Open" },
  claimed: { color: "bg-yellow-100 text-yellow-800", text: "Building..." },
  completed: { color: "bg-violet-100 text-violet-800", text: "Completed" },
} as const;

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
    color: "bg-gray-100 text-gray-800",
    text: status,
  };
}
