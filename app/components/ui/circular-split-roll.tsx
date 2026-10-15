"use client";

/**
 * From 21st.dev's "Circular Split Roll" (hyperiux), rebuilt without GSAP
 * (see ADR 0006). The maths is the original's; the machinery is what this
 * site already ships:
 *
 * - The pin is CSS: a tall section with a `position: sticky` stage, instead
 *   of ScrollTrigger's pin and pin-spacer.
 * - Scroll progress comes from framer-motion's `useScroll`, smoothed by a
 *   `useSpring` in place of ScrollTrigger's `scrub`. Lenis drives the native
 *   scroll position, so `useScroll` follows it without any bridging.
 * - Each frame writes transforms straight to the nodes from
 *   `useMotionValueEvent`, as the original did with `gsap.set`: no React
 *   re-render per frame.
 * - `gsap.utils` clamp / mapRange / interpolate are three one-line helpers.
 *
 * Also changed for this site: no shadcn theme tokens (white type, navy card
 * placeholder), `next/image`-free `<img>` kept, the demo's embedded images
 * dropped (items are required), and `sectionHeight` is per item as before but
 * sized for six items rather than ten.
 *
 * Titles orbit one circle on the left, image cards another on the right; the
 * item crossing each circle's inner edge eases into focus. Under 1025px, and
 * under reduced motion, it renders a plain grid instead.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

const DESKTOP_WIDTH = 1200;
const TABLET_MIN_WIDTH = 768;
const Z_INDEX_MIN = 1;

const clamp = (min: number, max: number, v: number) =>
  Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function wrapProgress(value: number) {
  const wrapped = value % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
}

function getCircularPosition(
  progress: number,
  radiusX: number,
  radiusY: number,
  angleOffset = 0,
) {
  const angle = progress * Math.PI * 2 + angleOffset;
  return {
    x: Math.sin(angle) * radiusX,
    y: Math.cos(angle) * radiusY,
    horizontalDepth: Math.sin(angle),
  };
}

/** -1..1 depth to 0..1 strength (the original's mapRange + clamp). */
const getStrength = (value: number) => clamp(0, 1, (value + 1) / 2);

function shapeFocus(strength: number, start: number, power: number) {
  return Math.pow(clamp(0, 1, (strength - start) / (1 - start)), power);
}

export interface CircularSplitRollItem {
  id?: string | number;
  title: string;
  image: string;
  alt?: string;
}

export interface CircularSplitRollProps {
  items: CircularSplitRollItem[];
  className?: string;
  /** Scroll length per item, in % of the viewport height. @default 70 */
  sectionHeight?: number;
  /** Sets all four orbit radii (px at 1200px wide). @default 500 */
  radius?: number;
  /** Image card width and height (px at 1200px wide). @default 205 */
  cardSize?: number;
  titleSize?: string;
  /** Spring stiffness smoothing scroll; lower trails more (like `scrub`). */
  smoothing?: number;
  textCenterScale?: number;
  textSideScale?: number;
  textCenterOpacity?: number;
  textSideOpacity?: number;
  imageCenterScale?: number;
  imageSideScale?: number;
  imageCenterOpacity?: number;
  imageSideOpacity?: number;
  textFocusStart?: number;
  textFocusPower?: number;
  imageFocusStart?: number;
  imageFocusPower?: number;
  leftAngleOffset?: number;
  rightAngleOffset?: number;
  focusPhase?: number;
  leftDepthMax?: number;
  rightDepthMax?: number;
  columnSpreadVw?: number;
  columnOffsetPx?: number;
  /** Placeholder behind each image while it loads. */
  cardColor?: string;
  /** Rendered above the stage, inside the pinned frame (e.g. a heading). */
  children?: React.ReactNode;
  /**
   * Share of each item's scroll spent resting with that item in focus, 0–0.9.
   * The original rolls continuously, so the title and its card only line up
   * for an instant; resting lets each pair sit together at the centre.
   * @default 0.45
   */
  hold?: number;
  /** Rings, glow, beam, numbering and the counter. @default true */
  decorated?: boolean;
}

export function CircularSplitRoll({
  items,
  className = "",
  sectionHeight = 70,
  radius = 500,
  cardSize = 205,
  titleSize = "clamp(28px, 3vw, 56px)",
  smoothing = 120,
  textCenterScale = 1,
  textSideScale = 0.68,
  textCenterOpacity = 1,
  textSideOpacity = 0.18,
  imageCenterScale = 1,
  imageSideScale = 0.58,
  imageCenterOpacity = 1,
  imageSideOpacity = 0.14,
  textFocusStart = 0.42,
  textFocusPower = 2.6,
  imageFocusStart = 0.45,
  imageFocusPower = 3.2,
  leftAngleOffset = Math.PI,
  rightAngleOffset = 0,
  focusPhase,
  leftDepthMax = 30,
  rightDepthMax = 40,
  columnSpreadVw = 5,
  columnOffsetPx = 500,
  cardColor = "#0d1347",
  children,
  hold = 0.45,
  decorated = true,
}: CircularSplitRollProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion() ?? false;
  const [desktop, setDesktop] = useState(false);

  const total = items.length;
  // An item is in focus at 0.75 of the way round its circle; this phase puts
  // one exactly there whenever the roll is at rest (0.5 for six items).
  const phase = focusPhase ?? (0.75 * total) % 1;
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const animated = desktop && !reducedMotion && total > 0;

  // The orbit only runs above 1025px; below it the grid shows (as the
  // original's `max-[1025px]` classes did). Read after mount.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1026px)");
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: smoothing,
    damping: 30,
    mass: 0.4,
  });

  const render = useCallback(
    (raw: number) => {
      if (!total) return;
      // Rest on each item: hold flat, then ease (smoothstep) to the next.
      const steps = raw * total;
      const k = Math.floor(steps);
      const t = clamp(0, 1, (steps - k - hold / 2) / (1 - hold));
      const p = (k + t * t * (3 - 2 * t)) / total;
      const nearest = Math.round(p * total);
      const focused =
        (((nearest + Math.round(0.75 * total - phase)) % total) + total) % total;
      if (focused !== activeRef.current) {
        activeRef.current = focused;
        setActive(focused);
      }
      const width = window.innerWidth;
      const factor =
        width < DESKTOP_WIDTH && width >= TABLET_MIN_WIDTH
          ? width / DESKTOP_WIDTH
          : 1;
      const r = radius * factor;
      rootRef.current?.style.setProperty("--csr-card", `${cardSize * factor}px`);
      rootRef.current?.style.setProperty("--csr-r", `${r}px`);

      const place = (
        node: HTMLDivElement | null,
        index: number,
        angleOffset: number,
        depthSign: 1 | -1,
        start: number,
        power: number,
        sideScale: number,
        centerScale: number,
        sideOpacity: number,
        centerOpacity: number,
        depthMax: number,
      ) => {
        if (!node) return;
        const local = wrapProgress(index / total - p + phase / total);
        const pos = getCircularPosition(local, r, r, angleOffset);
        const focus = shapeFocus(
          getStrength(depthSign * pos.horizontalDepth),
          start,
          power,
        );
        const scale = lerp(sideScale, centerScale, focus);
        node.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`;
        node.style.opacity = String(lerp(sideOpacity, centerOpacity, focus));
        node.style.setProperty("--f", focus.toFixed(3));
        node.style.zIndex = String(
          Math.round(lerp(Z_INDEX_MIN, depthMax, focus)),
        );
      };

      for (let i = 0; i < total; i++) {
        place(
          leftRefs.current[i],
          i,
          leftAngleOffset,
          1,
          textFocusStart,
          textFocusPower,
          textSideScale,
          textCenterScale,
          textSideOpacity,
          textCenterOpacity,
          leftDepthMax,
        );
        place(
          rightRefs.current[i],
          i,
          rightAngleOffset,
          -1,
          imageFocusStart,
          imageFocusPower,
          imageSideScale,
          imageCenterScale,
          imageSideOpacity,
          imageCenterOpacity,
          rightDepthMax,
        );
      }
    },
    [
      total,
      radius,
      cardSize,
      phase,
      hold,
      leftAngleOffset,
      rightAngleOffset,
      textFocusStart,
      textFocusPower,
      textSideScale,
      textCenterScale,
      textSideOpacity,
      textCenterOpacity,
      imageFocusStart,
      imageFocusPower,
      imageSideScale,
      imageCenterScale,
      imageSideOpacity,
      imageCenterOpacity,
      leftDepthMax,
      rightDepthMax,
    ],
  );

  useMotionValueEvent(progress, "change", (p) => {
    if (animated) render(p);
  });

  // First paint, and again on resize: the radii scale with the window.
  useEffect(() => {
    if (!animated) return;
    render(progress.get());
    const onResize = () => render(progress.get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [animated, render, progress]);

  const cardStyle = {
    width: "var(--csr-card)",
    height: "var(--csr-card)",
    marginLeft: "calc(var(--csr-card) * -0.5)",
    marginTop: "calc(var(--csr-card) * -0.5)",
  } as React.CSSProperties;

  return (
    <section
      ref={rootRef}
      className={`relative w-full text-white ${className}`}
      style={
        {
          "--csr-card": `${cardSize}px`,
          // The pin's length: one viewport to hold the stage, plus the
          // scroll the roll plays over. Only when animating.
          height: animated ? `${100 + sectionHeight * total}vh` : undefined,
        } as React.CSSProperties
      }
    >
      {animated ? (
        <div
          className="sticky top-0 h-screen w-full overflow-hidden"
          aria-hidden="true"
        >
          {children}
          {decorated ? (
            <>
              {/* Light behind both focus points, so the stage is not a flat
                  field of navy. Static: nothing here animates. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(38% 46% at 36% 50%, rgba(44,107,255,0.16), transparent 70%), radial-gradient(30% 40% at 66% 50%, rgba(63,219,255,0.12), transparent 70%)",
                }}
              />
              {/* The beam joining the focused title to its card. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 h-px -translate-y-1/2"
                style={{
                  left: "34%",
                  right: "34%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(63,219,255,0.55) 30%, rgba(63,219,255,0.55) 70%, transparent)",
                  boxShadow: "0 0 12px rgba(63,219,255,0.45)",
                }}
              />
            </>
          ) : null}
          <div className="relative mx-auto flex h-full w-full">
            <div
              className="relative flex h-full w-[50vw] items-center justify-center"
              style={{
                transform: `translateX(calc(${columnSpreadVw}vw - ${columnOffsetPx}px))`,
              }}
            >
              <div className="relative h-[78vh]">
                {decorated ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: "calc(var(--csr-r) * 2)",
                      height: "calc(var(--csr-r) * 2)",
                      border: "1px dashed rgba(255,255,255,0.09)",
                    }}
                  />
                ) : null}
                {items.map((item, i) => (
                  <div
                    key={item.id ?? i}
                    ref={(el) => {
                      leftRefs.current[i] = el;
                    }}
                    className="pointer-events-none absolute left-1/2 top-1/2 w-full origin-center whitespace-nowrap text-center font-bold leading-none tracking-[-0.03em] opacity-0 will-change-[transform,opacity]"
                    style={{
                      fontSize: titleSize,
                      fontFamily:
                        'var(--font-ubuntu), "Ubuntu", ui-sans-serif, system-ui, sans-serif',
                    }}
                  >
                    {decorated ? (
                      <span
                        className="absolute bottom-full left-0 right-0 mb-[0.35em] block text-[0.32em] font-semibold tracking-[0.3em]"
                        style={{
                          color: "var(--cyan, #3fdbff)",
                          opacity: "var(--f, 0)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    ) : null}
                    <span className={decorated ? "text-gradient-silver" : ""}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative flex h-full w-[50vw] items-center justify-center"
              style={{
                transform: `translateX(calc(${columnOffsetPx}px - ${columnSpreadVw}vw))`,
              }}
            >
              <div className="relative h-[78vh]">
                {decorated ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: "calc(var(--csr-r) * 2)",
                      height: "calc(var(--csr-r) * 2)",
                      border: "1px dashed rgba(255,255,255,0.09)",
                    }}
                  />
                ) : null}
                {items.map((item, i) => (
                  <div
                    key={item.id ?? i}
                    ref={(el) => {
                      rightRefs.current[i] = el;
                    }}
                    className="absolute left-1/2 top-1/2 origin-center opacity-0 will-change-[transform,opacity]"
                    style={cardStyle}
                  >
                    <div
                      className="relative h-full w-full overflow-hidden rounded-[18px]"
                      style={{
                        backgroundColor: cardColor,
                        border: decorated
                          ? "1px solid rgba(255,255,255,0.18)"
                          : undefined,
                        // The glow grows with focus (`--f`, set per frame).
                        boxShadow: decorated
                          ? "0 30px 60px rgba(0,0,0,0.45), 0 0 calc(80px * var(--f, 0)) rgba(44,107,255,calc(0.65 * var(--f, 0))), inset 0 1px 0 rgba(255,255,255,0.25)"
                          : "0 30px 60px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.3)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- transformed every frame; next/image adds a wrapper for nothing */}
                      <img
                        src={item.image}
                        alt=""
                        className="pointer-events-none absolute inset-0 block h-full w-full select-none object-cover"
                        draggable={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {decorated ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[6vh] left-1/2 flex -translate-x-1/2 items-center gap-4 text-sm font-semibold tracking-[0.2em] text-white/70"
            >
              <span style={{ color: "var(--cyan, #3fdbff)" }}>
                {String(active + 1).padStart(2, "0")}
              </span>
              <span className="flex gap-1.5">
                {items.map((item, i) => (
                  <span
                    key={item.id ?? i}
                    className="h-[3px] rounded-full transition-all duration-300"
                    style={{
                      width: i === active ? 28 : 10,
                      background:
                        i === active
                          ? "var(--cyan, #3fdbff)"
                          : "rgba(255,255,255,0.25)",
                    }}
                  />
                ))}
              </span>
              <span>{String(total).padStart(2, "0")}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* The grid: narrow screens and reduced motion see this instead, and
          screen readers always do (the orbit is aria-hidden). */}
      <div
        className={
          animated ? "sr-only" : "w-full px-5 py-10 max-md:px-4 max-md:py-8"
        }
      >
        {!animated ? children : null}
        <div className="mx-auto grid w-full max-w-5xl grid-cols-3 gap-5 max-md:grid-cols-2 max-md:gap-4">
          {items.map((item, i) => (
            <article key={item.id ?? i} className="w-full">
              <div
                className="relative aspect-square w-full overflow-hidden rounded-[18px] shadow-[0_18px_38px_rgba(0,0,0,0.4)] max-md:rounded-[14px]"
                style={{ backgroundColor: cardColor }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- same source as the orbit cards */}
                <img
                  src={item.image}
                  alt={item.alt ?? item.title}
                  className="absolute inset-0 block h-full w-full object-cover"
                  draggable={false}
                  loading="lazy"
                />
              </div>
              <h3 className="mt-3 text-center text-[clamp(16px,2.4vw,26px)] font-bold leading-tight tracking-[-0.02em] max-md:mt-2">
                {item.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CircularSplitRoll;
