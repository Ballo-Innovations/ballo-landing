"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Bot,
  Brain,
  CalendarClock,
  Contact,
  LayoutTemplate,
  Mail,
  MessageCircle,
  MessageSquare,
  Bell,
  Split,
  Users,
  type LucideIcon,
} from "lucide-react";

import { isFeatureEnabled } from "@/lib/featureFlags";

import { Marquee } from "./Marquee";

/**
 * The feature chips, and the two counter-scrolling rows they run in.
 *
 * One list, two callers: the closing CTA (`FinalCta`) and "Why Choose
 * BalloAds" (the hero's own pin, plus the standalone `WhyScrollSection`). It
 * lives here rather than in either section so the two never drift apart —
 * a channel added to the product is added once.
 *
 * The chips are text and icons, not images: nothing to load, nothing to
 * decode, and the rows are transform-only marquees.
 */

export const CHIPS: Array<{ label: string; Icon: LucideIcon }> = [
  { label: "WhatsApp campaigns", Icon: MessageCircle },
  { label: "Bulk SMS", Icon: MessageSquare },
  { label: "Email marketing", Icon: Mail },
  { label: "Web push", Icon: Bell },
  { label: "AI targeting", Icon: Brain },
  { label: "Real-time analytics", Icon: BarChart3 },
  { label: "Audience builder", Icon: Users },
  { label: "Scheduling", Icon: CalendarClock },
  { label: "Brutus AI", Icon: Bot },
  { label: "Templates", Icon: LayoutTemplate },
  { label: "A/B testing", Icon: Split },
  { label: "Contact import", Icon: Contact },
];

const ROW_A = CHIPS.filter((_, i) => i % 2 === 0);
const ROW_B = CHIPS.filter((_, i) => i % 2 === 1);

export function Chips({ items }: { items: typeof CHIPS }) {
  return (
    <>
      {items.map(({ label, Icon }) => (
        <span key={label} className="cta-chip">
          <Icon size={15} aria-hidden="true" />
          {label}
        </span>
      ))}
    </>
  );
}

/**
 * Both rows, counter-scrolling.
 *
 * No wrapper of its own: the caller's element is the wrapper —
 * `.cta-mq__rows` in the CTA, `.why-copy-rows` under "Why Choose" — because
 * that is what decides the width the rows are masked against, and an extra
 * div between it and the marquees would shrink to its content instead.
 */
export function FeatureChipRows() {
  return (
    <>
      <Marquee reverse duration={34}>
        <Chips items={ROW_A} />
      </Marquee>
      <Marquee duration={30} className="mq--row-b">
        <Chips items={ROW_B} />
      </Marquee>
    </>
  );
}

/**
 * The same two rows, under "Why Choose BalloAds" 's copy.
 *
 * Behind `whyFeatureChips` (see docs/feature-promotion.md) because it is new
 * UI, and read after mount for the same reason the assistant widget does it:
 * the flag honours a localStorage override that only exists client side, so
 * reading it during render would make the server and client markup disagree.
 *
 * "Why Choose" plays inside the hero's pin, so this block has to fit one
 * viewport alongside three lines of display type, the body copy and the CTA.
 * `.why-copy-rows` is what keeps it to that budget — the second row goes away
 * before the first does.
 */
export function WhyFeatureChips() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(isFeatureEnabled("whyFeatureChips")), []);
  if (!enabled) return null;

  return (
    <div className="why-copy-rows">
      <FeatureChipRows />
    </div>
  );
}
