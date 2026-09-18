"use client";

import * as React from "react";

import { useMotionValue, useMotionValueEvent } from "framer-motion";

import { useOptionalContainerScrollContext } from "./AnimatedVideoOnScroll";
import { GlassBandMarquee } from "./GlassBandMarquee";
import { BAND_EXIT, BAND_RISE } from "./HeroSideExit";
import { at } from "@/lib/cinematic";

/**
 * The hero's background band: "YOUR DIGITAL MARKETING ASSISTANT", scrolling,
 * set in glass — artwork rather than type (see `GlassBandMarquee`).
 *
 * It was a field of particles before that, and flat CSS type before that. The
 * particles answered the pointer, which is the one thing a picture cannot do;
 * the scatter went with them. What it buys is glass that actually looks like
 * glass, which three passes at building it in CSS did not.
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
 * How much of the band is still on the stage at this scroll position, 1 to 0.
 *
 * Scroll-linked rather than a class and a CSS transition, which is what this
 * was. A transition runs on wall-clock time: fast scrolling put the copy on
 * screen while the band was still halfway through a 520ms fade, and the exact
 * overlap depended on how hard the wheel was spun. Tied to progress, the band
 * is always gone at `BAND_EXIT`'s end and never later, at any scroll speed.
 *
 * Quantised before it reaches state: this runs on every scroll frame, and the
 * band has no business re-rendering 60 times a second to cross a tenth of a
 * step of opacity.
 */
function bandFade(p: number) {
  return Math.round((1 - at(p, BAND_EXIT)) * 20) / 20;
}

/**
 * How far the band has deepened, 0 to 1, across the phone's arrival.
 *
 * The band opens in the pale blues it has always had — it is behind a hero
 * that is still being read, and it has to stay behind it. By the time the
 * device has landed the hero has gone and the band is the thing on the stage,
 * so the fill travels to a deeper, more saturated set over exactly the stretch
 * the phone is arriving and the band is rising (`BAND_RISE` is tied to the end
 * of `PHONE_IN`). The two movements are one movement.
 *
 * Quantised for the same reason `bandFade` is: this runs on every scroll frame.
 */
function bandRich(p: number) {
  return Math.round(at(p, BAND_RISE) * 20) / 20;
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
  const [fade, setFade] = React.useState(1);
  const [rich, setRich] = React.useState(0);
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
    // Only the band's own track can take it off the stage. Without a pin
    // there are no scenes to make way for, and the line simply keeps running.
    if (!track) return;
    const nextFade = bandFade(p);
    setFade((prev) => (prev === nextFade ? prev : nextFade));
    const nextRich = bandRich(p);
    setRich((prev) => (prev === nextRich ? prev : nextRich));
  });

  return (
    <GlassBandMarquee
      className="hero-marquee-canvas"
      style={{ ["--band-fade" as string]: fade, ["--band-rich" as string]: rich }}
      text={TEXT}
      /* `marqueeFontPx` still speaks in font sizes, which is what every
         breakpoint in this file was tuned in; a cap is about 0.72 of one. */
      capHeightPx={Math.round(fontPx * 0.72)}
      speedPxPerSec={SPEED_PX_PER_SEC}
      gapPx={40}
    />
  );
}
