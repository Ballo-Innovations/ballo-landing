"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

import { bringForward, flightFrames, sameBox, slideOffset, type Box } from "@/lib/guidesCarousel";
import { guides, type Guide } from "./guidesContent";

/** How long a guide holds the big card before the tour moves on. */
const TOUR_MS = 5000;
/** How long a card takes to fly between a tile and the big card. */
const FLIGHT_MS = 620;
const FLIGHT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/** The queue closes up a beat behind the flight, one tile after another. */
const SLIDE_MS = 520;
const SLIDE_STAGGER_MS = 45;

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
 * The /guides hero: one guide in the big card on the left, the rest queued as
 * tiles on the right. Choosing a tile flies it into the big card, the tiles
 * behind it slide up one place to close the gap, and the guide it replaces
 * flies out to the back of the queue.
 *
 * Every move is a FLIP. The two flying artworks are cloned into a fixed
 * overlay with the real ones hidden for the duration; the sliding tiles are
 * the real tiles, started from where they used to be. Measuring real elements
 * is what keeps the layout authoritative, so cards land on exactly the pixels
 * CSS gave them at any viewport width.
 */
export default function GuidesCarousel() {
  const [order, setOrder] = React.useState<Guide[]>(guides);
  const [paused, setPaused] = React.useState(false);
  const [tookOver, setTookOver] = React.useState(false);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const bigArtRef = React.useRef<HTMLDivElement>(null);
  const slotArtRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  /** Each tile's element, by guide id: tiles keep their element as they move. */
  const tileRefs = React.useRef(new Map<string, HTMLLIElement>());
  /** Where everything was just before a move. */
  const pendingRef = React.useRef<{ big: Box; tile: Box; tiles: Map<string, Box> } | null>(null);
  const flightsRef = React.useRef<Animation[]>([]);

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
    const tiles = new Map<string, Box>();
    for (const [id, el] of tileRefs.current) tiles.set(id, box(el));
    pendingRef.current =
      bigArt && tileArt && !reducedMotion()
        ? { big: box(bigArt), tile: box(tileArt), tiles }
        : null;
    setOrder((current) => bringForward(current, slot));
  }, []);

  // Auto-tour until the visitor takes over, and never while they are reading a
  // card (pointer over the stage or keyboard focus inside it).
  React.useEffect(() => {
    if (tookOver || paused || reducedMotion()) return;
    // Always the front of the queue: that alone walks through every guide,
    // and it carries on from wherever a pause left it.
    const id = window.setInterval(() => select(0, false), TOUR_MS);
    return () => window.clearInterval(id);
  }, [tookOver, paused, select]);

  // The flight itself, after React has painted the new order.
  React.useLayoutEffect(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    const overlay = overlayRef.current;
    const bigArt = bigArtRef.current;
    // The guide that left the big card is now the last tile.
    const lastSlot = order.length - 2;
    const tileArt = pending ? slotArtRefs.current[lastSlot] : null;
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
    //
    // The card's colour travels the same way. A tile is a coloured card and
    // the big card is a picture standing on studio grey, so the leg going in
    // lets its colour go and the leg coming out picks its own back up.
    const promoted = order[0];
    const demoted = order[order.length - 1];
    const demotedTile = tileRefs.current.get(demoted.id) ?? null;
    const CLEAR = "rgba(0, 0, 0, 0)";
    type Leg = {
      el: HTMLElement;
      from: Box;
      to: Box;
      grey: [string, string];
      bg: [string, string];
      /** What to keep out of sight while the clone stands in for it. */
      hide: HTMLElement;
    };
    const legs: Leg[] = [
      // The promoted tile's artwork, flying into the big card.
      {
        el: bigArt,
        from: pending.tile,
        to: bigNow,
        grey: ["grayscale(0)", "grayscale(1)"],
        bg: [promoted.bg, CLEAR],
        hide: bigArt,
      },
      // The artwork it replaced, flying out to the back of the queue.
      {
        el: tileArt,
        from: pending.big,
        to: tileNow,
        grey: ["grayscale(1)", "grayscale(0)"],
        bg: [CLEAR, demoted.bg],
        // The whole tile, not just its picture: a label and a button waiting
        // in an empty slot for their card to arrive look like a fault.
        hide: demotedTile ?? tileArt,
      },
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

      leg.hide.style.visibility = "hidden";

      const timing = { duration: FLIGHT_MS, easing: FLIGHT_EASE, fill: "both" as const };
      const [from, to] = flightFrames(leg.from, leg.to);
      const anim = clone.animate(
        [
          { ...from, backgroundColor: leg.bg[0] },
          { ...to, backgroundColor: leg.bg[1] },
        ],
        timing,
      );

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
        leg.hide.style.visibility = "";
      };
      anim.addEventListener("finish", done);
      anim.addEventListener("cancel", done);
      flightsRef.current.push(anim);
    }

    // The queue closes up: every tile that is still a tile and has a new place
    // starts from its old one and slides home, each a beat after the last.
    let moved = 0;
    for (const guide of order.slice(1)) {
      if (guide.id === demoted.id) continue;
      const el = tileRefs.current.get(guide.id);
      const was = pending.tiles.get(guide.id);
      if (!el || !was) continue;
      const { dx, dy } = slideOffset(was, box(el));
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      const slide = el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0px, 0px)" }],
        {
          duration: SLIDE_MS,
          delay: moved++ * SLIDE_STAGGER_MS,
          easing: FLIGHT_EASE,
          fill: "backwards",
        },
      );
      flightsRef.current.push(slide);
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
              sizes="(max-width: 1099px) 92vw, 40rem"
              priority={i === 0}
              className={`guides-big__img guides-big__img--${guide.kind}${
                guide.id === active.id ? " is-active" : ""
              }`}
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
          <li
            className={`guides-tile guides-tile--label-${guide.labelTone} guides-tile--button-${guide.buttonTone}${guide.isFilm ? " guides-tile--film" : ""}`}
            key={guide.id}
            ref={(el) => {
              if (el) tileRefs.current.set(guide.id, el);
              else tileRefs.current.delete(guide.id);
            }}
          >
            <div
              className="guides-tile__art"
              style={{ backgroundColor: guide.bg }}
              ref={(el) => {
                slotArtRefs.current[slot] = el;
              }}
            >
              <Image
                src={guide.image}
                alt=""
                fill
                sizes="(max-width: 1099px) 46vw, 16rem"
                style={{ objectPosition: guide.focus }}
                className={`guides-tile__img guides-tile__img--${guide.kind}`}
              />
            </div>
            <span className="guides-tile__label">{guide.label}</span>
            {guide.isFilm && (
              <span className="guides-tile__play" aria-hidden="true">
                <Play fill="currentColor" strokeWidth={0} />
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
