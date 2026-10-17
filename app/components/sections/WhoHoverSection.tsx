"use client";

import { FadeUpReveal } from "../ui/FadeUpReveal";
import { ShinyButton } from "../ui/ShinyButton";
import {
  ServicesHoverModal,
  type HoverModalItem,
} from "../ui/services-with-animated-hover-modal";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { industries } from "./WhoCinematicSection";
import { TAGS } from "./whoIndustryTags";

/**
 * "Who can use BalloAds?" as a hover list (ADR 0007), behind `whoHoverList`.
 *
 * One large row per industry with who it covers on the right. Hovering a row
 * reveals its description and brings up its photo on a card that trails the
 * pointer, with a "Start" cursor; clicking a row opens the waitlist, like
 * every other call to action on the page. Touch shows each photo inline.
 */
const CARD_COLORS = ["#0d1347", "#14215e", "#0b2a6f", "#101a52", "#1a2a6c", "#0e1d5a"];

const ITEMS: HoverModalItem[] = industries.map((item, i) => ({
  title: item.name,
  meta: TAGS[item.id]?.who,
  description: item.description,
  image: item.src.replace("w=420&h=420", "w=640&h=560"),
  color: CARD_COLORS[i % CARD_COLORS.length],
}));

export function WhoHoverSection() {
  const { openWaitlist } = useWaitlist();

  return (
    <section className="who-hover">
      <div className="who-hover__inner">
        <FadeUpReveal yOffset={24}>
          <div className="who-hover__head">
            <h2 className="section-h2 text-gradient-silver">Who can use BalloAds?</h2>
            <div className="who-hover__lines">
              <p>Banks, clinics, schools, shops, nonprofits, government.</p>
              <p>One dashboard, whatever you are sending.</p>
            </div>
          </div>
        </FadeUpReveal>

        <ServicesHoverModal
          items={ITEMS}
          cursorLabel="Start"
          onSelect={() => openWaitlist()}
          className="who-hover__list"
        />

        <div className="who-hover__cta">
          <ShinyButton onClick={openWaitlist}>Start your first campaign</ShinyButton>
        </div>
      </div>
    </section>
  );
}
