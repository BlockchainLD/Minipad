import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { betterAuth } from "better-auth";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  }
);

// NOTE: better-auth + Convex component is still wired up for HTTP routes
// (see convex/http.ts). The SIWE plugin was removed because no client-side
// code invokes it — auth state comes from wagmi wallet connection.
// When migrating to Farcaster Quick Auth, replace the plugins array below
// with a Quick Auth verifier plugin.
export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false },
) => {
  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    baseURL: siteUrl,
    trustedOrigins: [
      "http://localhost:3000",
      "https://minipad.xyz",
      "https://*.vercel.app",
      ...(process.env.SITE_URL ? [process.env.SITE_URL] : [])
    ],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      convex(),
    ],
  });
};
