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
    iconUrl: `${APP_URL}/icon.jpg`,
    embedImageUrl: `${APP_URL}/embed.jpg`,
    splash: {
        imageUrl: `${APP_URL}/splash.jpg`,
        backgroundColor: '#7c3aed',
    },
    url: (process.env.SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://minipad.xyz')).trim(),
};
