"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";

import {
  ContainerScroll,
  ContainerSticky,
  useContainerScrollContext,
} from "../ui/AnimatedVideoOnScroll";
import { ShinyButton } from "../ui/ShinyButton";
import { useAnimateWhenVisible } from "../ui/useAnimateWhenVisible";
import { at, easeOut } from "@/lib/cinematic";
import { StageRowProgress } from "../ui/stageRowProgress";
import { SectionTitle } from "../ui/SectionTitle";

/**
 * Brutus on the home page (ADR 0016).
 *
 * The film no longer opens out of a pill on a stage of its own. The hero's
 * phone carries on into it: once the last "Why Choose" card has had its dwell
 * the device returns to the centre, turns to landscape and plays the film on
 * its own screen, and this copy rises in underneath it — all on the hero's pin
 * (see `HeroSideExit`). This module supplies the two pieces that pin needs,
 * `BrutusStageCopy` and `BRUTUS_FILM`, and keeps the stage that follows it:
 * Who, then "Backed by" and "Trusted by".
 *
 * The class names are the old stage's, so the shared copy styling still
 * applies wherever it is rendered.
 */
export function BrutusStageCopy() {
  return (
    <>
      <div className="brutus-stage__copy">
        <span className="section-eyebrow">
          <Sparkles size={13} aria-hidden="true" />
          Meet Brutus
        </span>
        <SectionTitle
          className="section-h2 brutus-stage__h2"
          text="Your AI assistant that never clocks off."
        />
        <p className="landing-body brutus-stage__lede">
          Brutus answers customers, qualifies leads and sends campaigns for
          you, across WhatsApp, SMS, email and the web, in a voice that sounds
          like your brand.
        </p>
      </div>
      <div className="brutus-stage__cta">
        <ShinyButton href="/brutus">Meet Brutus</ShinyButton>
        <Link href="/live-chat" className="btn-secondary group">
          Talk to us
        </Link>
      </div>
    </>
  );
}

/**
 * The demo film, self-hosted rather than pointed at `cdn.21st.dev`, and
 * re-encoded to 1152 wide with no audio track (it only ever plays muted).
 */
export const BRUTUS_FILM = {
  src: "/brutus/demo.mp4",
  poster: "/brutus/demo-poster.jpg",
};

/*
 * ── The stage's timeline ────────────────────────────────────────────────
 *
 * Ranges are stated in vh of scroll and divided by the track's length. The
 * track starts as the section's top enters the bottom of the screen
 * (`offset` below), and the section is pulled up a whole viewport over the end
 * of the hero's pin (`.brutus-home` in home.css), so the stage pins at vh 100
 * — the moment the hero's pin releases, with its stage already empty.
 */
// Was 440vh with the film's 123vh at the front (ADR 0014); the film moved to
// the hero's pin and every beat below moved up by that much.
const TRACK_VH = 317;
const vh = (a: number, b: number): [number, number] => [a / TRACK_VH, b / TRACK_VH];

/**
 * Where Who comes in: just before the stage pins, so it arrives as the hero's
 * Brutus act finishes leaving rather than onto an empty screen.
 */
export const AFTER_IN: [number, number] = vh(92, 110);
/**
 * The hold (ADR 0015): Who and "Backed by" share the screen while the scroll
 * turns Who's curved row one full lap; only then does it all leave, the way
 * Who came in.
 */
export const ROW_TURN: [number, number] = vh(117, 207);
export const AFTER_OUT: [number, number] = vh(207, 262);
/** Then "Backed by" fades in alone, high on the stage (ADR 0014). */
export const THEN_IN: [number, number] = vh(257, 277);

function After({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useContainerScrollContext();
  const ref = React.useRef<HTMLDivElement>(null);
  const rowProgress = useTransform(scrollYProgress, (p) => at(p, ROW_TURN));
  // One number, `--after-t` (0→1 over AFTER_IN); home.css decides what each
  // piece does with it: the copy fades, the carousel rises from below.
  const place = React.useCallback((p: number) => {
    const el = ref.current;
    if (!el) return;
    const t = at(p, AFTER_IN);
    const out = at(p, AFTER_OUT);
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
    // In order, without crossing: a card comes from the side of the screen
    // it sits on, the cards nearest the centre first, each from the same
    // distance. A later (outer) card is never further along than an earlier
    // (inner) one, so their paths never overlap. Out reverses it.
    const cards = Array.from(
      el.querySelectorAll<HTMLElement>('.who-curved__band [class*="tgh-t-"]'),
    );
    const mid = window.innerWidth / 2;
    const placed = cards.map((card) => {
      const r = card.getBoundingClientRect();
      const tx = parseFloat(card.style.translate) || 0;
      return { card, x: r.left + r.width / 2 - tx, visible: r.width > 0 };
    });
    const ranked = [...placed].sort((p1, p2) => Math.abs(p1.x - mid) - Math.abs(p2.x - mid));
    const D = window.innerWidth * 1.1;
    ranked.forEach(({ card, x }, rank) => {
      const dir = x < mid ? -1 : 1;
      const a = easeOut(Math.min(1, Math.max(0, (t - rank * 0.06) * 1.4)));
      const o = Math.min(1, Math.max(0, (out - (ranked.length - 1 - rank) * 0.06) * 1.4));
      const k = 1 - a + o * o * (3 - 2 * o);
      card.style.translate = k > 0.001 ? `${(dir * D * k).toFixed(1)}px 0` : "";
    });
    pieces.forEach((piece, i) => {
      const sp = [1.7, 1.45, 1.25, 1.05][Math.min(i, 3)];
      const a = easeOut(Math.min(1, Math.max(0, (t - i * 0.05) * sp)));
      const o = Math.min(1, Math.max(0, (out - (pieces.length - 1 - i) * 0.05) * sp));
      const x = dist * (1 - a) + dist * o * o * (3 - 2 * o);
      piece.style.position = "relative";
      piece.style.left = x > 0.5 ? `${x.toFixed(1)}px` : "";
    });
    el.style.visibility = t > 0 && out < 1 ? "visible" : "hidden";
    el.style.pointerEvents = t > 0.6 && out < 0.2 ? "auto" : "none";
  }, []);
  useMotionValueEvent(scrollYProgress, "change", place);
  React.useEffect(() => place(scrollYProgress.get()), [place, scrollYProgress]);
  return (
    <div
      ref={ref}
      className="brutus-stage__after"
      style={{ visibility: "hidden" }}
    >
      <StageRowProgress.Provider value={rowProgress}>
        {children}
      </StageRowProgress.Provider>
    </div>
  );
}

/** "Backed by" (ADR 0014): fades in alone after Who has left. */
function Then({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useContainerScrollContext();
  const t = useTransform(scrollYProgress, (p) => at(p, THEN_IN));
  const scale = useTransform(t, (v) => 0.96 + 0.04 * easeOut(v));
  const pointerEvents = useTransform(t, (v) => (v > 0.6 ? "auto" : "none"));
  return (
    <motion.div
      className="brutus-stage__after brutus-stage__then"
      style={{ opacity: t, scale, pointerEvents }}
    >
      {children}
    </motion.div>
  );
}

export function BrutusSection({
  after,
  then,
}: { after?: React.ReactNode; then?: React.ReactNode } = {}) {
  const animRef = useAnimateWhenVisible<HTMLElement>();

  return (
    <section ref={animRef} className="brutus-home">
      <ContainerScroll
        className="brutus-stage-track"
        offset={["start end", "end end"]}
      >
        <ContainerSticky className="brutus-stage">
          {after ? <After>{after}</After> : null}
          {then ? <Then>{then}</Then> : null}
        </ContainerSticky>
      </ContainerScroll>
    </section>
  );
}
