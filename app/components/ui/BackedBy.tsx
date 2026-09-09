"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { HomeLogoItem } from "@/app/HomeClient";

/**
 * "Backed by", as one partner at a time.
 *
 * The logos were a static row that said nothing about who any of them were: a
 * reader either recognised a mark or did not. Here one partner is always lit —
 * its name and what it is to BalloAds read at full size beside the rail — and
 * the light travels along the row on its own, so the marks become legible as
 * names without printing a caption under every one of them.
 *
 * This replaces `BackedByHover`, which did the same naming on hover alone. Two
 * things were wrong with that:
 *
 *   - with no pointer (touch, which is most of this page's traffic) the label
 *     never changed, so the section read "Backed by our partners" forever —
 *     which says nothing, and left the crossfade it was built around unused;
 *   - the roles were not in the document at all, so the only thing a partner
 *     row actually communicated was its logo.
 *
 * So the cycle is the baseline and the pointer is the override: hovering the
 * rail stops the advance and lights whichever mark is under the cursor, and
 * leaving it hands the section back to the cycle.
 *
 * The light is on the mark itself rather than in a panel behind it — see
 * `LogoGlow` below for how, and why it is a blurred copy rather than a filter
 * on the logo.
 */

/** How long each partner holds the light. */
const DWELL_MS = 2800;

/**
 * The longest string in a set, used to reserve the label's box.
 *
 * The live label is absolutely positioned so the two halves of a swap can
 * overlap, which takes it out of flow — so an invisible copy holds the box
 * open behind it. Sized to the longest string it will ever hold rather than to
 * the current one: reserving only the current width lets a longer name reflow
 * the section mid-cycle, and backer names come from the CMS, so the longest is
 * not knowable from here.
 */
function longest(candidates: string[]) {
  return candidates.reduce((a, b) => (b.length > a.length ? b : a), "");
}

/**
 * A mark, and the light coming off it.
 *
 * The glow is a second copy of the same logo sitting behind the first, blurred
 * and pushed a little wider. Two things fall out of doing it that way, and both
 * are the reason it is not a `filter: drop-shadow` on the logo itself:
 *
 *   - the halo is the logo's OWN colours, so Airtel glows red, MTN yellow and
 *     Meta blue with nothing declaring any of that. A drop-shadow takes one
 *     fixed colour, which would mean either a mismatched halo on every mark or
 *     a per-brand colour to maintain here — and no way at all to pick one for
 *     whatever the CMS uploads next;
 *   - only `opacity` animates. The blur is rasterised once and never changes,
 *     so lighting a mark is a composited fade, where transitioning a filter
 *     would repaint the element on every frame of it.
 *
 * `next/image` serves both copies from one request, so the second costs no
 * extra bytes.
 */
function LogoGlow({ src, alt }: { src: NonNullable<HomeLogoItem["src"]>; alt: string }) {
  return (
    <span className="backers__logo">
      <span className="backers__logo-glow" aria-hidden="true">
        <Image
          src={src}
          alt=""
          width={224}
          height={112}
          loading="lazy"
          sizes="160px"
          className="max-h-full w-auto max-w-full object-contain"
        />
      </span>
      <Image
        src={src}
        alt={alt}
        width={224}
        height={112}
        loading="lazy"
        sizes="160px"
        /* A fixed box with object-contain, not a fixed height. These marks
           have wildly different aspect ratios — MTN's is a 2:1 wordmark,
           Airtel's and ZICTA's are square — and sizing them all to one height
           makes the wide ones read as twice the size of the square ones.
           Fitting each inside the same box normalises them optically without
           per-brand tuning, which also holds for whatever the CMS uploads. */
        className="relative max-h-full w-auto max-w-full object-contain"
      />
    </span>
  );
}

export function BackedBy({
  logos,
  eyebrow = "Backed by",
}: {
  logos: HomeLogoItem[];
  eyebrow?: string;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(0);
  /** Set while the pointer owns the rail; suspends the cycle. */
  const [pinned, setPinned] = React.useState(false);
  const [onScreen, setOnScreen] = React.useState(false);
  const railRef = React.useRef<HTMLDivElement>(null);

  const count = logos.length;

  // Only run the cycle when it can actually be seen, and never against the
  // reader: a pointer in the rail pins it, and reduced motion stops it
  // outright (the first mark stays lit, and hover still moves the light).
  const cycling = onScreen && !pinned && !reduced && count > 1;

  React.useEffect(() => {
    const el = railRef.current;
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

  const current = logos[Math.min(active, count - 1)];
  const nameSizer = longest(logos.map((l) => l.alt));
  const roleSizer = longest(logos.map((l) => l.role ?? ""));

  const swapMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { y: 18, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -18, opacity: 0 },
      };

  return (
    <div className="backers">
      <div className="backers__label">
        <p className="backers__eyebrow">{eyebrow}</p>

        <div className="backers__swap">
          {/* Reserves the box the absolutely positioned live label vacates. */}
          <p className="backers__line backers__line--sizer" aria-hidden="true">
            <span className="backers__name">{nameSizer}</span>
            {roleSizer ? <span className="backers__role">{roleSizer}</span> : null}
          </p>

          {/* Decorative: every partner's name and role is already in the rail
              below, on the mark itself, so announcing this as well would read
              the list twice — and re-announce it every few seconds as the
              cycle advances. */}
          <div className="backers__live" aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={current.alt}
                className="backers__line"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                {...swapMotion}
              >
                <span className="backers__name">{current.alt}</span>
                {current.role ? (
                  <span className="backers__role">{current.role}</span>
                ) : null}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* The rail. `onMouseLeave` hands the section back to the cycle rather
          than leaving the light parked wherever the pointer left it. */}
      <div
        ref={railRef}
        className="backers__rail"
        onMouseEnter={() => setPinned(true)}
        onMouseLeave={() => setPinned(false)}
      >
        <ul className="backers__items">
          {logos.map((logo, i) => (
            <li
              key={`${logo.alt}-${i}`}
              className="backers__item"
              data-active={i === active ? "" : undefined}
              /* Drives the entrance stagger; see `.backers__logo` in
                 home.css. */
              style={{ ["--i" as string]: i } as React.CSSProperties}
              onMouseEnter={() => setActive(i)}
            >
              {logo.src ? (
                <LogoGlow src={logo.src} alt={logo.alt} />
              ) : (
                <span className="backers__wordmark">{logo.alt}</span>
              )}
              {/* The role reaches a screen reader here, on the mark it belongs
                  to, rather than only through the visual highlight. */}
              {logo.role ? <span className="sr-only">{logo.role}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
