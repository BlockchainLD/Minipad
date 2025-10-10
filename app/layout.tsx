import type { Metadata } from "next";
import "./globals.css";
import "@worldcoin/mini-apps-ui-kit-react/styles.css";
import { Provider as WagmiProvider } from './providers/wagmi-provider';
import { ConvexClientProvider } from "./providers/convex-client-provider";
import { Toaster } from "@worldcoin/mini-apps-ui-kit-react";

export const metadata: Metadata = {
  title: "Minipad",
  description: "Submit and vote on miniapp ideas for Base",
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
            <Toaster />
          </ConvexClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
