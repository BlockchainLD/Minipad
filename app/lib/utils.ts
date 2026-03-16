
const APP_URL = process.env.SITE_URL || 'https://minipad-app.vercel.app';

export const APP_METADATA = {
    title: 'Minipad',
    description: 'Submit and vote on miniapp ideas for Base',
    imageUrl: 'https://i.imgur.com/2bsV8mV.png',
    splash: {
        imageUrl: `${APP_URL}/splash.png`,
        backgroundColor: '#eeccff',
    },
    url: process.env.SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://minipad-app.vercel.app'),
    baseBuilder: {
        allowedAddresses: ['0x8342A48694A74044116F330db5050a267b28dD85']
    }
};
