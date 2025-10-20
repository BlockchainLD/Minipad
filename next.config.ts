import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        port: '',
        pathname: '/**',
      },
      // Farcaster CDN avatars
      {
        protocol: 'https',
        hostname: 'cdn.farcaster.xyz',
        port: '',
        pathname: '/**',
      },
      // Allow Imgur images used in APP_METADATA
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    // Allow embedding inside Base App and Farcaster webviews/frames
    return [
      {
        source: '/:path*',
        headers: [
          // Permit framing in Base App and Warpcast; include self and Vercel previews
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://base.app https://*.base.org https://warpcast.com https://*.warpcast.com https://*.vercel.app;",
          },
          // Explicitly allow framing (older UAs)
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          // Basic hardening
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
