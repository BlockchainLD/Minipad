import { Typography } from "@worldcoin/mini-apps-ui-kit-react";

interface CopyNotificationProps {
  show: boolean;
  isMobile?: boolean;
}

export const CopyNotification = ({ show, isMobile = false }: CopyNotificationProps) => {
  if (!show) return null;

  return (
    <div className={`fixed ${isMobile ? 'bottom-20' : 'bottom-4'} left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg`}>
      <Typography variant="label" className="text-white">Copied!</Typography>
      <Typography variant="body" className="text-white">Wallet address copied to clipboard</Typography>
    </div>
  );
};
