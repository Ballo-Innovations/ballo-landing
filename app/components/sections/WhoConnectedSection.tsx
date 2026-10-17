"use client";

import { FadeUpReveal } from "../ui/FadeUpReveal";
import { ShinyButton } from "../ui/ShinyButton";
import { CalendlyCarousel, type CarouselItem } from "../ui/connected-carousel";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { industries } from "./WhoCinematicSection";
import { TAGS } from "./whoIndustryTags";

/**
 * "Who can use BalloAds?" as a connected carousel (ADR 0005), behind
 * `whoConnected`.
 *
 * One card per industry: its name as the title, its one-line description,
 * and two tags: who it's for, and an example of what they send. The
 * component was built for customer quotes; there are none for these
 * industries, so `quoted={false}` keeps the description from reading as a
 * testimonial.
 */

const ITEMS: CarouselItem[] = industries.map((item) => ({
  id: item.id,
  stat: item.name,
  quote: item.description,
  author: TAGS[item.id]?.who ?? item.name,
  role: TAGS[item.id]?.example ?? "",
  defaultImage: item.src.replace("w=420&h=420", "w=240&h=600"),
  selectedImage: item.src.replace("w=420&h=420", "w=660&h=1000"),
  alt: "",
}));

export function WhoConnectedSection() {
  const { openWaitlist } = useWaitlist();

  return (
    <section className="who-connected">
      <FadeUpReveal yOffset={24}>
        <div className="who-connected__copy">
          <h2 className="section-h2">Who can use BalloAds?</h2>
          <p>Banks, clinics, schools, shops, nonprofits, government.</p>
          <p>One dashboard, whatever you are sending.</p>
        </div>
      </FadeUpReveal>

      <CalendlyCarousel
        items={ITEMS}
        quoted={false}
        // Title and photo only for now; where the description and tags go
        // (on hover) is still open. Screen readers get them below.
        showDetails={false}
        ariaLabel="Industries BalloAds serves"
        autoPlayInterval={6000}
        pauseOnHover
        className="who-connected__carousel"
      />

      <ul className="sr-only">
        {ITEMS.map((item) => (
          <li key={item.id}>
            {item.stat}. {item.quote} {item.author}, {item.role}.
          </li>
        ))}
      </ul>

      <div className="who-connected__cta">
        <ShinyButton onClick={openWaitlist}>Start your first campaign</ShinyButton>
      </div>
    </section>
  );
}
