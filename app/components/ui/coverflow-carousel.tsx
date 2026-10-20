"use client";

/**
 * From 21st.dev's "Coverflow Carousel", adapted for this site (see ADR 0008):
 * the shadcn tokens (`bg-muted`, `text-foreground`, `bg-background`,
 * `ring-ring`) become the site's navy and white, and the caption's
 * `animate-in fade-in` (a tailwindcss-animate class this repo doesn't have)
 * is a small CSS fade, `.cf-caption-in` in home.css. The meta list is spaced
 * tighter so the section stays compact. Behaviour is unchanged: drag, flick,
 * arrow keys, looping without clones, all painted straight to the DOM.
 */

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  /** Where the overlay's action button goes for this slide. */
  href?: string;
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length. Everything else is derived from it, so the rake scales. */
  cardWidth?: string;
  /** Card height as a multiple of its width; 1 is square. */
  cardAspect?: number;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  /** Title and subtitle over the card on hover (the front card on touch). */
  showOverlay?: boolean;
  /** Keep every card's overlay up instead of showing it on hover. */
  overlayAlways?: boolean;
  /** Label for the front card's overlay button on slides with an `href`. */
  actionLabel?: string;
  /**
   * Fade a card out before it reaches the frame's edge, so no card is ever
   * shown cut off. Measured from where each card actually lands on screen.
   */
  fitToFrame?: boolean;
  /**
   * Advance one card every this many ms; 0 is off. Paused while hovered,
   * dragged or focused, off-screen, in a hidden tab, and under reduced motion.
   */
  autoPlay?: number;
  /** Names the carousel for assistive tech. */
  label?: string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(148px, 22vw, 260px)",
  cardAspect = 1,
  gap = 0.05,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  showOverlay = false,
  overlayAlways = false,
  actionLabel = "Open",
  fitToFrame = false,
  autoPlay = 0,
  label = "Cover carousel",
  className,
  cardClassName,
}: CoverflowCarouselProps) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  /** Where the current settle is headed. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [held, setHeld] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  /** Nearest whole card, folded back into 0..count-1. */
  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  // Paint straight to the DOM; no React render per frame.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Fold the distance the shorter way round the ring: the whole loop.
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // Gone by half a turn out, where it teleports across the ring.
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });

    // Read after every transform is written: one layout per frame, not one
    // per card. A card is fully shown only with `band` px to spare and is gone
    // by the time it touches the edge, so the clip never cuts one visibly.
    // The card nearest the centre is exempt: where only one card fits (a
    // phone), fading it too would blank the ring halfway through every step.
    // At rest it is whole anyway; it only meets the edge while sliding.
    const frame = frameRef.current;
    if (!fitToFrame || !frame) return;
    const room = frame.getBoundingClientRect();
    const band = width * 0.12;
    const front = indexAt(pos);
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      if (index === front) {
        card.style.visibility = "";
        return;
      }
      const box = card.getBoundingClientRect();
      const spare = Math.min(box.left - room.left, room.right - box.right);
      const fit = Math.min(1, Math.max(0, spare / band));
      card.style.opacity = String(Number(card.style.opacity) * fit);
      card.style.visibility = fit > 0 ? "" : "hidden";
    });
  }, [count, depth, fade, falloff, fitToFrame, gap, indexAt, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  /** Set once a press travels far enough to be a drag; swallows the click. */
  const draggedRef = React.useRef(false);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // A press on a link stays a click: capturing the pointer here would
    // retarget its click to the frame and the link would never open.
    if ((event.target as HTMLElement).closest("a")) return;
    draggedRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    if (Math.abs(event.clientX - drag.x) > 6) draggedRef.current = true;
    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    // A flick carries, but never more than two cards.
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  // Only run while someone can see it, and never under reduced motion.
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || !autoPlay) return;
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlay]);

  React.useEffect(() => {
    if (!autoPlay || held || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden && !dragRef.current) nudge(1);
    }, autoPlay);
    return () => window.clearInterval(id);
  }, [autoPlay, held, visible, nudge]);

  const active = slides[selected];

  return (
    <div
      ref={rootRef}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className={cn("w-full", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          // Clip sideways only, for cards sliding off the ends; `clip` (unlike
          // `hidden`) lets the other axis stay visible, so the drop shadows
          // fall below the ring instead of being sliced off.
          className="cursor-grab overflow-x-clip overflow-y-visible py-8 outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: `calc(var(--cf-card) * ${cardAspect})`,
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                onClick={() => {
                  // A click (not a drag) on a side card brings it forward.
                  if (!draggedRef.current && index !== selected) goTo(index);
                }}
                data-front={index === selected ? "" : undefined}
                data-overlay={overlayAlways ? "always" : undefined}
                className={cn(
                  "cf-card group absolute left-1/2 top-0 overflow-hidden rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] will-change-transform",
                  cardClassName,
                )}
                style={{
                  width: "var(--cf-card)",
                  height: `calc(var(--cf-card) * ${cardAspect})`,
                  backgroundColor: "#0d1347",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  className="h-full w-full select-none object-cover"
                />
                {showOverlay && slide.title ? (
                  <div className="cf-overlay pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#02001e]/90 via-[#02001e]/45 to-transparent p-4 text-left">
                    <p className="text-base font-bold leading-tight text-white md:text-lg">
                      {slide.title}
                    </p>
                    {slide.subtitle ? (
                      <p className="mt-1 text-xs leading-snug text-white/80 md:text-sm">
                        {slide.subtitle}
                      </p>
                    ) : null}
                    {slide.href && index === selected ? (
                      <Link
                        href={slide.href}
                        draggable={false}
                        className="cf-overlay__action pointer-events-auto mt-3 self-start"
                      >
                        {actionLabel}
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => nudge(-1)}
              className="absolute left-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => nudge(1)}
              className="absolute right-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {showCaption && active?.title && (
        <div
          key={selected}
          aria-live="polite"
          className="cf-caption-in mt-1 flex flex-col items-center px-6 text-center"
        >
          <p className="text-lg font-bold tracking-tight text-white md:text-xl">
            {active.title}
          </p>
          {active.subtitle && (
            <p className="mt-1 max-w-md text-sm text-white/70">{active.subtitle}</p>
          )}
          {active.meta && active.meta.length > 0 && (
            <dl className="mt-4 w-full max-w-[300px] text-[12px]">
              {active.meta.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-[4px]">
                  <dt className="text-white/50">{row.label}</dt>
                  <dd className="text-right font-medium text-white/85">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {showPagination && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className={cn(
                "size-2 rounded-full bg-white transition-opacity",
                index === selected ? "opacity-100" : "opacity-30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
