// Proxy for better-auth requests to Convex HTTP routes.
// Currently no auth provider is active (SIWE was removed). This route will
// be used when Farcaster Quick Auth or another provider is added.
import { nextJsHandler } from "@convex-dev/better-auth/nextjs";

export const { GET, POST } = nextJsHandler();
