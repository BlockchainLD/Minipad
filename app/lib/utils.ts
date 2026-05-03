import React from "react";

export const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
  e.preventDefault();
  e.stopPropagation();
  callback();
};

const APP_URL = (process.env.SITE_URL || 'https://minipad.xyz').trim();

export const APP_METADATA = {
    title: 'Minipad',
    description: 'Submit and build miniapp ideas',
    iconUrl: `${APP_URL}/icon.png`,
    embedImageUrl: `${APP_URL}/embed.png`,
    splash: {
        imageUrl: `${APP_URL}/splash.png`,
        backgroundColor: '#7c3aed',
    },
    screenshotUrls: [
        `${APP_URL}/screenshot1.png`,
        `${APP_URL}/screenshot2.png`,
        `${APP_URL}/screenshot3.png`,
    ],
    url: (process.env.SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://minipad.xyz')).trim(),
};
