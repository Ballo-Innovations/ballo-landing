"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, X, MessageSquare, Mail, MessageCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import bg from "@/public/BalloAds Assets 2/1.png";
import ring from "@/public/Assets/9.png";
import woman from "@/public/BalloAds Assets 2/25.png";
import type { PricingPlan } from "@/lib/pricingApi";
import { resolveIcon } from "@/lib/iconRegistry";
import { type LadderBand, resolveRate } from "@/lib/pricingLadderTypes";

// --- Icons (kept 1:1 with the pre-CMS design — selected by `channel`, a
// closed 3-value enum, rather than the freeform `iconName` string) ---

function channelIcon(channel: PricingPlan["channel"]) {
  switch (channel) {
    case "Email":
      return <Mail className="w-6 h-6 text-blue-400" />;
    case "WhatsApp":
      return <MessageCircle className="w-6 h-6 text-green-500" />;
    default:
      return <MessageSquare className="w-6 h-6 text-blue-400" />;
  }
}

// --- Price logic ---
// Priced live from the backoffice Pricing Ladder's "no expiry" duration (0) —
// the same volume-tier rate table the /pricing (monthly) cards use for their
// 30/60/90-day durations, just with duration=0 selected.
const MIN_MSGS = 1000;
const MAX_MSGS = 10000;

function calculatePrice(plan: PricingPlan, bands: LadderBand[], messages: number): number | null {
  const rate = resolveRate(bands, plan.channel, messages);
  return rate === null ? null : messages * rate;
}

// --- Reusable components ---

interface PricingCardProps {
  plan: PricingPlan;
  bands: LadderBand[];
  initialMessages: number;
  maxMessages: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, bands, initialMessages, maxMessages = 10000 }) => {
  const [selectedMessages, setSelectedMessages] = useState(initialMessages);

  const calculatedPrice = useMemo(() => {
    return calculatePrice(plan, bands, selectedMessages);
  }, [plan, bands, selectedMessages]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMessages(parseInt(event.target.value));
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-900" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-slate-800">{plan.title}</h3>
        {channelIcon(plan.channel)}
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-slate-900 mb-2">
          {calculatedPrice === null
            ? "Contact us"
            : `${plan.currency}${calculatedPrice.toLocaleString()}`}{" "}
          <span className="text-sm text-slate-500 font-normal">per month</span>
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
        {plan.features.map((feature, index) => (
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

// --- Step strip types (matches app/pricing/PricingPageClient.tsx's shape) ---

type HowItWorksStepStrip = {
  slug: string;
  stepNumber: number;
  title: string;
  screenImageUrl: string | null;
  iconName: string | null;
};

// The desktop layout is a fixed 4-slot zig-zag (top row L→R = steps 1,2;
// bottom row L→R = steps 4,3 — closing the loop the connecting arrows are
// drawn for). Preserved by re-ordering the CMS-sorted (by stepNumber) array
// into [0,1,3,2] rather than reading it as a literal reading-order list.
function zigzagOrder(steps: HowItWorksStepStrip[]): HowItWorksStepStrip[] {
  if (steps.length !== 4) return steps;
  return [steps[0], steps[1], steps[3], steps[2]];
}

function StepVisual({
  step,
  width,
  height,
  className,
}: {
  step: HowItWorksStepStrip;
  width: number;
  height: number;
  className?: string;
}) {
  if (step.screenImageUrl) {
    return (
      <Image src={step.screenImageUrl} alt={step.title} width={width} height={height} className={className} />
    );
  }
  const Icon = resolveIcon(step.iconName);
  return (
    <div
      className={`flex items-center justify-center bg-blue-900/10 rounded-xl ${className ?? ""}`}
      style={{ width, height }}
    >
      <Icon className="text-blue-900" style={{ width: width * 0.4, height: height * 0.4 }} strokeWidth={1.6} aria-hidden="true" />
    </div>
  );
}

export default function PricingUnlimitedPageClient({
  plans,
  bands,
  stepsFlow,
}: {
  plans: PricingPlan[];
  bands: LadderBand[];
  stepsFlow: HowItWorksStepStrip[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isUnlimited = pathname === "/pricing/unlimited";

  // Force the body background to match the page so no dark bar shows behind the fixed nav.
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#DFE0E1";
    return () => { document.body.style.background = prev; };
  }, []);

  const orderedSteps = useMemo(() => zigzagOrder(stepsFlow), [stepsFlow]);
  const mobileSteps = useMemo(
    () => stepsFlow.slice().sort((a, b) => a.stepNumber - b.stepNumber),
    [stepsFlow],
  );
  const [rowTopLeft, rowTopRight, rowBottomLeft, rowBottomRight] = orderedSteps;

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
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                bands={bands}
                initialMessages={1250}
                maxMessages={10000}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: 4 EASY STEPS (Process Flow) --- */}
      {stepsFlow.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-blue-900">
              Drive more growth in just {stepsFlow.length} easy steps
            </h2>
          </div>

          {/* ── Mobile: native vertical step timeline (single column) ── */}
          <ol className="md:hidden relative mx-auto max-w-sm pl-14">
            <span
              aria-hidden="true"
              className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-blue-900/20"
            />
            {mobileSteps.map((step) => (
              <li key={step.slug} className="relative pb-10 last:pb-0">
                <span className="absolute -left-14 top-1 flex items-center justify-center w-11 h-11 rounded-full bg-blue-900 text-white font-bold text-base shadow-md ring-4 ring-[#DFE0E1]">
                  {step.stepNumber}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-800 leading-snug">
                      {step.title}
                    </h3>
                  </div>
                  <StepVisual step={step} width={96} height={196} className="object-contain shrink-0" />
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
          {orderedSteps.length === 4 && (
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

                <path
                  d="M 248 210 L 768 210 A 48 48 0 0 1 816 258 L 816 482 A 48 48 0 0 1 768 530 L 248 530 A 48 48 0 0 1 200 482 L 200 258 A 48 48 0 0 1 248 210 Z"
                  stroke="#22d3ee"
                  strokeWidth="2.6"
                />

                <line x1="430" y1="210" x2="586" y2="210" stroke="#22d3ee" strokeWidth="2.6" markerEnd="url(#pru-arrowR)" />
                <line x1="586" y1="530" x2="430" y2="530" stroke="#22d3ee" strokeWidth="2.6" markerEnd="url(#pru-arrowL)" />
              </svg>

              {/* Phone grid — raised above the loop. [label | phone | phone | label] x 2 rows */}
              <div className="relative z-1 grid grid-cols-[1fr_auto_auto_1fr] gap-x-16 lg:gap-x-24 gap-y-28 items-center py-8">

                {/* ── Row 1 ── */}
                <p className="text-base font-bold text-slate-700 text-right leading-tight">
                  {rowTopLeft.stepNumber}. {rowTopLeft.title}
                </p>
                <StepVisual step={rowTopLeft} width={224} height={280} className="object-contain" />
                <StepVisual step={rowTopRight} width={224} height={280} className="object-contain" />
                <p className="text-base font-bold text-slate-700 text-left leading-tight">
                  {rowTopRight.stepNumber}. {rowTopRight.title}
                </p>

                {/* ── Row 2 ── */}
                <p className="text-base font-bold text-slate-700 text-right leading-tight">
                  {rowBottomLeft.stepNumber}. {rowBottomLeft.title}
                </p>
                <StepVisual step={rowBottomLeft} width={224} height={280} className="object-contain" />
                <StepVisual step={rowBottomRight} width={224} height={280} className="object-contain" />
                <p className="text-base font-bold text-slate-700 text-left leading-tight">
                  {rowBottomRight.stepNumber}. {rowBottomRight.title}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* --- SECTION 3: CTA --- */}
      <section className="py-20 container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              Run your campaign <br />
              in just a few seconds
            </h2>
            <p className="landing-body text-slate-600 mb-8 max-w-md">
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
