"use client";

import React, { useEffect, useRef, useState } from "react";

export type StackedCard = {
  title: string;
  img: string;
  href?: string;
};

/* Sample data — portrait Unsplash photos + blog-style titles */
const DEFAULT_ITEMS: StackedCard[] = [
  { title: "Get to know about Insurance", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=640&h=900&q=70" },
  { title: "The latest on AI Technology", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=640&h=900&q=70" },
  { title: "You've heard about Teledoctor", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=640&h=900&q=70" },
  { title: "Working from home remotely", img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=640&h=900&q=70" },
  { title: "Big brands use marketing", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&h=900&q=70" },
  { title: "Lifestyle with Medicine", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=640&h=900&q=70" },
  { title: "Growing your business online", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&h=900&q=70" },
];

/* Tier ratios relative to the hero card (measured from the original). */
const SCALES = [1, 0.77, 0.64, 0.5];
/* Top-edge drop as a fraction of hero width: 0 / 70 / 125 / 150 at heroW=320 */
const DROP_FRAC = [0, 70 / 320, 125 / 320, 150 / 320];
const Z_BY_TIER = [50, 40, 30, 20];
const TINT_BY_TIER = [0, 0.12, 0.22, 0.34];
const ASPECT = 0.7; // width ÷ height

function pickConfig(w: number) {
  if (w >= 1024) return { heroW: 320, ov: 0.34, maxTier: 3 };
  if (w >= 768) return { heroW: 264, ov: 0.4, maxTier: 3 };
  if (w >= 560) return { heroW: 234, ov: 0.46, maxTier: 2 };
  // Phones: let the hero card fill far more of the column so the side cards
  // just peek and the empty space around the stack is evened out.
  return { heroW: Math.max(230, Math.min(290, w * 0.72)), ov: 0.62, maxTier: 1 };
}

const Chevron = ({ dir = "right" }: { dir?: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
    />
  </svg>
);

export function StackedCardCarousel({
  items = DEFAULT_ITEMS,
  initialCenter = 0,
}: {
  items?: StackedCard[];
  initialCenter?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(1280);
  const [center, setCenter] = useState(initialCenter);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerW(entry.contentRect.width));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const N = items.length;
  const half = Math.floor(N / 2);
  const { heroW, ov, maxTier } = pickConfig(containerW);
  const heroH = heroW / ASPECT;

  // Cumulative horizontal centres, computed from the scaled widths so adjacent
  // cards overlap by `ov` of the smaller (outer) card's width.
  const widths = SCALES.map((s) => heroW * s);
  const xc = [0, 0, 0, 0];
  for (let t = 1; t <= 3; t++) {
    xc[t] = xc[t - 1] + (widths[t - 1] + widths[t]) / 2 - ov * widths[t];
  }
  const drops = DROP_FRAC.map((f) => f * heroW);
  const stageH = Math.round(heroH + 56);

  const outerTier = Math.min(maxTier, 3);
  const nextX = xc[outerTier];
  const nextY = drops[outerTier] + heroH * SCALES[outerTier] * 0.42;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dist = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dist) > 50) {
      if (dist > 0) setCenter((c) => (c + 1) % N);
      else setCenter((c) => (c - 1 + N) % N);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="scc-wrap"
      ref={wrapRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="scc-glow" aria-hidden="true" />
      <div
        className="scc-stage"
        style={{ height: stageH, ["--k" as string]: String(heroW / 320) } as React.CSSProperties}
      >
        {items.map((item, i) => {
          // Circular signed offset in [-half, half] → always a symmetric fan.
          let o = (i - center) % N;
          if (o > half) o -= N;
          if (o < -half) o += N;

          const tier = Math.abs(o);
          const visible = tier <= maxTier;
          const sign = Math.sign(o);
          const tEff = Math.min(tier, 3);

          let x = sign * xc[tEff];
          let y = drops[tEff];
          let s = SCALES[tEff];
          if (!visible) {
            // Tuck hidden cards just past the outermost visible slot.
            x = sign * (xc[outerTier] + widths[outerTier]);
            y = drops[outerTier];
            s = SCALES[outerTier] * 0.92;
          }

          const isCenter = o === 0;

          return (
            <div
              key={i}
              className={`scc-card${isCenter ? " is-center" : ""}`}
              style={{
                width: heroW,
                height: heroH,
                backgroundImage: `url(${item.img})`,
                transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) scale(${s})`,
                zIndex: visible ? Z_BY_TIER[tEff] : 0,
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
              }}
              onClick={() => !isCenter && setCenter(i)}
              role={isCenter ? undefined : "button"}
              tabIndex={isCenter || !visible ? -1 : 0}
              aria-label={isCenter ? undefined : `Bring "${item.title}" to front`}
              onKeyDown={(e) => {
                if (!isCenter && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  setCenter(i);
                }
              }}
            >
              <div className="scc-card__grad" />
              <div className="scc-card__tint" style={{ opacity: visible ? TINT_BY_TIER[tEff] : 0.5 }} />
              <div className="scc-card__body">
                <h3 className="scc-card__title">{item.title}</h3>
                <a
                  href={item.href ?? "#"}
                  className="scc-card__btn"
                  onClick={(e) => e.stopPropagation()}
                  tabIndex={isCenter ? 0 : -1}
                >
                  Read Article
                  <Chevron />
                </a>
              </div>
            </div>
          );
        })}

        {/* Carousel controls — sit over the outermost cards */}
        <button
          type="button"
          className="scc-arrow scc-prev"
          aria-label="Previous article"
          style={{ left: `calc(50% - ${nextX}px)`, top: nextY }}
          onClick={() => setCenter((c) => (c - 1 + N) % N)}
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          className="scc-arrow scc-next"
          aria-label="Next article"
          style={{ left: `calc(50% + ${nextX}px)`, top: nextY }}
          onClick={() => setCenter((c) => (c + 1) % N)}
        >
          <Chevron dir="right" />
        </button>
      </div>
    </div>
  );
}
