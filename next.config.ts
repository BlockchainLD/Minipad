import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
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
    return [
      {
        source: '/:path*',
        headers: [
          // Allow any Farcaster client to embed this mini app.
          // Farcaster is an open protocol — restricting to specific domains
          // would break the app in any client not explicitly listed.
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
          // Basic hardening
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
