"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";

import {
  ContainerInset,
  ContainerScroll,
  ContainerSticky,
  HeroVideo,
  useContainerScrollContext,
} from "../ui/AnimatedVideoOnScroll";
import { ShinyButton } from "../ui/ShinyButton";
import { useAnimateWhenVisible } from "../ui/useAnimateWhenVisible";
import { at, easeOut } from "@/lib/cinematic";

/**
 * Brutus, as a section of the home page.
 *
 * A trailer for /brutus rather than a copy of it: a pinned stage where the
 * copy rises out of a blur and the demo film opens from a rounded pill to full
 * bleed as you scroll.
 *
 * The stage is the 21st.dev "animated video on scroll" component, which this
 * project already had at `ui/AnimatedVideoOnScroll` — the hero's own pin runs
 * on the same four primitives (see `HeroSideExit`), so this adds no dependency
 * and no second copy of them. `HeroVideo` was the one export that had never
 * been needed before and is ported now.
 *
 * What this replaced, and why: a "lamp" header, a phone mock and pulse beams
 * running between them, and below the stage a set of capability cards and
 * chips. The film is a far stronger centrepiece than any of it, and all of
 * that detail still lives on /brutus, which is where the CTA sends anyone who
 * wants it — the six capabilities included, from the same shared module.
 *
/*
 * ── The stage's timeline ────────────────────────────────────────────────
 *
 * The pin runs one thing at a time: the film opens, and only then does the
 * copy arrive under it.
 *
 * This is NOT what `ContainerAnimated` gives you, which is why neither the
 * copy nor the CTA uses it any more. That component fades its content in on
 * `whileInView` with `once: true` — so it fires the moment the element enters
 * the viewport, which on a pinned stage is the very first frame of the pin,
 * with the film still a capsule. The heading was fully readable before the
 * film had opened at all. Its CTA variant also carried `outputRange={[-120,
 * 0]}`, lifting the buttons 120px at zero progress, which parked them on top
 * of the heading.
 *
 * So every beat below is driven by scroll progress instead, in sequence.
 */

/**
 * When the film opens.
 *
 * The track starts a whole viewport before this section owns the screen (see
 * the `offset` on `ContainerScroll` below), so progress 0 is NOT the moment
 * the stage takes over — it is the moment the section first appears at the
 * bottom of the screen.
 *
 * Zero: the capsule starts widening as soon as it appears, which is what
 * George asked for. It used to hold until 0.5, because the hero's "Why Choose
 * BalloAds?" copy is measured to leave the viewport only at about 0.47, and
 * holding kept the two scenes from animating over each other. They now
 * overlap through the entry by design — the film opens across the whole
 * approach instead of the back half of it.
 *
 * `FILM_OPEN` is unchanged, so the film still finishes opening exactly where
 * it did and the copy and CTA beats below keep their cues.
 */
/** The track grew 170vh → 240vh for the outro; the entrance keeps its scroll. */
const TRACK_SCALE = 170 / 240;

const FILM_OPEN_FROM = 0;
/** Progress at which the film has finished opening to full bleed. */
const FILM_OPEN = 0.78 * TRACK_SCALE;

/**
 * How far below its resting place the film starts, in pixels.
 *
 * The capsule sat high in the stage with the copy's reserved space empty
 * beneath it, so the section opened on a sliver of film under the nav and a
 * void. Starting it lower and letting it rise as it widens puts the expansion
 * nearer the middle of the screen, where there is something to look at.
 */
const FILM_DROP = 150;

/** The copy, then the buttons — each after the beat before it. */
const COPY_IN: [number, number] = [0.79 * TRACK_SCALE, 0.9 * TRACK_SCALE];
const CTA_IN: [number, number] = [0.87 * TRACK_SCALE, 0.97 * TRACK_SCALE];

/**
 * The outro (like the hero's exit, see HeroSideExit): the pieces leave
 * sideways at their own speeds over the track's added tail, before the pin
 * releases. Travel only; written to CSS `translate` so it composes with the
 * film's rise and the copy's own `y`.
 */
const OUTRO: [number, number] = [0.74, 1];
const OUTRO_PARTS: Array<[selector: string, dir: 1 | -1, speed: number]> = [
  [".brutus-stage__cta", 1, 2],
  [".brutus-stage__lede", -1, 1.7],
  [".brutus-stage__h2", 1, 1.4],
  [".brutus-stage__copy .section-eyebrow", -1, 1.9],
  [".brutus-stage__inset", -1, 1.05],
];

function BrutusOutro() {
  const { scrollYProgress } = useContainerScrollContext();
  const ref = React.useRef<HTMLSpanElement>(null);
  const place = React.useCallback((p: number) => {
    const stage = ref.current?.parentElement;
    if (!stage) return;
    const u0 = at(p, OUTRO);
    const dist = window.innerWidth + 120;
    OUTRO_PARTS.forEach(([sel, dir, speed], i) => {
      const u = Math.min(1, Math.max(0, (u0 - i * 0.04) * speed));
      const t = u * u * (3 - 2 * u);
      const el = stage.querySelector<HTMLElement>(sel);
      if (el) el.style.translate = t > 0.0005 ? `${(dir * dist * t).toFixed(1)}px 0` : "";
    });
  }, []);
  useMotionValueEvent(scrollYProgress, "change", place);
  React.useEffect(() => place(scrollYProgress.get()), [place, scrollYProgress]);
  return <span ref={ref} hidden />;
}

/**
 * One beat of the stage: fades and rises over its own slice of the pin.
 *
 * `pointerEvents` is gated on the same range. Opacity alone leaves a button
 * clickable and focusable while it is invisible, which on this stage means a
 * CTA sitting unseen over the heading for the first half of the pin.
 */
function Beat({
  range,
  className,
  children,
}: {
  range: [number, number];
  className?: string;
  children: React.ReactNode;
}) {
  const { scrollYProgress } = useContainerScrollContext();

  /**
   * Derived with `at()` — this project's own "how far through this range is
   * the scroll" primitive, the one the hero's pin is built on — rather than
   * handed to `useTransform` as keyframe arrays.
   *
   * Both earlier attempts at the array form misbehaved. Two stops (`[from,
   * to]`) do not hold the end value: the copy faded in on cue and then faded
   * back out again over the rest of the pin. Spelling out the flats across the
   * whole domain (`[0, from, to, 1]` against `[0, 0, 1, 1]`) then produced
   * values that did not match the stops at all — measured 0.77 at a progress
   * of 0.515, where the stops say 0.
   *
   * A function transform has no interpolation semantics to get wrong: it
   * clamps at both ends by construction, and what it returns can be read
   * straight off the source.
   */
  const t = useTransform(scrollYProgress, (p) => at(p, range));
  const opacity = t;
  const y = useTransform(t, (v) => (1 - easeOut(v)) * 28);
  const pointerEvents = useTransform(scrollYProgress, (p) =>
    p > range[0] + (range[1] - range[0]) * 0.6 ? "auto" : "none",
  );

  return (
    <motion.div className={className} style={{ opacity, y, pointerEvents }}>
      {children}
    </motion.div>
  );
}

/** The film, rising as it widens. */
function Film() {
  const { scrollYProgress } = useContainerScrollContext();
  // Held low until the film starts opening, then rising with it. Same function
  // form as `Beat`, for the same reason.
  const y = useTransform(
    scrollYProgress,
    (p) => (1 - easeOut(at(p, [FILM_OPEN_FROM, FILM_OPEN]))) * FILM_DROP,
  );

  return (
    <ContainerInset
      openFrom={FILM_OPEN_FROM}
      closeAt={FILM_OPEN}
      // Ends rounder than the component's default 16px.
      roundednessRange={[1000, 40]}
      className="brutus-stage__inset"
      style={{ y }}
    >
      {/* The clip from the component's own demo, self-hosted rather than
          pointed at `cdn.21st.dev`: a third-party demo asset can be moved or
          rate-limited at any time, and a hotlink would put a render of this
          section in someone else's hands.

          Re-encoded from the 2560x1440, 14MB source to 1152 wide with its
          audio track dropped — the player is muted, so the AAC stream was pure
          overhead.

          `aria-hidden`, not a label: it is atmosphere, and the heading below
          already says what the section is. */}
      <HeroVideo
        className="brutus-stage__video"
        src="/brutus/demo.mp4"
        poster="/brutus/demo-poster.jpg"
        aria-hidden="true"
      />
    </ContainerInset>
  );
}

/** Where the next section fades in, over the end of the outro. */
const AFTER_IN: [number, number] = [0.93, 1];

function After({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useContainerScrollContext();
  const ref = React.useRef<HTMLDivElement>(null);
  // One number, `--after-t` (0→1 over AFTER_IN); home.css decides what each
  // piece does with it: the copy fades, the carousel rises from below.
  const place = React.useCallback((p: number) => {
    const el = ref.current;
    if (!el) return;
    const t = at(p, AFTER_IN);
    el.style.setProperty("--after-t", t.toFixed(4));
    el.style.setProperty("--after-rise", easeOut(t).toFixed(4));
    // The copy slides in from the right piece by piece, heading first and
    // fastest, like "What We're About" (ADR 0010's `slideCopy`).
    const pieces = el.querySelectorAll<HTMLElement>(
      ".who-curved__copy > *, .who-curved__cta",
    );
    const dist = window.innerWidth;
    // Each carousel card flies in from its own direction and speed and
    // settles into the curve. CSS `translate` composes with the tile's own
    // orbit transform, so the row keeps moving underneath.
    const dirs: Array<[number, number]> = [
      // Straight in from the left or the right, alternating; no angles.
      [-1, 0], [1, 0], [-1, 0], [1, 0], [-1, 0], [1, 0],
    ];
    el.querySelectorAll<HTMLElement>('.who-curved__band [class*="tgh-t-"]').forEach(
      (card, i) => {
        const [dx, dy] = dirs[i % dirs.length];
        const sp = 1.15 + (i % 3) * 0.25;
        const a = easeOut(Math.min(1, Math.max(0, (t - (i % 4) * 0.04) * sp)));
        const k = 1 - a;
        card.style.translate =
          k > 0.001
            ? `${(dx * window.innerWidth * 1.1 * k).toFixed(1)}px ${(dy * window.innerHeight * 0.7 * k).toFixed(1)}px`
            : "";
      },
    );
    pieces.forEach((piece, i) => {
      const sp = [1.7, 1.45, 1.25, 1.05][Math.min(i, 3)];
      const a = easeOut(Math.min(1, Math.max(0, (t - i * 0.05) * sp)));
      const x = dist * (1 - a);
      piece.style.position = "relative";
      piece.style.left = x > 0.5 ? `${x.toFixed(1)}px` : "";
    });
    el.style.visibility = t > 0 ? "visible" : "hidden";
    el.style.pointerEvents = t > 0.6 ? "auto" : "none";
  }, []);
  useMotionValueEvent(scrollYProgress, "change", place);
  React.useEffect(() => place(scrollYProgress.get()), [place, scrollYProgress]);
  return (
    <div ref={ref} className="brutus-stage__after" style={{ visibility: "hidden" }}>
      {children}
    </div>
  );
}

export function BrutusSection({ after }: { after?: React.ReactNode } = {}) {
  const animRef = useAnimateWhenVisible<HTMLElement>();

  return (
    <section id="brutus" ref={animRef} className="brutus-home">
      {/* ── The pinned stage ── */}
      {/* Progress starts as the section RISES into view, not once it is
          already pinned. The default ["start start", ...] leaves an entire
          viewport of scroll — the whole entry — sitting at progress 0, so this
          section came up from the bottom as a capsule of film over a void
          while the hero's own composition was still leaving through the top.
          That stretch was the "gap between the sections": neither section had
          anything in the middle of the screen.

          Shifted to the viewport's bottom edge, the track is the same length
          and still ends exactly where the pin releases — the film simply opens
          on the way in, so the arriving section fills the screen the departing
          one is vacating. */}
      <ContainerScroll
        className="brutus-stage-track"
        offset={["start end", "end end"]}
      >
        <ContainerSticky className="brutus-stage">
          <BrutusOutro />
          <Film />

          <Beat range={COPY_IN} className="brutus-stage__copy">
            <span className="section-eyebrow">
              <Sparkles size={13} aria-hidden="true" />
              Meet Brutus
            </span>
            <h2 className="section-h2 brutus-stage__h2">
              Your AI assistant that never clocks off.
            </h2>
            <p className="landing-body brutus-stage__lede">
              Brutus answers customers, qualifies leads and sends campaigns for
              you, across WhatsApp, SMS, email and the web, in a voice that
              sounds like your brand.
            </p>
          </Beat>

          <Beat range={CTA_IN} className="brutus-stage__cta">
            <ShinyButton href="/brutus">Meet Brutus</ShinyButton>
            <Link href="/live-chat" className="btn-secondary group">
              Talk to us
            </Link>
          </Beat>
          {after ? <After>{after}</After> : null}
        </ContainerSticky>
      </ContainerScroll>
    </section>
  );
}
