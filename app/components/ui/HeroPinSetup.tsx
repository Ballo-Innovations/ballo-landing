"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pins the HERO in place while the next section (.about-cover — the opaque,
 * z-50 "POWERFUL AND VERSATILE" / "What We're About" panel) scrolls up and
 * covers it. pinSpacing:false is the key: no spacer is inserted, so the next
 * section rises INTO the held hero's space and hides it, instead of being
 * pushed below. Once the hero is fully covered (~one viewport of scroll) it
 * unpins and normal flow resumes into "Why Choose BalloAds?".
 *
 * The hero lives inline in page.tsx, so — like ParallaxSetup — this drives it
 * by selector rather than wrapping the markup.
 */
export function HeroPinSetup() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = document.querySelector<HTMLElement>(".prlx-hero-trigger");
      if (!hero) return;

      ScrollTrigger.create({
        trigger: hero,
        start: "top top", // pin as soon as the hero top reaches the viewport top
        end: "+=100%", // hold ~one viewport — time for the next section to cover it
        pin: true,
        pinSpacing: false, // let the next section scroll OVER the held hero
        anticipatePin: 1,
      });

      // Recompute against final heights once fonts/images settle.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);

      return () => window.removeEventListener("load", refresh);
    });

    return () => mm.revert();
  }, []);

  return null;
}
