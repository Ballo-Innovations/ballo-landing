import { getPricingPlans } from "@/lib/pricingApi";
import { getProcessSteps } from "@/lib/processStepsApi";
import { getLadder } from "@/lib/pricingLadderApi";
import PricingUnlimitedPageClient from "./PricingUnlimitedPageClient";

export const dynamic = "force-dynamic";

export default async function PricingUnlimitedPage() {
  // "Unlimited" == the ladder's "no expiry" duration (0) — priced live from
  // the same Recurring plan content shown on /pricing, not a separate
  // flat-rate plan type.
  const [plans, rawSteps, bands] = await Promise.all([
    getPricingPlans("Recurring"),
    getProcessSteps("pricing-cta"),
    getLadder(0),
  ]);

  const stepsFlow = rawSteps.map((step) => ({
    slug: step.slug,
    stepNumber: step.stepNumber,
    title: step.title,
    screenImageUrl: step.screenImageUrl,
    iconName: step.iconName,
  }));

  return <PricingUnlimitedPageClient plans={plans} bands={bands} stepsFlow={stepsFlow} />;
}
