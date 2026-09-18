"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The hero's background band: one line of glass type, travelling.
 *
 * The line is artwork, not type — `marquee-glass-text.png`, cut and given real
 * alpha by scripts/build-marquee-glass.py. Everything before this tried to
 * build the glass in CSS on live text: orbs behind `background-clip: text`, a
 * gloss, a specular, a bevel from text-shadows. It reached "coloured type with
 * a lit edge" and stopped. The speculars inside a letter, the way the rim
 * gathers light at a corner, the thickness you can see through — those are
 * rendered, and the browser has no way to derive them from a glyph outline.
 *
 * What it costs is that the words are now a picture:
 *
 *   - the line cannot be changed without re-rendering the artwork, so `alt`
 *     carries the words and `TEXT` is duplicated in the image. They have to be
 *     kept in step by hand.
 *   - it cannot be recoloured, only filtered. The deepening as the phone
 *     arrives is a `filter` on the image (see `--band-rich` in the stylesheet)
 *     rather than a palette swap.
 *
 * The travel is unchanged: one transform on a track of repeated copies,
 * advanced by elapsed time so a dropped frame costs no distance.
 */

export interface GlassBandMarqueeProps {
  className?: string;
  /** The words in the artwork. Not rendered — it is the image's `alt`. */
  text: string;
  /** Cap height of the letters, in px. The halo is drawn outside it. */
  capHeightPx?: number;
  /** Travel speed in CSS px per second. */
  speedPxPerSec?: number;
  /** Space between repeats of the line, in px. */
  gapPx?: number;
  /** Merged into the root — the caller's scroll-linked fade and deepening. */
  style?: React.CSSProperties;
}

/** The artwork, and its own proportions. */
const ART = "/Assets/marquee-glass-text.png";
const ART_W = 2166;
const ART_H = 185;
/**
 * How much of the file the letters themselves occupy, the rest being the halo
 * around them. Set by the crop in scripts/build-marquee-glass.py — change it
 * there and this follows.
 *
 * It exists so the caller can ask for a cap height and get one. Sizing the
 * image directly would mean every breakpoint carrying a number that silently
 * depends on how much glow the artwork happens to have around it.
 */
const LETTER_FRACTION = 0.503;

export function GlassBandMarquee({
  className,
  text,
  capHeightPx = 144,
  speedPxPerSec = 140,
  gapPx = 40,
  style,
}: GlassBandMarqueeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  // The artwork is a known size, so one copy's width is arithmetic rather than
  // a measurement — no waiting on layout, and no second pass when a webfont
  // lands, because there is no font involved any more.
  const artH = capHeightPx / LETTER_FRACTION;
  const copyW = (artH * ART_W) / ART_H;
  const period = copyW + gapPx;
  const [copies, setCopies] = React.useState(2);

  React.useLayoutEffect(() => {
    const fit = () => {
      const root = rootRef.current;
      if (!root) return;
      setCopies(Math.ceil(root.getBoundingClientRect().width / period) + 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [period]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track || period <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let offset = 0;
    let last = performance.now();
    // Off screen the band is not worth a frame.
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(track);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible) {
        offset = (offset + speedPxPerSec * dt) % period;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [period, speedPxPerSec]);

  return (
    <div ref={rootRef} className={cn("glass-band", className)} style={style}>
      <div
        ref={trackRef}
        className="glass-band__track"
        style={{ gap: `${gapPx}px` }}
      >
        {Array.from({ length: copies }, (_, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            className="glass-band__line"
            src={ART}
            width={ART_W}
            height={ART_H}
            style={{ height: `${artH}px`, width: `${copyW}px` }}
            // One copy is the sentence; the rest are the same sentence again.
            // A screen reader should hear the band once.
            alt={i === 0 ? text : ""}
            aria-hidden={i > 0 || undefined}
            draggable={false}
            // Decorative and above the fold, so it must not be lazy: the band
            // is on screen from the first paint.
            loading="eager"
          />
        ))}
      </div>
    </div>
  );
}
