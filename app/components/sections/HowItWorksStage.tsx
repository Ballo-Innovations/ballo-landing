"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { howItWorksSteps } from "@/app/how-it-works/steps";

const AUTO_MS = 4200;

/** Card surface treatment per step, matching the mockup's alternating palette. */
const VARIANTS = ["navy", "outline", "soft", "blue"] as const;

/**
 * Orthogonal elbow connectors between consecutive step cards, in a 0–100
 * viewBox (preserveAspectRatio="none") so the coordinates track the same
 * percentage grid the cards are positioned on. Each path starts and ends
 * *inside* the cards it joins — the cards sit above the SVG and hide the
 * ends, so the join stays clean even as card heights change with content.
 */
const CONNECTORS = [
  "M 19.5 10 V 20 H 35.5 V 30",
  "M 35.5 36 V 46 H 53.5 V 56",
  "M 53.5 62 V 72 H 71.5 V 82",
];

export default function HowItWorksStage() {
  const [active, setActive] = useState(0);
  const [tookOver, setTookOver] = useState(false);
  const startRef = useRef(0);

  // Auto-tour until the visitor interacts. The index is derived from elapsed
  // time rather than incremented, so a duplicated timer (StrictMode double
  // invoke / Fast Refresh) recomputes the same value instead of double-stepping.
  useEffect(() => {
    if (tookOver) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startRef.current = performance.now();
    const id = setInterval(() => {
      const i =
        Math.floor((performance.now() - startRef.current) / AUTO_MS) % howItWorksSteps.length;
      setActive(i);
    }, 250);
    return () => clearInterval(id);
  }, [tookOver]);

  const pick = (i: number) => {
    setTookOver(true);
    setActive(i);
  };

  return (
    <div className="hiw-flow">
      <svg
        className="hiw-flow__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {CONNECTORS.map((d, i) => (
          <path
            key={d}
            className={`hiw-flow__line${
              active > i ? " is-done" : active === i ? " is-current" : ""
            }`}
            d={d}
          />
        ))}
      </svg>

      {/* Decorative app screens flanking the staircase */}
      <div className="hiw-flow__phone hiw-flow__phone--top" aria-hidden="true">
        <span className="hiw-flow__halo" />
        <Image
          src={howItWorksSteps[0].screen}
          alt=""
          priority
          sizes="(max-width: 900px) 30vw, 11rem"
          className="hiw-flow__phone-img"
        />
      </div>
      <div className="hiw-flow__phone hiw-flow__phone--mid" aria-hidden="true">
        <span className="hiw-flow__halo" />
        <Image
          src={howItWorksSteps[3].screen}
          alt=""
          priority
          sizes="(max-width: 900px) 34vw, 13rem"
          className="hiw-flow__phone-img"
        />
      </div>

      {howItWorksSteps.map((step, i) => (
        <Link
          key={step.slug}
          href={`/how-it-works/${step.slug}`}
          className={`hiw-step hiw-step--${VARIANTS[i]} hiw-step--p${i + 1}${
            active === i ? " is-active" : ""
          }`}
          onMouseEnter={() => pick(i)}
          onFocus={() => pick(i)}
          aria-current={active === i ? "step" : undefined}
        >
          <span className="hiw-step__head">
            <span className="hiw-step__num" aria-hidden="true">
              {step.number}.
            </span>
            <span className="hiw-step__title">{step.title}</span>
          </span>
          <span className="hiw-step__desc">{step.description}</span>
        </Link>
      ))}
    </div>
  );
}
