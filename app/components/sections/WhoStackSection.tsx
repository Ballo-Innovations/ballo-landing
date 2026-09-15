"use client";

import { ShinyButton } from "../ui/ShinyButton";
import { useAnimateWhenVisible } from "../ui/useAnimateWhenVisible";
import { StackSpread, type StackSpreadCard } from "../ui/stack-spread";
import { useWaitlist } from "../waitlist/WaitlistProvider";

/**
 * "Who can use BalloAds?", as a stack of industries that scatters on scroll.
 *
 * Replaces `WhoCinematicSection`, which answered the same question with two
 * marquee rows. The question is the point of the section and a marquee was a
 * poor way to put it: the answer arrived a tile at a time, at the speed the
 * track happened to be moving, and never in one view — so "who can use this"
 * was never actually on screen at once. Here the six industries end up spread
 * around the question, all of them readable together, and the reveal is the
 * reader's own scroll rather than a loop running whether anyone is there.
 *
 * It also takes the page's fourth infinite marquee off the home page.
 */

type Industry = {
  id: string;
  name: string;
  description: string;
  src: string;
};

/**
 * The same six industries and photographs the marquee carried, at a crop that
 * suits a portrait card rather than a square tile.
 */
const industries: Industry[] = [
  {
    id: "sme",
    name: "SMEs & Corporations",
    description:
      "Promote products, services, and offers to your ideal customers.",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=520&h=720&fit=crop&auto=format&q=70",
  },
  {
    id: "finance",
    name: "Financial Institutions",
    description:
      "Send loan approvals, transaction updates, and targeted offers.",
    src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=520&h=720&fit=crop&auto=format&q=70",
  },
  {
    id: "nonprofit",
    name: "Nonprofits & Government",
    description:
      "Spread awareness and reach communities with mass communication.",
    src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=520&h=720&fit=crop&auto=format&q=70",
  },
  {
    id: "retail",
    name: "Retail & E-commerce",
    description: "Drive sales, customer loyalty, and engagement at scale.",
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=520&h=720&fit=crop&auto=format&q=70",
  },
  {
    id: "health",
    name: "Healthcare & Clinics",
    description: "Send appointment reminders and targeted health campaigns.",
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=520&h=720&fit=crop&auto=format&q=70",
  },
  {
    id: "education",
    name: "Education Institutions",
    description: "Notify students, parents, and staff with timely updates.",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=520&h=720&fit=crop&auto=format&q=70",
  },
];

/**
 * Where each card starts (clustered, centre) and ends (spread).
 *
 * The reference scatters eight cards across the whole stage, including through
 * the middle, because its centre copy is two lines of text that the cards are
 * allowed to overlap. Ours ends on a button, so the six targets ring the stage
 * and leave the middle column clear at every breakpoint: on desktop the two
 * flanking columns sit outside the copy's measure, and `targetSm` drops the
 * cards into a band above and a band below it.
 *
 * Array order is stack order, back to front.
 */
const CARDS: StackSpreadCard[] = industries.map((item, i) => {
  const layout = [
    // top-left
    {
      stackOffset: { x: -10, y: -8 },
      stackRotate: -16,
      target: { x: -33, y: -27, rotate: -6, w: 17, h: 30 },
      targetSm: { x: -30, y: -34 },
    },
    // top-right
    {
      stackOffset: { x: 12, y: -9 },
      stackRotate: 18,
      target: { x: 33, y: -27, rotate: 6, w: 17, h: 30 },
      targetSm: { x: 0, y: -34 },
    },
    // mid-left
    {
      stackOffset: { x: -15, y: 1 },
      stackRotate: -5,
      target: { x: -41, y: 6, rotate: -3, w: 15, h: 28 },
      targetSm: { x: 30, y: -34 },
    },
    // mid-right
    {
      stackOffset: { x: 16, y: 2 },
      stackRotate: 7,
      target: { x: 41, y: 6, rotate: 3, w: 15, h: 28 },
      targetSm: { x: -30, y: 34 },
    },
    // bottom-left
    {
      stackOffset: { x: -7, y: 10 },
      stackRotate: 6,
      target: { x: -26, y: 33, rotate: 4, w: 18, h: 26 },
      targetSm: { x: 0, y: 34 },
    },
    // bottom-right
    {
      stackOffset: { x: 9, y: 11 },
      stackRotate: -8,
      target: { x: 26, y: 33, rotate: -4, w: 18, h: 26 },
      targetSm: { x: 30, y: 34 },
    },
  ][i];

  return {
    item: {
      src: item.src,
      label: item.name,
      // The photographs are decorative — the label is the content — so the alt
      // text is empty rather than a description of the stock image.
      alt: "",
      description: item.description,
    },
    ...layout,
    z: i + 2,
  };
});

export function WhoStackSection() {
  const { openWaitlist } = useWaitlist();
  const ctaRef = useAnimateWhenVisible<HTMLDivElement>();

  return (
    <StackSpread cards={CARDS} className="who-stack" scrollLength={280}>
      <h2 className="section-h2 who-stack__h2">Who can use BalloAds?</h2>
      <div className="who-stack__lines">
        <p>Banks, clinics, schools, shops, nonprofits, government.</p>
        <p>One dashboard, whatever you are sending.</p>
      </div>
      {/* The shiny button's rim and sheen are infinite animations, and
          StackSpread has no parking of its own (nothing inside it animated
          forever until this button arrived), so the wrapper carries the
          observer that pauses them once the section scrolls away. */}
      <div ref={ctaRef}>
        <ShinyButton onClick={openWaitlist}>
          Start your first campaign
        </ShinyButton>
      </div>
    </StackSpread>
  );
}
