"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Each entry: the layer element, its scroll trigger section, and parallax speed
const LAYERS = [
  { sel: ".prlx-hero-1",  trigger: ".prlx-hero-trigger",  yPercent: 18 },
  { sel: ".prlx-hero-2",  trigger: ".prlx-hero-trigger",  yPercent: 36 },
  { sel: ".prlx-about-1", trigger: ".prlx-about-trigger", yPercent: 24 },
  { sel: ".prlx-testi-1", trigger: ".prlx-testi-trigger", yPercent: 16 },
] as const;

export function ParallaxSetup() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      LAYERS.forEach(({ sel, trigger, yPercent }) => {
        const el      = document.querySelector<Element>(sel);
        const section = document.querySelector<Element>(trigger);
        if (!el || !section) return;

        gsap.to(el, {
          yPercent,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => {}; // gsap.matchMedia handles cleanup on revert
    });

    return () => mm.revert();
  }, []);

  return null;
}
