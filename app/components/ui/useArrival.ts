"use client";

import * as React from "react";

/**
 * Whether an element has "arrived": it is on screen and actually showing.
 *
 * Being in the viewport is not enough on the Brutus stage, whose sections sit
 * in view at opacity 0 long before they fade in (the same problem
 * SectionTitle solves). So while the element is near the viewport this checks
 * a few times a second: on screen, not `visibility: hidden`, and the opacity
 * of every ancestor multiplied together. It turns true above `show` and back
 * to false once the element is hidden or off screen again, so an entrance
 * keyed to it plays on every arrival.
 */
export function useArrival<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { enabled = true, show = 0.35, hide = 0.05 }: { enabled?: boolean; show?: number; hide?: number } = {},
) {
  const [arrived, setArrived] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const visible = () => {
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.bottom < 0 || r.top > window.innerHeight) return 0;
      let opacity = 1;
      for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.visibility === "hidden" || cs.display === "none") return 0;
        opacity *= parseFloat(cs.opacity) || 0;
        if (opacity < 0.01) return 0;
      }
      return opacity;
    };
    const check = () => {
      const v = visible();
      if (!shown && v > show) {
        shown = true;
        setArrived(true);
      } else if (shown && v < hide) {
        shown = false;
        setArrived(false);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          check();
          timer ??= setInterval(check, 100);
        } else {
          if (timer) clearInterval(timer);
          timer = null;
          if (shown) {
            shown = false;
            setArrived(false);
          }
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [ref, enabled, show, hide]);

  return arrived;
}
