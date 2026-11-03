import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/featureFlags";
import ManageClient from "./ManageClient";

export const metadata: Metadata = {
  title: { absolute: "Manage your demo | BalloAds" },
  description: "Reschedule or cancel your BalloAds demo.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function ManageDemoPage() {
  if (!isFeatureEnabled("bookDemo")) notFound();

  return (
    <main className="bd-page bd-page--manage">
      <div className="bd-page__glow" aria-hidden="true" />
      <div className="bd-manage">
        <Suspense fallback={<div className="bd-card"><div className="bd-card__inner"><p className="bd-card__sub">Loading your booking...</p></div></div>}>
          <ManageClient />
        </Suspense>
      </div>
    </main>
  );
}
