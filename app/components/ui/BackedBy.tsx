"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { DrawLineText } from "./DrawLineText";
import type { HomeLogoItem } from "@/app/HomeClient";

/**
 * "Backed by": the marks, and what each one is to BalloAds on hover.
 *
 * The logos were a static row that said nothing about who any of them were: a
 * reader either recognised a mark or did not. Hovering a cell prints what that
 * partner is in place of its logo — the mark slides up and out and the name
 * and role come up from under it — so the marks become legible as names
 * without a caption printed under every one of them.
 *
 * The swap is in the cell, not in a headline beside the rail. It used to be
 * both: a large cycling name sat next to the rail while the marks only lit up.
 * That meant the section named the same partner twice at the same moment, and
 * the large copy had to be sized to the longest name the CMS might ever hold
 * so a swap could not reflow the page. Naming each mark on the mark drops the
 * duplicate and the sizing hack with it, and the label above is now just the
 * "Backed by" pill — the headline that sat under it named nothing the pill
 * and the marks do not already say.
 *
 * The resting state is every mark visible, and the pointer is the only thing
 * that changes it. This used to cycle on a timer, lighting one partner at a
 * time for 2.8s whenever the band was on screen — which meant one of the four
 * marks was always missing from a row whose job is to show all four, and the
 * section moved on its own while the reader was elsewhere on it.
 *
 * What the cycle bought was the roles on touch, where there is no hover. That
 * is now carried by the visually-hidden list in each cell instead: a screen
 * reader still gets every name and role, in order. A sighted touch reader sees
 * the marks and not the roles, which is the trade this shape accepts.
 */

export function BackedBy({
  logos,
  eyebrow = "Backed by",
}: {
  logos: HomeLogoItem[];
  eyebrow?: string;
}) {
  const reduced = useReducedMotion();
  /** The cell under the pointer, or `null` — the resting state, all marks up. */
  const [active, setActive] = React.useState<number | null>(null);

  const count = logos.length;

  if (count === 0) return null;

  /**
   * The wrapper only takes the caption OUT. Its entrance is the draw, which
   * runs in CSS inside `DrawLineText` — fading or lifting the box at the same
   * time would drag the strokes along with it and wash them out while they are
   * still being drawn.
   *
   * Leaving still has to be a fade: a letter that has finished drawing reads
   * as written, and running the draw backwards reads as an erase, which is a
   * second effect nobody asked for. Fast, and undelayed, so moving between
   * cells never has two partners named at once.
   */
  const captionExit = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: -8 };

  return (
    <div className="backers">
      <div className="backers__label">
        <p className="backers__eyebrow">{eyebrow}</p>
      </div>

      {/* `onMouseLeave` is on the band, not on each cell: leaving one cell for
          the next must not clear the reveal between them, and leaving the band
          altogether must return it to all-marks-up rather than park the
          caption wherever the pointer left it. */}
      <div className="backers__band" onMouseLeave={() => setActive(null)}>
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
                      than depending on a pointer it does not have. */}
                  <div className="backers__caption" aria-hidden="true">
                    <AnimatePresence initial={false}>
                      {isActive ? (
                        <motion.p
                          key="caption"
                          className="backers__caption-line"
                          initial={false}
                          exit={{ ...captionExit, transition: { duration: 0.18 } }}
                        >
                          {/* Drawn on, letter by letter, rather than set. The
                              wrapper no longer fades the caption in — the draw
                              IS the entrance, and a fade over the top of it
                              just greys the strokes while they run. It still
                              owns the exit, which has to be a fade: there is
                              no un-drawing a letter that reads as written.

                              The delays are what keep the two lines from
                              arriving as one block: the name waits for the
                              mark to clear the cell, and the role follows it
                              rather than racing it. */}
                          <DrawLineText
                            className="backers__name"
                            text={logo.alt}
                            delay="0.16s"
                          />
                          {logo.role ? (
                            <DrawLineText
                              className="backers__role"
                              text={logo.role}
                              delay="0.34s"
                            />
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
