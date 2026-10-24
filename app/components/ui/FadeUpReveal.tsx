"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";

interface FadeUpRevealProps {
  children: ReactNode;
  delay?: number;
  yOffset?: number;
  duration?: number;
  className?: string;
  /**
   * Keep the observer alive so the reveal plays in both directions: the
   * element returns to its `out` state once it leaves the viewport and
   * animates in again on the way back. Default is the cheaper one-shot
   * reveal (observer disconnected on first hit).
   */
  replay?: boolean;
}

/**
 * Scroll-in reveal: opacity + translateY, driven entirely by CSS.
 *
 * One IntersectionObserver per instance, disconnected the moment it fires, and
 * a single class toggle — no animation library, no re-render, and nothing left
 * running after the reveal. The transform/opacity pair is compositor-only, so
 * a reveal never costs layout or paint.
 *
 * Elements already inside the viewport on mount are marked revealed on the
 * first effect (`data-fur="in"` is written straight to the node, not to state),
 * so above-the-fold content settles immediately instead of waiting on scroll.
 */
export function FadeUpReveal({
  children,
  delay = 0,
  yOffset = 100,
  duration = 1.05,
  className = "",
  replay = false,
}: FadeUpRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Watch the untransformed parent, not the node itself. The node's `out`
    // state can park it a long way off-screen (the Who grid throws tiles 22vw
    // sideways and 30vh down), and a transformed box reports that displaced
    // rect — so observing the node meant it never intersected and never
    // revealed. The parent keeps its real layout position.
    const target = node.parentElement ?? node;

    const rect = target.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      node.dataset.fur = "in";
      if (!replay) return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.fur = "in";
          // One-shot: nothing left to watch once it has played.
          if (!replay) observer.disconnect();
          return;
        }
        // Replay mode only: park it back at the start so scrolling up (or
        // down past it and back) plays the entrance again, in reverse.
        node.dataset.fur = "out";
      },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [replay]);

  return (
    <div
      ref={ref}
      data-fur="out"
      className={`fade-up-reveal ${className}`}
      style={
        {
          "--fur-y": `${yOffset}px`,
          "--fur-duration": `${duration}s`,
          "--fur-delay": `${delay}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
