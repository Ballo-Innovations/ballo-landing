"use client";

import { FadeUpReveal } from "../ui/FadeUpReveal";
import { ShinyButton } from "../ui/ShinyButton";
import { TiltedGridHero, type TiltedGridImage } from "../ui/tilted-grid-hero";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { industries } from "./WhoCinematicSection";

/**
 * "Who can use BalloAds?" as one curved row (ADR 0003), behind `whoCurvedRow`.
 *
 * The copy sits centred above a full-width band: the six industries stream
 * round the inside of a cylinder, flat in the middle and bending toward the
 * viewer at the ends. Each tile carries its industry's name, bent with it.
 *
 * Same industries and copy as `WhoCinematicSection` (the list is imported
 * from there, so the two can't drift). The photos are re-cropped 16:9 for
 * the wider tiles, at 960px wide, enough for the centre tile on a 2x screen.
 */
const IMAGES: TiltedGridImage[] = industries.map((item) => ({
  src: item.src.replace("w=420&h=420", "w=960&h=540"),
  alt: "",
  label: item.name,
}));

export function WhoCurvedSection() {
  const { openWaitlist } = useWaitlist();

  return (
    <section className="who-curved">
      <FadeUpReveal yOffset={24}>
        <div className="who-curved__copy">
          <h2 className="section-h2 who-curved__h2">Who can use BalloAds?</h2>
          <p>Banks, clinics, schools, shops, nonprofits, government.</p>
          <p>One dashboard, whatever you are sending.</p>
        </div>
      </FadeUpReveal>

      <TiltedGridHero
        images={IMAGES}
        className="who-curved__band"
        tileHeight={40}
        axis={50}
        speed={8}
        curve={70}
        fade={10}
      />

      <div className="who-curved__cta">
        <ShinyButton onClick={openWaitlist}>Start your first campaign</ShinyButton>
      </div>

      {/* The band is decorative (aria-hidden), so the industries are listed
          here for screen readers and crawlers. */}
      <ul className="sr-only">
        {industries.map((item) => (
          <li key={item.id}>
            {item.name}. {item.description}
          </li>
        ))}
      </ul>
    </section>
  );
}
