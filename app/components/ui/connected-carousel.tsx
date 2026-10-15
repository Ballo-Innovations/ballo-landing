"use client";

/**
 * From 21st.dev's "Connected Carousel" (CalendlyCarousel), adapted for this
 * site (see ADR 0005):
 *
 * - No shadcn theme tokens. `bg-card`, `text-foreground`, `bg-secondary`,
 *   `bg-muted` and friends become the site's dark navy palette, set once in
 *   `PALETTE` below. The card colour also fills the notch connectors, so the
 *   two must stay the same value.
 * - `quoted` (default true) controls the serif quote treatment. Pass false for
 *   copy that is not somebody's words, so a description doesn't read as a
 *   testimonial nobody gave.
 * - `ariaLabel` replaces the hard-coded "Customer stories".
 * - Images go through Next's optimiser (Unsplash is allowed in
 *   next.config), with `sizes`, instead of `unoptimized`.
 * - Autoplay pauses while the carousel is off-screen or the tab is hidden,
 *   and under reduced motion. The original ran its rAF loop forever.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLAttributes, MouseEvent, KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

export interface CarouselItem {
  id: string | number;
  stat: string;
  quote: string;
  author: string;
  role: string;
  defaultImage: string;
  selectedImage: string;
  alt?: string;
}

export interface CalendlyCarouselProps extends HTMLAttributes<HTMLDivElement> {
  items: CarouselItem[];
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  /** Render `quote` as a quotation (serif, quote marks). @default true */
  quoted?: boolean;
  /** Show the quote and the author/role chips. False leaves the title and
   *  the image only. @default true */
  showDetails?: boolean;
  ariaLabel?: string;
}

type ScreenTier = "mobile" | "tablet" | "desktop";

const VISIBLE_OFFSETS = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;

const TRANSITION_SPRING = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 0.75,
} as const;

/** The site's navy, standing in for the shadcn card/secondary/muted tokens. */
const PALETTE = {
  // Glass, same recipe as the testimonial cards (.t3d-card) minus the
  // backdrop-filter: these cards ride a spring transform, which smears it.
  card: "linear-gradient(160deg, rgba(255, 255, 255, 0.14), rgba(120, 140, 220, 0.09) 60%, rgba(255, 255, 255, 0.05))",
  // The notches can't take a gradient (SVG fill), so they get its mid tone.
  connector: "rgba(150, 165, 230, 0.16)",
  text: "#ffffff",
  chip: "rgba(255, 255, 255, 0.12)",
  chipText: "rgba(255, 255, 255, 0.85)",
  chipMuted: "rgba(255, 255, 255, 0.6)",
  muted: "rgba(255, 255, 255, 0.06)",
  track: "rgba(255, 255, 255, 0.18)",
  fill: "#2c6bff",
};

export function CalendlyCarousel({
  items,
  autoPlayInterval = 6000,
  pauseOnHover = false,
  quoted = true,
  showDetails = true,
  ariaLabel = "Customer stories",
  className,
  ...props
}: CalendlyCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);

  const [page, setPage] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [inView, setInView] = useState<boolean>(false);
  const [tier, setTier] = useState<ScreenTier>("desktop");
  const [viewportWidth, setViewportWidth] = useState<number>(1200);
  const reduceMotion = useReducedMotion() ?? false;

  const total = items.length;
  const activeIndex = ((page % total) + total) % total;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      if (width < 768) setTier("mobile");
      else if (width < 1120) setTier("tablet");
      else setTier("desktop");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Only tick while someone can see it: on screen, in a visible tab.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting && !document.hidden),
    );
    io.observe(el);
    const onVisibility = () => {
      if (document.hidden) setInView(false);
      else {
        const r = el.getBoundingClientRect();
        setInView(r.bottom > 0 && r.top < window.innerHeight);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if ((pauseOnHover && isHovered) || !inView || reduceMotion) {
      lastTimeRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      elapsedRef.current += delta;

      if (elapsedRef.current >= autoPlayInterval) {
        elapsedRef.current = 0;
        lastTimeRef.current = null;
        setProgress(0);
        setPage((curr) => curr + 1);
        return;
      }

      setProgress(Math.min((elapsedRef.current / autoPlayInterval) * 100, 100));
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [page, pauseOnHover, isHovered, inView, reduceMotion, autoPlayInterval]);

  const restart = () => {
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    setProgress(0);
  };

  const handlePrev = useCallback(() => {
    restart();
    setPage((curr) => curr - 1);
  }, []);

  const handleNext = useCallback(() => {
    restart();
    setPage((curr) => curr + 1);
  }, []);

  const handleSelectTab = (event: MouseEvent<HTMLButtonElement>) => {
    const indexStr = event.currentTarget.dataset.index;
    if (indexStr === undefined) return;
    const targetIdx = Number.parseInt(indexStr, 10);
    let diff = targetIdx - activeIndex;
    if (diff > total / 2) diff -= total;
    else if (diff < -total / 2) diff += total;
    restart();
    setPage((curr) => curr + diff);
  };

  const handleSelectCard = (event: MouseEvent<HTMLDivElement>) => {
    const offsetStr = event.currentTarget.dataset.offset;
    if (offsetStr === undefined) return;
    const offset = Number.parseInt(offsetStr, 10);
    if (offset !== 0) {
      restart();
      setPage((curr) => curr + offset);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") handlePrev();
    else if (event.key === "ArrowRight") handleNext();
  };

  const activeDimensions = {
    desktop: { width: 762, height: 513 },
    tablet: { width: 560, height: 440 },
    mobile: { width: Math.min(340, viewportWidth - 56), height: 490 },
  }[tier];

  if (total === 0) return null;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative mx-auto flex w-full max-w-[1240px] select-none flex-col items-center overflow-hidden py-4 outline-none",
        className,
      )}
      {...props}
    >
      <div
        id="carousel-view-panel"
        role="tabpanel"
        aria-live="polite"
        className="relative flex w-full items-center justify-center"
        style={{ height: activeDimensions.height }}
      >
        {VISIBLE_OFFSETS.map((offset) => {
          const virtualIndex = page + offset;
          const itemIndex = ((virtualIndex % total) + total) % total;
          const item = items[itemIndex]!;
          const isActive = offset === 0;

          const getVariant = () => {
            if (tier === "mobile") {
              const activeW = activeDimensions.width;
              const activeH = activeDimensions.height;
              const gap = 16;
              const peekW = 60;
              const peekH = 410;

              if (offset === 0)
                return { x: -activeW / 2, y: -activeH / 2, width: activeW, height: activeH, opacity: 1, zIndex: 0, pointerEvents: "auto" as const };
              if (offset === -1)
                return { x: -activeW / 2 - gap - peekW, y: -peekH / 2, width: peekW, height: peekH, opacity: 1, zIndex: 100, pointerEvents: "auto" as const };
              if (offset === 1)
                return { x: activeW / 2 + gap, y: -peekH / 2, width: peekW, height: peekH, opacity: 1, zIndex: 100, pointerEvents: "auto" as const };
              return { x: offset < 0 ? -activeW / 2 - 220 : activeW / 2 + 220, y: -peekH / 2, width: peekW, height: peekH, opacity: 0, zIndex: 0, pointerEvents: "none" as const };
            }

            if (tier === "tablet") {
              const activeW = 560;
              const activeH = 440;
              const gap = 18;
              const sideW = 100;
              const sideH = 340;

              if (offset === 0)
                return { x: -activeW / 2, y: -activeH / 2, width: activeW, height: activeH, opacity: 1, zIndex: 0, pointerEvents: "auto" as const };
              if (offset === -1)
                return { x: -activeW / 2 - gap - sideW, y: -sideH / 2, width: sideW, height: sideH, opacity: 1, zIndex: 100, pointerEvents: "auto" as const };
              if (offset === 1)
                return { x: activeW / 2 + gap, y: -sideH / 2, width: sideW, height: sideH, opacity: 1, zIndex: 100, pointerEvents: "auto" as const };
              return { x: offset < 0 ? -activeW / 2 - 240 : activeW / 2 + 240, y: -sideH / 2, width: 74, height: 205, opacity: 0, zIndex: 0, pointerEvents: "none" as const };
            }

            switch (offset) {
              case 0:
                return { x: -381, y: -256.5, width: 762, height: 513, opacity: 1, zIndex: 0, pointerEvents: "auto" as const };
              case -1:
                return { x: -506, y: -172, width: 105, height: 344, opacity: 1, zIndex: 100, pointerEvents: "auto" as const };
              case 1:
                return { x: 401, y: -172, width: 105, height: 344, opacity: 1, zIndex: 100, pointerEvents: "auto" as const };
              case -2:
                return { x: -596, y: -102.5, width: 74, height: 205, opacity: 1, zIndex: 100, pointerEvents: "auto" as const };
              case 2:
                return { x: 522, y: -102.5, width: 74, height: 205, opacity: 1, zIndex: 100, pointerEvents: "auto" as const };
              case -3:
                return { x: -720, y: -102.5, width: 74, height: 205, opacity: 0, zIndex: 0, pointerEvents: "none" as const };
              case 3:
                return { x: 646, y: -102.5, width: 74, height: 205, opacity: 0, zIndex: 0, pointerEvents: "none" as const };
              default:
                return { x: offset < 0 ? -860 : 860, y: -102.5, width: 74, height: 205, opacity: 0, zIndex: 0, pointerEvents: "none" as const };
            }
          };

          return (
            <motion.div
              key={virtualIndex}
              data-offset={offset}
              onClick={handleSelectCard}
              initial={false}
              animate={getVariant()}
              transition={reduceMotion ? { duration: 0 } : TRANSITION_SPRING}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                willChange: "transform",
                background: PALETTE.card,
                color: PALETTE.text,
              }}
              className={cn(
                "overflow-visible rounded-[28px] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_0_40px_rgba(255,255,255,0.05),0_18px_40px_-18px_rgba(0,0,0,0.85)] sm:rounded-[32px]",
                !isActive && "cursor-pointer",
              )}
            >
              {/* The connectors: a notch in the card's own colour, joining
                  each neighbour to the next one in. */}
              {(offset === -1 || offset === 1) && (
                <Connector side={offset === -1 ? "left" : "right"} width={22} height={42} large />
              )}
              {(offset === -2 || offset === 2) && tier === "desktop" && (
                <Connector side={offset === -2 ? "left" : "right"} width={18} height={28} />
              )}

              <div className="relative size-full overflow-hidden" style={{ borderRadius: "inherit" }}>
                <motion.div
                  initial={false}
                  animate={{ opacity: isActive ? 0 : 1 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={cn("absolute inset-0 p-2", isActive && "pointer-events-none")}
                >
                  <div
                    className="relative size-full overflow-hidden rounded-[20px] sm:rounded-[24px]"
                    style={{ backgroundColor: PALETTE.muted }}
                  >
                    <Image
                      alt={item.alt || item.author}
                      src={item.defaultImage}
                      fill
                      sizes="120px"
                      draggable={false}
                      className="size-full object-cover"
                    />
                  </div>
                </motion.div>

                <div
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: activeDimensions.width,
                    height: activeDimensions.height,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : offset < 0 ? -822 : 822,
                    }}
                    transition={reduceMotion ? { duration: 0 } : TRANSITION_SPRING}
                    className={cn(
                      "flex size-full flex-col gap-3 p-4 sm:gap-4 sm:p-5 md:flex-row md:gap-6 md:p-6 lg:p-7",
                      !isActive && "pointer-events-none",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-col items-center justify-between gap-2 py-1 text-center sm:gap-3 md:items-start md:text-left">
                      <h3
                        title={item.stat}
                        className="w-full text-lg font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl lg:text-4xl"
                      >
                        {item.stat}
                      </h3>

                      {showDetails ? (
                        <>
                      <div className="relative my-auto w-full min-w-0 py-1">
                        {quoted ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute right-full top-0 hidden select-none pr-1 font-serif text-2xl text-white/40 sm:text-3xl md:inline lg:text-4xl"
                            >
                              “
                            </span>
                            <p className="font-serif text-xs leading-snug text-white/85 sm:text-base md:text-lg">
                              “{item.quote}”
                            </p>
                          </>
                        ) : (
                          <p className="text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
                            {item.quote}
                          </p>
                        )}
                      </div>

                      <div className="flex w-full min-w-0 max-w-full items-center justify-center overflow-hidden md:items-start md:justify-start">
                        <div className="flex min-w-0 max-w-full flex-col items-center md:items-start">
                          <span
                            className="inline-flex w-fit shrink-0 select-none items-center justify-center rounded-[4px] px-2.5 py-1 text-[11px] font-medium sm:text-xs"
                            style={{ backgroundColor: PALETTE.chip, color: PALETTE.chipText }}
                          >
                            <span className="whitespace-nowrap font-semibold">{item.author}</span>
                          </span>

                          <div
                            className="relative z-10 -my-[1px] flex h-[6px] shrink-0 items-center justify-center px-3 md:justify-start"
                            style={{ color: PALETTE.chip }}
                          >
                            <svg
                              className="block shrink-0 overflow-visible fill-current"
                              preserveAspectRatio="none"
                              viewBox="0 -2 14 12"
                              width="14"
                              height="10"
                            >
                              <path d="M0 -2 V0 C0 0 5.09091 0.49688 5.09091 4 C5.09091 7.50312 0 8 0 8 V10 H14 V8 C14 8 8.90909 7.50312 8.90909 4 C8.90909 0.49688 14 0 14 0 V-2 Z" />
                            </svg>
                          </div>

                          <span
                            className="inline-flex w-fit max-w-full select-none items-center justify-center rounded-[4px] px-2.5 py-1 text-[10px] font-medium sm:text-xs"
                            style={{ backgroundColor: PALETTE.chip, color: PALETTE.chipMuted }}
                          >
                            <span title={item.role} className="truncate">
                              {item.role}
                            </span>
                          </span>
                        </div>
                      </div>
                        </>
                      ) : null}
                    </div>

                    <div
                      className="relative max-h-[220px] w-full flex-1 shrink-0 overflow-hidden rounded-[18px] sm:rounded-[22px] md:h-full md:max-h-none md:w-[clamp(180px,44%,330px)] md:flex-initial"
                      style={{ backgroundColor: PALETTE.muted }}
                    >
                      <Image
                        alt={item.alt || item.author}
                        src={item.selectedImage}
                        fill
                        sizes="(max-width: 768px) 90vw, 330px"
                        draggable={false}
                        className="size-full object-cover"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div role="tablist" aria-label={ariaLabel} className="mt-5 flex items-center gap-1.5">
        {items.map((item, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              data-index={idx}
              id={`carousel-tab-${idx}`}
              aria-controls="carousel-view-panel"
              onClick={handleSelectTab}
              aria-selected={isSelected}
              aria-label={item.stat}
              tabIndex={isSelected ? 0 : -1}
              className={cn(
                "h-[8px] cursor-pointer overflow-hidden rounded-[3px] border-0 p-0 outline-none transition-[width] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/70",
                isSelected ? "w-[80px]" : "w-[8px] hover:opacity-80",
              )}
              style={{ backgroundColor: PALETTE.track }}
            >
              {isSelected && (
                <div
                  className="h-full rounded-[3px]"
                  style={{
                    backgroundColor: PALETTE.fill,
                    transformOrigin: "0% 50%",
                    transform: `scaleX(${progress / 100})`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A notch in the card colour bridging the gap to the neighbouring card. */
function Connector({
  side,
  width,
  height,
  large = false,
}: {
  side: "left" | "right";
  width: number;
  height: number;
  large?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 top-0 z-[100] flex items-center"
      style={{
        width,
        height,
        margin: "auto 0",
        color: PALETTE.connector,
        ...(side === "left" ? { left: "calc(100% - 1px)" } : { right: "calc(100% - 1px)" }),
      }}
    >
      {large ? (
        <svg viewBox="0 0 20 37.3338" preserveAspectRatio="none" className="block size-full overflow-visible fill-current">
          <path d="M0 0C0 0 1.2422 13.5759 10 13.5759C18.7578 13.5759 20 0 20 0V37.3338C20 37.3338 18.7578 23.7578 10 23.7578C1.2422 23.7578 0 37.3338 0 37.3338V0Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 28" preserveAspectRatio="none" className="block size-full overflow-visible fill-current">
          <path d="M0 0C0 0 0.993759 10.1818 8 10.1818C15.0062 10.1818 16 0 16 0V28C16 28 15.0062 17.8182 8 17.8182C0.993759 17.8182 0 28 0 28V0Z" />
        </svg>
      )}
    </div>
  );
}
