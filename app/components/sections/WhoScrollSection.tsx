"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import {
  Building,
  Landmark,
  Globe,
  ShoppingCart,
  Heart,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import building from "@/public/Assets/46.png";
import buildingFinance from "@/public/Assets/48.png";
import buildingNonprofit from "@/public/Assets/49.png";
import buildingRetail from "@/public/Assets/51.png";
import buildingHealthcare from "@/public/Assets/53.png";
import buildingEducation from "@/public/Assets/57.png";


interface UseCase {
  id: string;
  icon: React.ReactNode;
  text: string;
  subtext: string;
  image: StaticImageData;
}

const useCases: UseCase[] = [
  {
    id: "sme",
    icon: <Building className="w-6 h-6" />,
    text: "SMEs & Corporations",
    subtext: "Promote products, services, and offers.",
    image: building,
  },
  {
    id: "finance",
    icon: <Landmark className="w-6 h-6" />,
    text: "Financial Institutions",
    subtext: "Send loan approvals, transaction updates, and offers.",
    image: buildingFinance,
  },
  {
    id: "nonprofit",
    icon: <Globe className="w-6 h-6" />,
    text: "Nonprofits & Government Initiatives",
    subtext: "Spread awareness with mass communication.",
    image: buildingNonprofit,
  },
  {
    id: "retail",
    icon: <ShoppingCart className="w-6 h-6" />,
    text: "Retail & E-commerce",
    subtext: "Drive sales and customer engagement.",
    image: buildingRetail,
  },
  {
    id: "healthcare",
    icon: <Heart className="w-6 h-6" />,
    text: "Healthcare & Clinics",
    subtext: "Send appointment reminders and health campaigns.",
    image: buildingHealthcare,
  },
  {
    id: "education",
    icon: <GraduationCap className="w-6 h-6" />,
    text: "Education Institutions",
    subtext: "Notify students, parents, and staff with updates.",
    image: buildingEducation,
  },
];

const SLIDE_MS = 4000;

export function WhoScrollSection() {
  const count = useCases.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setTimeout(() => setActive((v) => (v + 1) % count), SLIDE_MS);
    return () => clearTimeout(t);
  }, [active, paused, reduced, count]);

  const go = useCallback((i: number) => setActive(((i % count) + count) % count), [count]);
  const current = useCases[active];

  return (
    <section
      className="wc-section"
      aria-roledescription="carousel"
      aria-label="Who can use BalloAds"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h2 className="who-scroll-heading-text">Who can use BalloAds?</h2>

      <div className="wc-grid">
        <div className="wc-tabs" role="tablist" aria-label="Business types">
          {useCases.map((item, i) => {
            const on = i === active;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="wc-panel"
                onClick={() => go(i)}
                className={`wc-tab${on ? " is-active" : ""}`}
              >
                <span className="wc-tab__icon" aria-hidden="true">
                  {React.cloneElement(item.icon as React.ReactElement<{ className?: string; strokeWidth?: number }>, {
                    className: "w-5 h-5 md:w-6 md:h-6",
                    strokeWidth: 1.6,
                  })}
                </span>
                <span className="wc-tab__text">
                  <span className="wc-tab__title">{item.text}</span>
                  <span className="wc-tab__sub">{item.subtext}</span>
                </span>
                {on && (
                  <span className="wc-tab__progress" aria-hidden="true">
                    <span
                      key={`${active}-${paused}`}
                      className={`wc-tab__bar${paused || reduced ? " is-paused" : ""}`}
                      style={{ animationDuration: `${SLIDE_MS}ms` }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="wc-stage" id="wc-panel" role="tabpanel" aria-live="polite">
          <div className="wc-frame">
            {useCases.map((item, i) => (
              <div key={item.id} className={`wc-slide${i === active ? " is-active" : ""}`} aria-hidden={i !== active}>
                <Image src={item.image} alt={item.text} placeholder="blur" sizes="(max-width: 768px) 90vw, 45vw" />
              </div>
            ))}
            <span className="wc-caption">{current.text}</span>
          </div>

          <div className="wc-controls">
            <button type="button" className="wc-arrow" onClick={() => go(active - 1)} aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <div className="wc-dots">
              {useCases.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(i)}
                  className={`wc-dot tap-dot${i === active ? " is-active" : ""}`}
                  aria-label={`Show ${item.text}`}
                />
              ))}
            </div>
            <span className="wc-count" aria-hidden="true">
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button type="button" className="wc-arrow" onClick={() => go(active + 1)} aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
