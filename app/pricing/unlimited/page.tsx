import { getPricingPlans } from "@/lib/pricingApi";
import { getProcessSteps } from "@/lib/processStepsApi";
import PricingUnlimitedPageClient from "./PricingUnlimitedPageClient";

export const dynamic = "force-dynamic";

export default async function PricingUnlimitedPage() {
  const [plans, rawSteps] = await Promise.all([
    getPricingPlans("Unlimited"),
    getProcessSteps("pricing-cta"),
  ]);

  const stepsFlow = rawSteps.map((step) => ({
    slug: step.slug,
    stepNumber: step.stepNumber,
    title: step.title,
    screenImageUrl: step.screenImageUrl,
    iconName: step.iconName,
  }));

  return <PricingUnlimitedPageClient plans={plans} stepsFlow={stepsFlow} />;
}
