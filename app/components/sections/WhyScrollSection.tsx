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
    const WHY_START = 190;
    const WHY_END = 340;
    const hues = items.map((_, i) =>
      WHY_START + ((WHY_END - WHY_START) / (numItems - 1)) * i
    );
    const alphas = items.map((_, i) => (i === 0 || i === numItems - 1 ? 0 : 1));

    gsap.set(stickyEl, { "--bg-hue": hues[0], "--bg-alpha": alphas[0] });
    gsap.set(items, { opacity: 0 });
    gsap.set(items[0], { opacity: 1 });

    const tl = gsap.timeline();
    for (let i = 1; i < numItems; i++) {
      tl.to(items[i - 1], { opacity: 0, duration: 0.7 });
      tl.to(items[i], { opacity: 1, duration: 0.7 }, "<");
      tl.to(
        stickyEl,
        { "--bg-hue": hues[i], "--bg-alpha": alphas[i], ease: "none", duration: 1 },
        "<"
      );
    }

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: stickyEl,
        start: "top top",
        end: `+=${numItems * 100}vh`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        animation: tl,
        scrub: 0.5,
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(items, { opacity: 1 });
    });

    // Entrance reveal for the heading block (heading, subtitle, CTA) — fires
    // once as the section scrolls in, before the pin engages. Kept separate
    // from the pinned timeline so it never fights GSAP's opacity scrubbing.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const headingChildren = outer.querySelectorAll<HTMLElement>(".why-scroll-heading > *");
      gsap.from(headingChildren, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: stickyEl, start: "top 80%", once: true },
      });
    });
  });

  return (
    <section ref={containerRef} className="why-scroll-outer">
      <div className="why-scroll-sticky">
        <div className="why-scroll-inner">
          <div className="why-scroll-heading">
            <h2 className="text-4xl md:text-8xl font-black text-gradient-silver leading-tight tracking-tight">
              Why<br />Choose<br />BalloAds?
            </h2>
            <p className="mt-4 text-white text-base leading-relaxed" style={{ maxWidth: "22rem" }}>
              The digital marketing platform built for your growth.
            </p>
            <button
              type="button"
              onClick={openWaitlist}
              className="btn-primary group mt-8"
            >
              Join Waitlist
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
                className="why-phone-frame-img"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
