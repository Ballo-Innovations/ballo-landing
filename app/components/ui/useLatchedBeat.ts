"use client";

import * as React from "react";
import type { MotionValue } from "framer-motion";

import { clamp01, type Range } from "@/lib/cinematic";

/**
 * A beat that scroll *triggers* but does not *scrub*.
 *
 * Everything else on the hero's pin is a pure function of scroll progress,
 * which is what makes the timeline readable — but it has one failure mode that
 * a crossfade cannot afford. Stop scrolling halfway through
 * `easeInOut(at(p, TEXT_SWAP))` and the swap stops with you: "What We're
 * About" and "Why Choose BalloAds?" both sit there at half opacity, one legible
 * through the other. There is no scroll position at which that is a frame
 * anyone meant to design.
 *
 * So this beat is scroll-triggered and self-timed. Scroll decides which end it
 * is heading for; its own clock takes it there and will not rest in between.
 * Reversing is allowed — scroll back over the midpoint and it turns around
 * from wherever it is — but the only states it comes to rest in are 0 and 1.
 *
 * The caller owns the ref this writes into, rather than being handed one back.
 * That is not a style choice: `onFrame` is the caller's own `place()`, which
 * has to be able to read the beat, and a returned ref would only be assignable
 * after `place` had already been defined against it. Raw linear progress goes
 * in the ref — easing belongs to the caller, the same as with `at`, so a
 * crossfade and a slide on one beat can still shape themselves differently.
 *
 * @param value Written on every frame the beat moves. 0 to 1, uneased.
 * @param onFrame Called after each write, for the same imperative `place()`
 * that the scroll subscription calls. The beat is not a MotionValue precisely
 * because its callers write styles straight to the DOM.
 */
export function useLatchedBeat(
  progress: MotionValue<number>,
  range: Range,
  value: React.MutableRefObject<number>,
  onFrame: () => void,
  /** Seconds for a full 0 → 1 run. */
  duration = 0.45,
) {
  const target = React.useRef(0);
  const frame = React.useRef<number | null>(null);
  const lastNow = React.useRef(0);
  // Held in a ref so a caller's `place` does not have to be stable to avoid
  // tearing down the subscription on every render.
  const onFrameRef = React.useRef(onFrame);
  onFrameRef.current = onFrame;

  React.useEffect(() => {
    const [from, to] = range;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const stop = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastNow.current) / 1000);
      lastNow.current = now;
      const dir = target.current > value.current ? 1 : -1;
      const next = clamp01(value.current + (dir * dt) / duration);
      const done = dir > 0 ? next >= target.current : next <= target.current;
      value.current = done ? target.current : next;
      onFrameRef.current();
      if (done) {
        stop();
        return;
      }
      frame.current = requestAnimationFrame(step);
    };

    const start = () => {
      if (frame.current !== null) return;
      lastNow.current = performance.now();
      frame.current = requestAnimationFrame(step);
    };

    const settle = (v: number) => {
      target.current = v;
      if (value.current === v) return;
      stop();
      value.current = v;
      onFrameRef.current();
    };

    const place = () => {
      const p = progress.get();
      // Outside the window there is nothing to time: the beat is simply over,
      // or has not begun. This is also what catches a flick that crosses the
      // whole range in one frame, and a page loaded at a scroll position past
      // it — neither should animate a beat the reader never saw.
      if (p <= from || p >= to) {
        settle(p >= to ? 1 : 0);
        return;
      }
      // A dead zone around the midpoint, so a reader idling right on the
      // threshold gets one decision rather than a flutter of them.
      const t = (p - from) / (to - from);
      const next = t > 0.55 ? 1 : t < 0.45 ? 0 : target.current;
      if (next === target.current && value.current === next) return;
      target.current = next;
      if (reduced) settle(next);
      else start();
    };

    place();
    const unsub = progress.on("change", place);
    return () => {
      unsub();
      stop();
    };
    // `range` is a module-level constant at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, range[0], range[1], duration, value]);
}
