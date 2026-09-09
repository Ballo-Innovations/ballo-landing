"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import ConcentricRings from "@/app/components/ui/ConcentricRings";
import { FadeUpReveal } from "@/app/components/ui/FadeUpReveal";
import { useWaitlist } from "@/app/components/waitlist/WaitlistProvider";
import { BrutusPhoneChat } from "@/app/components/brutus/BrutusPhoneChat";
import { BRUTUS_CAPABILITIES } from "@/app/components/brutus/content";
// Page styles are loaded through styles/index.css (styles/pages/brutus.css),
// which is also what lets the home page's Brutus section share the phone
// mock's styling.

import waGlow from "@/public/Assets/2.png";

// Full-bleed hero background video (lives in the asset library; path encoded
// for the spaces in the folder/filename).
const HERO_VIDEO = encodeURI("/BalloAds Assets 2/BalloAds Asset Videos.mp4");

export default function BrutusPage() {
  const { openWaitlist } = useWaitlist();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend yet — hand off to the live chat surface where Brutus lives.
    // The prompt is intentionally NOT passed in the URL.
    router.push("/live-chat");
  };

  return (
    <main className="brutus-page">
      {/* ---- Hero: full-bleed looping demo video ---- */}
      <section className="brutus-hero">
        <video
          className="brutus-hero__video"
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="brutus-hero__overlay" aria-hidden="true" />

        <div className="brutus-hero__inner">
          <FadeUpReveal yOffset={40} className="brutus-hero__copy">
            <span className="brutus-eyebrow">
              <Sparkles size={14} aria-hidden="true" />
              Meet Brutus — your AI assistant
            </span>
            <h1 className="brutus-hero__headline">
              A new way to <span className="brutus-hero__headline-accent">think and create</span>
            </h1>
          </FadeUpReveal>

          {/* Prompt bar — pinned toward the bottom of the hero */}
          <form className="brutus-prompt" onSubmit={handleAsk}>
            <input
              type="text"
              className="brutus-prompt__input"
              placeholder="Ask Brutus anything…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Ask Brutus anything"
            />
            <button type="submit" className="brutus-prompt__send" aria-label="Send to Brutus">
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      {/* ---- WhatsApp integration ---- */}
      <section className="brutus-whatsapp">
        <div className="brutus-wa">
          {/* Frosted white rectangle — header + sub-line, left-aligned */}
          <FadeUpReveal yOffset={50} className="brutus-wa-card">
            <h2 className="brutus-wa-card__title">Optimise WhatsApp Messaging</h2>
            <p className="brutus-wa-card__text">
              With WhatsApp Integration powered by Brutus, your messages go far beyond basic
              delivery.
            </p>
            <Link href="/whatsapp-marketing" className="brutus-wa-card__link">
              Read more
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </FadeUpReveal>

          {/* Phone + glow shape, right-aligned */}
          <div className="brutus-wa-phone" aria-hidden="true">
            <Image
              src={waGlow}
              alt=""
              className="brutus-wa-glow"
              style={{ maxWidth: "none", maxHeight: "none" }}
            />
            <BrutusPhoneChat priority onCta={openWaitlist} />
          </div>
        </div>

        <div className="brutus-arc" aria-hidden="true" />
      </section>

      {/* ---- Capabilities ---- */}
      <section className="brutus-capabilities">
        <div className="brutus-capabilities__rings" aria-hidden="true">
          <ConcentricRings />
        </div>

        <div className="brutus-capabilities__inner">
          <FadeUpReveal yOffset={40}>
            <h2 className="brutus-capabilities__title">
              Everything Brutus brings to your business
            </h2>
          </FadeUpReveal>

          <ul className="brutus-capabilities__grid">
            {BRUTUS_CAPABILITIES.map((cap) => (
              <li key={cap.title} className="brutus-cap">
                <span className="brutus-cap__check" aria-hidden="true">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l4 4L19 6" />
                  </svg>
                </span>
                <div>
                  <h3 className="brutus-cap__title">{cap.title}</h3>
                  <p className="brutus-cap__desc">{cap.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="brutus-capabilities__ctas">
            <button type="button" onClick={openWaitlist} className="btn-primary group">
              Get Started
            </button>
            <Link href="/live-chat" className="btn-secondary group">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
