"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { HomeLogoItem } from "@/app/HomeClient";

/**
 * "Backed by", as one partner at a time.
 *
 * The logos were a static row that said nothing about who any of them were: a
 * reader either recognised a mark or did not. Here one partner is always lit,
 * and what it is to BalloAds is printed in place of its logo — the mark slides
 * up and out of its cell and the name and role come up from under it — so the
 * marks become legible as names without printing a caption under every one of
 * them.
 *
 * The swap is in the cell, not in a headline beside the rail. It used to be
 * both: a large cycling name sat next to the rail while the marks only lit up.
 * That meant the section named the same partner twice at the same moment, and
 * the large copy had to be sized to the longest name the CMS might ever hold
 * so a swap could not reflow the page. Naming each mark on the mark drops the
 * duplicate and the sizing hack with it, and the label above is now fixed copy.
 *
 * The cycle is the baseline and the pointer is the override: hovering the band
 * stops the advance and reveals whichever mark is under the cursor, and
 * leaving it hands the section back to the cycle. That ordering is the whole
 * reason this is not a hover effect — most of this page's traffic is touch,
 * where a hover-only reveal means the roles are never shown at all.
 */

/** How long each partner holds the light. */
const DWELL_MS = 2800;

export function BackedBy({
  logos,
  eyebrow = "Backed by",
  headline = "The networks, platforms and institutions behind BalloAds.",
}: {
  logos: HomeLogoItem[];
  eyebrow?: string;
  headline?: string;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(0);
  /** Set while the pointer owns the band; suspends the cycle. */
  const [pinned, setPinned] = React.useState(false);
  const [onScreen, setOnScreen] = React.useState(false);
  const bandRef = React.useRef<HTMLDivElement>(null);

  const count = logos.length;

  // Only run the cycle when it can actually be seen, and never against the
  // reader: a pointer in the band pins it, and reduced motion stops it
  // outright (the first mark stays revealed, and hover still moves the light).
  const cycling = onScreen && !pinned && !reduced && count > 1;

  React.useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!cycling) return;
    const id = setInterval(() => setActive((i) => (i + 1) % count), DWELL_MS);
    return () => clearInterval(id);
  }, [cycling, count]);

  // Keep the active index in range if the CMS list shrinks under it.
  React.useEffect(() => {
    if (active >= count) setActive(0);
  }, [active, count]);

  if (count === 0) return null;

  // The caption's rise is the one piece that animates per swap. Under reduced
  // motion it is a plain crossfade — the cell still swaps, it just does not
  // travel.
  const captionMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { y: 14, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -10, opacity: 0 },
      };

  return (
    <div className="backers">
      <div className="backers__label">
        <p className="backers__eyebrow">{eyebrow}</p>
        <p className="backers__headline">{headline}</p>
      </div>

      {/* The band. `onMouseLeave` hands the section back to the cycle rather
          than leaving the reveal parked wherever the pointer left it. */}
      <div
        ref={bandRef}
        className="backers__band"
        onMouseEnter={() => setPinned(true)}
        onMouseLeave={() => setPinned(false)}
      >
        <ul className="backers__items">
          {logos.map((logo, i) => {
            const isActive = i === active;
            return (
              <li
                key={`${logo.alt}-${i}`}
                className="backers__item"
                data-active={isActive ? "" : undefined}
                /* Drives the entrance stagger; see `.backers__cell` in
                   home.css. */
                style={{ ["--i" as string]: i } as React.CSSProperties}
                onMouseEnter={() => setActive(i)}
              >
                <div className="backers__cell">
                  {/* The mark. It leaves the cell upwards as the caption
                      arrives, so the two read as one movement rather than as a
                      crossfade in place. */}
                  <span className="backers__logo" aria-hidden="true">
                    {logo.src ? (
                      <Image
                        src={logo.src}
                        alt=""
                        width={224}
                        height={112}
                        loading="lazy"
                        sizes="160px"
                        /* A fixed box with object-contain, not a fixed height.
                           These marks have wildly different aspect ratios —
                           MTN's is a 2:1 wordmark, Airtel's and ZICTA's are
                           square — and sizing them all to one height makes the
                           wide ones read as twice the size of the square ones.
                           Fitting each inside the same box normalises them
                           optically without per-brand tuning, which also holds
                           for whatever the CMS uploads. */
                        className="max-h-full w-auto max-w-full object-contain"
                      />
                    ) : (
                      <span className="backers__wordmark">{logo.alt}</span>
                    )}
                  </span>

                  {/* The caption is mounted only while its cell is the active
                      one, so `AnimatePresence` has something to animate out.
                      The name and role are in the document for every partner
                      regardless — see the visually-hidden copy below — so a
                      screen reader reads the full list once, in order, rather
                      than re-announcing whichever cell the cycle has reached. */}
                  <div className="backers__caption" aria-hidden="true">
                    <AnimatePresence initial={false}>
                      {isActive ? (
                        <motion.p
                          key="caption"
                          className="backers__caption-line"
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          {...captionMotion}
                        >
                          <span className="backers__name">{logo.alt}</span>
                          {logo.role ? (
                            <span className="backers__role">{logo.role}</span>
                          ) : null}
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>

                <span className="sr-only">
                  {logo.role ? `${logo.alt} — ${logo.role}` : logo.alt}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
