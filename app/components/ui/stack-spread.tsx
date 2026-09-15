"use client";

import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * A clustered stack of cards that scatters into place as the section scrolls
 * past, from Hyperiux Vault's "stack spread" (https://vault.hyperiux.com).
 *
 * Four departures from the reference, all because it ships as a standalone
 * hero for a different product:
 *
 *   - the eight hardcoded R2 photographs, the "Design That Responds." headline
 *     and its subtitle are gone. Cards and centre copy are props, so the
 *     mechanism can carry this site's own content — see `WhoStackSection`;
 *   - it imports from `framer-motion`, not `motion`. Same library, older
 *     package name, already a dependency here; adding `motion` as well would
 *     put two copies of the animation runtime in the bundle;
 *   - cards render through `next/image`, not a bare `<img>`, so the remote
 *     photographs are resized and served as AVIF/WebP like every other image
 *     on this page;
 *   - the card layer is `pointer-events-none` and the copy layer is not. In
 *     the reference the cards paint above the centre text, which is fine for
 *     a headline and impossible for the button this section ends on.
 *
 * Cards carry an optional label, because a photograph on its own does not say
 * what industry it stands for.
 *
 * Nothing here animates on a timer: every transform is driven by scroll
 * progress, and the pointer parallax only runs once the cluster has finished
 * spreading — which it can only do while the section is on screen.
 */

/** Scroll progress where the cluster starts scattering and where it finishes. */
const SCATTER_START = 0.12;
const SCATTER_END = 0.9;

const PARALLAX_X = 2.6;
const PARALLAX_Y = 2.2;
const PARALLAX_SPRING = { stiffness: 90, damping: 22, mass: 0.6 };
const parallaxDepth = (i: number, total: number) =>
  total <= 1 ? 1 : 0.55 + (i / (total - 1)) * 0.75;

const RESPONSIVE = {
  desktop: {
    scale: null as number | null,
    small: false,
    card: null as { w: number; h: number } | null,
  },
  small: {
    scale: 0.85,
    small: true,
    card: { w: 27, h: 15 },
  },
};

function useResponsive() {
  const [r, setR] = useState(RESPONSIVE.desktop);
  useEffect(() => {
    // Touch vs. mouse, not raw width: a narrow but mouse-driven frame (a split
    // editor, a resized window) keeps the desktop scatter and the pointer
    // parallax; only real touch devices drop to the compact layout.
    const mq = window.matchMedia("(pointer: coarse)");
    const read = () => setR(mq.matches ? RESPONSIVE.small : RESPONSIVE.desktop);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return r;
}

function usePointerParallax(active: boolean, enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, PARALLAX_SPRING);
  const y = useSpring(rawY, PARALLAX_SPRING);

  useEffect(() => {
    if (!enabled) return;

    if (!active) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [active, enabled, rawX, rawY]);

  return { x, y };
}

export interface StackSpreadItem {
  src: string;
  /** Printed on the card. Also the image's alt text when `alt` is unset. */
  label?: string;
  alt?: string;
  /** Read by a screen reader after the label; never shown. */
  description?: string;
}

export interface StackSpreadTarget {
  /** Final position, as vw/vh from the centre of the stage. */
  x: number;
  y: number;
  rotate: number;
  scale?: number;
  w: number;
  h: number;
}

export interface StackSpreadCard {
  item: StackSpreadItem;
  target: StackSpreadTarget;
  /** Final x/y (vw/vh) on touch layouts; falls back to `target`. */
  targetSm?: { x: number; y: number };
  /** Angle while clustered. */
  stackRotate?: number;
  /** Offset (vw/vh) while clustered. */
  stackOffset?: { x: number; y: number };
  /** Paint order, higher on top. */
  z?: number;
}

function Card({
  card,
  progress,
  reduce,
  clusterRotation,
  scaleMul,
  isSmall,
  fixedCard,
  stackScale,
  cardRadius,
  pointer,
  depth,
}: {
  card: StackSpreadCard;
  progress: MotionValue<number>;
  reduce: boolean | null;
  clusterRotation: boolean;
  /** Uniform rest-scale for every card; null = use each card's own scale. */
  scaleMul: number | null;
  isSmall: boolean;
  fixedCard: { w: number; h: number } | null;
  /** Scale of the cards while clustered, before the scatter. */
  stackScale: number;
  /** Corner radius on each card, in px (desktop). */
  cardRadius: number;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  depth: number;
}) {
  const { item, target } = card;

  const flat = reduce === true;
  const stackRotate = flat ? 0 : clusterRotation ? card.stackRotate ?? 0 : 0;
  const stackOffset = card.stackOffset ?? { x: 0, y: 0 };
  const restScale = scaleMul ?? target.scale ?? 1;

  const sm = isSmall && card.targetSm ? card.targetSm : null;
  const endX = sm ? sm.x : target.x;
  const endY = sm ? sm.y : target.y;
  const endRotate = flat || isSmall ? 0 : target.rotate;

  // -50% keeps the card centred on its anchor.
  const translate = useTransform(
    [progress, pointer.x, pointer.y],
    ([p, px, py]: number[]) => {
      const tx = stackOffset.x + (endX - stackOffset.x) * p;
      const ty = stackOffset.y + (endY - stackOffset.y) * p;
      const drift = depth * p;
      const dx = tx - px * PARALLAX_X * drift;
      const dy = ty - py * PARALLAX_Y * drift;
      return `calc(-50% + ${dx}vw) calc(-50% + ${dy}vh)`;
    },
  );
  const rotate = useTransform(progress, [0, 1], [stackRotate, endRotate]);
  const scale = useTransform(progress, [0, 1], [stackScale, restScale]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 will-change-transform"
      style={{
        width: `${fixedCard ? fixedCard.w : target.w}vw`,
        height: `${fixedCard ? fixedCard.h : target.h}vh`,
        zIndex: card.z ?? 1,
        translate,
        rotate,
        scale,
      }}
    >
      <CardFace item={item} cardRadius={cardRadius} />
    </motion.div>
  );
}

function CardFace({
  item,
  cardRadius,
}: {
  item: StackSpreadItem;
  cardRadius: number;
}) {
  return (
    <figure
      className="stack-spread__face"
      style={{ borderRadius: `${cardRadius}px` }}
    >
      {/* `sizes` is the widest a card gets (the small layout's 27vw), so the
          browser never picks a source narrower than the card it lands in. */}
      <Image
        src={item.src}
        alt={item.alt ?? item.label ?? ""}
        fill
        sizes="(pointer: coarse) 27vw, 18vw"
        draggable={false}
        className="stack-spread__img"
      />
      {item.label ? (
        <figcaption className="stack-spread__label">
          {item.label}
          {item.description ? (
            <span className="sr-only">. {item.description}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

export interface StackSpreadProps {
  cards: StackSpreadCard[];
  /** Centre copy, revealed as the cards clear the middle. */
  children?: React.ReactNode;
  /** Scatter scroll distance, in vh. */
  scrollLength?: number;
  bgColor?: string;
  /** Fan the clustered stack (default) or start flat. */
  clusterRotation?: boolean;
  /** Scale of the cards while clustered, before the scatter. */
  stackScale?: number;
  /** Corner radius on each card, in px (desktop only — touch keeps its own). */
  cardRadius?: number;
  /** Scroll progress (0-1) where the centre copy starts fading in. */
  textFadeStart?: number;
  /** Show the "scroll to spread" hint until the scatter begins. */
  showScrollHint?: boolean;
  className?: string;
}

export function StackSpread({
  cards,
  children,
  scrollLength = 300,
  bgColor = "transparent",
  clusterRotation = true,
  stackScale = 0.82,
  cardRadius = 14,
  textFadeStart = 0.3,
  showScrollHint = false,
  className = "",
}: StackSpreadProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scale: scaleMul, small: isSmall, card: fixedCard } = useResponsive();

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // Hold, scatter, then settle.
  const progress = useTransform(
    scrollYProgress,
    [0, SCATTER_START, SCATTER_END, 1],
    [0, 0, 1, 1],
  );

  // The copy always fades in on scroll; the scale-in is dropped only when
  // reduced motion is confirmed (`true`), not on the null SSR value.
  const [spread, setSpread] = useState(false);
  useMotionValueEvent(progress, "change", (p) => {
    setSpread((was) => (was ? p > 0.985 : p >= 0.999));
  });
  const parallaxEnabled = reduce !== true && !isSmall;
  const pointer = usePointerParallax(spread, parallaxEnabled);

  const noScale = reduce === true;
  const copyOpacity = useTransform(
    progress,
    [textFadeStart, textFadeStart + 0.35],
    [0, 1],
  );
  const copyScale = useTransform(progress, [textFadeStart, 0.9], [0.85, 1]);
  const hintOpacity = useTransform(progress, [0, SCATTER_START], [1, 0]);

  return (
    <div
      ref={wrapRef}
      className={`stack-spread ${className}`.trim()}
      style={{ height: `${scrollLength}vh`, backgroundColor: bgColor }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Centre copy. Interactive, so the section can end on a button. */}
        <motion.div
          className="stack-spread__copy"
          style={{ opacity: copyOpacity, scale: noScale ? 1 : copyScale }}
        >
          {children}
        </motion.div>

        {/* The scattering cards, above the copy but never intercepting it. */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              progress={progress}
              reduce={reduce}
              clusterRotation={clusterRotation}
              scaleMul={scaleMul}
              isSmall={isSmall}
              fixedCard={fixedCard}
              stackScale={stackScale}
              cardRadius={cardRadius}
              pointer={pointer}
              depth={parallaxEnabled ? parallaxDepth(i, cards.length) : 0}
            />
          ))}
        </div>

        {showScrollHint ? (
          <motion.div
            className="stack-spread__hint"
            style={{ opacity: hintOpacity }}
          >
            <span>Scroll</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export default StackSpread;
