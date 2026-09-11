"use client";

import * as React from "react";

import { PHONE_CONTENT } from "./HeroSideExit";
import { GRID_FROM } from "./HeroMarquee";

/**
 * The lattice of boxes, carried down the rest of the page.
 *
 * The hero's band builds it out of its own dust once the last feature card has
 * been read (`#grid` in `HeroMarquee`) — but that band lives on the pin, inside
 * a stage that clips and then scrolls away, so whatever it builds leaves with
 * it. This is the same lattice as a fixed layer behind everything, faded in on
 * the same threshold: the particles form it, this keeps it.
 *
 * Not particles, because there is nothing left for particles to do here. The
 * dust earns its cost while it is spelling words and answering a cursor; a
 * static background is a paint, and one repeating tile is the whole of it.
 * `PAGE_DOT_PITCH` and the box size are matched to the field's own so the
 * handover reads as these boxes continuing rather than as a swap.
 */

/**
 * Pitch in CSS px, on screen.
 *
 * The field's own `GRID_STEP` is stated as this divided by the 1.3 the pin has
 * scaled the band to by then, so the two lattices have the same spacing at the
 * moment one takes over from the other.
 */
export const PAGE_DOT_PITCH = 22;

/** Where the pin's own lattice forms, in whole-track progress. */
const ON_AT = PHONE_CONTENT[0] + GRID_FROM * (PHONE_CONTENT[1] - PHONE_CONTENT[0]);

export function PageDots() {
  const [on, setOn] = React.useState(false);

  React.useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".cinematic-hero");
    // No hero on this page: there is no handover to wait for, and the lattice
    // is simply the background.
    if (!hero) {
      setOn(true);
      return;
    }

    const read = () => {
      const length = hero.offsetHeight - window.innerHeight;
      if (length <= 0) return;
      const p = (window.scrollY - hero.offsetTop) / length;
      const next = p >= ON_AT;
      setOn((prev) => (prev === next ? prev : next));
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  return <div className={on ? "page-dots page-dots--on" : "page-dots"} aria-hidden="true" />;
}
