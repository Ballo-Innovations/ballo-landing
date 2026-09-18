"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The hero's background band as one travelling line of gradient-filled type.
 *
 * The fill is four coloured orbs drifting behind the glyphs — the look of
 * `gradient-text-fill.tsx`, which is vendored in this repo and which this does
 * NOT use. That component paints its orbs as sibling boxes over the text and
 * relies on `mix-blend-lighten` to hide them: over a white page, lighten keeps
 * white, so the orbs survive only where the dark type is. Nothing clips them
 * to the letters — the page does the clipping.
 *
 * On this navy hero that inverts, and no combination of blend mode, isolation
 * or stacking fixes it: the orbs are lighter than the backdrop everywhere, so
 * they read as four coloured rectangles sitting over the band. Tried lighten,
 * darken on the layer, normal on the orbs, and `isolation: isolate` on the
 * run; the bleed is structural, not a blending accident.
 *
 * So the orbs are painted as radial gradients in the text's own background and
 * clipped with `background-clip: text` (see `.gradient-marquee__run` in
 * cinematic-hero.css). That is the one way the paint is bounded by the glyphs
 * rather than by the page behind them, and it is background-independent.
 *
 * The palette still arrives as the component's comma-separated `colors`
 * string, so the two stay swappable if the band ever moves onto a light
 * surface.
 */

export interface GradientMarqueeProps {
  className?: string;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  /** Travel speed in CSS px per second. */
  speedPxPerSec?: number;
  /** Space between repeats of the line, in px. */
  gapPx?: number;
  /**
   * Where the palette travels to as the band rises, same format as `colors`.
   *
   * The band opens pale behind a hero that is still being read and deepens
   * once it is the thing on the stage; the crossfade between the two is driven
   * by `--band-rich` in the stylesheet, not here.
   */
  deepColors?: string;
  /** Merged into the root — the caller's scroll-linked fade rides here. */
  style?: React.CSSProperties;
  /**
   * Orb palette, as `gradient-text-fill.tsx` takes it: comma-separated CSS
   * colours, four of which are used.
   */
  colors?: string;
}

export function GradientMarquee({
  className,
  text,
  fontSize = 200,
  fontFamily,
  speedPxPerSec = 140,
  gapPx = 40,
  colors = "#3fdbff, #1a3aff, #6186cc, #7c3aed",
  deepColors = "#0b6f96, #101d8c, #2d4a86, #3c1a78",
  style,
}: GradientMarqueeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const runRef = React.useRef<HTMLDivElement>(null);

  // Measured, not computed: one copy's width depends on the face, the size and
  // whether the webfont had landed yet, none of which are known here.
  const [period, setPeriod] = React.useState(0);
  const [copies, setCopies] = React.useState(2);

  // One filled run per word. The orbs are sized as a fraction of the run they
  // are in, so a run the width of the whole sentence would carry four smudges
  // across several thousand pixels; per word, an orb covers its word.
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  const orbs = React.useMemo(() => {
    // `--orb-1` .. `--orb-4` are where the band opens, `--orb-1-deep` .. where
    // it ends up; the stylesheet mixes between them by `--band-rich`.
    const parse = (input: string, suffix: string) => {
      const list = input.split(",").map((c) => c.trim()).filter(Boolean);
      return {
        [`--orb-1${suffix}`]: list[0],
        [`--orb-2${suffix}`]: list[1] ?? list[0],
        [`--orb-3${suffix}`]: list[2] ?? list[0],
        [`--orb-4${suffix}`]: list[3] ?? list[1] ?? list[0],
      };
    };
    return {
      ...parse(colors, ""),
      ...parse(deepColors, "-deep"),
    } as React.CSSProperties;
  }, [colors, deepColors]);

  React.useLayoutEffect(() => {
    const measure = () => {
      const run = runRef.current;
      const root = rootRef.current;
      if (!run || !root) return;
      const w = run.getBoundingClientRect().width + gapPx;
      if (w <= 0) return;
      setPeriod(w);
      setCopies(Math.ceil(root.getBoundingClientRect().width / w) + 1);
    };
    measure();
    // The face arrives after first paint on a cold load, and one copy is a
    // different width once it does.
    void document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [text, fontSize, fontFamily, gapPx]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track || period <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let offset = 0;
    let last = performance.now();
    // Off screen the band is not worth a frame, and the orbs are expensive
    // ones: four blurred, blended layers per copy.
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(track);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible) {
        // Advanced by elapsed time rather than per frame, so a dropped frame
        // costs no distance.
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
    <div
      ref={rootRef}
      className={cn("gradient-marquee", className)}
      style={{
        fontSize: `${fontSize}px`,
        ...(fontFamily ? { fontFamily } : null),
        ...style,
      }}
    >
      <div
        ref={trackRef}
        className="gradient-marquee__track"
        style={{ gap: `${gapPx}px` }}
      >
        {Array.from({ length: copies }, (_, i) => (
          // The ref goes on a wrapper rather than on `GradientText`, which is
          // a `memo`'d function component and forwards none. Measuring the
          // wrapper measures the run inside it.
          <div
            key={i}
            ref={i === 0 ? runRef : undefined}
            className="gradient-marquee__cell"
            // One copy is the sentence; the rest are the same sentence again.
            // A screen reader should hear the band once.
            aria-hidden={i > 0 || undefined}
          >
            {words.map((word, w) => (
              <span key={w} className="gradient-marquee__run" style={orbs}>
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
