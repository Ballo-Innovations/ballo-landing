"use client";

import Image from "next/image";

import { FadeUpReveal } from "../ui/FadeUpReveal";
import { Marquee } from "../ui/Marquee";
import { ScrambleButton } from "../ui/ScrambleButton";
import { useAnimateWhenVisible } from "../ui/useAnimateWhenVisible";
import { useWaitlist } from "../waitlist/WaitlistProvider";

/**
 * "Who can use BalloAds?" — the 21st.dev "CTA with marquee" layout: the
 * question and the action on one side, two rows of industry tiles drifting in
 * opposite directions on the other.
 *
 * Three departures from the reference, all for the same reason — it ships as a
 * hero for a different product:
 *
 *   - the tiles are the six industries with their own photographs and names,
 *     not eight unlabelled stock images from `cdn.21st.dev`. A row of pictures
 *     answers "who can use this" only if you can tell what you are looking
 *     at, so each tile carries its industry name and the rows hold still on
 *     hover;
 *   - its `daliagents.com` credit link and "Dali Agents showcase" alt text are
 *     gone. That is the component author's own attribution, not something to
 *     ship on this page;
 *   - `min-h-screen`, `bg-background`, `text-muted-foreground` and `bg-primary`
 *     are all dropped. The first forces a viewport on a mid-page section, and
 *     the rest are shadcn tokens that resolve to a white background and no
 *     primary colour at all in this project.
 *
 * The marquee is this project's own (`ui/Marquee`, already used by the closing
 * CTA), so the reference's second implementation and its `animate-marquee`
 * utility are not needed. Both rows park off-screen through
 * `useAnimateWhenVisible`.
 */

type Industry = {
  id: string;
  name: string;
  description: string;
  src: string;
};

/**
 * Square crops, sized for the tile rather than for a full-bleed card: these
 * render at 12rem, so a 420px source covers a 2x display with nothing to
 * spare.
 */
const industries: Industry[] = [
  {
    id: "sme",
    name: "SMEs & Corporations",
    description:
      "Promote products, services, and offers to your ideal customers.",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=420&h=420&fit=crop&auto=format&q=70",
  },
  {
    id: "finance",
    name: "Financial Institutions",
    description:
      "Send loan approvals, transaction updates, and targeted offers.",
    src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=420&h=420&fit=crop&auto=format&q=70",
  },
  {
    id: "nonprofit",
    name: "Nonprofits & Government",
    description:
      "Spread awareness and reach communities with mass communication.",
    src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=420&h=420&fit=crop&auto=format&q=70",
  },
  {
    id: "retail",
    name: "Retail & E-commerce",
    description: "Drive sales, customer loyalty, and engagement at scale.",
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=420&h=420&fit=crop&auto=format&q=70",
  },
  {
    id: "health",
    name: "Healthcare & Clinics",
    description: "Send appointment reminders and targeted health campaigns.",
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=420&h=420&fit=crop&auto=format&q=70",
  },
  {
    id: "education",
    name: "Education Institutions",
    description: "Notify students, parents, and staff with timely updates.",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=420&h=420&fit=crop&auto=format&q=70",
  },
];

/**
 * Both rows carry all six tiles, the second starting halfway through the list.
 *
 * The reference splits eight images into four and four. Three tiles to a row
 * would not fill the column here, and a group narrower than its container
 * leaves a visible gap on every loop, because the track only travels one
 * group's width. Six per row is comfortably wider than the column at any
 * breakpoint; the offset is what keeps the two rows from reading as the same
 * row twice.
 */
const ROW_ONE = industries;
const ROW_TWO = [...industries.slice(3), ...industries.slice(0, 3)];

function Tile({ item }: { item: Industry }) {
  return (
    <figure className="who-tile">
      {/* `loading="eager"`, not the default lazy.

          Native lazy loading never fires for a tile the marquee has
          translated outside its own clip box: measured, 14 of the 24 tile
          elements stayed permanently blank, and waiting six seconds did not
          help. The bytes are not the issue — there are only six unique
          photographs and the browser had already fetched all six for the
          tiles that did load, so the blank ones were duplicates that never
          started. Eager costs nothing beyond those six requests and is what
          a horizontally translated carousel needs. */}
      <Image
        src={item.src}
        alt=""
        fill
        sizes="12rem"
        loading="eager"
        className="who-tile__img"
      />
      <figcaption className="who-tile__label">
        {item.name}
        {/* The description has nowhere to sit on a 12rem tile, but it stays in
            the document for a screen reader and a crawler. */}
        <span className="sr-only">. {item.description}</span>
      </figcaption>
    </figure>
  );
}

export function WhoCinematicSection() {
  const { openWaitlist } = useWaitlist();
  const animRef = useAnimateWhenVisible<HTMLElement>();

  return (
    <section ref={animRef} className="who-cta">
      <div className="who-cta__inner">
        {/* Both reveals are triggers only — their own transforms are turned
            off in CSS — so the stagger inside each one is the whole effect
            rather than a fade on top of a fade. */}
        <FadeUpReveal yOffset={0} className="who-cta__copy-reveal">
          <div className="who-cta__copy">
            <h2 className="section-h2 who-cta__h2">Who can use BalloAds?</h2>
            <div className="who-cta__lines">
              <p>Banks, clinics, schools, shops, nonprofits, government.</p>
              <p>One dashboard, whatever you are sending.</p>
            </div>
            <ScrambleButton
              text="Start your first campaign"
              onClick={openWaitlist}
            />
          </div>
        </FadeUpReveal>

        {/* Two rows, opposite directions. Slower than the reference's 30s:
            these tiles carry names meant to be read, and at 30s across a
            half-width column the labels went past faster than they could be.

            Each row also ARRIVES from the side it travels towards, so the
            entrance reads as the two bands settling into the motion they are
            already in. */}
        <FadeUpReveal yOffset={0} delay={0.1} className="who-cta__rows-reveal">
          <div className="who-cta__rows">
            <Marquee duration={48} reverse pauseOnHover>
              {ROW_ONE.map((item) => (
                <Tile key={item.id} item={item} />
              ))}
            </Marquee>
            <Marquee duration={48} pauseOnHover>
              {ROW_TWO.map((item) => (
                <Tile key={`${item.id}-b`} item={item} />
              ))}
            </Marquee>
          </div>
        </FadeUpReveal>
      </div>
    </section>
  );
}
