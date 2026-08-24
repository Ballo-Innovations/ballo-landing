"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import phoneFrame from "@/public/Assets/phone-frame.png";
import BalloLoader from "@/app/components/ui/BalloLoader";
import { useWaitlist } from "@/app/components/waitlist/WaitlistProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const features = [
  { title: "AI-Powered Targeting", desc: "Get your message in front of the right audience at the right time." },
  { title: "Bulk & Personalised Messaging", desc: "Scale up your outreach while keeping it personal." },
  { title: "Real-Time Analytics", desc: "Track campaign performance and optimise results." },
  { title: "User-Friendly Dashboard", desc: "Manage all your campaigns in one place." },
  { title: "Affordable & Scalable", desc: "Flexible pricing that grows with your business." },
];

export function WhyScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { openWaitlist } = useWaitlist();

  useGSAP(() => {
    const outer = containerRef.current;
    if (!outer) return;

    const stickyEl = outer.querySelector<HTMLElement>(".why-scroll-sticky");
    const items = Array.from(outer.querySelectorAll<HTMLElement>(".why-scroll-item"));
    if (!stickyEl || items.length === 0) return;

    const numItems = items.length;
    // Section background stays transparent (page gradient shows through) and the
    // phone-screen hue stays fixed — no colour-change-on-scroll effect. Only the
    // feature cards swipe vertically as the user scrolls, then flow to the next section.
    gsap.set(stickyEl, { "--bg-hue": 190, "--bg-alpha": 0 });
    // Vertical carousel rather than a crossfade: every card is fully opaque
    // and parked one full screen below, so two cards are never legible on top
    // of each other. Each card is inset:0 on the screen box, so 100% == one
    // whole phone screen of travel.
    gsap.set(items, { opacity: 1, yPercent: 100 });
    gsap.set(items[0], { yPercent: 0 });

    // The timeline is hold-then-slide, not a continuous drift: each card rests
    // for HOLD of the scroll and the swap itself only takes SLIDE. Combined
    // with the snap below, the scroll cannot come to rest halfway through a
    // swap — the state the design must never show is two half-cards stacked.
    const HOLD = 1;
    const SLIDE = 0.32;

    const tl = gsap.timeline();
    // Progress values (0-1) where exactly one card fills the screen. These are
    // the only positions the scroll is allowed to settle on.
    const restTimes = [0];
    for (let i = 1; i < numItems; i++) {
      tl.to(items[i - 1], { yPercent: -100, duration: SLIDE, ease: "power2.inOut" }, `+=${HOLD}`);
      tl.to(items[i], { yPercent: 0, duration: SLIDE, ease: "power2.inOut" }, "<");
      restTimes.push(tl.duration());
    }
    // Trailing hold so the last card gets the same dwell as the others before
    // the pin releases.
    tl.to({}, { duration: HOLD });
    const total = tl.duration();
    const snapPoints = restTimes.map((t) => t / total).concat(1);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: stickyEl,
        start: "top top",
        // Function form → real pixels, recomputed on refresh. ScrollTrigger does
        // NOT parse units inside a "+=" string, so the previous
        // `+=${numItems * 100}vh` silently resolved to 500 *pixels* — the
        // section pinned for well under one viewport and all five cards
        // crossfaded inside it.
        //
        // Deliberately ~0.55 viewport per card rather than the full viewport
        // the old string implied: that would be five viewports of held scroll,
        // which is more scroll-jacking than this page should do (it is why the
        // Who section stopped pinning entirely).
        end: () => `+=${numItems * window.innerHeight * 0.55}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        animation: tl,
        // 1:1 with the scroll position. `scrub: 0.5` was half a second of
        // deliberate catch-up easing, which on a fast flick left the crossfade
        // visibly trailing the scroll — two feature cards on screen at partial
        // opacity at once. A number here buys smoothness at the cost of lag;
        // `true` locks the timeline to the scrollbar.
        scrub: true,
        // Snap the timeline straight to its end state when a fast scroll blows
        // past the pin, instead of leaving it mid-crossfade.
        fastScrollEnd: true,
        // Settle on a whole card. Without this, stopping mid-swap leaves two
        // cards half on screen — the exact state this section must never show.
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.15, max: 0.45 },
          delay: 0.04,
          ease: "power1.inOut",
        },
      });
    });

    mm.add("(max-width: 900px), (prefers-reduced-motion: reduce)", () => {
      gsap.set(items, { opacity: 1, yPercent: (i) => (i === 0 ? 0 : 100) });
    });

    // Entrance reveal for the heading block (heading, subtitle, CTA) — fires
    // once as the section scrolls in, before the pin engages. Kept separate
    // from the pinned timeline so it never fights GSAP's opacity scrubbing.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The CTA is deliberately excluded from the y-translation. Any tween that
      // moves it can leave an inline `transform: translate(0px, 60px)` behind
      // if it is interrupted — StrictMode's double effect invoke, an HMR
      // remount, or the ScrollTrigger.refresh() below — and because transforms
      // do not affect layout that stranded offset reads as phantom margin above
      // the button. It fades only, so no transform is ever written to it.
      const revealTargets = outer.querySelectorAll<HTMLElement>(
        ".why-scroll-heading > :not(button)",
      );
      const cta = outer.querySelector<HTMLElement>(".why-scroll-heading > button");
      const trigger = { trigger: stickyEl, start: "top 80%", once: true } as const;

      gsap.fromTo(
        revealTargets,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform,opacity",
          scrollTrigger: trigger,
        },
      );

      if (cta) {
        gsap.fromTo(
          cta,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.9,
            delay: 0.36,
            ease: "power3.out",
            clearProps: "opacity",
            scrollTrigger: trigger,
          },
        );
      }
    });

    // This pin's start/end are measured against a layout that is still settling
    // (fonts, the phone frame, and the industry images below). Remeasure once
    // on load. The Who section used to own the only refresh() on the page and
    // fixed this pin as a side effect; it no longer uses GSAP at all, so the
    // pin that actually needs the refresh now asks for it itself.
    if (document.readyState === "complete") {
      ScrollTrigger.refresh();
    } else {
      window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    }
  });

  return (
    <section ref={containerRef} className="why-scroll-outer">
      <div className="why-scroll-sticky">
        <div className="why-scroll-inner">
          <div className="why-scroll-heading">
            <h2 className="text-4xl md:text-8xl font-black text-gradient-silver leading-tight tracking-tight">
              Why<br />Choose<br />BalloAds?
            </h2>
            <p className="landing-body mt-3 text-white" style={{ maxWidth: "26rem" }}>
              Most tools make you choose between reach and relevance. BalloAds
              gives you both: one place to build an audience, send SMS,
              WhatsApp and email campaigns, and see exactly what each message
              earned you.
            </p>
            <button
              type="button"
              onClick={openWaitlist}
              className="btn-primary group mt-6"
            >
              Get Started
            </button>
          </div>

          <div className="why-right-area">
            <div className="why-bg-images" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BalloLoader />
            </div>
            <div className="why-phone-wrapper">
              <ul className="why-scroll-items" style={{ "--count": 5 } as React.CSSProperties}>
                {features.map((feature, i) => (
                  <li key={i} className="why-scroll-item" style={{ "--i": i } as React.CSSProperties}>
                    <span className="why-scroll-item-num">0{i + 1}</span>
                    <h3 className="why-scroll-item-title">{feature.title}</h3>
                    <p className="why-scroll-item-desc">{feature.desc}</p>
                  </li>
                ))}
              </ul>
              <Image
                src={phoneFrame}
                alt=""
                aria-hidden="true"
                sizes="(max-width: 768px) 220px, 300px"
                className="why-phone-frame-img"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
