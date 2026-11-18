"use client";

import { useEffect } from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";

/**
 * Applies the defaultPageBg flag to <html data-page-bg>. The layout already
 * sets the attribute from the build's env value; this keeps it in step with a
 * `?features=pagebg` / `?features=none` override, which only exists client-side.
 */
export function PageBgFlag() {
  useEffect(() => {
    const root = document.documentElement;
    if (isFeatureEnabled("defaultPageBg")) root.dataset.pageBg = "hero";
    else delete root.dataset.pageBg;
  }, []);
  return null;
}
