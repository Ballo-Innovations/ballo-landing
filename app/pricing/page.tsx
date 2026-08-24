import { getPricingPlans } from "@/lib/pricingApi";
import { getProcessSteps } from "@/lib/processStepsApi";
import { getAllLadders } from "@/lib/pricingLadderApi";
import PricingPageClient from "./PricingPageClient";

// No `force-dynamic`: this route already renders per-request because its CMS
// helpers read headers() to pick the environment's API base. All force-dynamic
// added was forcing `no-store` onto every fetch in the route, which overrode the
// revalidate window in lib/cmsFetch.ts and put an uncached upstream round-trip
// in front of every visitor.

export default async function PricingPage() {
  const [plans, rawSteps, { durations, laddersByDuration }] = await Promise.all([
    getPricingPlans("Recurring"),
    getProcessSteps("pricing-cta"),
    getAllLadders(),
  ]);

  const stepsFlow = rawSteps.map((step) => ({
    slug: step.slug,
    stepNumber: step.stepNumber,
    title: step.title,
    screenImageUrl: step.screenImageUrl,
    iconName: step.iconName,
  }));

  return (
    <PricingPageClient
      plans={plans}
      stepsFlow={stepsFlow}
      durations={durations}
      laddersByDuration={laddersByDuration}
    />
  );
}
