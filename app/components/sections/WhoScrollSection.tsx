"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Building, Landmark, Globe, ShoppingCart, Heart, GraduationCap } from "lucide-react";
import GradualBlur from "../ui/GradualBlur";

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

const useCases = [
  {
    id: "sme",
    num: "01",
    icon: <Building />,
    text: "SMEs & Corporations",
    subtext: "Promote products, services, and offers to your ideal customers.",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "finance",
    num: "02",
    icon: <Landmark />,
    text: "Financial Institutions",
    subtext: "Send loan approvals, transaction updates, and targeted offers.",
    src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "nonprofit",
    num: "03",
    icon: <Globe />,
    text: "Nonprofits & Government",
    subtext: "Spread awareness and reach communities with mass communication.",
    src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "retail",
    num: "04",
    icon: <ShoppingCart />,
    text: "Retail & E-commerce",
    subtext: "Drive sales, customer loyalty, and engagement at scale.",
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "healthcare",
    num: "05",
    icon: <Heart />,
    text: "Healthcare & Clinics",
    subtext: "Send appointment reminders and targeted health campaigns.",
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "education",
    num: "06",
    icon: <GraduationCap />,
    text: "Education Institutions",
    subtext: "Notify students, parents, and staff with timely updates.",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
  },
];

const N = useCases.length;

export function WhoScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const activeIdxRef = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);

  // Static layout = mobile OR reduced-motion → accessible stacked cards
  // (no pin, no scroll-jacking). Desktop with motion gets the rising stage.
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    const mqSmall = window.matchMedia("(max-width: 768px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setIsStatic(mqSmall.matches || mqReduce.matches);
    update();
    mqSmall.addEventListener("change", update);
    mqReduce.addEventListener("change", update);
    return () => {
      mqSmall.removeEventListener("change", update);
      mqReduce.removeEventListener("change", update);
    };
  }, []);

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

    // ── Desktop only: pin the stage and scrub the filmstrip up through
    //    every image; each rises into view as the previous exits the top. ──
    mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
      const sticky = outer.querySelector<HTMLElement>(".who-scroll-sticky");
      const strip = outer.querySelector<HTMLElement>(".who-strip");
      const stageEl = outer.querySelector<HTMLElement>(".who-stage");
      const revealMask = outer.querySelector<HTMLElement>(".who-reveal-blur");
      if (!sticky || !strip || !stageEl) return;

      // Card reveal: starts a full card-height below rest (yPercent:100 —
      // entirely below the fold, so the section reads as empty at first),
      // then rises as the section scrolls into view, reaching rest exactly
      // when the section's top hits the viewport top — the same instant the
      // pin below engages, so the rise hands off into the "stick" with no
      // gap. It passes up through the entrance blur zone on the way, so it
      // reads as emerging out of the blur rather than just sliding in.
      gsap.fromTo(
        stageEl,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: outer,
            start: "top bottom",
            end: "top top",
            scrub: true,
            refreshPriority: -1,
          },
        }
      );

      // The entrance mask's geometry overlaps the card's own resting bottom
      // (where the caption lives) since it's tall enough to mask the card
      // during transit — so it must fade out in the same window the card
      // rises, reaching 0 opacity exactly when the card settles. Otherwise
      // it would permanently blur the caption after the section sticks.
      if (revealMask) {
        gsap.fromTo(
          revealMask,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: outer,
              start: "top bottom",
              end: "top top",
              scrub: true,
              refreshPriority: -1,
            },
          }
        );
      }

      // Once stuck, each slide steps in with its own eased tween — not a
      // continuous scrub tied to scroll speed. The pin's onUpdate only
      // detects which discrete index we've crossed into.
      const animateToIndex = (idx: number) => {
        gsap.to(strip, {
          yPercent: -100 * idx,
          duration: 0.6,
          ease: "power2.in",
          overwrite: true,
        });
      };

      ScrollTrigger.create({
        trigger: outer,
        pin: sticky,
        start: "top top",
        // Function form → real pixels (ScrollTrigger ignores "vh" in "+=").
        // ~0.6 viewport of scroll per image, recomputed on resize/refresh.
        end: () => `+=${N * window.innerHeight * 0.6}`,
        pinSpacing: true,
        refreshPriority: -1,
        onUpdate: (self) => {
          const idx = Math.max(0, Math.min(Math.round(self.progress * (N - 1)), N - 1));
          if (idx === activeIdxRef.current) return;
          activeIdxRef.current = idx;
          setActiveIdx(idx);
          animateToIndex(idx);
        },
      });

      return () => {
        gsap.set(strip, { clearProps: "transform" });
        gsap.set(stageEl, { clearProps: "transform" });
        if (revealMask) gsap.set(revealMask, { clearProps: "opacity" });
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

          {/* ── Desktop: rising-image stage ── */}
          {!isStatic && (
            <div className="who-stage">
              <div className="who-strip">
                {useCases.map((item, i) => (
                  <div className="who-slide" key={item.id}>
                    <Image
                      src={item.src}
                      alt={item.text}
                      fill
                      sizes="(max-width: 1200px) 92vw, 1100px"
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

              {/* GradualBlur — softens the image where it meets the caption */}
              <GradualBlur
                target="parent"
                position="bottom"
                height="9rem"
                strength={2.5}
                divCount={6}
                curve="bezier"
                exponential
                opacity={1}
                zIndex={5}
              />

              {/* Caption — crisp, above the blur; swaps with the active image */}
              <div className="who-caption" style={{ zIndex: 6 }}>
                <div className="who-caption-inner" key={active.id}>
                  <span className="who-caption-num">{active.num}</span>
                  <div className="who-caption-text">
                    <p className="who-caption-title">
                      {React.cloneElement(
                        active.icon as React.ReactElement<{ className?: string; strokeWidth?: number }>,
                        { className: "who-caption-icon", strokeWidth: 1.75 }
                      )}
                      {active.text}
                    </p>
                    <p className="who-caption-sub">{active.subtext}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Mobile / reduced-motion: stacked cards ── */}
          {isStatic && (
            <div className="who-mobile-stack">
              {useCases.map((item, i) => (
                <div className="who-mcard" key={item.id}>
                  <div className="who-mcard-photo">
                    <Image
                      src={item.src}
                      alt={item.text}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                    <span className="who-mphoto-num">{item.num}</span>
                  </div>
                  <div className="who-mcard-body">
                    <p className="who-item-title">{item.text}</p>
                    <p className="who-item-subtext">{item.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Entrance blur — full-width, anchored to the section's bottom edge.
            The card rises up through this fixed zone from below the fold, so
            it reads as emerging out of the blur rather than just sliding in. */}
        {!isStatic && (
          <GradualBlur
            className="who-reveal-blur"
            target="parent"
            position="bottom"
            height="26rem"
            strength={3}
            divCount={7}
            curve="bezier"
            exponential
            opacity={1}
            zIndex={15}
          />
        )}
      </div>
    </section>
  );
}
