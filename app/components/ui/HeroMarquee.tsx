"use client";

import * as React from "react";

import { useMotionValue, useMotionValueEvent } from "framer-motion";

import { useOptionalContainerScrollContext } from "./AnimatedVideoOnScroll";
import { CursorDrivenParticleTypography } from "./cursor-driven-particles-typography";
import { BAND_WORDMARK } from "./HeroSideExit";
import { cn } from "@/lib/utils";

/**
 * The hero's background band: "YOUR DIGITAL MARKETING ASSISTANT", scrolling,
 * made of particles that scatter away from the pointer and settle back.
 *
 * It belongs to the hero and only to the hero. Once "What We're About"
 * arrives it fades out and does not come back for the rest of the pin: that
 * scene and "Why Choose BalloAds?" are a device beside a column of copy, and
 * anything in the background there is a third thing competing with them.
 *
 * It used to settle into "BalloAds" and then into one word per feature card,
 * which was an attempt at the same problem from the other side — say what the
 * scene says rather than talk over it. Quieter than a travelling line, but
 * still a word the size of the stage behind a scene that did not need one.
 *
 * The size has to be computed rather than left to CSS. The particle field is
 * sampled from text rendered into a canvas, so the face size is a number the
 * canvas needs up front — a `clamp()` in a stylesheet would never reach it.
 * These match the sizes the CSS type used at the same breakpoints.
 */

const TEXT = "YOUR DIGITAL MARKETING ASSISTANT";

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
 * The lattice lives and dies with the pin: it is not carried past the hero.
 */

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
 * Whether the band is off the stage at this scroll position.
 *
 * It holds a word through "What We're About" and "Why Choose BalloAds" no
 * longer: it leaves. Those two scenes are a device and a column of copy, and
 * a word behind them — at any size, in beads or in dust — was a third thing
 * competing for the same attention.
 *
 * It fades rather than unmounts. Unmounting would tear down the field and
 * re-sample thousands of particles the moment it came back, and the fade also
 * has to be reversible: scrolling back up returns the band to a hero that is
 * still on screen.
 *
 * The travelling line does NOT resume underneath. That was the arrangement
 * before the wordmark existed and it is what the wordmark was introduced to
 * fix — moving type behind the copy is the loudest version of this problem,
 * not the quietest. `wordAt` is gone with it; the band never holds a word now.
 */
function bandHidden(p: number) {
  return p >= BAND_WORDMARK[0];
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
  // Undefined on the reduced-motion path, where the band renders in plain flow
  // with no scroll track above it. No track, no zoom-out, no scatter.
  const track = useOptionalContainerScrollContext();
  const [hover, setHover] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  // `useMotionValueEvent` needs a MotionValue on every render, track or not.
  const idle = useMotionValue(0);

  React.useEffect(() => {
    const apply = () => {
      setFontPx(marqueeFontPx(window.innerWidth, window.innerHeight));
    };
    apply();
    // Settled rather than live, and not for tidiness: `fontPx` is a dependency
    // of the particle field's effect, so every distinct value a drag passes
    // through tears the field down and re-samples up to 14,000 particles.
    // `w * 0.13` rounds to a new number every eight pixels of width, which is
    // a full rebuild several times a second for as long as the drag lasts.
    // One rebuild once the window has stopped moving is the same result.
    //
    // Mobile needs it too: the URL bar collapsing on scroll fires `resize`,
    // and `marqueeFontPx` reads `innerHeight`.
    let settle: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (settle !== null) clearTimeout(settle);
      settle = setTimeout(apply, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      if (settle !== null) clearTimeout(settle);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useMotionValueEvent(track?.scrollYProgress ?? idle, "change", (p) => {
    const armed = p > HOVER_FROM;
    setHover((prev) => (prev === armed ? prev : armed));
    // Only the band's own track can take it off the stage. Without a pin
    // there are no scenes to make way for, and the line simply keeps running.
    if (!track) return;
    const out = bandHidden(p);
    setHidden((prev) => (prev === out ? prev : out));
  });

  return (
    <CursorDrivenParticleTypography
      className={cn("hero-marquee-canvas", hidden && "hero-marquee-canvas--out")}
      text={TEXT}
      fontSize={fontPx}
      fontFamily='var(--font-ubuntu), Ubuntu, ui-sans-serif, sans-serif'
      // The old band was `text-white/5`. Particles read lighter than solid
      // glyphs at the same alpha — there is space between them — so this is
      // lifted a little to land at the same weight on the page.
      color="rgba(255, 255, 255, 0.1)"
      /* The step and the size the beads want. Coarser than the flat dust
         started at (4 and 2): packed that tightly the dots read as a smooth
         wash rather than as dust, and a bead carries a glow on top of that —
         what makes beads read as glass is the dark between them. Coarser
         still overlapped less but cost the beads their footing on the
         lattice, so the glow was narrowed instead (see `buildBead`). */
      particleDensity={8}
      particleSize={2.4}
      dotShape="glass"
      // Scatter stays armed for the whole time the band is on the stage.
      interactive={hover && !hidden}
      dispersionStrength={18}
      returnSpeed={0.08}
      marquee
      marqueeSpeedPxPerSec={SPEED_PX_PER_SEC}
      marqueeGapPx={40}
      // The band is pointer-events:none so it can never eat a click on the
      // hero, which means the canvas itself never sees a mousemove.
      trackPointer="window"
    />
  );
}
