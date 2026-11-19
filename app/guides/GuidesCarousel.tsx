"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

import { flightFrames, promote, sameBox, tourSlot, type Box } from "@/lib/guidesCarousel";
import { guides, type Guide } from "./guidesContent";

/** How long a guide holds the big card before the tour moves on. */
const TOUR_MS = 5000;
/** How long a card takes to fly between a tile and the big card. */
const FLIGHT_MS = 620;
const FLIGHT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const WatchDemo = ({ className = "" }: { className?: string }) => (
  <span className={`guides-watch ${className}`.trim()}>
    Watch Demo
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const box = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

/**
 * The /guides hero: one guide in the big card on the left, the rest as tiles
 * on the right. Choosing a tile flies it into the big card while the guide it
 * replaces flies out to the slot it just left.
 *
 * The flight is a FLIP: the two artworks are cloned into a fixed overlay, the
 * real ones are hidden for the duration, and the clones are animated from
 * where the artwork used to be to where it now is. Measuring real elements
 * (rather than animating the cards themselves) is what keeps the layout
 * authoritative, so the cards land on exactly the pixels CSS gave them at any
 * viewport width.
 */
export default function GuidesCarousel() {
  const [order, setOrder] = React.useState<Guide[]>(guides);
  const [paused, setPaused] = React.useState(false);
  const [tookOver, setTookOver] = React.useState(false);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const bigArtRef = React.useRef<HTMLDivElement>(null);
  const slotArtRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  /** Rects captured just before a swap, keyed by the slot that was promoted. */
  const pendingRef = React.useRef<{ slot: number; big: Box; tile: Box } | null>(null);
  const flightsRef = React.useRef<Animation[]>([]);
  /** How far the auto-tour has walked; see the tour effect below. */
  const tickRef = React.useRef(0);

  const active = order[0];
  const slots = order.slice(1);

  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const select = React.useCallback((slot: number, byHand: boolean) => {
    if (byHand) setTookOver(true);
    const bigArt = bigArtRef.current;
    const tileArt = slotArtRefs.current[slot];
    // Only worth measuring when both are on screen and motion is wanted.
    pendingRef.current =
      bigArt && tileArt && !reducedMotion()
        ? { slot, big: box(bigArt), tile: box(tileArt) }
        : null;
    setOrder((current) => promote(current, slot));
  }, []);

  // Auto-tour until the visitor takes over, and never while they are reading a
  // card (pointer over the stage or keyboard focus inside it).
  React.useEffect(() => {
    if (tookOver || paused || reducedMotion()) return;
    const slotCount = guides.length - 1;
    // The count lives in a ref so pausing and resuming carries on through the
    // guides rather than starting the walk again. Restarting it would show the
    // same two guides over and over to anyone whose pointer keeps crossing.
    const id = window.setInterval(() => {
      select(tourSlot(tickRef.current++, slotCount), false);
    }, TOUR_MS);
    return () => window.clearInterval(id);
  }, [tookOver, paused, select]);

  // The flight itself, after React has painted the new order.
  React.useLayoutEffect(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    const overlay = overlayRef.current;
    const bigArt = bigArtRef.current;
    const tileArt = pending ? slotArtRefs.current[pending.slot] : null;
    if (!pending || !overlay || !bigArt || !tileArt) return;

    const bigNow = box(bigArt);
    const tileNow = box(tileArt);
    // A resize between the two paints can leave nothing to animate.
    if (sameBox(pending.tile, bigNow) || sameBox(pending.big, tileNow)) return;

    for (const old of flightsRef.current) old.cancel();
    flightsRef.current = [];

    // Artwork is black and white in the big card and in colour in the tiles,
    // so each leg drains or restores its colour as it travels. Without this the
    // picture jumps to its new treatment the instant it leaves, which reads as
    // a glitch rather than a move.
    const legs: { el: HTMLElement; from: Box; to: Box; real: HTMLElement; grey: [string, string] }[] =
      [
        // The promoted tile's artwork, flying into the big card.
        { el: bigArt, from: pending.tile, to: bigNow, real: bigArt, grey: ["grayscale(0)", "grayscale(1)"] },
        // The artwork it replaced, flying out to the slot the tile just left.
        { el: tileArt, from: pending.big, to: tileNow, real: tileArt, grey: ["grayscale(1)", "grayscale(0)"] },
      ];

    for (const leg of legs) {
      const clone = leg.el.cloneNode(true) as HTMLElement;
      // The clone reuses the already-decoded <img> (same src and srcset), so
      // nothing is fetched again for the flight.
      clone.style.position = "fixed";
      clone.style.left = `${leg.to.left}px`;
      clone.style.top = `${leg.to.top}px`;
      clone.style.margin = "0";
      clone.style.zIndex = "5";
      clone.style.pointerEvents = "none";
      overlay.appendChild(clone);

      leg.real.style.visibility = "hidden";

      const timing = { duration: FLIGHT_MS, easing: FLIGHT_EASE, fill: "both" as const };
      const [from, to] = flightFrames(leg.from, leg.to);
      const anim = clone.animate([from, to], timing);

      // The filter lives on the <img> inside, so it animates on its own track.
      // The inline value is what lets the animation beat the stylesheet's.
      // The big card holds every guide's picture, so take the drawn one.
      const img = clone.querySelector("img.is-active") ?? clone.querySelector("img");
      if (img instanceof HTMLElement) {
        img.style.filter = leg.grey[0];
        img.animate([{ filter: leg.grey[0] }, { filter: leg.grey[1] }], timing);
      }

      const done = () => {
        clone.remove();
        leg.real.style.visibility = "";
      };
      anim.addEventListener("finish", done);
      anim.addEventListener("cancel", done);
      flightsRef.current.push(anim);
    }
  }, [order]);

  // Never leave a card hidden behind a half-finished flight.
  React.useEffect(
    () => () => {
      for (const anim of flightsRef.current) anim.cancel();
    },
    [],
  );

  return (
    <div
      className="guides-stage"
      ref={stageRef}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!stageRef.current?.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {/* Big card */}
      <div className="guides-big">
        {/*
          Every guide's picture is mounted here and only the active one is
          shown. The big card asks for a wider picture than a tile does, so it
          is a different file: swapping the src on each change left the card
          blank while that file was fetched, and the card in flight was blank
          with it. Mounted together, they are all in hand before the first swap.
        */}
        <div className="guides-big__art" ref={bigArtRef}>
          {guides.map((guide, i) => (
            <Image
              key={guide.id}
              src={guide.image}
              alt=""
              fill
              sizes="(max-width: 900px) 92vw, 26rem"
              priority={i === 0}
              className={`guides-big__img${guide.id === active.id ? " is-active" : ""}`}
            />
          ))}
        </div>
        <div className="guides-big__copy">
          <h1 className="guides-big__headline" key={active.id}>
            {active.headline}
          </h1>
          <Link href={active.href} className="guides-big__cta">
            <WatchDemo />
          </Link>
        </div>
      </div>

      {/* Tiles */}
      <ul className="guides-tiles">
        {slots.map((guide, slot) => (
          <li className={`guides-tile guides-tile--${guide.tone}`} key={guide.id}>
            <div
              className="guides-tile__art"
              ref={(el) => {
                slotArtRefs.current[slot] = el;
              }}
            >
              <Image
                src={guide.image}
                alt=""
                fill
                sizes="(max-width: 900px) 46vw, 14rem"
                className="guides-tile__img"
              />
            </div>
            <span className="guides-tile__label">{guide.label}</span>
            {guide.isFilm && (
              <span className="guides-tile__play" aria-hidden="true">
                <Play size={16} fill="currentColor" />
              </span>
            )}
            {/*
              Two separate controls, never nested: the whole tile brings the
              guide into the big card, and the button on top of it opens the
              guide itself. A "Watch Demo" that only shuffled cards would lie.
            */}
            <button
              type="button"
              className="guides-tile__pick"
              onClick={() => select(slot, true)}
            >
              <span className="sr-only">Show {guide.label}</span>
            </button>
            <Link href={guide.href} className="guides-tile__cta">
              <WatchDemo className="guides-watch--tile" />
              <span className="sr-only">: {guide.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Where the artwork flies between the tiles and the big card. */}
      <div className="guides-flight" ref={overlayRef} aria-hidden="true" />

      <p className="sr-only" aria-live="polite">
        {active.label}
      </p>
    </div>
  );
}
