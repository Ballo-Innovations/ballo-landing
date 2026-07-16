"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import GradualBlur from "../ui/GradualBlur";

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

const useCases = [
  {
    id: "sme",
    num: "01",
    text: "SMEs & Corporations",
    subtext: "Promote products, services, and offers to your ideal customers.",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "finance",
    num: "02",
    text: "Financial Institutions",
    subtext: "Send loan approvals, transaction updates, and targeted offers.",
    src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "nonprofit",
    num: "03",
    text: "Nonprofits & Government",
    subtext: "Spread awareness and reach communities with mass communication.",
    src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "retail",
    num: "04",
    text: "Retail & E-commerce",
    subtext: "Drive sales, customer loyalty, and engagement at scale.",
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "healthcare",
    num: "05",
    text: "Healthcare & Clinics",
    subtext: "Send appointment reminders and targeted health campaigns.",
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "education",
    num: "06",
    text: "Education Institutions",
    subtext: "Notify students, parents, and staff with timely updates.",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
  },
];

const N = useCases.length;

// Mobile carousel auto-advance interval.
const AUTO_MS = 4500;

// Fraction of the pinned scroll spent on the card's rise before the slides
// begin stepping. Below this the card is emerging out of the liquid blur;
// above it the card is stuck and each slide steps in.
const RISE = 0.26;

export function WhoScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const activeIdxRef = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);

  // Static layout = mobile OR reduced-motion → a swipe/auto carousel (no pin,
  // no scroll-jacking) that mirrors the desktop one-at-a-time presentation.
  // Desktop with motion gets the scroll-driven rising stage.
  const [isStatic, setIsStatic] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  // Wall-clock origin for the auto-advance. The active index is DERIVED from
  // elapsed time, so extra timers (StrictMode dev double-invoke) just recompute
  // the same index — a harmless no-op — instead of racing each other.
  const autoStartRef = useRef(0);

  useEffect(() => {
    const mqSmall = window.matchMedia("(max-width: 900px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setIsStatic(mqSmall.matches || mqReduce.matches);
      setReduceMotion(mqReduce.matches);
    };
    update();
    mqSmall.addEventListener("change", update);
    mqReduce.addEventListener("change", update);
    return () => {
      mqSmall.removeEventListener("change", update);
      mqReduce.removeEventListener("change", update);
    };
  }, []);

  // Mobile carousel: gentle auto-advance (paused for reduced-motion). One stable
  // interval — activeIdx is intentionally NOT a dep, so it isn't torn down and
  // recreated on every tick (that stacked timers and interrupted the caption
  // fade-in). The functional update reads the latest index.
  useEffect(() => {
    if (!isStatic || reduceMotion) return;
    autoStartRef.current = performance.now();
    const id = setInterval(() => {
      const idx = Math.floor((performance.now() - autoStartRef.current) / AUTO_MS) % N;
      setActiveIdx(idx); // derived from elapsed time → idempotent under duplicate timers
    }, 500);
    return () => clearInterval(id);
  }, [isStatic, reduceMotion]);

  // Jump to a slide and re-anchor the clock so it shows now and advances in a
  // full AUTO_MS (used by dots + swipe).
  const jumpTo = (i: number) => {
    autoStartRef.current = performance.now() - i * AUTO_MS;
    setActiveIdx(i);
  };

  const onCarouselTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const onCarouselTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartXRef.current;
    touchStartXRef.current = null;
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) < 40) return;
    jumpTo(dx < 0 ? (activeIdx + 1) % N : (activeIdx - 1 + N) % N);
  };

  useGSAP(() => {
    const outer = containerRef.current;
    if (!outer) return;

    const mm = gsap.matchMedia();

    // ── Heading entrance (all breakpoints) ──
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const eyebrow = outer.querySelector<HTMLElement>(".who-eyebrow-tag");
      const heading = outer.querySelector<HTMLElement>(".who-redesign-h2");
      gsap.from([eyebrow, heading].filter(Boolean) as HTMLElement[], {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: outer, start: "top 80%", once: true },
      });
    });

    // ── Desktop only: pin the section; the card rises out of the fixed
    //    liquid-blur band at the bottom, then (once stuck) each industry
    //    slide steps in one at a time. ──
    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      const sticky = outer.querySelector<HTMLElement>(".who-scroll-sticky");
      const strip = outer.querySelector<HTMLElement>(".who-strip");
      const stageEl = outer.querySelector<HTMLElement>(".who-stage");
      if (!sticky || !strip || !stageEl) return;

      // Card starts a full height below rest — hidden below the fold / down in
      // the blur — so the section reads as empty at the bottom while you
      // approach it (nothing rises until you've scrolled into the section).
      gsap.set(stageEl, { yPercent: 100 });
      gsap.set(strip, { yPercent: 0 });

      // Slides step in with their own eased tween once stuck — NOT a
      // continuous scrub tied to scroll speed.
      const animateToIndex = (idx: number) => {
        gsap.to(strip, {
          yPercent: -100 * idx,
          duration: 0.6,
          ease: "power2.inOut",
          overwrite: true,
        });
      };
      const setActive = (idx: number) => {
        if (idx === activeIdxRef.current) return;
        activeIdxRef.current = idx;
        setActiveIdx(idx);
        animateToIndex(idx);
      };

      ScrollTrigger.create({
        trigger: outer,
        pin: sticky,
        start: "top top",
        // Function form → real pixels (ScrollTrigger ignores "vh" in "+=").
        // Recomputed on resize/refresh: enough scroll for the rise + N slides.
        end: () => `+=${(N + 1) * window.innerHeight * 0.55}`,
        pinSpacing: true,
        refreshPriority: -1,
        onUpdate: (self) => {
          const p = self.progress;
          if (p <= RISE) {
            // Phase 1 — scrubbed rise: the card climbs out of the blur band,
            // scroll-linked so it tracks the wheel 1:1.
            gsap.set(stageEl, { yPercent: 100 * (1 - p / RISE) });
            setActive(0);
          } else {
            // Phase 2 — stuck: discrete, eased slide steps.
            gsap.set(stageEl, { yPercent: 0 });
            const sp = (p - RISE) / (1 - RISE);
            setActive(Math.max(0, Math.min(Math.round(sp * (N - 1)), N - 1)));
          }
        },
      });

      return () => {
        gsap.set([strip, stageEl], { clearProps: "transform" });
      };
    });

    // The pin start depends on the hero + Why pins above, plus async image/font
    // heights. Refresh after the next frame AND on window load so the first
    // scroll-through measures against a settled layout (no erratic jump).
    requestAnimationFrame(() => ScrollTrigger.refresh());
    if (document.readyState !== "complete") {
      window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    }
  }, { scope: containerRef });

  const active = useCases[activeIdx];

  return (
    <section ref={containerRef} className="who-scroll-outer">
      <div className={`who-scroll-sticky${isStatic ? " is-static" : ""}`}>
        <div className="who-redesign-inner">

          {/* ── Heading ── */}
          <div className="who-stage-head">
            <span className="who-eyebrow-tag">Industries We Serve</span>
            <h2 className="who-redesign-h2">Who can use BalloAds?</h2>
          </div>

          {/* ── Desktop: rising-image card (left) ── */}
          {!isStatic && (
            <div className="who-stage">
              <div className="who-strip">
                {useCases.map((item, i) => (
                  <div className={`who-slide${i === activeIdx ? " is-active" : ""}`} key={item.id}>
                    <Image
                      src={item.src}
                      alt={item.text}
                      fill
                      sizes="(max-width: 1200px) 45vw, 430px"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>

              {/* Progress dots — current image within the set */}
              <div className="who-progress" aria-hidden="true">
                {useCases.map((item, i) => (
                  <span key={item.id} className={`who-dot${i === activeIdx ? " is-active" : ""}`} />
                ))}
              </div>
            </div>
          )}

          {/* ── Synced industry caption (right) — remounts per slide so its
               staggered "focus-in" reveal replays with each change ── */}
          {!isStatic && (
            <div className="who-headline-caption" key={active.id}>
              <span className="who-caption-num">{active.num}</span>
              <p className="who-caption-title">{active.text}</p>
              <p className="who-caption-sub">{active.subtext}</p>
            </div>
          )}

          {/* ── Mobile / reduced-motion: swipe + auto carousel (mirrors the
               desktop one-at-a-time presentation) ── */}
          {isStatic && (
            <div className="who-mcarousel">
              <div
                className="who-mstage"
                onTouchStart={onCarouselTouchStart}
                onTouchEnd={onCarouselTouchEnd}
              >
                <div
                  className="who-mstrip"
                  style={{ transform: `translateX(-${activeIdx * 100}%)` }}
                >
                  {useCases.map((item, i) => (
                    <div className="who-mslide" key={item.id}>
                      <Image
                        src={item.src}
                        alt={item.text}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority={i === 0}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Synced caption — remounts per slide so the focus-in reveal replays */}
              <div className="who-mcaption" key={active.id}>
                <span className="who-caption-num">{active.num}</span>
                <p className="who-caption-title">{active.text}</p>
                <p className="who-caption-sub">{active.subtext}</p>
              </div>

              {/* Tappable progress dots */}
              <div className="who-mdots">
                {useCases.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    className={i === activeIdx ? "is-active" : ""}
                    onClick={() => jumpTo(i)}
                    aria-label={`Show ${item.text}`}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Persistent "liquid surface" — a fixed gradual-blur band at the
            section's bottom edge (reactbits mechanic). The card rises up
            THROUGH it: its lower portion stays blurred (submerged) while the
            top emerges sharp. It never fades — it's the water line. */}
        {!isStatic && (
          <>
            {/* Crisp water-line where the card breaks the surface. */}
            <div className="who-surface-glow" aria-hidden="true" />
            <GradualBlur
              className="who-reveal-blur"
              target="parent"
              position="bottom"
              height="11rem"
              strength={2.5}
              divCount={6}
              curve="bezier"
              exponential
              opacity={1}
              zIndex={15}
            />
          </>
        )}
      </div>
    </section>
  );
}
