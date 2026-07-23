"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Check, X, MessageSquare, Mail, Phone, MessageCircle } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';

import bg from "@/public/BalloAds Assets 2/1.png";
import step1 from "@/public/Assets/45.png";
import step2 from "@/public/Assets/39.png";
import step3 from "@/public/Assets/38.png";
import step4 from "@/public/Assets/40.png";
import ring from "@/public/Assets/9.png";
import woman from "@/public/BalloAds Assets 2/25.png"

// --- TYPESCRIPT INTERFACES ---

interface Feature {
  text: string;
  included: boolean;
}

interface PricingTier {
    id: string;
    title: string;
    currency: string;
    icon: React.ReactNode;
    features: Feature[];
  }
  
  // --- DATA ---
  
  const pricingData: PricingTier[] = [
    {
      id: 'sms', title: 'SMS', currency: 'K', icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
      features: [
        { text: 'Quick action tools and scheduling', included: true },
        { text: 'Analytics and campaign data', included: true },
        { text: 'Generative AI for quick content', included: true },
        { text: 'Unlimited sms expiry', included: true },
      ],
    },
    {
      id: 'email', title: 'Email', currency: 'K', icon: <Mail className="w-6 h-6 text-blue-400" />,
      features: [
        { text: 'Quick action tools and scheduling', included: true },
        { text: 'Analytics and campaign data', included: true },
        { text: 'AI Agent for automations', included: true },
        { text: 'Unlimited email expiry', included: true },
      ],
    },
    {
      id: 'whatsapp', title: 'WhatsApp', currency: 'K', icon: <MessageCircle className="w-6 h-6 text-green-500" />,
      features: [
        { text: 'Quick action tools and scheduling', included: true },
        { text: 'Analytics and campaign data', included: true },
        { text: 'Email and Push Notification support', included: true },
        { text: 'Unlimited WhatsApp expiry', included: true },
      ],
    },
  ];
  
  // --- HELPER FUNCTION FOR PRICING ---
  const calculatePrice = (messages: number): number => {
    const baseMessages = 1000;
    const basePrice = 0.400;
    const ratePerUnit = -0.034;
    const messagesPerRate = 1000;
  
    if (messages <= baseMessages) { return basePrice; }
  
    const excessMessages = messages - baseMessages;
    const priceIncrease = Math.ceil(excessMessages / messagesPerRate) * ratePerUnit;
    
    return basePrice + priceIncrease;
  };
  
  
  // --- REUSABLE COMPONENTS ---
  
  interface PricingCardProps {
    tier: PricingTier;
    initialMessages: number;
    maxMessages: number; 
  }
  
  const PricingCard: React.FC<PricingCardProps> = ({ tier, initialMessages, maxMessages = 10000 }) => {
    const [selectedMessages, setSelectedMessages] = useState(initialMessages);
  
    const calculatedPrice = useMemo(() => {
      return calculatePrice(selectedMessages);
    }, [selectedMessages]);
  
    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedMessages(parseInt(event.target.value));
    };
  
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden h-full">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-900" />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-slate-800">{tier.title}</h3>
          {tier.icon}
        </div>
  
        <div className="mb-6">
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {tier.currency}{calculatedPrice} <span className="text-sm text-slate-500 font-normal">per month</span>
          </div>
          
          {/* FUNCTIONAL SLIDER INPUT */}
          <div className="relative mt-3">
              <input
                  type="range"
                  min={initialMessages}
                  max={maxMessages}
                  step={250}
                  value={selectedMessages}
                  onChange={handleSliderChange}
                  className="w-full h-6 appearance-none bg-transparent cursor-pointer touch-pan-y [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-slate-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-900 [&::-webkit-slider-thumb]:shadow-lg"
              />
          </div>
  
          <div className="text-xs font-semibold text-slate-500 mt-2">
            Messages: {selectedMessages.toLocaleString()} +
          </div>
        </div>
  
        <button className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors mb-8">
          Sign Up
        </button>
  
        <div className="space-y-3 flex-grow border-t pt-6 border-slate-100">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              {feature.included ? (
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="text-slate-600">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
// Assume you are defining this component in a file like PricingAndSteps.tsx
export default function PricingAndSteps() {
  const router = useRouter();
  const pathname = usePathname();

  const isUnlimited = pathname === "/pricing/unlimited";

  // Force the body background to match the page so no dark bar shows behind the fixed nav.
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#DFE0E1";
    return () => { document.body.style.background = prev; };
  }, []);

  // Data for the Step Flow (matching the image sequence)
  const stepsFlow = [
    { id: 1, title: "1. Easy Registration", image: step1, pos: "top-left" },
    { id: 2, title: "2. Purchase a package", image: step2, pos: "top-right" },
    { id: 4, title: "4. View Analytics", image: step3, pos: "bottom-left" },
    { id: 3, title: "3. Run your campaign", image: step4, pos: "bottom-right" },
  ];

  return (
    <main className="font-sans" style={{ background: "#DFE0E1" }}>

      {/* --- SECTION 1: DYNAMIC PRICING (contained hero card, matches /pricing) --- */}
      <section className="relative w-full pb-10" style={{ background: "#DFE0E1" }}>

        {/* Hero card — contained + rounded, with top margin below the nav */}
        <div
          className="mx-8 sm:mx-14 lg:mx-24 mt-24 md:mt-28 relative rounded-2xl overflow-hidden bg-[#0a1220]"
          style={{ minHeight: 260 }}
        >
          <Image
            src={bg}
            alt="Market background"
            fill
            className="object-cover object-center opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0a1220]/15 via-[#0a1220]/50 to-[#0a1220]/92" />

          <div className="relative z-10 px-6 sm:px-10 pt-10 md:pt-14 pb-32 sm:pb-36 md:pb-44 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Dynamic, Transparent Pricing
            </h1>

            <div className="flex w-full max-w-xs mx-auto sm:inline-flex sm:w-auto sm:max-w-none bg-white/10 backdrop-blur-sm border border-white/10 rounded-full p-1 gap-1">
              <button
                onClick={() => router.push("/pricing")}
                className={`flex-1 sm:flex-none min-h-11 px-7 rounded-full text-sm font-semibold transition-all duration-200 ${
                  !isUnlimited ? "bg-[#0a1f6e] text-white shadow" : "text-white/60 hover:text-white"
                }`}
              >
                monthly
              </button>
              <button
                onClick={() => router.push("/pricing/unlimited")}
                className={`flex-1 sm:flex-none min-h-11 px-7 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isUnlimited ? "bg-[#0a1f6e] text-white shadow" : "text-white/60 hover:text-white"
                }`}
              >
                unlimited
              </button>
            </div>
          </div>
        </div>

        {/* Cards overlap the bottom of the hero card */}
        <div className="px-4 sm:px-8 lg:px-16 -mt-24 sm:-mt-28 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {pricingData.map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                initialMessages={1250}
                maxMessages={10000}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: 4 EASY STEPS (Process Flow) --- */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-900">
            Drive more growth in just 4 easy steps
          </h2>
        </div>

        {/* ── Mobile: native vertical step timeline (single column) ── */}
        <ol className="md:hidden relative mx-auto max-w-sm pl-14">
          <span
            aria-hidden="true"
            className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-blue-900/20"
          />
          {stepsFlow
            .slice()
            .sort((a, b) => a.id - b.id)
            .map((step) => (
              <li key={step.id} className="relative pb-10 last:pb-0">
                <span className="absolute -left-14 top-1 flex items-center justify-center w-11 h-11 rounded-full bg-blue-900 text-white font-bold text-base shadow-md ring-4 ring-[#DFE0E1]">
                  {step.id}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-800 leading-snug">
                      {step.title.replace(/^\d+\.\s*/, "")}
                    </h3>
                  </div>
                  <Image
                    src={step.image}
                    alt={step.title.replace(/^\d+\.\s*/, "")}
                    width={96}
                    height={196}
                    className="object-contain shrink-0"
                  />
                </div>
              </li>
            ))}
        </ol>

        {/*
          ── Desktop: connected loop diagram (md+) ──
          Sized to ~1016 x 740px. A single rounded-rectangle SVG loop passes
          behind the four phones; visible only in the gaps + vertical sides,
          with directional arrows on the top (→) and bottom (←) runs.
        */}
        <div className="hidden md:block relative w-full max-w-[1016px] mx-auto">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1016 740"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <marker id="pru-arrowR" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                  <polygon points="0,0 10,5 0,10" fill="#22d3ee" />
                </marker>
                <marker id="pru-arrowL" markerWidth="10" markerHeight="10" refX="1" refY="5" orient="auto-start-reverse">
                  <polygon points="0,5 10,0 10,10" fill="#22d3ee" />
                </marker>
              </defs>

              {/* Continuous rounded-rectangle loop (left=200, right=816, top=210, bottom=530, R=48) */}
              <path
                d="M 248 210 L 768 210 A 48 48 0 0 1 816 258 L 816 482 A 48 48 0 0 1 768 530 L 248 530 A 48 48 0 0 1 200 482 L 200 258 A 48 48 0 0 1 248 210 Z"
                stroke="#22d3ee"
                strokeWidth="2.6"
              />

              {/* Top run arrow (→) — long segment between the two top phones */}
              <line x1="430" y1="210" x2="586" y2="210" stroke="#22d3ee" strokeWidth="2.6" markerEnd="url(#pru-arrowR)" />
              {/* Bottom run arrow (←) */}
              <line x1="586" y1="530" x2="430" y2="530" stroke="#22d3ee" strokeWidth="2.6" markerEnd="url(#pru-arrowL)" />
            </svg>

            {/* Phone grid — raised above the loop. [label | phone | phone | label] x 2 rows */}
            <div className="relative z-1 grid grid-cols-[1fr_auto_auto_1fr] gap-x-16 lg:gap-x-24 gap-y-28 items-center py-8">

              {/* ── Row 1 ── */}
              <p className="text-base font-bold text-slate-700 text-right leading-tight">
                1. Easy<br /> Registration
              </p>
              <Image src={step1} alt="Easy Registration" width={224} height={280} className="object-contain" />
              <Image src={step2} alt="Purchase a package" width={224} height={280} className="object-contain" />
              <p className="text-base font-bold text-slate-700 text-left leading-tight">
                2. Purchase<br /> a package
              </p>

              {/* ── Row 2 ── */}
              <p className="text-base font-bold text-slate-700 text-right leading-tight">
                4. View<br /> Analytics
              </p>
              <Image src={step3} alt="View Analytics" width={224} height={280} className="object-contain" />
              <Image src={step4} alt="Run your campaign" width={224} height={280} className="object-contain" />
              <p className="text-base font-bold text-slate-700 text-left leading-tight">
                3. Run your<br /> campaign
              </p>
            </div>
        </div>
      </section>

      {/* --- SECTION 3: CTA --- */}
      <section className="py-20 container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
            <div className="md:w-1/2">
                <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
                    Run your campaign <br />
                    in just a few seconds
                </h2>
                <p className="text-lg text-slate-600 mb-8 max-w-md">
                    After registration, utilise our automations and run your dynamic campaigns in just a few clicks
                </p>
                <button className="bg-blue-900 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl">
                    Download now
                </button>
            </div>
            
            {/* Right: woman image + decorative ring arc (contained, no overflow) */}
            <div className="w-full md:w-1/2 relative flex justify-center items-end overflow-hidden" style={{ minHeight: 260 }}>
                {/* Ring arc — centered on mobile, right-anchored on desktop */}
                <div className="absolute right-1/2 translate-x-1/2 md:right-0 md:translate-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Image
                    src={ring}
                    alt=""
                    aria-hidden="true"
                    width={320}
                    height={320}
                    className="w-56 sm:w-72 md:w-80 h-auto opacity-90 object-contain"
                  />
                </div>
                {/* Woman image — in front of ring */}
                <div className="relative z-10">
                  <Image
                    src={woman}
                    alt="BalloAds user on mobile"
                    width={300}
                    height={320}
                    className="w-56 sm:w-72 h-auto object-contain object-bottom"
                    priority
                  />
                </div>
            </div>
        </div>
      </section>
    </main>
  );
}