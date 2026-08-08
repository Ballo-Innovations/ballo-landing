import { getPricingPlans } from "@/lib/pricingApi";
import { getProcessSteps } from "@/lib/processStepsApi";
import { getAllLadders } from "@/lib/pricingLadderApi";
import PricingPageClient from "./PricingPageClient";

export const dynamic = "force-dynamic";

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
