import type { Metadata } from "next";
import "./globals.css";
import { Provider as WagmiProvider } from './providers/wagmi-provider';
import { ConvexClientProvider } from "./providers/convex-client-provider";
import { Toaster as SonnerToaster } from "sonner";
import { APP_METADATA } from "./lib/utils";

const appUrl = process.env.SITE_URL || 'https://minipad-app.vercel.app';

const splashConfig = {
  splashImageUrl: APP_METADATA.splash.imageUrl,
  splashBackgroundColor: APP_METADATA.splash.backgroundColor,
};

const miniAppEmbed = {
  version: "1",
  imageUrl: APP_METADATA.imageUrl,
  button: {
    title: "Open Minipad",
    action: {
      type: "launch_miniapp",
      name: APP_METADATA.title,
      url: appUrl,
      ...splashConfig,
    },
  },
};

const frameEmbed = {
  version: "next",
  imageUrl: APP_METADATA.imageUrl,
  button: {
    title: "Open Minipad",
    action: {
      type: "launch_frame",
      name: APP_METADATA.title,
      url: appUrl,
      ...splashConfig,
    },
  },
};

export const metadata: Metadata = {
  title: "Minipad",
  description: "Submit and vote on miniapp ideas for Base",
  other: {
    "fc:miniapp": JSON.stringify(miniAppEmbed),
    "fc:frame": JSON.stringify(frameEmbed),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          <ConvexClientProvider>
            {children}
            <SonnerToaster position="top-center" richColors />
          </ConvexClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
