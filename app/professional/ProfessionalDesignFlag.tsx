"use client";

import { useEffect } from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";

/**
 * Applies the professionalDesign flag to <main data-design>. The page already
 * sets the attribute from the build's env value; this keeps it in step with a
 * `?features=professional` / `?features=none` override, which only exists
 * client-side.
 */
export function ProfessionalDesignFlag() {
  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".professional-page");
    if (!main) return;
    if (isFeatureEnabled("professionalDesign")) main.dataset.design = "on";
    else delete main.dataset.design;
  }, []);
  return null;
}
