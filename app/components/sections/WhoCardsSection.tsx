"use client";

import { FadeUpReveal } from "../ui/FadeUpReveal";
import { FinancialHero } from "../ui/hero-section";
import { ShinyButton } from "../ui/ShinyButton";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { industries } from "./WhoCinematicSection";

/**
 * "Who can use BalloAds?" as copy beside two tilted photo cards (ADR 0004),
 * behind `whoCards`.
 *
 * The cards are two of the industries (SMEs and Education). The rest are
 * named in the copy and listed in full for screen readers, from the same
 * `industries` list as `WhoCinematicSection` so the two can't drift.
 */
const crop = (src: string) => src.replace("w=420&h=420", "w=640&h=800");
const front = industries.find((i) => i.id === "sme") ?? industries[0];
const back = industries.find((i) => i.id === "education") ?? industries[1];

export function WhoCardsSection() {
  const { openWaitlist } = useWaitlist();

  return (
    <FadeUpReveal yOffset={0}>
      <FinancialHero
        className="who-cards"
        title={
          <>
            Who can use <br />
            <span className="text-gradient-silver">BalloAds?</span>
          </>
        }
        description={
          <>
            <p>Banks, clinics, schools, shops, nonprofits, government.</p>
            <p>One dashboard, whatever you are sending.</p>
            <ul className="sr-only">
              {industries.map((item) => (
                <li key={item.id}>
                  {item.name}. {item.description}
                </li>
              ))}
            </ul>
          </>
        }
        action={
          <ShinyButton onClick={openWaitlist}>
            Start your first campaign
          </ShinyButton>
        }
        imageUrl1={crop(front.src)}
        imageUrl2={crop(back.src)}
        imageAlt1={front.name}
        imageAlt2={back.name}
      />
    </FadeUpReveal>
  );
}
