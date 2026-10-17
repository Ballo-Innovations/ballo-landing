"use client";

/**
 * From 21st.dev's "Services with animated hover modal", adapted for this site
 * (see ADR 0007). The published `Component` was a placeholder counter; the
 * design lives in its demo, which is what this is built from.
 *
 * - No GSAP. The demo used `gsap.quickTo` only to make the card and cursor
 *   trail the pointer; framer-motion springs on two motion values do the
 *   same, at the same three speeds (card slowest, cursor, then label).
 * - Fixed positioning from `clientX/Y` instead of absolute `pageX/Y`. The
 *   demo's absolute card was placed against whatever positioned ancestor it
 *   found, and page coordinates drift under Lenis' smooth scroll.
 * - The card is a vertical strip of every image, shifted to the hovered row,
 *   exactly as in the demo, so moving between rows slides rather than swaps.
 * - Touch screens have no hover, so each row shows its image inline below
 *   768px and the floating card is not rendered.
 * - Site palette: white type on the page's navy, hairline white rules, the
 *   brand blue for the cursor; rows are buttons when `onSelect` is given.
 */

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

export interface HoverModalItem {
  title: string;
  /** Short line on the right of the row (the demo's "Design & Development"). */
  meta?: string;
  /** Shown under the title while the row is hovered. */
  description?: string;
  image: string;
  /** Background behind the image in the card. */
  color?: string;
}

const scaleAnimation: Variants = {
  initial: { scale: 0, x: "-50%", y: "-50%" },
  enter: {
    scale: 1,
    x: "-50%",
    y: "-50%",
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
  },
  closed: {
    scale: 0,
    x: "-50%",
    y: "-50%",
    transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] },
  },
};

/** A pointer-following position, eased like `gsap.quickTo(..., power3)`. */
function useFollow(stiffness: number) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness, damping: 28, mass: 0.6 };
  return { x, y, sx: useSpring(x, spring), sy: useSpring(y, spring) };
}

export function ServicesHoverModal({
  items,
  cursorLabel = "View",
  onSelect,
  className,
}: {
  items: HoverModalItem[];
  cursorLabel?: string;
  onSelect?: (item: HoverModalItem, index: number) => void;
  className?: string;
}) {
  const [modal, setModal] = useState({ active: false, index: 0 });
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (min-width: 768px)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="flex w-full flex-col">
        {items.map((item, index) => {
          const Row = onSelect ? "button" : "div";
          return (
            <Row
              key={item.title}
              type={onSelect ? "button" : undefined}
              onClick={onSelect ? () => onSelect(item, index) : undefined}
              onMouseEnter={() => setModal({ active: true, index })}
              onMouseLeave={() => setModal({ active: false, index })}
              onFocus={() => setModal({ active: false, index })}
              className={cn(
                "group flex w-full flex-col gap-4 border-t border-white/15 px-2 py-5 text-left text-white transition-opacity duration-200 last:border-b md:flex-row md:items-center md:justify-between md:px-8 md:py-7",
                finePointer && "cursor-none",
                // The demo dims the row under the pointer, so the card in
                // front of it reads as the subject.
                "hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60",
              )}
            >
              <div className="min-w-0 transition-transform duration-300 group-hover:translate-x-2.5">
                <h3 className="m-0 text-[clamp(1.35rem,2.4vw,2.25rem)] font-bold leading-[1.05] tracking-[-0.02em]">
                  {item.title}
                </h3>
                {item.description ? (
                  /* Revealed on hover (and always on touch, where the row
                     has no hover to reveal it). */
                  <p
                    className={cn(
                      "mt-2 max-w-xl text-sm text-white/70 transition-[opacity,max-height] duration-300 md:text-base",
                      finePointer &&
                        "max-h-0 overflow-hidden opacity-0 group-hover:max-h-24 group-hover:opacity-100 group-focus-visible:max-h-24 group-focus-visible:opacity-100",
                    )}
                  >
                    {item.description}
                  </p>
                ) : null}
              </div>
              {item.meta ? (
                <p className="shrink-0 text-sm font-light text-white/70 transition-transform duration-300 group-hover:translate-x-2.5 md:text-base">
                  {item.meta}
                </p>
              ) : null}
              {!finePointer ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote Unsplash crop, same as the card
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="aspect-[16/10] w-full rounded-xl object-cover"
                />
              ) : null}
            </Row>
          );
        })}
      </div>

      {finePointer ? (
        <Modal modal={modal} items={items} cursorLabel={cursorLabel} />
      ) : null}
    </div>
  );
}

function Modal({
  modal,
  items,
  cursorLabel,
}: {
  modal: { active: boolean; index: number };
  items: HoverModalItem[];
  cursorLabel: string;
}) {
  const { active, index } = modal;
  // Card trails the most, then the cursor, then its label (the demo's
  // 0.8s / 0.5s / 0.45s quickTo durations, as spring stiffnesses).
  const card = useFollow(120);
  const cursor = useFollow(260);
  const label = useFollow(320);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      for (const f of [card, cursor, label]) {
        f.x.set(e.clientX);
        f.y.set(e.clientY);
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [card, cursor, label]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        variants={scaleAnimation}
        initial="initial"
        animate={active ? "enter" : "closed"}
        className="pointer-events-none fixed z-40 flex h-[350px] w-[400px] items-center justify-center overflow-hidden rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        style={{ left: card.sx, top: card.sy }}
      >
        <div
          className="absolute h-full w-full transition-[top] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
          style={{ top: `${index * -100}%` }}
        >
          {items.map((item) => (
            <div
              key={item.title}
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: item.color ?? "#0d1347" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote Unsplash crop */}
              <img
                src={item.image}
                alt=""
                className="h-[78%] w-[80%] rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        aria-hidden="true"
        variants={scaleAnimation}
        initial="initial"
        animate={active ? "enter" : "closed"}
        className="pointer-events-none fixed z-50 h-20 w-20 rounded-full"
        style={{ left: cursor.sx, top: cursor.sy, background: "#2c6bff" }}
      />
      <motion.div
        aria-hidden="true"
        variants={scaleAnimation}
        initial="initial"
        animate={active ? "enter" : "closed"}
        className="pointer-events-none fixed z-50 flex h-20 w-20 items-center justify-center text-sm font-light text-white"
        style={{ left: label.sx, top: label.sy }}
      >
        {cursorLabel}
      </motion.div>
    </>
  );
}

export default ServicesHoverModal;
