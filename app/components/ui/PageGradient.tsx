"use client";

import { useEffect, useRef } from "react";

/**
 * The home page's background gradient, painted on a FIXED viewport-sized layer
 * instead of as one document-tall background on the scrolling <main>.
 *
 * Why: as a background on <main> the gradient was ~1440x7450px. Chrome
 * rasterizes a scrolling layer in tiles as they approach the viewport, and a
 * fast fling outruns the tiler; every tile that is not ready yet gets filled
 * with the page's flat base colour instead. No single base colour can stand in
 * for a ramp that runs #153D87 -> #000000, so the mismatch was visible however
 * the base was tuned.
 *
 * This layer never scrolls, so it is always rastered and there are no tiles to
 * miss. To keep the appearance identical, it renders only the SLICE of the
 * original gradient that is currently on screen: the two endpoint colours are
 * interpolated from the same stops at the same document offsets, and any stop
 * falling inside the visible slice is carried through at its mapped position,
 * so the result is the same ramp travelling at the same rate — not a gradient
 * compressed into each screenful.
 */

// The original stops: offset down <main>, and sRGB colour.
const STOPS: ReadonlyArray<readonly [number, readonly [number, number, number]]> = [
  [0, [21, 61, 135]],    // #153D87
  [0.12, [7, 7, 86]],    // #070756
  [0.34, [5, 4, 58]],    // #05043A
  [0.56, [3, 2, 39]],    // #030227
  [0.78, [1, 1, 19]],    // #010113
  [1, [0, 0, 0]],        // #000000
];

function colorAt(t: number) {
  const c = Math.min(1, Math.max(0, t));
  for (let i = 1; i < STOPS.length; i++) {
    const [pos, col] = STOPS[i];
    if (c <= pos) {
      const [prevPos, prevCol] = STOPS[i - 1];
      const span = pos - prevPos;
      const f = span === 0 ? 0 : (c - prevPos) / span;
      return prevCol.map((v, k) => Math.round(v + (col[k] - v) * f)) as number[];
    }
  }
  return [0, 0, 0];
}

const rgb = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;

function sliceGradient(t0: number, t1: number) {
  const span = t1 - t0;
  if (!(span > 0)) return rgb(colorAt(t0));

  const parts = [`${rgb(colorAt(t0))} 0%`];
  // Carry through any original stop inside the visible slice, so a kink in the
  // ramp lands at exactly the same place it does today.
  for (const [pos, col] of STOPS) {
    if (pos > t0 && pos < t1) {
      parts.push(`${rgb([...col])} ${(((pos - t0) / span) * 100).toFixed(2)}%`);
    }
  }
  parts.push(`${rgb(colorAt(t1))} 100%`);
  return `linear-gradient(180deg, ${parts.join(",")})`;
}

export function PageGradient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    // The gradient is measured against <main>'s box, exactly as the CSS
    // background it replaces was.
    const box = el?.parentElement;
    if (!el || !box) return;

    let frame: number | null = null;

    const paint = () => {
      frame = null;
      const rect = box.getBoundingClientRect();
      if (rect.height <= 0) return;
      const t0 = -rect.top / rect.height;
      const t1 = (-rect.top + window.innerHeight) / rect.height;
      el.style.backgroundImage = sliceGradient(t0, t1);
    };

    // Coalesce to one paint per frame; a fling fires scroll far more often.
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // <main>'s height changes when GSAP pins insert their spacers, and when
    // images finally lay out — both move every stop's document offset.
    const observer = new ResizeObserver(schedule);
    observer.observe(box);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, []);

  return <div ref={ref} className="page-gradient" aria-hidden="true" />;
}
