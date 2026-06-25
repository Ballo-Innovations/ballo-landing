"use client";

import React, { useRef, useState, useEffect } from "react";
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
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
  },
];

// Stable reference — prevents FlyingPosters from remounting on every render
const IMAGE_SRCS = useCases.map((c) => c.src);

export function WhoScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const flyingRef    = useRef<FlyingPostersHandle>(null);
  const activeIdxRef = useRef(0);

  // Desktop = WebGL pinned fan. Mobile = horizontal swipe carousel.
  const [isMobile, setIsMobile]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const scrollRafRef    = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Mobile: derive the active item from the carousel's horizontal scroll offset.
  const handleMobileScroll = () => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = 0;
      const el = mobileScrollRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      const clamped = Math.max(0, Math.min(idx, useCases.length - 1));
      setActiveIdx((prev) => (prev === clamped ? prev : clamped));
    });
  };

  // Mobile: tapping a list item snaps the carousel to that image.
  const scrollToImage = (i: number) => {
    const el = mobileScrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  useGSAP(() => {
    const outer = containerRef.current;
    if (!outer) return;

    const stickyEl  = outer.querySelector<HTMLElement>(".who-scroll-sticky");
    const listItems = Array.from(outer.querySelectorAll<HTMLElement>(".who-redesign-item"));
    if (!stickyEl || listItems.length === 0) return;

    const n = listItems.length;

    const mm = gsap.matchMedia();

    // ── Desktop only: pinned WebGL fan, scroll-driven highlight ──
    // The opacity highlight + pin live inside the desktop branch so the mobile
    // layout (where the highlight is React-driven from the carousel) is never
    // touched by GSAP inline styles.
    const onUpdate = (self: ScrollTrigger) => {
      const newIdx = Math.min(Math.floor(self.progress * n), n - 1);
      if (newIdx === activeIdxRef.current) return;
      activeIdxRef.current = newIdx;
      flyingRef.current?.scrollToIndex(newIdx);
    };

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 769px)", () => {
      gsap.set(listItems,    { opacity: 0.2 });
      gsap.set(listItems[0], { opacity: 1   });

      const tl = gsap.timeline();
      for (let i = 1; i < n; i++) {
        tl.to(listItems[i - 1], { opacity: 0.2, duration: 0.4, ease: "none" });
        tl.to(listItems[i],     { opacity: 1,   duration: 0.4, ease: "none" }, "<");
      }

      ScrollTrigger.create({
        trigger: outer,         // outer <section> — position unaffected by pin-spacer
        pin: stickyEl,          // pin the inner sticky div, not the trigger itself
        start: "top top",
        // ~half a viewport of scroll per item — ScrollTrigger ignores "vh"/"%"
        // units in "+=" strings (it would treat "+=600vh" as 600px), so use the
        // function form for real pixels, recomputed on resize/refresh.
        end: () => `+=${n * window.innerHeight * 0.5}`,
        pinSpacing: true,
        // No anticipatePin — it pre-engages the pin a few frames early, snapping
        // the content up while the previous section is still leaving. Engaging
        // exactly at "top top" keeps the hand-off clean with no jump.
        // Lower than the hero/why pins above so this section measures AFTER them.
        refreshPriority: -1,
        animation: tl,
        scrub: 0.5,
        onUpdate,
      });

      return () => gsap.set(listItems, { clearProps: "opacity" });
    });

    // Entrance reveals — text + list slide up once as the section scrolls in.
    // No opacity tween on the list so it never fights the highlight (desktop:
    // GSAP-driven, mobile: CSS .is-active).
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const eyebrow = outer.querySelector<HTMLElement>(".who-eyebrow-tag");
      const heading = outer.querySelector<HTMLElement>(".who-redesign-h2");

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
    });

    // The pin start depends on the hero (pinSpacing:false) and Why pins above,
    // plus async image/font heights. A single rAF refresh runs before that has
    // settled, leaving a stale start — which makes the FIRST scroll-through jump
    // erratically (it self-corrects only after a later refresh). So refresh after
    // the next frame AND on window load, once everything is measured.
    requestAnimationFrame(() => ScrollTrigger.refresh());
    if (document.readyState !== "complete") {
      window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    }
    // Run once on mount — desktop/mobile reactivity is handled by gsap.matchMedia
    // above, so we must NOT re-run (and revert mid-flight) when isMobile flips.
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="who-scroll-outer">
      <div className="who-scroll-sticky">
        <div className="who-redesign-inner">

          {/* ── Mobile-only: horizontal thumb-scroll carousel (one image at a time,
               swipe left→right cycles 1–6, drives the list highlight) ── */}
          {isMobile && (
            <div
              className="who-mobile-photos"
              ref={mobileScrollRef}
              onScroll={handleMobileScroll}
            >
              {useCases.map((item, i) => (
                <div className="who-mphoto" key={item.id}>
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
              ))}
            </div>
          )}

          {/* ── Left column ── */}
          <div className="who-redesign-left">
            <span className="who-eyebrow-tag">Industries We Serve</span>

            <h2 className="who-redesign-h2">
              Who can use<br />BalloAds?
            </h2>

            <ul className="who-redesign-list">
              {useCases.map((item, i) => (
                <li
                  key={item.id}
                  className={`who-redesign-item${isMobile && i === activeIdx ? " is-active" : ""}`}
                  onClick={isMobile ? () => scrollToImage(i) : undefined}
                >
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

          {/* ── Desktop-only right column — pinned WebGL fan ── */}
          {!isMobile && (
            <div className="who-redesign-right">

              {/* Reduced-motion fallback: static photo of first use case */}
              <div className="who-rmo-fallback" aria-hidden="true">
                <Image
                  src={useCases[0].src}
                  alt={useCases[0].text}
                  fill
                  sizes="55vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>

              {/* FlyingPosters — GSAP-driven via scrollToIndex, wheel disabled */}
              <div className="who-flying-wrap">
                <FlyingPosters
                  ref={flyingRef}
                  items={IMAGE_SRCS}
                  initialIndex={0}
                  planeWidth={712}
                  planeHeight={506}
                  distortion={3}
                  scrollEase={0.12}
                  cameraFov={45}
                  cameraZ={20}
                  disableWheel={true}
                />
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}
