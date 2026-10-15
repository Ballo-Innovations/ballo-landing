"use client";

import { FadeUpReveal } from "../ui/FadeUpReveal";
import { ShinyButton } from "../ui/ShinyButton";
import {
  CircularSplitRoll,
  type CircularSplitRollItem,
} from "../ui/circular-split-roll";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { industries } from "./WhoCinematicSection";

/**
 * "Who can use BalloAds?" as a circular split roll (ADR 0006), behind
 * `whoRoll`.
 *
 * The heading scrolls in normally; when the roll reaches the top of the
 * screen it pins, and scrolling turns the six industry names round one
 * circle and their photos round another, each coming into focus in turn.
 * Title and photo only: the descriptions are for a later hover design and
 * stay in `industries` (the grid's sr-only copy carries the titles).
 */
const ITEMS: CircularSplitRollItem[] = industries.map((item) => ({
  id: item.id,
  title: item.name,
  image: item.src.replace("w=420&h=420", "w=480&h=480"),
  alt: item.name,
}));

export function WhoRollSection() {
  const { openWaitlist } = useWaitlist();

  return (
    <section className="who-roll">
      <FadeUpReveal yOffset={24}>
        <div className="who-roll__copy">
          <h2 className="section-h2">Who can use BalloAds?</h2>
          <p>Banks, clinics, schools, shops, nonprofits, government.</p>
          <p>One dashboard, whatever you are sending.</p>
        </div>
      </FadeUpReveal>

      <CircularSplitRoll items={ITEMS} radius={440} cardSize={240} />

      <div className="who-roll__cta">
        <ShinyButton onClick={openWaitlist}>Start your first campaign</ShinyButton>
      </div>
    </section>
  );
}
