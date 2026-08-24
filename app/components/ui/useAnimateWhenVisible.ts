"use client";

import { useEffect, useRef } from "react";

/**
 * Parks infinite decorative CSS animations while their element is off-screen.
 *
 * Returns a ref to attach to the wrapper. The observer writes
 * `data-anim="paused"` straight onto the node (never through state, so a scroll
 * past never triggers a React render), and `[data-anim="paused"]` in
 * utilities.css sets `animation-play-state: paused` on it and its subtree.
 *
 * Matters most for the marquees and `.text-shimmer`: a translating 200vw track
 * keeps a large composited layer alive, and the shimmer animates
 * background-position through `background-clip: text`, which cannot be
 * composited and so repaints the glyphs on every frame — forever, in view or
 * not.
 */
export function useAnimateWhenVisible<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset.anim = entry.isIntersecting ? "running" : "paused";
      },
      { rootMargin: "150px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}
