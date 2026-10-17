"use client";

import { FadeUpReveal } from "../ui/FadeUpReveal";
import { ShinyButton } from "../ui/ShinyButton";
import { CoverflowCarousel, type CoverflowSlide } from "../ui/coverflow-carousel";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { industries } from "./WhoCinematicSection";
import { TAGS } from "./whoIndustryTags";

/**
 * "Who can use BalloAds?" as a coverflow (ADR 0008), behind `whoCoverflow`.
 * One square photo per industry on a raked 3D ring. Hovering a card overlays
 * its name and description (on touch, the front card always shows it); there
 * is no caption under the ring.
 */
const SLIDES: CoverflowSlide[] = industries.map((item) => ({
  src: item.src.replace("w=420&h=420", "w=560&h=560"),
  alt: item.name,
  title: item.name,
  subtitle: item.description,
  meta: TAGS[item.id]
    ? [
        { label: "For", value: TAGS[item.id].who },
        { label: "Example", value: TAGS[item.id].example.replace(/^e\.g\. /, "") },
      ]
    : undefined,
}));

export function WhoCoverflowSection() {
  const { openWaitlist } = useWaitlist();

  return (
    <section className="who-cf">
      <FadeUpReveal yOffset={24}>
        <div className="who-cf__copy">
          <h2 className="section-h2 text-gradient-silver">Who can use BalloAds?</h2>
          <p>Banks, clinics, schools, shops, nonprofits, government.</p>
          <p>One dashboard, whatever you are sending.</p>
        </div>
      </FadeUpReveal>

      <CoverflowCarousel
        slides={SLIDES}
        label="Industries BalloAds serves"
        cardWidth="clamp(150px, 18vw, 230px)"
        showOverlay
        showPagination
        showNavigation
      />

      <div className="who-cf__cta">
        <ShinyButton onClick={openWaitlist}>Start your first campaign</ShinyButton>
      </div>
    </section>
  );
}
