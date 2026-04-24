import { APP_METADATA } from "../../lib/utils";

export async function GET() {
  const miniappConfig = {
    version: "1",
    name: APP_METADATA.title,
    subtitle: "Submit and Build Miniapp Ideas",
    description: "Best way to bring your miniapp ideas to life",
    iconUrl: APP_METADATA.iconUrl,
    homeUrl: APP_METADATA.url,
    imageUrl: APP_METADATA.embedImageUrl,
    buttonTitle: "Open Minipad",
    splashImageUrl: APP_METADATA.splash.imageUrl,
    splashBackgroundColor: APP_METADATA.splash.backgroundColor,
    heroImageUrl: APP_METADATA.embedImageUrl,
    ogImageUrl: APP_METADATA.embedImageUrl,
    primaryCategory: "productivity",
    tags: ["miniapp", "base", "ideas", "farcaster"],
    requiredChains: ["eip155:8453"],
    canonicalDomain: "minipad-app.vercel.app",
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
