import { APP_METADATA } from "../../lib/utils";

const APP_URL = process.env.SITE_URL || 'https://minipad-app.vercel.app';

export async function GET() {
  const miniappConfig = {
    version: "1",
    name: APP_METADATA.title,
    iconUrl: `${APP_URL}/icon.png`,
    splashImageUrl: `${APP_URL}/splash.png`,
    splashBackgroundColor: APP_METADATA.splash.backgroundColor,
    homeUrl: APP_METADATA.url,
    imageUrl: APP_METADATA.imageUrl,
    buttonTitle: "Open Minipad",
    requiredChains: ['eip155:8453'],
    requiredCapabilities: ['actions.ready'],
  };

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjgzOCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDAzMmJjNUI0NTVkOTlGQjhlMEM4MjcwMjk2YTNiNzExNkYwOTk1NTQifQ",
      payload: "eyJkb21haW4iOiJtaW5pcGFkLWFwcC52ZXJjZWwuYXBwIn0",
      signature: "vGLpgtSANNGtbh/VSfm2nOKXCxAJBj80/hetNJPwu7kqZrLP05dj73woQvvaCttP0eq3JrWMiyMcG25zRr+ScRw=",
    },
    frame: miniappConfig,
    miniapp: miniappConfig,
  };

  return Response.json(manifest);
}
