"use client";

import * as React from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Lenis, running for the whole page.
 *
 * Lenis does not fake the scroll position — it intercepts wheel and touch input
 * and eases the REAL `window.scrollY` toward the target. That is the property
 * everything else here depends on: `useScroll`, the hero's pin, the Why
 * section's sticky track and every `getBoundingClientRect` keep working
 * untouched, because as far as the document is concerned it is just being
 * scrolled.
 *
 * It also means nothing else may write the scroll position directly while this
 * is running — two things easing `scrollY` on separate clocks fight, and the
 * visible result is a stutter. Anything that needs to move the page should go
 * through `getLenis()?.scrollTo(...)` (see WhyScrollSection's card snap).
 */

let instance: Lenis | null = null;

/** The running instance, or null under reduced motion / before mount. */
export function getLenis() {
  return instance;
}

export function SmoothScroll() {
  React.useEffect(() => {
    // Smoothing scroll is exactly the kind of motion this preference is about,
    // and the page is built to work without it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Close to the library's own defaults. Deliberately restrained: this
      // page's hero pins for 250vh and the Why section for another 375vh, and
      // a long, floaty easing on top of a scrubbed pin reads as lag rather
      // than as smoothness.
      duration: 0.9,
      // Touch devices already have inertial scrolling from the OS; layering a
      // second easing on top of it is what makes smooth-scroll libraries feel
      // broken on phones.
      syncTouch: false,
    });
    instance = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
