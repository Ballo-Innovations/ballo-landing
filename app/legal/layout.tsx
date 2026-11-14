import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { isFeatureEnabled } from "@/lib/featureFlags";
import "./legal.css";

/**
 * Every /legal route ships dark behind `legalPages`
 * (NEXT_PUBLIC_FEATURE_LEGAL_PAGES). The value is inlined at build time, so
 * turning it on in Vercel needs a redeploy.
 */
export default function LegalLayout({ children }: { children: ReactNode }) {
  if (!isFeatureEnabled("legalPages")) notFound();
  return <main className="legal-page min-h-screen bg-[var(--dark-blue)] text-white">{children}</main>;
}
