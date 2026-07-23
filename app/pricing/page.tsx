"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PricingStepsFlow, type PricingStep } from "@/app/components/pricing/PricingStepsFlow";
import { PricingHeroToggle } from "@/app/components/pricing/PricingHeroToggle";

import bg from "@/public/BalloAds Assets 2/1.png";
import step1 from "@/public/Assets/45.png";
import step2 from "@/public/Assets/39.png";
import step3 from "@/public/Assets/38.png";
import step4 from "@/public/Assets/40.png";
import ring from "@/public/Assets/9.png";
import woman from "@/public/BalloAds Assets 2/23.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  text: string;
  included: boolean;
}

interface PricingTier {
  id: string;
  title: string;
  currency: string;
  subtitle: string;
  icon: React.ReactNode;
  features: Feature[];
}

// ─── Inline icons ─────────────────────────────────────────────────────────────

const SmsIcon = () => (
  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.615-.838A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 0 1-4.065-1.113l-.291-.173-3.015.548.559-2.938-.19-.303A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const pricingData: PricingTier[] = [
  {
    id: "sms",
    title: "SMS",
    currency: "K",
    subtitle: "Base (Suitable for freelancers/small businesses). No matter your industry, you can enjoy:",
    icon: <SmsIcon />,
    features: [
      { text: "Quick action tools and scheduling", included: true },
      { text: "Analytics and campaign data", included: true },
      { text: "Generative AI for quick content creation.", included: true },
      { text: "AI Agent for automations", included: true },
      { text: "Email and Push Notification support", included: true },
      { text: "Unlimited sms expiry", included: false },
    ],
  },
  {
    id: "email",
    title: "Email",
    currency: "K",
    subtitle: "Booster (Suitable for SMEs) No matter your industry, you can enjoy:",
    icon: <EmailIcon />,
    features: [
      { text: "Quick action tools and scheduling", included: true },
      { text: "Analytics and campaign data", included: true },
      { text: "Generative AI for quick content creation.", included: true },
      { text: "AI Agent for automations", included: true },
      { text: "Email and Push Notification support", included: true },
      { text: "Unlimited email expiry", included: false },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    currency: "K",
    subtitle: "Suitable for SMEs vying for growth. No matter your industry, you can enjoy:",
    icon: <WhatsAppIcon />,
    features: [
      { text: "Quick action tools and scheduling", included: true },
      { text: "Analytics and campaign data", included: true },
      { text: "Generative AI for quick content creation.", included: true },
      { text: "AI Agent for automations", included: true },
      { text: "Email and Push Notification support", included: true },
      { text: "Unlimited WhatsApp expiry", included: false },
    ],
  },
];

// ─── Price logic ──────────────────────────────────────────────────────────────

const STEP = 250;
const MIN_MSGS = 1000;
const MAX_MSGS = 10000;

function calculatePrice(messages: number): number {
  const base = 850;
  const extra = Math.max(0, messages - MIN_MSGS);
  return base + Math.ceil(extra / STEP) * 12;
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────

function PricingCard({ tier }: { tier: PricingTier }) {
  const [messages, setMessages] = useState(1750);
  const price = useMemo(() => calculatePrice(messages), [messages]);
  const progress = ((messages - MIN_MSGS) / (MAX_MSGS - MIN_MSGS)) * 100;

  return (
    <div
      className="bg-white rounded-3xl flex flex-col overflow-hidden border border-slate-100/60 h-full"
      style={{ boxShadow: "0 8px 32px rgba(10, 31, 110, 0.13), 0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div className="h-1.5 w-full bg-[#0a1f6e]" />

      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <h3 className="font-bold text-base text-slate-800 tracking-tight">{tier.title}</h3>
        {tier.icon}
      </div>

      {/* Message counter + progress bar */}
      <div className="px-5 pb-3 pt-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
          Number of Messages
        </p>
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <button
            onClick={() => setMessages((m) => Math.max(MIN_MSGS, m - STEP))}
            aria-label="Decrease"
            className="pricing-card__stepper-btn w-7 h-7 sm:w-6 sm:h-6 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm transition-colors"
          >
            -
          </button>
          <span className="text-sm font-bold text-slate-800 tabular-nums">{messages.toLocaleString()}</span>
          <button
            onClick={() => setMessages((m) => Math.min(MAX_MSGS, m + STEP))}
            aria-label="Increase"
            className="pricing-card__stepper-btn w-7 h-7 sm:w-6 sm:h-6 rounded bg-[#0a1f6e] hover:bg-[#0d2a8a] flex items-center justify-center text-white font-bold text-sm transition-colors"
          >
            +
          </button>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-0.75 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0a1f6e] rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Price */}
      <div className="px-5 pb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {tier.currency}{price.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-normal">per month</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-4">
        <Link
          href="#waitlist"
          className="pricing-card__cta block w-full text-center bg-[#0a1f6e] hover:bg-[#0d2a8a] text-white py-2.5 rounded-full text-sm font-semibold transition-colors"
        >
          Sign Up
        </Link>
      </div>

      {/* Features */}
      <div className="px-5 pb-5 border-t border-slate-100 pt-4 flex-1">
        <p className="text-[10px] text-slate-500 mb-3 leading-snug">{tier.subtitle}</p>
        <ul className="space-y-2">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              {f.included ? (
                <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-green-600" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </span>
              ) : (
                <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-red-500" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l6 6M9 3l-6 6" />
                  </svg>
                </span>
              )}
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#DFE0E1";
    return () => { document.body.style.background = prev; };
  }, []);

  const stepsFlow: PricingStep[] = [
    { id: 1, title: "1. Easy Registration", image: step1, imageAlt: "Easy Registration" },
    { id: 2, title: "2. Purchase a package", image: step2, imageAlt: "Purchase a package" },
    { id: 3, title: "3. Run your campaign", image: step4, imageAlt: "Run your campaign" },
    { id: 4, title: "4. View Analytics", image: step3, imageAlt: "View Analytics" },
  ];

  return (
    <main className="pricing-page font-sans">

      <section className="pricing-hero">
        <div className="pricing-hero__card">
          <Image
            src={bg}
            alt=""
            fill
            className="object-cover object-center opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0a1220]/15 via-[#0a1220]/50 to-[#0a1220]/92" />

          <div className="pricing-hero__card-inner">
            <h1 className="pricing-hero__title">Dynamic, Transparent Pricing</h1>
            <PricingHeroToggle />
          </div>
        </div>

        <div className="pricing-cards">
          <div className="pricing-cards__grid">
            {pricingData.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-steps">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="pricing-steps__heading">Drive more growth in just 4 easy steps</h2>
          <PricingStepsFlow steps={stepsFlow} />
        </div>
      </section>

      <section className="pricing-cta">
        <div className="pricing-cta__inner">
          <div className="pricing-cta__copy">
            <h2 className="pricing-cta__title">
              Run your campaign
              <br />
              in just a few seconds
            </h2>
            <p className="pricing-cta__text">
              After registration, utilise automations and run your dynamic campaigns in just a few clicks anywhere, anytime.
            </p>
            <button type="button" className="pricing-cta__btn">
              Download now
            </button>
          </div>

          <div className="pricing-cta__visual">
            <Image src={ring} alt="" aria-hidden="true" width={320} height={320} className="pricing-cta__ring" />
            <Image
              src={woman}
              alt="BalloAds user on mobile"
              width={280}
              height={300}
              className="pricing-cta__person"
              priority
            />
          </div>
        </div>
      </section>

    </main>
  );
}
