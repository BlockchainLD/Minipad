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
    canonicalDomain: "minipad.xyz",
  };

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjgzOCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDZBMGJBMzcwN2RGOUQxM0E0NDQ1Y0Q3RTA0Mjc0QjI3MjU5MzBjRDcifQ",
      payload: "eyJkb21haW4iOiJtaW5pcGFkLnh5eiJ9",
      signature: "zPP18yybIORyHvLM45+YUSJ8SDz3GHIAoGGX6dPsDNkyirU/n5eME3hgYK3jMnfRtVb4I6As5HDQ7HwTjf14SBw=",
    },
    miniapp: miniappConfig,
  };

  return Response.json(manifest);
}
