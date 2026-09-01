"use client";

import * as React from "react";
import {
  cubicBezier,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";

import { Phone3D } from "./Phone3D";
import { PhoneOnboardingScreen } from "./PhoneOnboardingScreen";
import {
  ContainerScroll,
  ContainerSticky,
  useContainerScrollContext,
} from "./AnimatedVideoOnScroll";

/**
 * The hero, zooming OUT on scroll and into the phone's Next button.
 *
 * This is the 21st.dev "animated video on scroll" transform run backwards.
 * That component opens up: a small rounded pill of video — clipped 45% in from
 * every edge, 1000px corners, scaled to 0.7 — expands to fill the screen at
 * inset 0 with 16px corners. Every range here is that one reversed, so the
 * hero starts full-bleed and closes down as you scroll past it.
 *
 * Where it closes is the one thing not taken from upstream. Rather than
 * shrinking to a pill of arbitrary size in the middle of the screen, the hero
 * lands on the Next button of the phone standing behind it — the button's real,
 * measured rect, not a guess at where it sits. The card and the button share a
 * colour and a shape, so the last of the close is a crossfade between two
 * identical pills and what emerges is the word "Next".
 *
 * The phone is in the pinned stage with the hero, not in the section below it,
 * which is what keeps this honest: both are children of the same sticky box, so
 * the landing rect cannot move out from under the animation mid-descent.
 */

/** Where the close finishes, as a fraction of the track. Upstream's 0.8. */
const CLOSE_AT = 0.8;

/** Track length. The pin holds for the extra scroll the close is scrubbed over. */
const TRACK_CLASS = "h-[250vh]";

/** Corner radius the hero starts at, in px. Upstream's open-state 16. */
const START_RADIUS = 16;

/**
 * The close, in fractions of its own [0, 1] — not of the whole track.
 *
 * The hero itself never fades. It stays fully opaque the whole way down and
 * simply gets smaller, so what the reader follows is one continuous object
 * shrinking rather than a section dissolving. FILL_IN only brings up a solid
 * BEHIND that content — the hero's own background is transparent (the page
 * gradient shows through it), and without something opaque backing the card
 * the phone would be visible straight through the shrinking hero.
 *
 * That leaves one unavoidable moment of fading, at the very end: CARD_OUT
 * hands the arrived pill over to the real Next button underneath it. Both are
 * the same colour and shape by then, so it reads as the card becoming the
 * button rather than as the hero going away. Kept as short as it can be.
 */
const FILL_IN: [number, number] = [0, 0.45];
const CARD_OUT: [number, number] = [0.92, 1];

/**
 * The phone's arrival: it rises from below the stage and fades in.
 *
 * Held back until the hero is halfway down. Before that the hero is still most
 * of the screen and there is nothing for the phone to do but sit behind it; the
 * device now enters at the point the shrinking card has made room for it, and
 * still settles with a clear margin before the card comes down on it.
 *
 * Stated as fractions of the close, not of the whole track.
 */
const PHONE_IN: [number, number] = [0.5, 0.78];

/** How far below its resting place the phone starts, as a fraction of the stage. */
const PHONE_RISE = 0.55;

/** Quad out — the phone decelerates into place rather than arriving at speed. */
const RISE_EASE = cubicBezier(0.16, 0.84, 0.44, 1);

/**
 * The window in which the hover tilt is suppressed, as fractions of the close.
 *
 * The phone leans to the pointer exactly as it does in "What We're About". It
 * gives that up only for the landing itself — a tilted phone means a rotated
 * button, and the card's clip-path is an axis-aligned rectangle that cannot
 * follow it. So the tilt runs while the phone rises and waits, drops out in
 * time to be flat when the card arrives, and comes back once the card is gone
 * and there is nothing left to line up with.
 */
const TILT_OFF_AT = 0.86;
const TILT_BACK_AT = 1;

/**
 * The background marquee's travel, as a percentage of the pinned stage.
 *
 * It starts low, roughly where it sat under the hero's CTAs, and rises to the
 * middle as the hero card closes. It grows on the way up rather than holding
 * still: against a hero that is shrinking, a band at constant size already
 * reads as gaining presence, and a little real growth makes that deliberate.
 */
const MARQUEE_TOP: [number, number] = [86, 50];
const MARQUEE_SCALE: [number, number] = [1, 1.3];

/**
 * The close happens in two phases, and this is where they meet.
 *
 * Up to here the hero shrinks in place, staying centred on the stage: it is a
 * zoom-out, and a zoom-out that drifts toward one corner of the screen reads as
 * the section sliding away rather than receding. Only afterwards — once the
 * phone has appeared and there is visibly something to land on — does the card
 * leave the middle and travel down to the button.
 *
 * Tied to PHONE_IN[0] rather than set independently: the travel beginning at
 * the moment the phone arrives is the point, not a coincidence.
 */
const TRAVEL_AT = PHONE_IN[0];

/** How much of the stage the card still fills when it stops shrinking in place. */
const MID_SIZE = 0.52;

/** Corner radius at that halfway shape, between the hero's 16 and the pill. */
const MID_RADIUS = 28;

/** The landing target: the Next button, in the sticky stage's coordinates. */
interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpRect = (a: TargetRect, b: TargetRect, t: number): TargetRect => ({
  top: lerp(a.top, b.top, t),
  left: lerp(a.left, b.left, t),
  width: lerp(a.width, b.width, t),
  height: lerp(a.height, b.height, t),
  radius: lerp(a.radius, b.radius, t),
});

/** Progress through a sub-range of the close, clamped at both ends. */
function phase(t: number, [from, to]: [number, number]) {
  if (to <= from) return t >= to ? 1 : 0;
  return clamp01((t - from) / (to - from));
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
 * The device the hero lands in, and the thing that publishes the target.
 *
 * The phone arrives — rises from below the stage and fades in — which puts it
 * in direct tension with the landing. The button's rect is measured per layout,
 * not per frame, so a phone that is still moving means the hero is closing onto
 * a rectangle the button has already left.
 *
 * Resolved by owning the movement rather than avoiding it. The rise is a single
 * translate on the Y axis whose current value this component writes to
 * `offsetYRef` every frame, and what it publishes to `targetRef` is the button's
 * SETTLED rect — its measured position with that offset taken back out. The
 * overlay adds the live offset again when it places the card, so the card tracks
 * the phone honestly on the way up and, because the rise is over long before the
 * close completes, lands on an offset of exactly zero.
 *
 * Nothing scales or rotates, though: those would change the button's size and
 * its corners, not just its position, and no single number could undo them. It
 * is why `Phone3D` is rendered non-interactive here.
 */
function HeroZoomPhone({
  targetRef,
  offsetYRef,
}: {
  targetRef: React.MutableRefObject<TargetRect | null>;
  offsetYRef: React.MutableRefObject<number>;
}) {
  const { scrollYProgress } = useContainerScrollContext();
  const nextRef = React.useRef<HTMLButtonElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [rise, setRise] = React.useState(0);
  const [tilting, setTilting] = React.useState(true);

  // Stated across the whole [0, 1] domain with the flats spelled out, rather
  // than as the two stops of the fade itself. A two-stop range that does not
  // span the source's domain does not hold its end value — it interpolates back
  // toward the first, so the phone would fade in and then fade out again by the
  // end of the track.
  const opacity = useTransform(
    scrollYProgress,
    [0, PHONE_IN[0] * CLOSE_AT, PHONE_IN[1] * CLOSE_AT, 1],
    [0, 0, 1, 1],
  );
  // In pixels rather than a percentage: the overlay has to add this exact
  // number back to a pixel rect, and a percentage would resolve against the
  // phone's own height instead of the stage's.
  const y = useTransform(
    scrollYProgress,
    [0, PHONE_IN[0] * CLOSE_AT, PHONE_IN[1] * CLOSE_AT, 1],
    [rise, rise, 0, 0],
    { ease: RISE_EASE },
  );
  // Seeded, not left at zero: the first measure() runs before any scroll event,
  // when the phone is still parked at the bottom of its travel.
  const liveY = useMotionValue(rise);
  useMotionValueEvent(y, "change", (v) => {
    liveY.set(v);
    offsetYRef.current = v;
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const t = p / CLOSE_AT;
    const next = t < TILT_OFF_AT || t >= TILT_BACK_AT;
    setTilting((prev) => (prev === next ? prev : next));
  });

  const measure = React.useCallback(() => {
    const btn = nextRef.current;
    const stage = rootRef.current?.closest(".hero-zoom-sticky") as HTMLElement | null;
    if (!btn || !stage) return;
    const b = btn.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    if (!b.width || !b.height) return;
    const style = window.getComputedStyle(btn);
    // Take the rise back out, so what is published is where the button will
    // come to rest — the only position the close can be aimed at.
    const settledTop = b.top - s.top - offsetYRef.current;
    // The button is a pill (`border-radius: 999px`), which computes to a value
    // far larger than the box. Cap it at half the height so the lerp lands on a
    // real radius rather than an arbitrary large number.
    const declared = parseFloat(style.borderTopLeftRadius) || 0;
    targetRef.current = {
      top: settledTop,
      left: b.left - s.left,
      width: b.width,
      height: b.height,
      radius: Math.min(declared, b.height / 2),
    };
  }, [targetRef, offsetYRef]);

  React.useEffect(() => {
    const stage = rootRef.current?.closest(".hero-zoom-sticky") as HTMLElement | null;
    const applyRise = () => {
      const h = stage?.clientHeight || window.innerHeight;
      const next = h * PHONE_RISE;
      setRise(next);
      // Only the parked value is seeded here; once scrolling starts the change
      // handler above owns both.
      if (scrollYProgress.get() <= PHONE_IN[0] * CLOSE_AT) {
        offsetYRef.current = next;
        liveY.set(next);
      }
    };
    applyRise();
    window.addEventListener("resize", applyRise);
    return () => window.removeEventListener("resize", applyRise);
  }, [offsetYRef, scrollYProgress, liveY]);

  React.useEffect(() => {
    measure();
    const stage = rootRef.current?.closest(".hero-zoom-sticky") as HTMLElement | null;
    const ro = new ResizeObserver(measure);
    if (nextRef.current) ro.observe(nextRef.current);
    if (stage) ro.observe(stage);
    // Fonts land after first paint and the button is sized by its text.
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, rise]);

  // The rect that matters is the flat one. Anything measured while the phone
  // was leaning was an axis-aligned bounding box, not the button — so take a
  // fresh reading once it has settled, before the card needs it. Two frames:
  // one for the flatten to write its final transform, one to read it back.
  React.useEffect(() => {
    if (tilting) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(measure);
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [tilting, measure]);

  return (
    <motion.div
      ref={rootRef}
      className="hero-zoom-phone"
      style={{ opacity, y: liveY }}
      aria-hidden="true"
    >
      <Phone3D interactive={tilting}>
        <PhoneOnboardingScreen nextRef={nextRef} />
      </Phone3D>
    </motion.div>
  );
}

/**
 * The scrolling band behind the hero.
 *
 * The whole point of this component is that it is NOT a child of the clip or
 * the scale — it is a sibling of them on the pinned stage. Inside the overlay
 * it shrank with the card and got cut off by the clip window; out here it holds
 * its own size, keeps its CSS animation running throughout (that animation is a
 * keyframe loop on the track, so nothing about the zoom-out touches it), and is
 * placed by scroll on its own terms.
 */
function HeroZoomMarquee({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useContainerScrollContext();
  // Percent, not pixels, so the band tracks the stage at any viewport height.
  const top = useTransform(scrollYProgress, [0, CLOSE_AT], MARQUEE_TOP);
  const topPercent = useTransform(top, (v) => `${v}%`);
  const scale = useTransform(scrollYProgress, [0, CLOSE_AT], MARQUEE_SCALE);

  return (
    <motion.div
      className="hero-zoom-marquee"
      style={{ top: topPercent, scale, x: "-50%", y: "-50%" }}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}

/**
 * The hero card, closing onto the button.
 *
 * Written imperatively rather than as framer ranges, because the target is
 * measured rather than declared: the four insets, the radius and the content
 * transform all depend on a rect that only exists once the phone has laid out.
 * A declarative range would have to be rebuilt every time that rect changed.
 *
 * Every write is guarded against the previous frame's value — this runs on the
 * scroll path, and the hero is the largest layer on the page.
 */
function HeroZoomOverlay({
  children,
  targetRef,
  offsetYRef,
}: {
  children: React.ReactNode;
  targetRef: React.MutableRefObject<TargetRect | null>;
  offsetYRef: React.MutableRefObject<number>;
}) {
  const { scrollYProgress } = useContainerScrollContext();
  const ref = React.useRef<HTMLDivElement>(null);
  const scaleRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<HTMLDivElement>(null);
  const last = React.useRef({ clip: "", transform: "", fill: -1, card: -1 });

  const place = React.useCallback(() => {
    const el = ref.current;
    const stage = el?.parentElement;
    const scaleEl = scaleRef.current;
    const fillEl = fillRef.current;
    if (!el || !stage || !scaleEl || !fillEl) return;

    // Native scrollY is the source of truth at the top of the page. Framer can
    // hold a stale progress after a reload or a programmatic jump, which would
    // leave the hero part-closed on a page that has not been scrolled.
    const progress = window.scrollY < 8 ? 0 : scrollYProgress.get();
    const t = clamp01(progress / CLOSE_AT);

    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;

    const full: TargetRect = {
      top: 0,
      left: 0,
      width: w,
      height: h,
      radius: START_RADIUS,
    };
    // The halfway shape: the hero at MID_SIZE, still dead centre. Both axes
    // scale by the same factor, so this phase is a true zoom-out — the content
    // shrinks to exactly the window it is seen through and nothing is cropped.
    const midW = w * MID_SIZE;
    const midH = h * MID_SIZE;
    const mid: TargetRect = {
      top: (h - midH) / 2,
      left: (w - midW) / 2,
      width: midW,
      height: midH,
      radius: MID_RADIUS,
    };

    // Until the phone has laid out there is nothing to travel to, so the card
    // holds at the centred shape rather than moving toward a guess.
    const target = targetRef.current;
    const cur =
      target && t > TRAVEL_AT
        ? lerpRect(
            mid,
            {
              ...target,
              // `target.top` is where the button comes to REST. Put the phone's
              // current rise back on it so the card aims at where the button is
              // right now — by the time the two meet the rise is zero and they
              // are the same number.
              top: target.top + offsetYRef.current,
            },
            clamp01((t - TRAVEL_AT) / (1 - TRAVEL_AT)),
          )
        : lerpRect(full, mid, clamp01(t / TRAVEL_AT));

    const right = w - (cur.left + cur.width);
    const bottom = h - (cur.top + cur.height);
    const clip = `inset(${cur.top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(
      1,
    )}px ${cur.left.toFixed(1)}px round ${cur.radius.toFixed(1)}px)`;

    // The content follows the same rect the window does — upstream scaled its
    // video by the same reversed factor. Clip alone would crop the middle out
    // of the hero and slice the headline at full size.
    const scale = cur.width / w;
    const dx = cur.left + cur.width / 2 - w / 2;
    const dy = cur.top + cur.height / 2 - h / 2;
    const transform =
      t <= 0
        ? ""
        : `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(4)})`;

    const fill = phase(t, FILL_IN);
    const card = 1 - phase(t, CARD_OUT);

    const prev = last.current;
    if (
      prev.clip === clip &&
      prev.transform === transform &&
      prev.fill === fill &&
      prev.card === card
    ) {
      return;
    }
    last.current = { clip, transform, fill, card };

    el.style.clipPath = clip;
    if (prev.card !== card) {
      el.style.opacity = String(card);
      // Once the card is on its way out it must not eat clicks meant for the
      // button underneath it.
      el.style.pointerEvents = card < 0.95 ? "none" : "auto";
    }
    if (prev.transform !== transform) scaleEl.style.transform = transform;
    if (prev.fill !== fill) fillEl.style.opacity = String(fill);
    el.style.willChange = t > 0 && card > 0.05 ? "clip-path, opacity" : "auto";
  }, [scrollYProgress, targetRef, offsetYRef]);

  useMotionValueEvent(scrollYProgress, "change", place);
  React.useEffect(place, [place]);

  return (
    <div ref={ref} className="hero-zoom-card">
      {/* Solid, in the button's own colour, so the closing card reads as a
          shape rather than as a window onto a shrinking hero. */}
      <div ref={fillRef} className="hero-zoom-fill" aria-hidden="true" />
      <div ref={scaleRef} className="hero-zoom-scale">
        {children}
      </div>
    </div>
  );
}

export function HeroZoomOut({
  children,
  backdrop,
}: {
  children: React.ReactNode;
  /** Full-size background band. Must not be a child of the scaled overlay. */
  backdrop?: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const targetRef = React.useRef<TargetRect | null>(null);
  /** The phone's current rise, shared so the card can aim at a moving button. */
  const offsetYRef = React.useRef(0);

  // No pin, no clip, no scroll-length track: the hero is just the hero.
  if (reduced) {
    return (
      <>
        {children}
        {backdrop ? (
          <div className="hero-zoom-marquee hero-zoom-marquee--static" aria-hidden="true">
            {backdrop}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <ContainerScroll className={TRACK_CLASS}>
      <ContainerSticky className="hero-zoom-sticky h-svh overflow-hidden">
        {backdrop ? <HeroZoomMarquee>{backdrop}</HeroZoomMarquee> : null}

        <HeroZoomPhone targetRef={targetRef} offsetYRef={offsetYRef} />

        <HeroZoomOverlay targetRef={targetRef} offsetYRef={offsetYRef}>
          {children}
        </HeroZoomOverlay>
      </ContainerSticky>
    </ContainerScroll>
  );
}
