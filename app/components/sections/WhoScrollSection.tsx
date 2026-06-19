"use client";

import React, { useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Building, Landmark, Globe, ShoppingCart, Heart, GraduationCap } from "lucide-react";
import type { FlyingPostersHandle } from "../ui/FlyingPosters";

// OGL canvas — browser only
const FlyingPosters = dynamic(() => import("../ui/FlyingPosters"), { ssr: false });

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
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80",
  },
];

// Stable reference — prevents FlyingPosters from remounting on every render
const IMAGE_SRCS = useCases.map((c) => c.src);

export function WhoScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const flyingRef    = useRef<FlyingPostersHandle>(null);
  const activeIdxRef = useRef(0);

  useGSAP(() => {
    const outer = containerRef.current;
    if (!outer) return;

    const stickyEl  = outer.querySelector<HTMLElement>(".who-scroll-sticky");
    const listItems = Array.from(outer.querySelectorAll<HTMLElement>(".who-redesign-item"));
    if (!stickyEl || listItems.length === 0) return;

    const n = listItems.length;

    gsap.set(listItems,    { opacity: 0.2 });
    gsap.set(listItems[0], { opacity: 1   });

    const tl = gsap.timeline();
    for (let i = 1; i < n; i++) {
      tl.to(listItems[i - 1], { opacity: 0.2, duration: 0.4, ease: "none" });
      tl.to(listItems[i],     { opacity: 1,   duration: 0.4, ease: "none" }, "<");
    }

    const mm = gsap.matchMedia();

    // Trigger on the OUTER section so GSAP measures position from the section's
    // natural top (not from the pin-spacer wrapper). Pin the inner sticky div
    // explicitly. This ensures the pin fires exactly when the logo section above
    // has scrolled fully out of view — no early-pin overlap.
    const onUpdate = (self: ScrollTrigger) => {
      const newIdx = Math.min(Math.floor(self.progress * n), n - 1);
      if (newIdx === activeIdxRef.current) return;
      activeIdxRef.current = newIdx;
      flyingRef.current?.scrollToIndex(newIdx);
    };

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 769px)", () => {
      ScrollTrigger.create({
        trigger: outer,         // outer <section> — position unaffected by pin-spacer
        pin: stickyEl,          // pin the inner sticky div, not the trigger itself
        start: "top top",
        end: `+=${n * 100}vh`,
        pinSpacing: true,
        anticipatePin: 1,
        animation: tl,
        scrub: 0.5,
        onUpdate,
      });
    });

    mm.add("(prefers-reduced-motion: no-preference) and (max-width: 768px)", () => {
      ScrollTrigger.create({
        trigger: outer,
        pin: stickyEl,
        start: "top top",
        end: `+=${n * 50}vh`,
        pinSpacing: true,
        anticipatePin: 1,
        animation: tl,
        scrub: 0.5,
        onUpdate,
      });
    });

    // Reduced-motion: no pin, no scrub, all items visible
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(listItems, { opacity: 1 });
    });

    // Entrance reveals — fire once as the section scrolls in. The list items
    // animate transform only (y), leaving opacity to the scroll-driven highlight
    // above so the two never fight. The posters column fades opacity only (no
    // transform/scale) to avoid blurring the WebGL canvas.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const eyebrow = outer.querySelector<HTMLElement>(".who-eyebrow-tag");
      const heading = outer.querySelector<HTMLElement>(".who-redesign-h2");
      const rightCol = outer.querySelector<HTMLElement>(".who-redesign-right");

      gsap.from([eyebrow, heading].filter(Boolean) as HTMLElement[], {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: outer, start: "top 78%", once: true },
      });

      gsap.from(listItems, {
        y: 36,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: outer, start: "top 70%", once: true },
      });

      if (rightCol) {
        gsap.from(rightCol, {
          opacity: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: outer, start: "top 78%", once: true },
        });
      }
    });

    // Refresh after one frame so WhyScrollSection's pin-spacer is in the DOM
    // before WhoScrollSection recalculates its trigger position.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  return (
    <section ref={containerRef} className="who-scroll-outer">
      <div className="who-scroll-sticky">
        <div className="who-redesign-inner">

          {/* ── Left column ── */}
          <div className="who-redesign-left">
            <span className="who-eyebrow-tag">Industries We Serve</span>

            <h2 className="who-redesign-h2">
              Who can use<br />BalloAds?
            </h2>

            <ul className="who-redesign-list">
              {useCases.map((item) => (
                <li key={item.id} className="who-redesign-item">
                  <span className="who-item-num">{item.num}</span>

                  {/* Bare icon — no wrapper box */}
                  {React.cloneElement(
                    item.icon as React.ReactElement<{ className?: string; strokeWidth?: number }>,
                    { className: "who-item-icon", strokeWidth: 1.5 }
                  )}

                  <div className="who-item-body">
                    <p className="who-item-title">{item.text}</p>
                    <p className="who-item-subtext">{item.subtext}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right column ── */}
          <div className="who-redesign-right">

            {/* Reduced-motion fallback: static photo of first use case */}
            <div className="who-rmo-fallback" aria-hidden="true">
              <Image
                src={useCases[0].src}
                alt={useCases[0].text}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
                loading="lazy"
              />
            </div>

            {/* FlyingPosters — GSAP-driven via scrollToIndex, wheel disabled */}
            <div className="who-flying-wrap">
              <FlyingPosters
                ref={flyingRef}
                items={IMAGE_SRCS}
                planeWidth={712}
                planeHeight={506}
                distortion={3}
                scrollEase={0.06}
                cameraFov={45}
                cameraZ={20}
                disableWheel={true}
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
