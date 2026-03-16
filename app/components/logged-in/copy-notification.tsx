interface CopyNotificationProps {
  show: boolean;
}

export const CopyNotification = ({ show }: CopyNotificationProps) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <p className="text-sm font-semibold text-white">Copied!</p>
      <p className="text-xs text-white">Wallet address copied to clipboard</p>
    </div>
  );
};
