import { redirect } from "next/navigation";

import { isFeatureEnabled } from "@/lib/featureFlags";

export default function PrivacyPolicyPage() {
  // The placeholder is superseded by the full policy under /legal once that ships.
  if (isFeatureEnabled("legalPages")) redirect("/legal/privacy");

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
      <div className="container mx-auto">
        <h1 className="text-5xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-xl text-white/80">
          Learn how we protect and handle your personal information and data.
        </p>
      </div>
    </main>
  );
}


