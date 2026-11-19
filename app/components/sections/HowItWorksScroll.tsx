"use client";

// How it works, designed layout (flag: howItWorksDesign).
//
// A staircase of four step cards with a phone on the right (steps 1 and 2)
// and a phone on the left (steps 3 and 4). On a desktop the section holds in
// place while the visitor scrolls: the steps glide in one at a time with the
// scroll, each connector draws in, and only the screen inside a phone changes. From step 3
// the view moves down to the left phone. On a phone the cards stack and fade
// in as they come into view. With reduced motion everything is simply shown.
//
// Styles: app/styles/pages/how-it-works.css (`.hiwd-*`). The phone frame and
// screens are the features page's (scripts/build-features-phone.cjs).

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import phoneFrame from "@/public/Assets/features-phone/frame.png";
import screenSignup from "@/public/Assets/features-phone/screen-signup.webp";
import screenHome from "@/public/Assets/features-phone/screen-home.webp";
import screenSms from "@/public/Assets/features-phone/screen-sms.webp";
import screenAnalytics from "@/public/Assets/features-phone/screen-analytics.webp";

export type HowItWorksScrollStep = {
  key: string;
  number: string;
  title: string;
  description: string;
  /** Detail page for the step, when the CMS has one. */
  href: string | null;
  /** CMS screen for the step's phone; a built-in app screen is used without one. */
  screen: string | null;
};

const BUILT_IN_SCREENS: { src: StaticImageData; alt: string }[] = [
  { src: screenSignup, alt: "The BalloAds sign-up screen" },
  { src: screenHome, alt: "The BalloAds home screen, with Create Bulk Message and Create Ad" },
  { src: screenSms, alt: "Writing an SMS campaign in BalloAds" },
  { src: screenAnalytics, alt: "Campaign analytics in BalloAds" },
];

const VARIANTS = ["navy", "outline", "soft", "blue"] as const;

/**
 * Elbow connectors between consecutive cards, in a 0-100 viewBox stretched
 * over the stage, so they share the percentage grid the cards sit on. Each
 * one starts and ends under a card.
 */
const CONNECTORS = ["M 11 10 V 30.4 H 20", "M 50 30.4 H 60 V 56", "M 60 60 V 85.7 H 68"];

type Mode = "static" | "pin" | "stack";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export default function HowItWorksScroll({ steps }: { steps: HowItWorksScrollStep[] }) {
  const shown = steps.slice(0, 4);
  const count = shown.length;

  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  // Before the script runs (and with reduced motion) every step is shown.
  const [mode, setMode] = useState<Mode>("static");
  const [active, setActive] = useState(count - 1);
  const [seen, setSeen] = useState<boolean[]>(() => shown.map(() => true));

  useIsoLayoutEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pick = () => {
      const next: Mode = calm.matches ? "static" : wide.matches ? "pin" : "stack";
      setMode(next);
      if (next === "static") {
        setActive(count - 1);
        setSeen(shown.map(() => true));
      } else {
        setActive(0);
        setSeen(shown.map(() => false));
      }
    };
    pick();
    wide.addEventListener("change", pick);
    calm.addEventListener("change", pick);
    return () => {
      wide.removeEventListener("change", pick);
      calm.removeEventListener("change", pick);
    };
  }, [count]);

  // Desktop: the wrapper is taller than the screen and its child is sticky, so
  // scrolling through it yields a 0-1 progress. Everything is driven from that
  // progress, eased a little each frame, so the steps glide in with the scroll
  // instead of snapping at fixed points.
  useEffect(() => {
    if (mode !== "pin") return;
    const wrap = wrapRef.current;
    const view = viewRef.current;
    const stage = stageRef.current;
    if (!wrap || !view || !stage) return;

    const cards = cardRefs.current.filter((c): c is HTMLElement => c !== null);
    const lines = Array.from(stage.querySelectorAll<SVGPathElement>(".hiwd-line"));
    const phoneB = stage.querySelector<HTMLElement>(".hiwd-phone--b");

    let frame = 0;
    let current = -1;

    const measure = () => {
      if (wrap.offsetParent === null) return 0; // hidden: the flag is off
      const total = wrap.offsetHeight - window.innerHeight;
      return total > 0 ? Math.min(1, Math.max(0, -wrap.getBoundingClientRect().top / total)) : 0;
    };

    const paint = (progress: number) => {
      // `at` runs 0 to `count`: step n is settled once it passes n - 1.
      const at = progress * count;
      setActive(Math.min(count - 1, Math.max(0, Math.floor(at + 0.25))));

      cards.forEach((card, i) => {
        const t = i === 0 ? 1 : smoothstep((at - (i - 0.5)) / 0.42);
        card.style.opacity = t.toFixed(3);
        card.style.transform = `translate3d(0, ${((1 - t) * 30).toFixed(1)}px, 0)`;
      });
      // Each line draws just before the card it leads to arrives.
      lines.forEach((line, i) => {
        const t = smoothstep((at - (i + 0.2)) / 0.4);
        line.style.strokeDashoffset = (1 - t).toFixed(3);
      });
      if (phoneB) {
        const t = smoothstep((at - 1.5) / 0.45);
        phoneB.style.opacity = t.toFixed(3);
        phoneB.style.transform = `translate3d(0, ${((1 - t) * 34).toFixed(1)}px, 0) scale(${(0.94 + 0.06 * t).toFixed(4)})`;
      }

      // On screens shorter than the staircase, move down to the lower half as
      // the third step arrives.
      const styles = getComputedStyle(view);
      const room =
        view.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
      const overflow = Math.max(0, stage.offsetHeight - room);
      const shift = overflow * smoothstep((at - 1.5) / 0.75);
      stage.style.transform = `translate3d(0, ${(-shift).toFixed(1)}px, 0)`;
    };

    const tick = () => {
      frame = 0;
      const target = measure();
      if (current < 0) current = target;
      const gap = target - current;
      current = Math.abs(gap) < 0.0004 ? target : current + gap * 0.14;
      paint(current);
      if (current !== target) frame = requestAnimationFrame(tick);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      stage.style.transform = "";
      for (const el of [...cards, ...(phoneB ? [phoneB] : [])]) {
        el.style.opacity = "";
        el.style.transform = "";
      }
      for (const line of lines) line.style.strokeDashoffset = "";
    };
  }, [mode, count]);

  // Phone: cards fade in as they arrive, and the card nearest the middle of
  // the screen picks the phone screen.
  useEffect(() => {
    if (mode !== "stack") return;
    const cards = cardRefs.current.filter((c): c is HTMLElement => c !== null);
    if (cards.length === 0) return;
    const reveal = new IntersectionObserver(
      (entries) => {
        const hits = entries.filter((e) => e.isIntersecting).map((e) => cards.indexOf(e.target as HTMLElement));
        if (hits.length === 0) return;
        setSeen((prev) => prev.map((v, i) => v || hits.includes(i)));
      },
      { threshold: 0.3 },
    );
    const focus = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(cards.indexOf(entry.target as HTMLElement));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const card of cards) {
      reveal.observe(card);
      focus.observe(card);
    }
    return () => {
      reveal.disconnect();
      focus.disconnect();
    };
  }, [mode, count]);

  if (count === 0) return null;

  const isShown = (i: number) => (mode === "pin" ? i <= active : mode === "stack" ? seen[i] : true);
  const screenFor = (i: number) => {
    const builtIn = BUILT_IN_SCREENS[i % BUILT_IN_SCREENS.length];
    const step = shown[i];
    return step?.screen ? { src: step.screen, alt: `${step.title}: app screen` } : builtIn;
  };

  const renderPhone = (which: "a" | "b") => {
    // Phone A plays the first two steps, phone B the last two.
    const indices = (which === "a" ? [0, 1] : [2, 3]).filter((i) => i < count);
    if (indices.length === 0) return null;
    const current = which === "a" ? Math.min(active, indices[indices.length - 1]) : Math.max(active, indices[0]);
    const visible = which === "a" ? true : isShown(indices[0]);
    const resting = mode === "pin" && which === "a" && active > indices[indices.length - 1];
    return (
      <div
        className={`hiwd-phone hiwd-phone--${which}${visible ? " is-shown" : ""}${resting ? " is-resting" : ""}`}
        aria-hidden="true"
      >
        <span className="hiwd-phone__halo" />
        <span className="hiwd-phone__shadow" />
        <div className="hiwd-phone__display">
          {indices.map((i) => {
            const screen = screenFor(i);
            return (
              <Image
                key={i}
                src={screen.src}
                alt=""
                width={600}
                height={1336}
                sizes="(max-width: 900px) 45vw, 15rem"
                className={`hiwd-phone__screen${i === current ? " is-active" : ""}`}
              />
            );
          })}
        </div>
        <Image
          src={phoneFrame}
          alt=""
          sizes="(max-width: 900px) 90vw, 32rem"
          className="hiwd-phone__frame"
        />
      </div>
    );
  };

  const renderCard = (i: number) => {
    const step = shown[i];
    if (!step) return null;
    const className = `hiwd-step hiwd-step--${VARIANTS[i % VARIANTS.length]} hiwd-step--p${i + 1}${
      isShown(i) ? " is-shown" : ""
    }${active === i ? " is-active" : ""}`;
    const body = (
      <>
        <span className="hiwd-step__head">
          <span className="hiwd-step__num" aria-hidden="true">
            {step.number}.
          </span>
          <span className="hiwd-step__title">
            <span className="hiwd-sr">Step {step.number}: </span>
            {step.title}
          </span>
        </span>
        <span className="hiwd-step__desc">{step.description}</span>
      </>
    );
    const setRef = (el: HTMLElement | null) => {
      cardRefs.current[i] = el;
    };
    return step.href ? (
      <Link key={step.key} ref={setRef} href={step.href} className={className} role="listitem">
        {body}
      </Link>
    ) : (
      <div key={step.key} ref={setRef} className={className} role="listitem">
        {body}
      </div>
    );
  };

  return (
    <div
      ref={wrapRef}
      className="hiwd-scroll"
      data-mode={mode}
      style={{ ["--hiwd-steps" as string]: count }}
    >
      <div className="hiwd-pin">
        <div ref={viewRef} className="hiwd-view">
          <div ref={stageRef} className="hiwd-stage" role="list" aria-label="How it works, in four steps">
            <svg className="hiwd-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {CONNECTORS.slice(0, Math.max(0, count - 1)).map((d, i) => (
                <path
                  key={d}
                  d={d}
                  pathLength={1}
                  className={`hiwd-line${isShown(i + 1) ? " is-drawn" : ""}`}
                />
              ))}
            </svg>
            {renderCard(0)}
            {renderPhone("a")}
            {renderCard(1)}
            {renderCard(2)}
            {renderPhone("b")}
            {renderCard(3)}
          </div>
        </div>
      </div>
    </div>
  );
}
