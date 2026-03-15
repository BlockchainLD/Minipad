"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function SdkReady() {
  useEffect(() => {
    sdk.actions
      .ready()
      .catch((e) => console.error("[MiniApp] sdk.actions.ready() failed:", e));
  }, []);
  return null;
}
