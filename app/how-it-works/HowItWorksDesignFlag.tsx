"use client";

import { useEffect } from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";

/**
 * Applies the howItWorksDesign flag to <main data-design>. The page already
 * sets the attribute from the build's env value; this keeps it in step with a
 * `?features=howitworks` / `?features=none` override, which only exists
 * client-side.
 */
export function HowItWorksDesignFlag() {
  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".how-it-works-page");
    if (!main) return;
    const before = main.dataset.design;
    if (isFeatureEnabled("howItWorksDesign")) main.dataset.design = "on";
    else delete main.dataset.design;
    // The step section measures itself, so let it re-measure after a switch.
    if (before !== main.dataset.design) window.dispatchEvent(new Event("resize"));
  }, []);
  return null;
}
