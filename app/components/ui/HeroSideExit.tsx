"use client";

import * as React from "react";
import { motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";

import { Phone3D } from "./Phone3D";
import { PhoneOnboardingScreen } from "./PhoneOnboardingScreen";
import {
  ContainerScroll,
  ContainerSticky,
  useContainerScrollContext,
} from "./AnimatedVideoOnScroll";
import { at, clamp01, easeInOut, easeOut, lerp, staggered, type Range } from "@/lib/cinematic";

/**
 * The hero's handover to the phone.
 *
 * The hero pins, its own elements leave sideways, and the phone rises into the
 * space they vacate. Nothing shrinks and nothing is clipped, which is what
 * makes this simpler than the zoom-out it replaces: that version needed an
 * opaque card so the device could not be seen through the hero's transparent
 * background, and that card was in turn what kept covering the marquee band.
 * With the hero leaving rather than closing, none of it is needed.
 *
 * Which way an element goes is not declared in the markup. Each is measured
 * once and sent toward whichever edge of the stage it already sits nearer, so
 * the copy column travels left and the figure travels right without either of
 * them being told to.
 */

/**
 * The hero's elements leave over the first stretch of the track.
 *
 * Shortened to match what they actually do: with the per-element speeds below,
 * the last of them is clear well before the old 0.55, so the nominal range was
 * describing a departure that had already finished.
 */
const ITEMS_OUT: Range = [0, 0.38];

/**
 * Gap between one element's departure and the next.
 *
 * Deliberately tiny. Every step of stagger is dead scroll for the elements at
 * the end of the queue: at six elements even a small gap left the last of them
 * waiting through a third of the range before moving at all. The per-element
 * speeds below are what separate the departures now, and they do it while
 * everything is already in motion rather than by making some of it wait.
 */
const ITEM_STAGGER = 0.025;

/**
 * The phone rises from below.
 *
 * Overlapping the departures rather than waiting for them: it starts while the
 * last elements are still on their way out, so there is no stretch of empty
 * stage between the two. Starting it at 0.36 left a visible gap, because the
 * elements were gone by about a quarter of the way through.
 */
const PHONE_IN: Range = [0.14, 0.58];

/**
 * How far below its resting place the phone starts, as a fraction of the stage.
 *
 * A whole stage height, so the device begins genuinely off-stage. It used to
 * travel about half that and rely on its own fade to stay unseen at rest; with
 * the fade gone the top of the phone was left poking into the bottom of the
 * hero before any scrolling. One full height clears it for any device shorter
 * than the stage, without measuring the mockup.
 */
const PHONE_RISE = 1;

/**
 * The band travels to the middle of the stage over the whole handover.
 *
 * Tied to the end of the phone's arrival, so the line settles as the device
 * does. It read as a separate animation when it finished earlier than the rest.
 */
const BAND_RISE: Range = [0, PHONE_IN[1]];
const BAND_TOP: Range = [86, 50];
const BAND_SCALE: Range = [1, 1.3];

/** And clears only at the very end of the track, well after everything else. */
const BAND_OUT: Range = [0.9, 1];

/** Track length: one extra viewport of held scroll for the handover. */
const TRACK_CLASS = "h-[220vh]";

/**
 * The element's true on-screen extent, its transformed descendants included.
 *
 * `getBoundingClientRect` reports an element's own box; a child's transform
 * does not expand it. That matters here because `.hero-person-stage` holds four
 * stacked figures, each with its own `--person-scale` (up to 1.2) and
 * `--person-x` offset, so an image can reach well past the box that contains
 * it. Sending the stage exactly its own width off screen therefore left the
 * overhang of the wider cutouts still visible at the edge.
 *
 * Each descendant's rect already accounts for its own transforms, so unioning
 * them gives the extent that actually has to clear the stage. Measured once per
 * survey, not per frame.
 */
function visualRect(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  let left = r.left;
  let right = r.right;
  let top = r.top;
  let bottom = r.bottom;

  for (const child of el.querySelectorAll<HTMLElement>("*")) {
    const c = child.getBoundingClientRect();
    // Skip anything with no box: it contributes nothing and an empty rect at
    // the origin would drag the union to the top left of the document.
    if (!c.width && !c.height) continue;
    if (c.left < left) left = c.left;
    if (c.right > right) right = c.right;
    if (c.top < top) top = c.top;
    if (c.bottom > bottom) bottom = c.bottom;
  }

  return { left, right, top, bottom, width: right - left, height: bottom - top };
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);
  return reduced;
}

/**
 * The phone, rising in from below.
 *
 * Opacity and one translate on Y, nothing else. The zoom-out version had to
 * publish its screen rect for the hero to land on, and then compensate for its
 * own movement so the target did not slide out from under the animation. There
 * is no landing any more, so none of that machinery is here.
 */
function HeroPhone() {
  const { scrollYProgress } = useContainerScrollContext();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [rise, setRise] = React.useState(0);

  // Travel only, no opacity. The device arrives at full strength: a fade made
  // it materialise rather than move, and the movement is the point.
  //
  // Stated across the whole [0, 1] domain with the flats spelled out. A range
  // that does not span the source's domain will not hold its end value: it
  // interpolates back toward the first, and the phone would arrive and then
  // sink away again before the track ended.
  // Decelerating, not eased at both ends. The device has a whole stage height
  // to travel and `easeInOut` spent the opening of that almost stationary: it
  // had covered under a twentieth of the distance a fifth of the way through
  // its own range, so it seemed not to be coming at all. This one sets off at
  // once and settles into place.
  const y = useTransform(
    scrollYProgress,
    [0, PHONE_IN[0], PHONE_IN[1], 1],
    [rise, rise, 0, 0],
    { ease: easeOut },
  );
  const liveY = useMotionValue(rise);
  useMotionValueEvent(y, "change", (v) => liveY.set(v));

  React.useEffect(() => {
    const stage = rootRef.current?.closest(".ch-stage") as HTMLElement | null;
    const apply = () => {
      const next = (stage?.clientHeight || window.innerHeight) * PHONE_RISE;
      setRise(next);
      if (scrollYProgress.get() <= PHONE_IN[0]) liveY.set(next);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [scrollYProgress, liveY]);

  return (
    <motion.div
      ref={rootRef}
      className="hero-zoom-phone"
      style={{ y: liveY }}
      aria-hidden="true"
    >
      {/* Pointer tilt is back on. It was off for the zoom-out, which had to
          land on the phone's screen rect and could not follow a rotating
          target. Nothing measures the screen now, so the phone is free to
          lean toward the cursor as it does in "What We're About". */}
      <Phone3D>
        <PhoneOnboardingScreen />
      </Phone3D>
    </motion.div>
  );
}

/** One element's departure: which way, how far, how quickly, and from what. */
interface Departure {
  el: HTMLElement;
  dx: number;
  speed: number;
  /**
   * The transform the element already had, if any.
   *
   * Some of these carry one at rest: `.hero-rings` is centred and scaled by
   * `translate(-50%, -50%) scale(1.45)`. Writing the exit straight onto
   * `transform` would throw that away and the element would jump to its
   * untransformed position on the first frame of the scroll. The exit is
   * composed in front of it instead.
   */
  base: string;
}

/**
 * Range of exit speeds, as a multiplier on the element's own progress.
 *
 * Never below 1, so every element still clears the stage by the end of
 * ITEMS_OUT; the faster ones simply get there sooner. Which element gets which
 * speed is decided by its size: a small line of copy leaves briskly, the
 * figure drifts. Reading it off the measured box rather than the index means
 * the spread follows the composition instead of DOM order.
 */
const SPEED_FAST = 1.85;
const SPEED_SLOW = 1;

/**
 * `data-hero-exit="fast"` and `="slow"` override the size rule.
 *
 * Needed where the sizes do not separate things on their own: the rings and the
 * figure occupy near-identical boxes, so the rule gave them near-identical
 * speeds. They read as different depths, not different sizes, so the depth is
 * stated instead. Nearer travels faster.
 */
const SPEED_HINTS: Record<string, number> = {
  fast: SPEED_FAST,
  slow: SPEED_SLOW,
};

/**
 * The hero, leaving sideways.
 *
 * The hero is passed in as `children` and is otherwise untouched. Anything
 * meant to leave carries `data-hero-exit`; DOM order is order of departure.
 */
function HeroParts({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useContainerScrollContext();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const partsRef = React.useRef<Departure[]>([]);

  /**
   * Measure each element's resting position and work out its exit.
   *
   * Taken with every transform cleared first. Measuring an element that is
   * already part-way through its departure would fold the current offset into
   * the distance and each pass would send it further than the last.
   */
  const survey = React.useCallback(() => {
    const root = rootRef.current;
    const stage = root?.parentElement;
    if (!root || !stage) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-exit]"));
    // Cleared before measuring: an element already part-way through its
    // departure would fold the current offset into the distance, and every
    // pass would send it further than the last.
    for (const el of els) el.style.transform = "";

    const s = stage.getBoundingClientRect();
    const mid = s.left + s.width / 2;
    const boxes = els.map((el) => visualRect(el));
    const areas = boxes.map((r) => r.width * r.height);
    const min = Math.min(...areas);
    const max = Math.max(...areas);

    partsRef.current = els.map((el, i) => {
      const r = boxes[i];
      const centre = r.left + r.width / 2;
      // Toward the nearer edge, and far enough that the element's trailing
      // edge clears it, with a little margin for shadows and glows.
      const dx = centre < mid ? -(r.right - s.left) - 40 : s.right - r.left + 40;
      // Bigger elements leave more slowly, unless the markup says otherwise.
      // Normalised across the set actually on the stage, so it holds whatever
      // the hero contains.
      const bulk = max > min ? (areas[i] - min) / (max - min) : 0;
      const hint = SPEED_HINTS[el.dataset.heroExit ?? ""];
      const computed = window.getComputedStyle(el).transform;
      return {
        el,
        dx,
        speed: hint ?? lerp(SPEED_FAST, SPEED_SLOW, bulk),
        base: computed === "none" ? "" : ` ${computed}`,
      };
    });
  }, []);

  const place = React.useCallback(() => {
    // Native scrollY is the source of truth at the top of the page: framer can
    // hold a stale progress after a reload, which would leave the hero
    // part-gone on a page nobody has scrolled.
    const p = window.scrollY < 8 ? 0 : scrollYProgress.get();
    const groupT = at(p, ITEMS_OUT);
    const parts = partsRef.current;

    parts.forEach(({ el, dx, speed, base }, i) => {
      const own = staggered(groupT, i, parts.length, ITEM_STAGGER);
      // Decelerating, not eased at both ends. `easeInOut` spends its opening
      // stretch almost stationary — a tenth of the way in it has covered less
      // than a hundredth of the distance — which read as a delay before
      // anything happened. This leaves at once and settles as it goes.
      const t = easeOut(clamp01(own * speed));
      // Travel only. No blur and no fade: the elements simply move off the
      // stage at their own rate, and they are gone because they have left, not
      // because they dissolved on the way.
      //
      // The exit translate goes IN FRONT of whatever transform the element
      // already had, so it applies in the parent's frame and leaves the
      // element's own centring and scaling intact.
      el.style.transform =
        t > 0.0005 ? `translate3d(${(dx * t).toFixed(1)}px, 0, 0)${base}` : "";
      el.style.willChange = t > 0.0005 && t < 0.999 ? "transform" : "auto";
    });
  }, [scrollYProgress]);

  React.useEffect(() => {
    survey();
    place();
    const unsub = scrollYProgress.on("change", place);
    const onResize = () => {
      survey();
      place();
    };
    window.addEventListener("resize", onResize);
    return () => {
      unsub();
      window.removeEventListener("resize", onResize);
    };
  }, [scrollYProgress, survey, place]);

  return (
    <div ref={rootRef} className="hero-parts">
      {children}
    </div>
  );
}

/**
 * The scrolling band behind the hero.
 *
 * A sibling of the hero and the phone on the pin. Nothing above it is opaque
 * any more, so it is simply visible for the whole handover: it starts low,
 * travels to the middle as the hero leaves and the phone arrives, and clears
 * only at the very end of the track.
 */
function HeroBand({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useContainerScrollContext();
  const ref = React.useRef<HTMLDivElement>(null);

  const place = React.useCallback(() => {
    const el = ref.current;
    const stage = el?.parentElement;
    if (!el || !stage) return;
    const p = scrollYProgress.get();
    const m = easeInOut(at(p, BAND_RISE));
    // Folded into the transform rather than written to `top`: `top` is a
    // layout property, and writing it per frame relaid out a band as wide as
    // the viewport on every one of them.
    const y = (stage.clientHeight * lerp(BAND_TOP[0], BAND_TOP[1], m)) / 100;
    el.style.transform =
      `translate(-50%, calc(${y.toFixed(1)}px - 50%)) scale(${lerp(BAND_SCALE[0], BAND_SCALE[1], m).toFixed(3)})`;
    el.style.opacity = String(clamp01(1 - at(p, BAND_OUT)));
  }, [scrollYProgress]);

  React.useEffect(() => {
    const unsub = scrollYProgress.on("change", place);
    place();
    window.addEventListener("resize", place);
    return () => {
      unsub();
      window.removeEventListener("resize", place);
    };
  }, [scrollYProgress, place]);

  return (
    <div ref={ref} className="ch-marquee" aria-hidden="true">
      {children}
    </div>
  );
}

export function HeroSideExit({
  children,
  backdrop,
}: {
  children: React.ReactNode;
  /** Background band on the pin, behind everything. */
  backdrop?: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  // No pin and no handover: the hero is just the hero, and the band follows it
  // in normal flow.
  if (reduced) {
    return (
      <div className="cinematic-hero">
        <div className="ch-stage ch-stage--static">
          {children}
          {backdrop}
        </div>
      </div>
    );
  }

  return (
    <ContainerScroll className={`cinematic-hero ${TRACK_CLASS}`}>
      <ContainerSticky className="ch-stage h-svh w-full">
        {backdrop ? <HeroBand>{backdrop}</HeroBand> : null}
        <HeroPhone />
        <HeroParts>{children}</HeroParts>
      </ContainerSticky>
    </ContainerScroll>
  );
}
