"use client";

import React from "react";
import Image from "next/image";
import { useRotatingIndex } from "./useRotatingIndex";

import phoneFrame from "@/public/Assets/phone-frame.png";
import analyticsDashImg from "@/public/Assets/analytics-D8Ni1S4n.png";


const features = [
  { title: "AI-Powered Targeting", desc: "Get your message in front of the right audience at the right time." },
  { title: "Bulk & Personalised Messaging", desc: "Scale up your outreach while keeping it personal." },
  { title: "Real-Time Analytics", desc: "Track campaign performance and optimise results." },
  { title: "User-Friendly Dashboard", desc: "Manage all your campaigns in one place." },
  { title: "Affordable & Scalable", desc: "Flexible pricing that grows with your business." },
];

export function WhyScrollSection() {
  const active = useRotatingIndex(features.length, 3500);

  return (
    <section className="why-scroll-outer">
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
              onClick={() => window.dispatchEvent(new CustomEvent("open-waitlist"))}
              className="mt-8 inline-flex items-center gap-4 bg-white text-[#020055] px-8 py-2 rounded-full font-black text-lg hover:bg-white/90 transition-all group cursor-pointer"
            >
              Join the waitlist
              <div className="w-8 h-8 rounded-full bg-[#020055] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          <div className="why-right-area">
            <div className="why-bg-images h-[60vh] mt-32 rounded-3xl overflow-hidden">
              <Image
                src={analyticsDashImg}
                alt=""
                aria-hidden="true"
                fill
                sizes="50vw"
                loading="lazy"
                className="why-bg-img"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
            </div>
            <div className="why-phone-wrapper">
              <ul className="why-scroll-items" style={{ "--count": 5 } as React.CSSProperties}>
                {features.map((feature, i) => (
                  <li key={i} className={`why-scroll-item${i === active ? " is-active" : ""}`} style={{ "--i": i } as React.CSSProperties} aria-hidden={i !== active}>
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
