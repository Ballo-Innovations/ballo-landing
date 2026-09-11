"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion, useTransform } from "framer-motion";

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
 * bottom of the screen, with the hero's "Why Choose BalloAds?" copy still
 * filling most of it.
 *
 * Measured: that copy's last pixel leaves the viewport at about progress
 * 0.47. So the film holds as a capsule until 0.5 and only then begins to
 * widen, which is what keeps the two scenes from animating over each other.
 */
const FILM_OPEN_FROM = 0.5;
/** Progress at which the film has finished opening to full bleed. */
const FILM_OPEN = 0.78;

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
const COPY_IN: [number, number] = [0.79, 0.9];
const CTA_IN: [number, number] = [0.87, 0.97];

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

export function BrutusSection() {
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
        </ContainerSticky>
      </ContainerScroll>
    </section>
  );
}
