"use client";

import * as React from "react";

import { useMotionValue, useMotionValueEvent } from "framer-motion";

import { useOptionalContainerScrollContext } from "./AnimatedVideoOnScroll";
import { CursorDrivenParticleTypography } from "./cursor-driven-particles-typography";

/**
 * The hero's background band: "YOUR DIGITAL MARKETING ASSISTANT", scrolling,
 * made of particles that scatter away from the pointer and settle back.
 *
 * The size has to be computed rather than left to CSS. The particle field is
 * sampled from text rendered into a canvas, so the face size is a number the
 * canvas needs up front — a `clamp()` in a stylesheet would never reach it.
 * These match the sizes the CSS type used at the same breakpoints.
 */

const TEXT = "YOUR DIGITAL MARKETING ASSISTANT";

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
  // Undefined on the reduced-motion path, where the band renders in plain flow
  // with no scroll track above it. No track, no zoom-out, no scatter.
  const track = useOptionalContainerScrollContext();
  const [hover, setHover] = React.useState(false);
  // `useMotionValueEvent` needs a MotionValue on every render, track or not.
  const idle = useMotionValue(0);

  React.useEffect(() => {
    const apply = () => setFontPx(marqueeFontPx(window.innerWidth, window.innerHeight));
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useMotionValueEvent(track?.scrollYProgress ?? idle, "change", (p) => {
    const next = p > HOVER_FROM;
    setHover((prev) => (prev === next ? prev : next));
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
      particleDensity={4}
      particleSize={2}
      dispersionStrength={18}
      returnSpeed={0.08}
      marquee
      marqueeSpeedPxPerSec={SPEED_PX_PER_SEC}
      marqueeGapPx={40}
      // The band is pointer-events:none so it can never eat a click on the
      // hero, which means the canvas itself never sees a mousemove.
      trackPointer="window"
      interactive={hover}
    />
  );
}
