import { HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { resolveIcon } from "@/lib/iconRegistry";
import type { ProcessStep } from "@/lib/processStepsApi";

/**
 * Shape the interactive stage (`HowItWorksStage.tsx`), the main
 * `/how-it-works` page, and `/how-it-works/[step]` all render against.
 * This used to be backed by a hardcoded array; it's now the target shape
 * that CMS `ProcessStep` records get mapped onto via `toHowItWorksStep`,
 * so none of those three consumers needed to change their prop types.
 */
export type HowItWorksStep = {
  slug: string;
  number: string;
  title: string;
  /** One-liner used on the stage caption + the timeline. */
  description: string;
  /** Short preview note shown on the bottom cards. */
  note: string;
  Icon: LucideIcon;
  /** Real in-app screen shown on the phone for this step, or null if the CMS record has none. */
  screen: string | null;
  screenAlt: string;
  detail: {
    intro: string;
    sections: { heading: string; body: string }[];
  };
};

/** Map a CMS `ProcessStep` (group="how-it-works") onto the shape the UI expects. */
export function toHowItWorksStep(raw: ProcessStep): HowItWorksStep {
  return {
    slug: raw.slug,
    number: String(raw.stepNumber),
    title: raw.title,
    description: raw.description,
    note: raw.note ?? raw.description,
    Icon: resolveIcon(raw.iconName, HelpCircle),
    screen: raw.screenImageUrl,
    screenAlt: `${raw.title} — BalloAds app screen`,
    detail: {
      intro: raw.detailIntro ?? raw.description,
      sections: raw.detailSections.map((section) => ({ heading: section.title, body: section.body })),
    },
  };
}
