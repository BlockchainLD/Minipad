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
    tagline: "Submit and Build Miniapp Ideas",
    heroImageUrl: APP_METADATA.embedImageUrl,
    ogTitle: APP_METADATA.title,
    ogDescription: "Best way to bring your miniapp ideas to life",
    ogImageUrl: APP_METADATA.embedImageUrl,
    primaryCategory: "productivity",
    tags: ["miniapp", "base", "ideas", "farcaster"],
    requiredChains: ["eip155:8453"],
    canonicalDomain: "minipad.xyz",
  };

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjgzOCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDAzMmJjNUI0NTVkOTlGQjhlMEM4MjcwMjk2YTNiNzExNkYwOTk1NTQifQ",
      payload: "eyJkb21haW4iOiJtaW5pcGFkLnh5eiJ9",
      signature: "v5YRRaIogUBzUZgHh3yMQuOPG4/XgtLUGk/BaHineqgjffwHmy9asQl9NrBahLbm6rhpJSUHVX0VmAcmcUnUlxw=",
    },
    miniapp: miniappConfig,
  };

  return Response.json(manifest);
}
