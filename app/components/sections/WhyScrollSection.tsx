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

const features = [
  {
    title: "AI-Powered Targeting",
    desc: "Get your message in front of the right audience at the right time.",
  },
  {
    title: "Bulk & Personalised Messaging",
    desc: "Scale up your outreach while keeping it personal.",
  },
  {
    title: "Real-Time Analytics",
    desc: "Track campaign performance and optimise results.",
  },
  {
    title: "User-Friendly Dashboard",
    desc: "Manage all your campaigns in one place.",
  },
  {
    title: "Affordable & Scalable",
    desc: "Flexible pricing that grows with your business.",
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
function buildTimeline(count: number) {
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
      // Only while the section is actually pinned. At the very ends the reader
      // is on their way somewhere else and must not be pulled back.
      if (progress <= 0.001 || progress >= 0.999) return;

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
  }, [enabled, outerRef, snapPoints, tweenTo, cancel]);
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
  visible: { transition: { staggerChildren: 0.12 } },
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

function WhyCard({
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
            className="why-scroll-heading"
            variants={HEADING_STAGGER}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2
              variants={RISE}
              className="text-4xl md:text-8xl font-black text-gradient-silver leading-tight tracking-tight"
            >
              Why
              <br />
              Choose
              <br />
              BalloAds?
            </motion.h2>
            <motion.p
              variants={RISE}
              className="landing-body mt-3 text-white"
              style={{ maxWidth: "26rem" }}
            >
              Most tools make you choose between reach and relevance. BalloAds
              gives you both: one place to build an audience, send SMS, WhatsApp
              and email campaigns, and see exactly what each message earned you.
            </motion.p>
            <motion.button
              variants={FADE}
              type="button"
              onClick={openWaitlist}
              className="btn-primary group mt-6"
            >
              Get Started
            </motion.button>
          </motion.div>

          <div className="why-right-area">
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
                    // Mobile and reduced-motion: no pin, no carousel. The first
                    // card sits on the screen and the rest stay parked below.
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
          </div>
        </div>
      </div>
    </section>
  );
}
