"use client";

import { FadeUpReveal } from "../ui/FadeUpReveal";
import { ShinyButton } from "../ui/ShinyButton";
import { CalendlyCarousel, type CarouselItem } from "../ui/connected-carousel";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { industries } from "./WhoCinematicSection";

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
const TAGS: Record<string, { who: string; example: string }> = {
  sme: { who: "Shops, brands & companies", example: "e.g. a weekend offer to past buyers" },
  finance: { who: "Banks, lenders & insurers", example: "e.g. a loan-approval SMS" },
  nonprofit: { who: "NGOs, councils & ministries", example: "e.g. a community health alert" },
  retail: { who: "Stores & online sellers", example: "e.g. back-in-stock on WhatsApp" },
  health: { who: "Clinics, labs & pharmacies", example: "e.g. an appointment reminder" },
  education: { who: "Schools, colleges & universities", example: "e.g. fees due to parents" },
};

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
        ariaLabel="Industries BalloAds serves"
        autoPlayInterval={6000}
        pauseOnHover
        className="who-connected__carousel"
      />

      <div className="who-connected__cta">
        <ShinyButton onClick={openWaitlist}>Start your first campaign</ShinyButton>
      </div>
    </section>
  );
}
