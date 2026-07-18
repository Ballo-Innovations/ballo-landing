"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { howItWorksSteps } from "@/app/how-it-works/steps";

const AUTO_MS = 4200;
const LEFT = [0, 1];
const RIGHT = [2, 3];

/**
 * HowItWorksStage — the phone sits at the centre with a tile per step orbiting
 * it. Hovering, focusing, or clicking a tile switches the phone to that step's
 * real in-app screen. It auto-tours the steps until the visitor interacts, then
 * hands control over for good.
 */
export default function HowItWorksStage() {
  const [active, setActive] = useState(0);
  const [tookOver, setTookOver] = useState(false);
  const startRef = useRef(0);

  // Auto-tour. The index is derived from elapsed time rather than incremented,
  // so a duplicated timer (StrictMode double-invoke / Fast Refresh) recomputes
  // the same value instead of double-stepping the cadence.
  useEffect(() => {
    if (tookOver) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startRef.current = performance.now();
    const id = setInterval(() => {
      const i = Math.floor((performance.now() - startRef.current) / AUTO_MS) % howItWorksSteps.length;
      setActive(i);
    }, 250);
    return () => clearInterval(id);
  }, [tookOver]);

  const pick = (i: number) => {
    setTookOver(true);
    setActive(i);
  };

  const step = howItWorksSteps[active];

  const renderTile = (i: number) => {
    const s = howItWorksSteps[i];
    const isActive = i === active;
    const Icon = s.Icon;
    return (
      <button
        key={s.slug}
        type="button"
        className={`hiw-tile${isActive ? " is-active" : ""}`}
        onMouseEnter={() => pick(i)}
        onFocus={() => pick(i)}
        onClick={() => pick(i)}
        aria-pressed={isActive}
        aria-label={`Show step ${s.number}: ${s.title}`}
      >
        <span className="hiw-tile__icon">
          <Icon strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="hiw-tile__text">
          <span className="hiw-tile__num">Step {s.number}</span>
          <span className="hiw-tile__title">{s.title}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="hiw-stage">
      <div className="hiw-stage__panel">
        <div className="hiw-stage__cols">
          <div className="hiw-tiles hiw-tiles--left">{LEFT.map(renderTile)}</div>

          <div className="hiw-phone">
            <span className="hiw-phone__glow" aria-hidden="true" />
            {/* All four are eager: they're stacked above the fold and swap on
                hover, so a lazy screen would flash blank on first switch. */}
            {howItWorksSteps.map((s, i) => (
              <Image
                key={s.slug}
                src={s.screen}
                alt=""
                aria-hidden="true"
                priority
                sizes="(max-width: 900px) 60vw, 20rem"
                className={`hiw-phone__screen${i === active ? " is-active" : ""}`}
              />
            ))}
          </div>

          <div className="hiw-tiles hiw-tiles--right">{RIGHT.map(renderTile)}</div>
        </div>

        {/* Caption — carries the semantics for the (decorative) phone screens. */}
        <div className="hiw-caption" key={step.slug} aria-live="polite">
          <span className="hiw-caption__num">Step {step.number}</span>
          <h3 className="hiw-caption__title">{step.title}</h3>
          <p className="hiw-caption__desc">{step.description}</p>
          <Link href={`/how-it-works/${step.slug}`} className="hiw-caption__link">
            Read more
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
