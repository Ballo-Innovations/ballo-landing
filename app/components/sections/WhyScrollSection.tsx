"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  cubicBezier,
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

import { getLenis } from "@/app/components/ui/SmoothScroll";
import phoneFrame from "@/public/Assets/phone-frame.png";
import BalloLoader from "@/app/components/ui/BalloLoader";
import { useWaitlist } from "@/app/components/waitlist/WaitlistProvider";
import { WhyFeatureChips } from "@/app/components/ui/FeatureChips";
import { useDustMirror } from "@/app/components/ui/DustMirror";
import {
  useContainerScrollContext,
  useOptionalContainerScrollContext,
} from "@/app/components/ui/AnimatedVideoOnScroll";
import { at, type Range } from "@/lib/cinematic";

/**
 * Why Choose BalloAds — a pinned phone with a vertical card carousel.
 *
 * This was a GSAP ScrollTrigger pin with a scrubbed timeline and `snap`. It is
 * the same animation on framer-motion now, and the pin is real layout rather
 * than a runtime-injected spacer: `.why-scroll-outer` carries the track height
 * in CSS and `.why-scroll-sticky` is `position: sticky`. That is the part worth
 * knowing about — ScrollTrigger used to measure the pin against a layout that
 * was still settling (fonts, the phone frame, the images below) and needed a
 * `refresh()` on load to correct itself. A sticky element has nothing to
 * remeasure, so that whole class of problem is gone with the dependency.
 */

/**
 * `word` is the card's one-word echo on the background band, which stops
 * travelling and holds it while the card is up (see `HeroMarquee`). It lives
 * on the card rather than in the band because it is the card's word: whoever
 * edits this list is the one who has to keep the two saying the same thing.
 */
export const features = [
  {
    title: "AI-Powered Targeting",
    desc: "Get your message in front of the right audience at the right time.",
    word: "AI",
    blurb:
      "Most tools make you choose between reach and relevance. BalloAds gives you both: audiences built from what your contacts actually do, so the right message reaches the right people.",
  },
  {
    title: "Bulk & Personalised Messaging",
    desc: "Scale up your outreach while keeping it personal.",
    word: "SCALE",
    blurb:
      "Send to thousands at once without sounding like it. Every message can carry a name, a last order or anything else you already hold on a contact.",
  },
  {
    title: "Real-Time Analytics",
    desc: "Track campaign performance and optimise results.",
    word: "INSIGHT",
    blurb:
      "Watch a campaign as it lands: delivery, opens, replies and what each message earned you, while there is still time to change something.",
  },
  {
    title: "User-Friendly Dashboard",
    desc: "Manage all your campaigns in one place.",
    word: "CONTROL",
    blurb:
      "SMS, WhatsApp and email run from one place, off one contact list. No exports between tools, and no reconciling numbers at the end of the month.",
  },
  {
    title: "Affordable & Scalable",
    desc: "Flexible pricing that grows with your business.",
    word: "GROWTH",
    blurb:
      "Start on a plan that fits what you send today. Pricing moves with your volume, so the platform grows with the business rather than ahead of it.",
  },
];

/**
 * Hold-then-slide, not a continuous drift: each card rests for HOLD of the
 * scroll and the swap itself only takes SLIDE. Together with the snap below,
 * the scroll cannot come to rest halfway through a swap — two half-cards
 * stacked is the state this section must never show.
 *
 * The units are the old timeline's arbitrary seconds, kept so the rhythm is
 * unchanged; everything is normalised against `total` before it reaches a
 * transform.
 */
const HOLD = 1;
const SLIDE = 0.32;


/** GSAP's `power2.inOut`, which is a quad in-out. */
const SWAP_EASE = cubicBezier(0.45, 0, 0.55, 1);

/** Held scroll per card, in viewport heights — the old `end` computation. */
const HOLD_VH_PER_CARD = 0.55;

/** Desktop-only, matching the old `gsap.matchMedia` breakpoint. */
const PINNED_QUERY =
  "(min-width: 901px) and (prefers-reduced-motion: no-preference)";

interface Swap {
  start: number;
  end: number;
}

/**
 * The timeline, as plain numbers. `rest` holds the times at which exactly one
 * card fills the screen — the only positions the scroll may settle on.
 */
export function buildTimeline(count: number) {
  const rest = [0];
  const swaps: Swap[] = [];
  let cursor = 0;
  for (let i = 1; i < count; i++) {
    const start = cursor + HOLD;
    const end = start + SLIDE;
    swaps.push({ start, end });
    rest.push(end);
    cursor = end;
  }
  // Trailing hold so the last card gets the same dwell as the others before
  // the pin releases.
  const total = cursor + HOLD;
  return {
    total,
    swaps,
    /** Normalised rest points, plus the end of the track. */
    snapPoints: rest.map((t) => t / total).concat(1),
  };
}

/**
 * One card's vertical travel across the whole track.
 *
 * Stated over the full [0, 1] domain with the flats spelled out, rather than
 * as the two stops of its own swap. A range that does not span the source's
 * domain does not hold its end value — it interpolates back toward the first,
 * so a card that had slid away would drift back on screen later in the track.
 */
function cardKeyframes(index: number, swaps: Swap[], total: number) {
  const points: Array<[number, number]> = [];
  const inbound = index > 0 ? swaps[index - 1] : undefined;
  const outbound = swaps[index];

  if (inbound) {
    points.push(
      [0, 100],
      [inbound.start / total, 100],
      [inbound.end / total, 0],
    );
  } else {
    points.push([0, 0]);
  }
  if (outbound) {
    points.push([outbound.start / total, 0], [outbound.end / total, -100]);
  }
  points.push([1, points[points.length - 1][1]]);

  return {
    input: points.map(([t]) => t),
    output: points.map(([, y]) => y),
  };
}

function useMatchMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const apply = () => setMatches(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [query]);
  return matches;
}

/**
 * Settle on a whole card, the way ScrollTrigger's `snap` did.
 *
 * Framer has no scroll snapping, and CSS `scroll-snap` cannot express "these
 * five fractions of one element's track", so this is the one piece that had to
 * be written rather than translated.
 *
 * Two implementations, and which one runs is not a style choice. Lenis owns the
 * scroll position when it is running, so the snap hands the move to it and lets
 * one clock ease the page. Only when Lenis is absent — reduced motion, or
 * before it has mounted — does the rAF tween below drive the scroll itself.
 * Running both at once is the failure this avoids: two easings writing
 * `scrollY` on separate clocks, which reads as a stutter, not as smoothness.
 *
 * Either way it yields to the reader. The manual tween writes a known position
 * each frame and abandons itself if the next frame does not start there; Lenis
 * stops its own programmatic scroll on user input.
 */
function useSnapToCard(
  outerRef: React.RefObject<HTMLElement | null>,
  snapPoints: number[],
  enabled: boolean,
  /**
   * Progress below which the track belongs to something else and must not be
   * snapped. It is 0 for this section, whose whole track is the carousel, and
   * the start of the card window for the hero, whose track opens with four
   * beats of handover that would be yanked around by a snap.
   */
  activeFrom: number = 0,
) {
  const frameRef = useRef<number | null>(null);
  const expectedRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    expectedRef.current = null;
  }, []);

  const tweenTo = useCallback(
    (to: number, distance: number) => {
      // GSAP's { min: 0.15, max: 0.45 }, scaled by how far there is to go.
      const span = window.innerHeight * HOLD_VH_PER_CARD;
      const seconds = Math.min(
        0.45,
        Math.max(0.15, (Math.abs(distance) / span) * 0.45),
      );

      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(to, { duration: seconds, easing: SWAP_EASE });
        return;
      }

      const from = window.scrollY;
      const duration = seconds * 1000;
      const startedAt = performance.now();

      const step = (now: number) => {
        // Someone else moved the page: leave it to them.
        if (
          expectedRef.current !== null &&
          Math.abs(window.scrollY - expectedRef.current) > 4
        ) {
          cancel();
          return;
        }
        const t = Math.min(1, (now - startedAt) / duration);
        const next = Math.round(from + (to - from) * SWAP_EASE(t));
        window.scrollTo(0, next);
        expectedRef.current = window.scrollY;
        if (t < 1) {
          frameRef.current = requestAnimationFrame(step);
        } else {
          cancel();
        }
      };

      expectedRef.current = from;
      frameRef.current = requestAnimationFrame(step);
    },
    [cancel],
  );

  useEffect(() => {
    if (!enabled) return;
    let settle: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      // A scroll event that is not ours interrupts an in-flight snap.
      if (
        frameRef.current !== null &&
        expectedRef.current !== null &&
        Math.abs(window.scrollY - expectedRef.current) > 4
      ) {
        cancel();
      }
      if (settle) clearTimeout(settle);
      // GSAP's snap `delay: 0.04` plus the time it takes a flick to stop.
      settle = setTimeout(snap, 140);
    };

    const snap = () => {
      const outer = outerRef.current;
      if (!outer || frameRef.current !== null) return;
      const start = outer.offsetTop;
      const length = outer.offsetHeight - window.innerHeight;
      if (length <= 0) return;
      const progress = (window.scrollY - start) / length;
      // Only while the cards actually own the track. At the very ends the
      // reader is on their way somewhere else and must not be pulled back.
      if (progress <= Math.max(0.001, activeFrom) || progress >= 0.999) return;

      const nearest = snapPoints.reduce((best, p) =>
        Math.abs(p - progress) < Math.abs(best - progress) ? p : best,
      );
      const target = Math.round(start + nearest * length);
      const distance = target - window.scrollY;
      if (Math.abs(distance) < 2) return;
      tweenTo(target, distance);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (settle) clearTimeout(settle);
      cancel();
    };
  }, [enabled, outerRef, snapPoints, tweenTo, cancel, activeFrom]);
}

/**
 * The heading's entrance, fired once as the section scrolls in.
 *
 * The CTA is deliberately excluded from the y-translation and fades only. The
 * GSAP version had the same rule for a reason worth keeping: any tween that
 * moves the button can strand an inline `translate(0, 60px)` on it if it is
 * interrupted, and because transforms do not affect layout that leftover reads
 * as phantom margin above the button.
 */
const HEADING_STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.55 } },
};
const RISE: Variants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.215, 0.61, 0.355, 1] },
  },
};
const FADE: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.9, delay: 0.36, ease: [0.215, 0.61, 0.355, 1] },
  },
};

/**
 * Slide in from the right of the column, not of the page.
 *
 * This must not live on the same node as `whileInView`. `hidden` parks the
 * element one full width off-stage, and IntersectionObserver uses the
 * transformed box — so the observer would wait for a target that can never
 * enter the viewport, and the phone would stay at opacity 0 forever. The
 * outer `.why-right-area` is what gets watched; this variant plays on a
 * child that is free to travel.
 */
const PHONE_ENTER: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.215, 0.61, 0.355, 1] },
  },
};

/**
 * The right-hand paragraph, re-written by whichever card the phone is holding.
 *
 * The copy beside the phone used to be one fixed paragraph for all five steps,
 * so four of them were illustrated by a sentence that had nothing to do with
 * them. Each feature now brings its own, and the swap is driven by the same
 * scroll progress as the cards, at the midpoint of each swap — so the sentence
 * turns over with the card rather than before or after it.
 *
 * Two things this deliberately does NOT do:
 *
 *   - re-render. The active index is written straight onto the paragraph nodes
 *     from a scroll subscription, and only when the index actually changes, so
 *     a scroll through the whole section costs no React renders at all;
 *   - reflow. All five paragraphs occupy one grid cell, so the block is always
 *     as tall as the longest of them and the chips and CTA underneath do not
 *     move when the copy changes length.
 */
export function WhyStepBlurb({
  range,
  progress: progressProp,
}: {
  /** Where the card sequence sits in the track this reads. */
  range: Range;
  /** The track's progress. Defaults to the enclosing `ContainerScroll`. */
  progress?: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const ctx = useOptionalContainerScrollContext();
  const source = progressProp ?? ctx?.scrollYProgress;
  const nodes = useRef<Array<HTMLParagraphElement | null>>([]);
  const active = useRef(0);

  // The point in each swap at which the copy turns over: its midpoint, which
  // is where the outgoing card is half gone and the incoming one half arrived.
  const midpoints = useMemo(() => {
    const { total, swaps } = buildTimeline(features.length);
    return swaps.map((sw) => (sw.start + sw.end) / 2 / total);
  }, []);

  const [from, to] = range;

  useEffect(() => {
    if (!source) return;

    const apply = () => {
      const t = at(source.get(), [from, to]);
      let index = 0;
      for (let i = 0; i < midpoints.length; i++) {
        if (t >= midpoints[i]) index = i + 1;
      }
      if (index === active.current) return;
      active.current = index;

      nodes.current.forEach((node, i) => {
        if (!node) return;
        const on = i === index;
        node.style.opacity = on ? "1" : "0";
        node.style.transform = on ? "none" : "translate3d(0, 0.75rem, 0)";
        // Opacity alone leaves the other four readable to a screen reader, so
        // only the one on screen is in the accessibility tree.
        node.setAttribute("aria-hidden", on ? "false" : "true");
      });
    };

    apply();
    return source.on("change", apply);
  }, [source, from, to, midpoints]);

  return (
    <div className="why-step-blurb">
      {features.map((feature, i) => (
        <p
          key={i}
          ref={(node) => {
            nodes.current[i] = node;
          }}
          className="landing-body aside-copy-body why-step-blurb__line"
          aria-hidden={i === 0 ? "false" : "true"}
          style={{
            opacity: i === 0 ? 1 : 0,
            transform: i === 0 ? "none" : "translate3d(0, 0.75rem, 0)",
          }}
        >
          {feature.blurb}
        </p>
      ))}
    </div>
  );
}

export function WhyCard({
  index,
  feature,
  swaps,
  total,
  progress,
}: {
  index: number;
  feature: (typeof features)[number];
  swaps: Swap[];
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const { input, output } = useMemo(
    () => cardKeyframes(index, swaps, total),
    [index, swaps, total],
  );
  const yPercent = useTransform(progress, input, output, { ease: SWAP_EASE });
  // Percent, not pixels: each card is inset:0 on the screen box, so 100% is
  // exactly one phone screen of travel at any viewport size.
  const y = useTransform(yPercent, (v) => `${v}%`);

  return (
    <motion.li
      className="why-scroll-item"
      // Every card is fully opaque and parked one full screen below, so two are
      // never legible on top of each other. `.why-scroll-item` ships
      // `opacity: 0` for the no-JS case; the carousel owns it from here.
      style={{ opacity: 1, y, ["--i" as string]: index }}
    >
      <span className="why-scroll-item-num">0{index + 1}</span>
      <h3 className="why-scroll-item-title">{feature.title}</h3>
      <p className="why-scroll-item-desc">{feature.desc}</p>
    </motion.li>
  );
}

/**
 * All five feature cards, on the hero's own phone screen.
 *
 * This is the carousel — not a preview of it. It runs on the hero's pin (see
 * `phoneScreen` on `HeroSideExit`), crossfaded onto the phone already on
 * screen in place of the onboarding mock, so the whole five-step sequence is
 * one continuous scroll scene rather than two that hand off mid-list.
 *
 * `range` is the hero's card window; the hero's progress is remapped into a
 * fresh [0, 1] across it, which is the same shape of input `WhyCard` takes
 * from `WhyScrollSection`'s own track. The snap is mapped back the other way:
 * its rest points are fractions of the card window, and the hook needs them as
 * fractions of the whole track, with everything before the window left alone.
 */
export function WhyCardSequence({ range }: { range: Range }) {
  const { scrollYProgress } = useContainerScrollContext();
  const progress = useTransform(scrollYProgress, (p) => at(p, range));
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement | null>(null);
  const pinned = useMatchMedia(PINNED_QUERY);
  const mirror = useDustMirror();

  const { total, swaps, snapPoints } = useMemo(
    () => buildTimeline(features.length),
    [],
  );

  // The snap measures the scroll track, which is the hero's `ContainerScroll`
  // element — an ancestor rather than anything this renders, so it is resolved
  // once on mount instead of being passed down through the phone.
  useEffect(() => {
    trackRef.current =
      rootRef.current?.closest(".cinematic-hero") as HTMLElement | null;
  }, []);

  const trackSnapPoints = useMemo(
    () => snapPoints.map((p) => range[0] + p * (range[1] - range[0])),
    [snapPoints, range],
  );

  useSnapToCard(trackRef, trackSnapPoints, pinned, range[0]);

  return (
    <div ref={rootRef} className="hero-phone-why-screen" aria-hidden="true">
      {/* The band's own particles, drawn a second time in register (see
          `DustMirror`): the phone covers part of the word the band is holding,
          and this is that part — same field, same pointer, so it scatters with
          the rest of the dust. It sits under the cards, which is why they are
          transparent in this variant and the screen carries the background. */}
      {mirror ? (
        <canvas ref={mirror} className="why-screen-dust" aria-hidden="true" />
      ) : null}
      <ul
        className="why-scroll-items why-scroll-items--flush why-scroll-items--dust"
        style={{ "--count": features.length } as React.CSSProperties}
      >
        {features.map((feature, i) => (
          <WhyCard
            key={i}
            index={i}
            feature={feature}
            swaps={swaps}
            total={total}
            progress={progress}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * The standalone section: its own pin, its own carousel.
 *
 * The home page does not render this any more — the hero's pin owns that scene
 * now, cards and all (see `WhyCardSequence`). It is kept whole, and in its
 * original standalone form, because it is the only self-contained version of
 * this section: anything wanting "Why Choose" as a section of its own, rather
 * than as part of a hero handover, mounts this.
 */
export function WhyScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { openWaitlist } = useWaitlist();
  const pinned = useMatchMedia(PINNED_QUERY);

  const { total, swaps, snapPoints } = useMemo(
    () => buildTimeline(features.length),
    [],
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useSnapToCard(containerRef, snapPoints, pinned);

  return (
    <section
      ref={containerRef}
      className="why-scroll-outer"
      style={
        { ["--why-count" as string]: features.length } as React.CSSProperties
      }
    >
      <div className="why-scroll-sticky">
        <div className="why-scroll-inner">
          <motion.div
            className="why-scroll-heading aside-copy"
            variants={HEADING_STAGGER}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2
              variants={RISE}
              className="aside-copy-title font-black text-gradient-silver"
            >
              Why
              <br />
              Choose
              <br />
              BalloAds?
            </motion.h2>
            {/* Its own track, so the whole of it is the card sequence. */}
            <motion.div variants={RISE}>
              <WhyStepBlurb range={[0, 1]} progress={scrollYProgress} />
            </motion.div>
            <motion.div variants={FADE}>
              <WhyFeatureChips />
            </motion.div>
            <motion.button
              variants={FADE}
              type="button"
              onClick={openWaitlist}
              className="btn-primary group aside-copy-cta"
            >
              Get Started
            </motion.button>
          </motion.div>

          <motion.div
            className="why-right-area"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div className="why-right-enter" variants={PHONE_ENTER}>
              <div
                className="why-bg-images"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BalloLoader />
              </div>
              <div className="why-phone-wrapper">
                <ul
                  className="why-scroll-items"
                  style={{ "--count": features.length } as React.CSSProperties}
                >
                  {features.map((feature, i) =>
                    pinned ? (
                      <WhyCard
                        key={i}
                        index={i}
                        feature={feature}
                        swaps={swaps}
                        total={total}
                        progress={scrollYProgress}
                      />
                    ) : (
                      <li
                        key={i}
                        className="why-scroll-item"
                        style={
                          {
                            opacity: 1,
                            transform: `translateY(${i === 0 ? 0 : 100}%)`,
                            ["--i" as string]: i,
                          } as React.CSSProperties
                        }
                      >
                        <span className="why-scroll-item-num">0{i + 1}</span>
                        <h3 className="why-scroll-item-title">{feature.title}</h3>
                        <p className="why-scroll-item-desc">{feature.desc}</p>
                      </li>
                    ),
                  )}
                </ul>
                <Image
                  src={phoneFrame}
                  alt=""
                  aria-hidden="true"
                  sizes="(max-width: 768px) 220px, 300px"
                  className="why-phone-frame-img"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
