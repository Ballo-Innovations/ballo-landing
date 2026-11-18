"use client";

import * as React from "react";

import { isFeatureEnabled } from "@/lib/featureFlags";
import { TextReveal } from "./TextReveal";

/**
 * A section title in the same treatment as the hero's "Why Choose BalloAds?":
 * the heaviest weight, the silver ramp, and the characters rising into place
 * as the title arrives. Behind `sectionTitles`; with the flag off it renders
 * the plain heading it replaced, classes and all.
 *
 * When it plays. The titles live in very different places: on the hero's pin
 * (Brutus), on the Brutus stage that fades sections in and out while it is
 * pinned (Who, Trusted by), and in ordinary scrolling sections that fade up
 * (testimonials, the closing CTA). Being in the viewport is not enough for
 * the pinned ones, which sit in view at opacity 0 long before they show. So
 * while the title is near the viewport it checks, a few times a second,
 * whether it is actually visible: on screen, not `visibility: hidden`, and
 * the opacity of every ancestor multiplied together above 0.6. It plays then,
 * and re-arms once it is hidden or off screen again, so it plays on every
 * arrival, like the hero's copy.
 */
export function SectionTitle({
  text,
  className,
  as = "h2",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const [on, setOn] = React.useState(false);
  // Read after mount: the flag honours a localStorage override, which only
  // exists client side, so the server and the first render must agree.
  // The flag also lifts the home page's paragraphs to match the bigger titles
  // (a step larger: text-reveal.css), through an attribute on <html>
  // because those paragraphs are spread over several components.
  React.useEffect(() => {
    const enabled = isFeatureEnabled("sectionTitles");
    setOn(enabled);
    if (enabled) document.documentElement.dataset.sectionTitles = "on";
  }, []);

  const ref = React.useRef<HTMLElement>(null);
  const [play, setPlay] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
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
        if (opacity < 0.05) return 0;
      }
      return opacity;
    };
    const check = () => {
      const v = visible();
      if (!shown && v > 0.6) {
        shown = true;
        setPlay(true);
      } else if (shown && v < 0.05) {
        shown = false;
        setPlay(false);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          check();
          timer ??= setInterval(check, 120);
        } else {
          if (timer) clearInterval(timer);
          timer = null;
          if (shown) {
            shown = false;
            setPlay(false);
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
  }, [on]);

  if (!on) {
    const Tag = as;
    return <Tag className={className}>{text}</Tag>;
  }
  return (
    <TextReveal
      as={as}
      elRef={ref}
      play={play}
      text={text}
      className={[className, "section-title-fx text-gradient-silver"]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
