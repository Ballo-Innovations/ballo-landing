"use client";

import { useRouter, usePathname } from "next/navigation";

export function PricingHeroToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const isUnlimited = pathname === "/pricing/unlimited";

  return (
    <div className="pricing-hero__toggle" role="tablist" aria-label="Pricing plan type">
      <button
        type="button"
        role="tab"
        aria-selected={!isUnlimited}
        onClick={() => router.push("/pricing")}
        className={`pricing-hero__toggle-btn${!isUnlimited ? " is-active" : ""}`}
      >
        Monthly
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={isUnlimited}
        onClick={() => router.push("/pricing/unlimited")}
        className={`pricing-hero__toggle-btn${isUnlimited ? " is-active" : ""}`}
      >
        Unlimited
      </button>
    </div>
  );
}
