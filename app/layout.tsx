import type { Metadata } from "next";
import "./globals.css";
import { Provider as WagmiProvider } from './providers/wagmi-provider';
import { ConvexClientProvider } from "./providers/convex-client-provider";
import { Toaster as SonnerToaster } from "sonner";
import { APP_METADATA } from "./lib/utils";

const appUrl = (process.env.SITE_URL || 'https://minipad.xyz').trim();

const splashConfig = {
  splashImageUrl: APP_METADATA.splash.imageUrl,
  splashBackgroundColor: APP_METADATA.splash.backgroundColor,
};

const miniAppEmbed = {
  version: "1",
  imageUrl: APP_METADATA.embedImageUrl,
  button: {
    title: "Open Minipad",
    action: {
      type: "launch_miniapp",
      url: appUrl,
      name: APP_METADATA.title,
      ...splashConfig,
    },
  },
};

const frameEmbed = {
  version: "1",
  imageUrl: APP_METADATA.embedImageUrl,
  button: {
    title: "Open Minipad",
    action: {
      type: "launch_frame",
      url: appUrl,
      name: APP_METADATA.title,
      ...splashConfig,
    },
  },
};

export const metadata: Metadata = {
  title: "Minipad",
  description: "Submit and build miniapp ideas",
  openGraph: {
    images: [{ url: APP_METADATA.embedImageUrl, width: 1200, height: 800 }],
  },
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
            <SonnerToaster position="top-center" richColors duration={3000} />
          </ConvexClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
