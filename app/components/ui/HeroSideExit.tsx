"use client";

import * as React from "react";
import { motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";

import { Phone3D } from "./Phone3D";
import { StoreBadge } from "./StoreBadge";
import { PhoneOnboardingScreen } from "./PhoneOnboardingScreen";
import {
  ContainerScroll,
  ContainerSticky,
  useContainerScrollContext,
} from "./AnimatedVideoOnScroll";
import { at, clamp01, easeInOut, easeOut, lerp, staggered, type Range } from "@/lib/cinematic";
import { LATCH_FLIP, useLatchedBeat } from "./useLatchedBeat";
import { DustMirrorProvider } from "./DustMirror";

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
 * The handover, then the five-card sequence, on one track.
 *
 * This pin owns the whole "Why Choose" scene now — heading, phone and all five
 * feature cards — rather than previewing two of them and handing the rest to a
 * section below. Four swaps need the bulk of the scroll, so the handover (the
 * hero leaving, the phone arriving, the copy swapping) is compressed into the
 * opening `HANDOVER_END` of the track and the cards get the rest.
 *
 * Every range below is still written in the numbers it was tuned in — where the
 * handover ran from 0 to `HANDOVER_TUNED_END` — and `hand()` maps them onto
 * their share of the real track. Restating them against the track directly
 * would mean renumbering all six of them every time this split moves, and each
 * one is tuned against the others rather than against the track.
 *
 * The physical scroll the handover gets is unchanged by the split, and stayed
 * unchanged when the card sequence was shortened: it is HANDOVER_END of
 * TRACK_CLASS, which is 432vh at both 0.48/900vh and 0.72/600vh.
 */
const HANDOVER_END = 0.72;
const HANDOVER_TUNED_END = 0.9;
const hand = ([from, to]: Range): Range => [
  (from / HANDOVER_TUNED_END) * HANDOVER_END,
  (to / HANDOVER_TUNED_END) * HANDOVER_END,
];

/**
 * The hero's elements leave over the first stretch of the track.
 *
 * Shortened to match what they actually do: with the per-element speeds below,
 * the last of them is clear well before the old 0.55, so the nominal range was
 * describing a departure that had already finished.
 */
const ITEMS_OUT: Range = hand([0, 0.38]);

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
const PHONE_IN: Range = hand([0.14, 0.58]);

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
export const BAND_RISE: Range = [0, PHONE_IN[1]];
const BAND_TOP: Range = [86, 50];
const BAND_SCALE: Range = [1, 1.3];

/* ── Act two ──────────────────────────────────────────────────────────────
   Once the device has fully arrived it steps aside and the "What We're
   About" copy comes in beside it. Both live on this pin rather than in the
   section below, which is what lets the copy be placed against the phone
   instead of waiting for a separate section to scroll up under it. */

/**
 * The phone drifts out of the middle to make room, and it goes first.
 *
 * Opened earlier than it was (0.6) to buy the band somewhere to leave. The
 * order of this beat is the device moving, then the tagline going, then the
 * copy arriving — three things one after another rather than two of them
 * happening over each other. Nothing else in the beat had room to give: the
 * copy has to be settled before `TEXT_SWAP`, so the space came from starting
 * the move sooner.
 */
const PHONE_ASIDE: Range = hand([0.54, 0.66]);
/** As a percentage of the stage, so it holds at any viewport width. */
const PHONE_ASIDE_X = -26;
const PHONE_ASIDE_SCALE = 0.86;

/**
 * The copy arrives from the right, into the half the phone just left.
 *
 * Settles well before `TEXT_SWAP` starts, so there is a stretch where "What
 * We're About" is simply sitting there readable rather than arriving and
 * leaving in one movement. The end is what that depends on, so the end is what
 * held still when the start moved out to 0.64 to let `BAND_EXIT` finish first.
 */
const ASIDE_IN: Range = hand([0.64, 0.72]);

/**
 * The band leaves: after the phone has started moving, before the copy lands.
 *
 * It used to fade across `BAND_WORDMARK`, which opens at 0.62 — the same
 * instant `ASIDE_IN` did. The two therefore overlapped: "YOUR DIGITAL
 * MARKETING ASSISTANT" was still legible across the stage while "What We're
 * About" was reading beside the phone, which is the one thing the band leaving
 * was meant to prevent.
 *
 * It then went out ahead of the phone instead, which traded one wrong order
 * for another — the tagline vanishing off a stage nothing had begun to leave.
 * Sitting inside `PHONE_ASIDE` (0.54–0.66) and ending before `ASIDE_IN`
 * (0.64), it now reads as the consequence of the device moving rather than as
 * its own event.
 *
 * Not to be confused with `BAND_OUT` below, which dims the band to `BAND_DIM`
 * late in the pin. That now runs against a band that left long before, and is
 * left in place only because it is part of this file's timeline rather than
 * the band's own.
 */
export const BAND_EXIT: Range = hand([0.57, 0.63]);

/**
 * Act three: "What We're About" hands off to "Why Choose BalloAds" in place,
 * rather than the phone leaving and a second phone arriving beside a second
 * block of copy. The phone that is already on screen stays exactly where it
 * is and its own screen changes what it's showing; the copy column crossfades
 * the same way. Two beats, and the copy leads:
 *
 *   1. "What We're About" 's copy crossfades to "Why Choose" 's heading, in
 *      the same spot
 *   2. only then does the phone's screen crossfade from the onboarding mock to
 *      the feature cards, and go on to run all five of them
 */
/** The copy goes first, and finishes before the phone's screen starts. */
export const TEXT_SWAP: Range = hand([0.76, 0.86]);

/**
 * Where the store badges animate in: once the phone has finished stepping aside.
 *
 * Not before: the device moving left and two pills arriving from the same side
 * at the same time is two pieces of motion crossing each other. Past this
 * point the phone is parked and the badges land on something standing still.
 *
 * A trigger, not a range. The badges used to be scrubbed across the scroll
 * between here and `TEXT_SWAP`, which left them wherever the reader stopped,
 * half on and half off the window. Now scroll only decides whether they are
 * shown; the animation itself runs on its own clock (a CSS transition — see
 * `.hero-store-badges` in cinematic-hero.css).
 */
const BADGES_SHOW_AT = PHONE_ASIDE[1];
/*
 * There is no matching point where they animate out. They used to leave at
 * `TEXT_SWAP`, then after the fifth feature card; both read as the page losing
 * its call to action. They now stay on the phone through the last card and
 * scroll away with it when the pin releases. The only way they animate out is
 * scrolling back up past `BADGES_SHOW_AT`.
 */

/**
 * While the band holds the wordmark instead of the travelling line.
 *
 * Act two is the one beat where the band had nothing to say: the hero has
 * gone, "What We're About" is being read beside the device, and the tagline
 * kept scrolling past behind it — a second line of moving type competing with
 * the copy for the same attention. So the dust comes to rest as "BalloAds"
 * for the length of that beat. It opens as the copy arrives and closes exactly
 * where `TEXT_SWAP` does, which is where the per-card words take over.
 */
export const BAND_WORDMARK: Range = hand([0.62, 0.86]);
/*
 * The copy swap used to slide too: the outgoing block left 64px to the left
 * and the incoming one arrived from 64px to the right, which is what
 * `TEXT_SWAP_DISTANCE` was. Both are gone. The headings turn over character by
 * character now (`data-flip`), and a block travelling sideways underneath
 * letters that are hinging in place is two transitions playing over each
 * other — the same reason `ASIDE_IN` no longer slides the column in.
 * What is left on these two layers is the crossfade, which is what keeps one
 * from being legible through the other.
 */
/**
 * The whole rest of the track: the five-card sequence (see `WhyCardSequence`)
 * runs here, four swaps and their dwells, holding on the last card until the
 * pin releases. Exported so the sequence can remap the same scroll progress
 * into its own [0, 1].
 */
export const PHONE_CONTENT: Range = [HANDOVER_END, 1];
/**
 * Just the crossfade — the onboarding mock fading out under the cards.
 *
 * Placed against the point the COPY turns over rather than written as its own
 * pair of numbers, because that is the thing it has to follow and the two are
 * easy to mis-set by eye. Both this and `TEXT_SWAP` are latched beats (see
 * `useLatchedBeat`), and a latched beat turns over at `LATCH_FLIP` of its
 * range, not at its end — so two ranges that look adjacent can turn over a
 * long way apart. They did: at hand([0.86, 0.9]) the copy turned over at 0.652
 * of the track and the screen not until 0.706, and for a quarter of a viewport
 * of scrolling "Why Choose BalloAds?" was being read beside a phone still
 * showing the onboarding mock from "What We're About". Moving the range by eye
 * closed most of that gap and left 65px of it.
 *
 * Ending before `PHONE_CONTENT` opens still holds: the phone is never fading
 * in while its first card is already dwelling. The cards clamp to the first of
 * them below that range, so what this fades up to is the card the sequence is
 * about to start on.
 */
/** How long the crossfade's window is, in track progress. */
const PHONE_SCREEN_SPAN = 0.048;
/**
 * How far after the copy turns over the phone's screen does, in track progress.
 *
 * Zero: they turn over on the same frame. This beat was designed with the copy
 * leading, and it still reads that way — the copy's swap is 0.9s against
 * the screen's 0.32s, so the heading is still changing after the screen has
 * settled — but the LEAD is now in how long each takes rather than in where
 * each is triggered. Any positive value here is a window, however short, in
 * which "Why Choose BalloAds?" is being read beside the onboarding mock, which
 * is the thing this was tuned to get rid of. At 0.005 that window was 20px of
 * scroll, and a reader stopped inside it still saw the stale screen.
 */
const PHONE_SCREEN_LEAD = 0;
const COPY_FLIP = lerp(TEXT_SWAP[0], TEXT_SWAP[1], LATCH_FLIP);
const PHONE_SCREEN_CROSSFADE: Range = [
  COPY_FLIP + PHONE_SCREEN_LEAD - LATCH_FLIP * PHONE_SCREEN_SPAN,
  COPY_FLIP + PHONE_SCREEN_LEAD + (1 - LATCH_FLIP) * PHONE_SCREEN_SPAN,
];

/**
 * The band dissolves once the phone has finished moving aside, not while it
 * is still travelling.
 *
 * It used to be tied to ASIDE_IN, which overlapped `PHONE_ASIDE` almost
 * exactly — and because the band is what lights the middle of the stage, the
 * phone lost its backlight in the middle of its own move and read as fading
 * out, even though its opacity never left 1. Starting the dissolve at the end
 * of the move keeps the device lit the whole way across; it still clears
 * before "Why Choose" arrives, which is what it was tied to ASIDE_IN for.
 */
/*
 * Moved to after the wordmark, not through the middle of it. At
 * hand([0.7, 0.78]) this dimming landed inside `BAND_WORDMARK` — so the dust
 * settled into "BalloAds" and was faded to half strength in the same breath.
 * It now starts where the wordmark hands over to the per-card words, which is
 * the copy this dimming was tuned for.
 */
const BAND_OUT: Range = hand([0.86, 0.9]);
/**
 * What the band dims *to*, rather than out to. It is the one element that runs
 * the whole length of the pin, and it is the only thing keeping the middle of
 * the stage from reading as empty once the phone has stepped aside — so it
 * stays there, quietly, behind "What We're About" and "Why Choose" both.
 *
 * Low enough that the copy in front of it is the thing being read: this is
 * texture at this point in the pin, not type.
 */
const BAND_REST_OPACITY = 0.5;

/**
 * Track length: the handover, then act two, then the in-place handoff to
 * "Why Choose". `PHONE_CONTENT` needs room to fit an actual card swap (see
 * `WhyPreviewCards`), not just a crossfade.
 *
 * Shortened from 900vh, and the shortening is all in the card sequence. At
 * 900vh the cards had 468vh between five of them — roughly a full viewport of
 * scrolling to advance one card, so a reader had to wheel several times per
 * step and the section read as stuck. They have 168vh now, about 35vh a card,
 * which one ordinary flick clears; the snap finishes the step from there.
 *
 * The handover is untouched by this. It was 0.48 of 900vh and is 0.72 of
 * 600vh — 432vh either way — which is exactly what `HANDOVER_END` and `hand()`
 * are for: the split moves, the beats before it do not.
 */
const TRACK_CLASS = "h-[600vh]";

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
 * The App Store and Google Play badges, on the phone.
 *
 * They ride inside `Phone3D`'s `floating` slot, which sits in the tilt rig's
 * `preserve-3d` space — so they lean with the device rather than sliding
 * across a flat pane in front of it, which is what the pointer tilt would make
 * of a sibling layer.
 *
 * Scroll triggers them but does not scrub them. From `BADGES_SHOW_AT` on, the
 * group carries `data-shown`, and CSS transitions take them in (or out, if the
 * reader scrolls back up) on their own clock, so there is no scroll position
 * that leaves a badge frozen halfway across the stage.
 *
 * The attribute is written straight to the DOM from the scroll subscription,
 * the way `HeroAside` and `HeroBand` write their styles. It changes at most
 * once per pass, so it would be cheap as React state too; the DOM write just
 * keeps this component out of React's render cycle entirely.
 */
function HeroStoreBadges() {
  const { scrollYProgress } = useContainerScrollContext();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const place = () => {
      const el = ref.current;
      if (!el) return;
      const p = scrollYProgress.get();
      el.toggleAttribute("data-shown", p >= BADGES_SHOW_AT);
    };
    const unsub = scrollYProgress.on("change", place);
    place();
    return unsub;
  }, [scrollYProgress]);

  return (
    <div ref={ref} className="hero-store-badges">
      <span className="hero-store-badges__item">
        <StoreBadge store="apple" decorative />
      </span>
      <span className="hero-store-badges__item">
        <StoreBadge store="play" decorative />
      </span>
    </div>
  );
}

/**
 * The phone, rising in from below.
 *
 * Opacity and one translate on Y, nothing else. The zoom-out version had to
 * publish its screen rect for the hero to land on, and then compensate for its
 * own movement so the target did not slide out from under the animation. There
 * is no landing any more, so none of that machinery is here.
 */
function HeroPhone({ screen }: { screen?: React.ReactNode }) {
  const { scrollYProgress } = useContainerScrollContext();
  const rootRef = React.useRef<HTMLDivElement>(null);
  /**
   * How far below its resting place the phone waits, in px. `null` until the
   * stage has been measured, which cannot happen on the server.
   *
   * It matters that this is not `0`. The rise is the phone's whole entrance,
   * so a rise of nothing puts the device at its ARRIVED position — dead centre
   * of the hero, on top of the headline — and that is the state the server
   * renders and the browser paints before the measuring effect below has run.
   * It showed as a phone flashing over the hero on every cold load. Unmeasured
   * is now its own state, and the phone is not painted at all until the real
   * distance is known (see `visibility` on the stage).
   */
  const [rise, setRise] = React.useState<number | null>(null);
  const measured = rise !== null;
  /**
   * Below 900px the copy comes in *underneath* the phone rather than beside
   * it (see `.hero-aside`), so there is no right-hand half for the device to
   * clear: drifting left there only walks it into the heading. It stays
   * centred and the stack does the separating.
   */
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    const apply = () => setNarrow(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);
  const asideX = narrow ? 0 : PHONE_ASIDE_X;

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
    [rise ?? 0, rise ?? 0, 0, 0],
    { ease: easeOut },
  );
  const liveY = useMotionValue(rise ?? 0);
  useMotionValueEvent(y, "change", (v) => liveY.set(v));

  // Act two. The phone drifts aside and stays there for the rest of the
  // track — act three changes what's on its screen rather than moving it
  // again.
  const x = useTransform(
    scrollYProgress,
    [0, PHONE_ASIDE[0], PHONE_ASIDE[1], 1],
    ["0%", "0%", `${asideX}%`, `${asideX}%`],
    { ease: easeInOut },
  );
  const scale = useTransform(
    scrollYProgress,
    [0, PHONE_ASIDE[0], PHONE_ASIDE[1], 1],
    [1, 1, PHONE_ASIDE_SCALE, PHONE_ASIDE_SCALE],
    { ease: easeInOut },
  );

  // The onboarding mock crossfades into the feature cards over
  // `PHONE_SCREEN_CROSSFADE`; `screen` then drives its own card swap through
  // the rest of `PHONE_CONTENT`.
  //
  // BOTH sides are written here. Fading only the outgoing one leaves the cards
  // — which are opaque and stacked above — sitting on top of the onboarding
  // screen from the first frame, so the phone shows both at once rather than
  // either of them. Written straight to the DOM, not state, so this doesn't
  // re-render on every scroll frame.
  //
  // Scroll-triggered but self-timed, like the copy's own swap: a crossfade
  // that stops halfway shows the mock through the cards, which is the state
  // this whole block exists to avoid. See `useLatchedBeat`.
  const onboardingRef = React.useRef<HTMLDivElement>(null);
  const screenRef = React.useRef<HTMLDivElement>(null);
  const screenSwap = React.useRef(0);
  const placeScreen = React.useCallback(() => {
    const t = easeOut(screenSwap.current);
    if (onboardingRef.current) {
      onboardingRef.current.style.opacity = String(1 - t);
    }
    if (screenRef.current) {
      screenRef.current.style.opacity = String(t);
      // Nothing to composite while it is entirely one or the other.
      screenRef.current.style.willChange =
        t > 0.001 && t < 0.999 ? "opacity" : "auto";
    }
  }, []);
  useLatchedBeat(
    scrollYProgress,
    PHONE_SCREEN_CROSSFADE,
    screenSwap,
    placeScreen,
    // Shorter than the copy's: this one is only an opacity swap on one small
    // surface, and it follows the copy rather than accompanying it.
    0.32,
  );

  // The halo behind the settled phone ("What We're About"): rings and a cyan
  // bloom that come up as the device steps aside, and stay while it shows the
  // feature cards. Inside the phone's own layer, so it travels and scales with
  // it rather than being placed against the stage.
  const haloOpacity = useTransform(
    scrollYProgress,
    [0, PHONE_ASIDE[0], PHONE_ASIDE[1], 1],
    [0, 0, 1, 1],
    { ease: easeOut },
  );

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
      /* Hidden, not just displaced, until the rise is known: the server has no
         stage to measure, so the markup it sends would otherwise place the
         phone at y=0 — over the hero copy — for as long as it takes hydration
         to run. `visibility` rather than a mount gate so the device and its
         screens are in the document from the start and nothing pops in. */
      style={{ x, y: liveY, scale, visibility: measured ? "visible" : "hidden" }}
      aria-hidden="true"
    >
      {/* Pointer tilt is back on. It was off for the zoom-out, which had to
          land on the phone's screen rect and could not follow a rotating
          target. Nothing measures the screen now, so the phone is free to
          lean toward the cursor as it does in "What We're About". */}
      <motion.div className="hero-phone-halo" style={{ opacity: haloOpacity }} />
      <Phone3D floating={<HeroStoreBadges />}>
        {/* Two screens stacked in the same box, crossfading — the onboarding
            mock is what's on the phone at rest, `screen` (the feature-card
            preview) is what it hands off to. Absolute-on-relative rather than
            a mount/unmount swap, so neither screen ever pops during the
            crossfade. */}
        <div ref={onboardingRef} style={{ position: "absolute", inset: 0 }}>
          <PhoneOnboardingScreen />
        </div>
        {screen ? (
          <div ref={screenRef} style={{ position: "absolute", inset: 0, opacity: 0 }}>
            {screen}
          </div>
        ) : null}
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
 * The copy column: "What We're About" arrives beside the phone once it has
 * stepped aside, then crossfades to "Why Choose" 's heading in the same spot
 * once the phone has started showing its cards.
 *
 * It lives here rather than in the section below because the phone it belongs
 * next to is here: the pin holds both, so the copy can be placed against the
 * device instead of waiting for a separate section to scroll up under it.
 *
 * No `FadeUpReveal` on it, for the same reason the Who tiles could not keep
 * theirs: inside a pinned stage it is in the viewport from the first frame, so
 * a viewport-triggered reveal would fire before the phone had even arrived.
 */
/**
 * Puts a copy layer's HEADING into a flip state, or takes it out of one.
 *
 * The heading rather than the layer, though the layer is what knows: the CSS
 * matches characters at any depth, and the "Why Choose" layer also contains
 * the five per-card sentences, all of them split. Set on the layer, one swap
 * put 636 characters into the same animation on the same frame — four
 * paragraphs' worth of which are invisible and belong to a beat that has not
 * happened yet.
 *
 * Written only when the value changes: assigning the same string is a no-op,
 * but assigning a different one restarts every character.
 */
function setFlip(layer: HTMLElement, state: "in" | "out" | undefined) {
  const heading = layer.querySelector<HTMLElement>(".aside-copy-title");
  if (!heading || heading.dataset.flip === state) return;
  if (state) heading.dataset.flip = state;
  else delete heading.dataset.flip;
}

/**
 * The copy swap is sequenced, not crossfaded: "What We're About" leaves over
 * the first `SWAP_HALF` of the beat and "Why Choose" arrives over the rest, so
 * the two are never on screen at once. They share one grid cell, and when they
 * overlapped, two headings flipping and two blocks of body copy fading through
 * each other read as noise. Twice the old 0.45s crossfade, so each half keeps
 * roughly the time the whole swap used to have.
 */
const SWAP_SECONDS = 0.9;
const SWAP_HALF = 0.5;

function HeroAside({
  children,
  whyHeading,
}: {
  children: React.ReactNode;
  /** "Why Choose" 's heading, crossfaded in over `TEXT_SWAP`. */
  whyHeading?: React.ReactNode;
}) {
  const { scrollYProgress } = useContainerScrollContext();
  const ref = React.useRef<HTMLDivElement>(null);
  const oldRef = React.useRef<HTMLDivElement>(null);
  const newRef = React.useRef<HTMLDivElement>(null);

  // Scroll-triggered, self-timed: see `useLatchedBeat`. `place` reads the
  // beat rather than the scroll for the swap, so stopping mid-scroll cannot
  // leave both blocks of copy legible at once.
  const swap = React.useRef(0);
  // Which way the swap last moved, so each heading can turn the right way:
  // on the way back up "What We're About" has to come IN while "Why Choose"
  // goes out, not replay the forward flips under a crossfade running the
  // other way.
  const lastSwap = React.useRef(0);
  const swapDir = React.useRef<1 | -1>(1);

  const place = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const p = scrollYProgress.get();
    const tIn = easeOut(at(p, ASIDE_IN));
    const s = swap.current;
    if (s !== lastSwap.current) {
      swapDir.current = s > lastSwap.current ? 1 : -1;
      lastSwap.current = s;
    }
    const forward = swapDir.current > 0;
    // How far the outgoing block is gone, and the incoming one arrived: one
    // half of the beat each.
    const tOut = easeInOut(clamp01(s / SWAP_HALF));
    const tIn2 = easeInOut(clamp01((s - SWAP_HALF) / (1 - SWAP_HALF)));
    // No travel. The column used to slide in from 64px to the right of where
    // it belongs, which was its entrance; the per-character reveal on the
    // heading (see `TextReveal`) is the entrance now, and running both meant
    // the letters rose into place while the block they sat on was still
    // arriving underneath them — two movements, in two directions, on one
    // piece of copy.
    //
    // The fade stays. It is not the slide: this column is in the viewport from
    // the pin's first frame, so something has to keep it off the stage until
    // the phone has moved aside, and the alternative is the block appearing
    // outright the instant `ASIDE_IN` opens.
    el.style.opacity = String(tIn);
    el.style.pointerEvents = tIn > 0.9 && tOut < 0.1 ? "auto" : "none";
    el.style.willChange = tIn > 0.001 && tIn < 0.999 ? "opacity" : "auto";

    if (oldRef.current) {
      // Arms the heading's per-character reveal (see `TextReveal`) as the
      // block arrives, and disarms it if the reader scrolls back out, so the
      // copy plays again on the way in rather than being spent the first
      // time. Same write-only-on-change rule as `data-morph` below: a new
      // value restarts an animation on every character.
      const reveal = tIn > 0.05 ? "in" : "out";
      if (oldRef.current.dataset.reveal !== reveal) oldRef.current.dataset.reveal = reveal;
      const oldTitle = oldRef.current.querySelector<HTMLElement>(".aside-copy-title");
      // And hinges away when the swap starts — the first half of the beat is
      // this heading's. Cleared once that half is over and the layer is
      // transparent, or it keeps a spent animation holding its characters
      // edge-on for the rest of the pin.
      //
      // Scrolling back it turns IN over the second half of the reverse, once
      // "Why Choose" has gone, and keeps that state when the beat is back at
      // 0: clearing it there would hand the characters back to the rise and
      // replay it on copy that is already on screen. It is cleared when the
      // block itself leaves (`reveal` out), so the rise plays again on the
      // next way in.
      if (s > 0 && s < SWAP_HALF) setFlip(oldRef.current, forward ? "out" : "in");
      else if (s >= SWAP_HALF || reveal === "out") setFlip(oldRef.current, undefined);
      else if (oldTitle?.dataset.flip === "out") setFlip(oldRef.current, undefined);
      oldRef.current.style.opacity = String(1 - tOut);
    }
    if (newRef.current) {
      // One-shot rather than scrubbed: the chips under this heading form as it
      // turns over (see `chip-morph` in cinematic-hero.css). Written as an
      // attribute the CSS keys off, and only on the frames it actually
      // changes — assigning the same value every frame would be a no-op, but
      // assigning a different one restarts twelve animations, so the two
      // states are set from the beat's own threshold rather than from tSwap
      // crossing some number of its own.
      const morph = s > SWAP_HALF ? "in" : "out";
      if (newRef.current.dataset.morph !== morph) newRef.current.dataset.morph = morph;
      // The second half of the turn: this heading's characters come up out of
      // the page once the one above has fallen away. Scrolling back, it falls
      // away first, before "What We're About" turns up.
      setFlip(
        newRef.current,
        s > SWAP_HALF && s < 1 ? (forward ? "in" : "out") : s >= 1 ? "in" : undefined,
      );
      newRef.current.style.opacity = String(tIn2);
      newRef.current.style.pointerEvents = tIn2 > 0.9 ? "auto" : "none";
    }
  }, [scrollYProgress]);

  useLatchedBeat(scrollYProgress, TEXT_SWAP, swap, place, SWAP_SECONDS);

  React.useEffect(() => {
    const unsub = scrollYProgress.on("change", place);
    place();
    return unsub;
  }, [scrollYProgress, place]);

  return (
    <div
      ref={ref}
      className={whyHeading ? "hero-aside hero-aside--stack" : "hero-aside"}
      style={{ opacity: 0 }}
    >
      {/* Both crossfade layers occupy the same grid cell, so swapping copy
          never reflows the column and neither layer is taken out of flow.
          They were absolute-on-inset-0, which works only while the column has
          a height of its own to fill: below 900px `.hero-aside` is anchored by
          `bottom` alone, so with both children absolute it collapsed to zero
          height and the copy spilled off the bottom of the stage. A grid
          stack takes its height from the taller layer at every width. */}
      <div ref={oldRef} className="hero-aside-layer">
        {children}
      </div>
      {whyHeading ? (
        <div ref={newRef} className="hero-aside-layer" style={{ opacity: 0 }}>
          {whyHeading}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The scrolling band behind the hero.
 *
 * A sibling of the hero and the phone on the pin. Nothing above it is opaque
 * any more, so it is simply visible for the handover: it starts low, travels
 * to the middle as the hero leaves and the phone arrives, and dims — never
 * all the way out — as the "What We're About" copy comes in beside the device.
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
    // easeOut to match the aside's arrival, so the band drops as fast as the
    // copy comes up rather than lingering linearly behind already-readable
    // text. It settles at BAND_REST_OPACITY, not at 0.
    el.style.opacity = String(
      lerp(1, BAND_REST_OPACITY, easeOut(at(p, BAND_OUT))),
    );
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
  glow,
  aside,
  whyHeading,
  phoneScreen,
}: {
  children: React.ReactNode;
  /** Background band on the pin, behind everything. */
  backdrop?: React.ReactNode;
  /**
   * Background washes, above the band and BEHIND the phone.
   *
   * They used to live in the hero section itself, but `children` render in
   * `HeroParts`, which is stacked in front of the phone so the hero can leave
   * across it. A wash there tints the device: the mid-left bloom sits where the
   * phone steps aside to, and turned its white onboarding screen greyish blue.
   * From here it lights the stage around the phone and never covers it.
   */
  glow?: React.ReactNode;
  /** Copy that arrives beside the phone once it has stepped aside. */
  aside?: React.ReactNode;
  /**
   * "Why Choose" 's heading, crossfaded in over the same spot as `aside`
   * once the phone has started showing its cards (`TEXT_SWAP`). The real
   * section below starts already in this pose — see `skipEntrance` on
   * `WhyScrollSection`.
   */
  whyHeading?: React.ReactNode;
  /**
   * "Why Choose" 's feature cards, crossfaded onto the phone's own screen in
   * place of the onboarding mock (`PHONE_CONTENT`/`PHONE_SCREEN_CROSSFADE`) —
   * the phone never leaves or is replaced, only what it's showing changes.
   */
  phoneScreen?: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  // No pin and no handover: the hero is just the hero, and the band follows it
  // in normal flow. "Why Choose" gets no preview either — it plays its own
  // entrance once scrolled into view, same as any other section.
  if (reduced) {
    return (
      <div className="cinematic-hero">
        <div className="ch-stage ch-stage--static">
          {children}
          {backdrop}
          {aside ? <div className="hero-aside hero-aside--static">{aside}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <ContainerScroll className={`cinematic-hero ${TRACK_CLASS}`}>
      {/* The band and the phone's screen are cousins here, and the band draws
          the word it is holding into the screen as well (see `DustMirror`).
          The provider is what lets them find each other. */}
      <DustMirrorProvider>
        <ContainerSticky className="ch-stage h-svh w-full">
          {backdrop ? <HeroBand>{backdrop}</HeroBand> : null}
          {glow ? (
            <div className="hero-glow" aria-hidden="true">
              {glow}
            </div>
          ) : null}
          <HeroPhone screen={phoneScreen} />
          {aside ? <HeroAside whyHeading={whyHeading}>{aside}</HeroAside> : null}
          <HeroParts>{children}</HeroParts>
        </ContainerSticky>
      </DustMirrorProvider>
    </ContainerScroll>
  );
}
