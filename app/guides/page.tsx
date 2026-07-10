"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import "@/app/styles/pages/guides.css";

import heroPhoto from "@/public/Assets/12.png";
import pushNotifications from "@/public/Assets/10.png";
import analyticsTile from "@/public/BalloAds Assets 2/1.png";
import smsTile from "@/public/BalloAds Assets 2/24.png";
import uploadContacts from "@/public/Assets/14.png";
import whatsappTile from "@/public/BalloAds Assets 2/22.png";

const tiles = [
  { label: "Push Notifications", image: pushNotifications },
  { label: "Check your Analytics", image: analyticsTile },
  { label: "SMS marketing just for you", image: smsTile },
  { label: "Upload Contacts", image: uploadContacts },
  { label: "WhatsApp Marketing", image: whatsappTile },
];

const steps =
  "Open BalloAds · Menu · Create Ad · Type message · Select platform · Add contacts · Select duration · Select area · Preview · Done";

const faqs = [
  {
    q: "How do I create an account on BalloAds?",
    a: "Visit our homepage, click 'Sign Up', complete your details, and verify your account.",
  },
  {
    q: "How do I launch my first campaign?",
    a: "Open your dashboard, choose a channel, write your message, add your contacts, set a schedule, and hit send.",
  },
  {
    q: "Which channels can I send messages on?",
    a: "SMS, WhatsApp, email, web push, and pop-up notifications — all managed from one place.",
  },
  {
    q: "How do I upload my contacts?",
    a: "Import a CSV file or add contacts manually from the Contacts section of your dashboard.",
  },
  {
    q: "Can I schedule campaigns in advance?",
    a: "Yes — pick a date and time when creating a campaign and BalloAds sends it automatically.",
  },
  {
    q: "How does pricing work?",
    a: "Flexible plans that scale with your usage. See the Pricing page for current tiers.",
  },
  {
    q: "How do I track campaign performance?",
    a: "BalloDash Analytics shows delivery, opens, clicks, and conversions for every campaign in real time.",
  },
  {
    q: "Is my data secure?",
    a: "Yes — your data is encrypted, never shared, and handled under strict privacy and security standards.",
  },
  {
    q: "Can I target a specific audience?",
    a: "Use segmentation to reach contacts by behaviour, interest, location, or your own custom fields.",
  },
  {
    q: "How do I get help?",
    a: "Reach our support team any time via Live Chat, or talk to Brutus, our AI assistant.",
  },
];

export default function GuidesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) =>
    setOpenFaq((current) => (current === index ? null : index));

  return (
    <main className="guides-page">
      {/* Hero */}
      <section className="guides-hero">
        <div className="guides-hero__grid">
          {/* Demo card */}
          <div className="guides-hero__main">
            <div className="guides-hero__photo">
              <Image
                src={heroPhoto}
                alt="A BalloAds customer using the platform"
                fill
                sizes="(max-width: 900px) 45vw, 20rem"
                priority
              />
            </div>
            <div className="guides-hero__copy">
              <h1 className="guides-hero__headline">
                Seamless email Marketing and at your fingertips
              </h1>
              {/* TODO: wire to the product demo video once available. */}
              <Link href="/how-it-works" className="guides-watch-btn">
                Watch Demo
                <span className="guides-watch-btn__icon" aria-hidden="true">
                  <Play size={12} fill="currentColor" />
                </span>
              </Link>
            </div>
          </div>

          {/* Feature tiles */}
          <div className="guides-hero__tiles">
            {tiles.map((tile) => (
              <div className="guides-tile" key={tile.label}>
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 45vw, 12rem"
                  className="object-cover"
                />
                <span className="guides-tile__label">{tile.label}</span>
              </div>
            ))}
            <div className="guides-tile guides-tile--video">
              <span className="guides-tile__play" aria-hidden="true">
                <Play size={18} fill="currentColor" />
              </span>
            </div>
          </div>
        </div>

        <p className="guides-steps">{steps}</p>
      </section>

      {/* FAQ band */}
      <section className="guides-faq-band">
        <h2 className="guides-faq-band__title">FAQs</h2>
        <button type="button" className="guides-category">
          Category
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </section>

      {/* FAQ accordion */}
      <section className="guides-faq">
        <h2 className="guides-faq__title">
          Got any questions? <span>We&apos;ve got the answers</span>
        </h2>

        <div className="guides-faq__grid">
          {[0, 1].map((col) => (
            <div className="guides-faq__col" key={col}>
              {faqs.map((faq, i) => {
                if (i % 2 !== col) return null;
                const isOpen = openFaq === i;
                const panelId = `guides-faq-panel-${i}`;
                const triggerId = `guides-faq-trigger-${i}`;
                return (
                  <div key={faq.q} className={`guides-faq__item${isOpen ? " is-open" : ""}`}>
                    <h3 style={{ margin: 0 }}>
                      <button
                        id={triggerId}
                        type="button"
                        className="guides-faq__q"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggleFaq(i)}
                      >
                        <span className="guides-faq__q-text">{faq.q}</span>
                        <span className="guides-faq__toggle" aria-hidden="true" />
                      </button>
                    </h3>
                    <div id={panelId} role="region" aria-labelledby={triggerId} className="guides-faq__panel">
                      <div className="guides-faq__panel-inner" inert={!isOpen ? true : undefined}>
                        <p className="guides-faq__a">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="guides-contact">
        <div className="guides-contact__card">
          <h2 className="guides-contact__title">Still have questions?</h2>
          <p className="guides-contact__text">
            Can&apos;t find the answer to your question? Talk to{" "}
            <Link href="/live-chat">Brutus</Link> or contact us directly and we&apos;ll get back to
            you as soon as possible.
          </p>
          <Link href="/live-chat" className="guides-contact__btn">
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
