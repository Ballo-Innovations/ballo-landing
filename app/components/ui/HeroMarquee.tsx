"use client";

import * as React from "react";

import { useMotionValue, useMotionValueEvent } from "framer-motion";

import { useOptionalContainerScrollContext } from "./AnimatedVideoOnScroll";
import { CursorDrivenParticleTypography } from "./cursor-driven-particles-typography";
import { BAND_WORDMARK, PHONE_CONTENT, TEXT_SWAP } from "./HeroSideExit";
import { useDustMirror } from "./DustMirror";
import { buildTimeline, features } from "@/app/components/sections/WhyScrollSection";
import { at } from "@/lib/cinematic";

/**
 * The hero's background band: "YOUR DIGITAL MARKETING ASSISTANT", scrolling,
 * made of particles that scatter away from the pointer and settle back.
 *
 * Through "What We're About" it comes to rest as "BalloAds" rather than
 * running the tagline past it: the copy beside the device is what should be
 * read there, and a second line of moving type behind it was competing for
 * the same attention.
 *
 * Once the pin reaches "Why Choose BalloAds?" the line stops travelling and
 * the same dust re-forms into one word per feature card — AI, SCALE, INSIGHT
 * — so the background is saying what the card in front of it says instead of
 * repeating the tagline behind it. The words come from the cards themselves
 * (`features[].word`); the morph is `morphTo` on the particle field.
 *
 * The size has to be computed rather than left to CSS. The particle field is
 * sampled from text rendered into a canvas, so the face size is a number the
 * canvas needs up front — a `clamp()` in a stylesheet would never reach it.
 * These match the sizes the CSS type used at the same breakpoints.
 */

const TEXT = "YOUR DIGITAL MARKETING ASSISTANT";

/** What the dust settles into through "What We're About". */
const WORDMARK = "BalloAds";

/**
 * The lattice of boxes the band becomes once the last feature card has had its
 * moment, and how far through the card sequence that happens.
 *
 * `#` marks a pattern rather than a literal word (see `morphTo` on
 * `CursorDrivenParticleTypography`). The last card comes to rest at 0.84 of
 * the sequence and holds until the pin releases; 0.93 is inside that hold —
 * late enough that the card has been read, early enough that the lattice has
 * formed before the section starts leaving the screen.
 *
 * `PageDots` fades in on the same threshold and carries the same lattice down
 * the rest of the page, so what the pin builds here does not leave with it.
 */
const GRID = "#grid";
export const GRID_FROM = 0.93;

/**
 * Travel speed, in px per second.
 *
 * The old CSS marquee was 24s for half a six-copy track, i.e. one copy every
 * 8s — which at the 200px face this now uses works out around 445px/s, fast
 * enough to read as motion rather than as atmosphere. This is a background
 * band behind a hero; it should drift.
 */
const SPEED_PX_PER_SEC = 140;

/**
 * The scatter stays off until the page has actually been scrolled.
 *
 * At rest the band is background: the hero owns the screen, and letters
 * blowing apart under a cursor that is on its way to the Sign Up button is a
 * distraction from the thing being clicked. Once the zoom-out is under way the
 * band is rising into the middle of the stage on its own terms, and answering
 * the pointer is then the point.
 *
 * Not exactly zero — `scrollYProgress` can sit a hair above it at the top of
 * the document, and this must not arm on a page nobody has touched.
 */
const HOVER_FROM = 0.004;

/**
 * The card sequence's own timeline, in the same units `WhyCardSequence` uses.
 * The band changes word at each swap's midpoint: the cards snap, so the scroll
 * cannot rest mid-swap, and the midpoint is where the incoming card has taken
 * the screen.
 */
const { swaps: CARD_SWAPS, total: CARD_TOTAL } = buildTimeline(features.length);

/**
 * Which word the band is holding at this scroll position, or null while it is
 * still the travelling line.
 *
 * It starts at the end of the copy swap, not at the first card: "Why Choose"
 * 's heading is in by then and the phone is already showing card 01, so the
 * band arriving late would be the only thing still talking about the hero.
 */
function wordAt(p: number) {
  // Act two: the dust settles into the wordmark while "What We're About" is
  // being read beside the phone.
  if (p >= BAND_WORDMARK[0] && p < BAND_WORDMARK[1]) return WORDMARK;
  if (p < TEXT_SWAP[1]) return null;
  const t = at(p, PHONE_CONTENT);
  // Past the last card the band stops saying anything and becomes the
  // background it was always closest to being: the same dust, in a lattice.
  if (t >= GRID_FROM) return GRID;
  let i = 0;
  for (const swap of CARD_SWAPS) {
    if (t >= (swap.start + swap.end) / 2 / CARD_TOTAL) i++;
  }
  return features[Math.min(i, features.length - 1)].word;
}

/**
 * How far left of centre a held word sits, as a fraction of the band's width.
 *
 * Only where the layout is side by side. Above 900px the phone stands left of
 * centre and the copy column owns the right, so a word centred on the band ran
 * under copy nobody could read it through; pulled left, it spans the open
 * margin, the device, and the gap between them, with almost nothing left under
 * the text. Below that breakpoint the copy sits *under* the phone rather than
 * beside it, the middle of the band is clear, and centred is correct.
 */
function marqueeWordShift(w: number) {
  return w > 900 ? -0.14 : 0;
}

function marqueeFontPx(w: number, h: number) {
  // Rounded, and not only for tidiness: the canvas verifies its own font
  // string by looking for `<size>px` in the normalised value the browser
  // hands back, and a fractional size does not survive that round trip.
  if (w <= 900) return Math.round(Math.min(152, Math.max(96, w * 0.24)));
  // Short desktop windows got a smaller face so the band did not swallow the
  // hero; same rule here.
  if (h < 860) return 124;
  return Math.round(Math.min(200, Math.max(120, w * 0.13)));
}

export function HeroMarquee() {
  const [fontPx, setFontPx] = React.useState(200);
  const [wordShift, setWordShift] = React.useState(0);
  // Undefined on the reduced-motion path, where the band renders in plain flow
  // with no scroll track above it. No track, no zoom-out, no scatter.
  const track = useOptionalContainerScrollContext();
  const [hover, setHover] = React.useState(false);
  const [word, setWord] = React.useState<string | null>(null);
  // The phone's screen, if this band is on a pin that has one. The field draws
  // the held word into it as well, in register — the device is standing in
  // front of the band, and what it covers is what it shows.
  const mirror = useDustMirror();
  // `useMotionValueEvent` needs a MotionValue on every render, track or not.
  const idle = useMotionValue(0);

  React.useEffect(() => {
    const apply = () => {
      setFontPx(marqueeFontPx(window.innerWidth, window.innerHeight));
      setWordShift(marqueeWordShift(window.innerWidth));
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useMotionValueEvent(track?.scrollYProgress ?? idle, "change", (p) => {
    const next = p > HOVER_FROM;
    setHover((prev) => (prev === next ? prev : next));
    // Only the band's own track drives the words. Without a pin there is no
    // card sequence to echo, and the line simply keeps running.
    if (!track) return;
    const nextWord = wordAt(p);
    setWord((prev) => (prev === nextWord ? prev : nextWord));
  });

  return (
    <CursorDrivenParticleTypography
      className="hero-marquee-canvas"
      text={TEXT}
      fontSize={fontPx}
      fontFamily='var(--font-ubuntu), Ubuntu, ui-sans-serif, sans-serif'
      // The old band was `text-white/5`. Particles read lighter than solid
      // glyphs at the same alpha — there is space between them — so this is
      // lifted a little to land at the same weight on the page.
      color="rgba(255, 255, 255, 0.1)"
      /* Coarser and chunkier than it was (4 and 2). The dots were packed
         tightly enough to read as a smooth wash rather than as dust; at this
         step they are visibly separate, and squares at whole-pixel positions
         make the held word read as pixel type. It is also cheaper — the field
         samples roughly a third of the points it used to. */
      particleDensity={7}
      particleSize={3}
      dotShape="square"
      dispersionStrength={18}
      returnSpeed={0.08}
      marquee
      marqueeSpeedPxPerSec={SPEED_PX_PER_SEC}
      marqueeGapPx={40}
      // The band is pointer-events:none so it can never eat a click on the
      // hero, which means the canvas itself never sees a mousemove.
      trackPointer="window"
      // Off again once the band is holding a word. Up to that point the line
      // is atmosphere and answering the pointer is the point of it; from
      // "Why Choose" on it is a statement standing behind the copy, and dust
      // that scatters under a passing cursor turns reading the section into
      // an interruption. It also means the word the phone is showing cannot
      // be knocked out of register by the pointer.
      // Off while the band is holding a word. Dust that scatters under a
      // passing cursor turns reading the copy beside it into an interruption,
      // and it would knock the held word out of register with the part of it
      // the phone is mirroring.
      interactive={hover && word === null}
      morphTo={word}
      mirror={mirror}
      morphOffsetX={wordShift}
    />
  );
}
