"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import bg from "@/public/BalloAds Assets 2/1.png";
import ring from "@/public/Assets/9.png";
import woman from "@/public/BalloAds Assets 2/23.png";
import { useEffect } from "react";
import type { PricingPlan } from "@/lib/pricingApi";
import type { HowItWorksStep } from "@/app/how-it-works/steps";
import { resolveIcon } from "@/lib/iconRegistry";

// ─── Inline icons (kept 1:1 with the pre-CMS design — selected by `channel`,
//     a closed 3-value enum, rather than the freeform `iconName` string, so
//     the exact brand colors/shapes below are preserved regardless of what
//     iconName the CMS ends up storing) ────────────────────────────────────

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

function channelIcon(channel: PricingPlan["channel"]) {
  switch (channel) {
    case "Email":
      return <EmailIcon />;
    case "WhatsApp":
      return <WhatsAppIcon />;
    default:
      return <SmsIcon />;
  }
}

// ─── Price logic ──────────────────────────────────────────────────────────────
// Same shape as the original hand-written formula (base price below a message
// floor, then `pricePerUnit` per `unitSize` messages above it) — just driven
// by the plan's CMS-provided basePrice/pricePerUnit/unitSize instead of the
// hardcoded 850 / 12 / 250 constants. Slider bounds aren't part of the CMS
// schema, so they stay as local UI constants.
const MIN_MSGS = 1000;
const MAX_MSGS = 10000;

function calculatePrice(plan: PricingPlan, messages: number): number {
  const extra = Math.max(0, messages - MIN_MSGS);
  return plan.basePrice + Math.ceil(extra / plan.unitSize) * plan.pricePerUnit;
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────

function PricingCard({ plan }: { plan: PricingPlan }) {
  const [messages, setMessages] = useState(1750);
  const price = useMemo(() => calculatePrice(plan, messages), [plan, messages]);
  const progress = ((messages - MIN_MSGS) / (MAX_MSGS - MIN_MSGS)) * 100;
  const step = plan.unitSize > 0 ? plan.unitSize : 250;

  return (
    <div
      className="bg-white rounded-3xl flex flex-col overflow-hidden border border-slate-100/60 h-full"
      style={{ boxShadow: "0 8px 32px rgba(10, 31, 110, 0.13), 0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div className="h-1.5 w-full bg-[#0a1f6e]" />

      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <h3 className="font-bold text-base text-slate-800 tracking-tight">{plan.title}</h3>
        {channelIcon(plan.channel)}
      </div>

      {/* Message counter + progress bar */}
      <div className="px-5 pb-3 pt-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
          Number of Messages
        </p>
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
          <button
            onClick={() => setMessages((m) => Math.max(MIN_MSGS, m - step))}
            aria-label="Decrease message count"
            className="w-11 h-11 rounded-lg bg-slate-200 hover:bg-slate-300 active:bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-lg transition-colors"
          >
            -
          </button>
          <span className="text-sm font-bold text-slate-800 tabular-nums">{messages.toLocaleString()}</span>
          <button
            onClick={() => setMessages((m) => Math.min(MAX_MSGS, m + step))}
            aria-label="Increase message count"
            className="w-11 h-11 rounded-lg bg-[#0a1f6e] hover:bg-[#0d2a8a] active:bg-[#0d2a8a] flex items-center justify-center text-white font-bold text-lg transition-colors"
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
            {plan.currency}{price.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-normal">per month</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-4">
        <Link
          href="#waitlist"
          className="flex items-center justify-center w-full text-center bg-[#0a1f6e] hover:bg-[#0d2a8a] text-white min-h-11 rounded-full text-sm font-semibold transition-colors"
        >
          Sign Up
        </Link>
      </div>

      {/* Features */}
      <div className="px-5 pb-5 border-t border-slate-100 pt-4 flex-1">
        <p className="text-[10px] text-slate-500 mb-3 leading-snug">{plan.subtitle}</p>
        <ul className="space-y-2">
          {plan.features.map((f, i) => (
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

// ─── Step strip ───────────────────────────────────────────────────────────────
// The desktop layout is a fixed 4-slot zig-zag (top row L→R = steps 1,2; bottom
// row L→R = steps 4,3 — closing the loop the connecting arrows are drawn for).
// That geometry is preserved by re-ordering the CMS-sorted (by stepNumber)
// array into [0,1,3,2] rather than reading it as a literal reading-order list.
function zigzagOrder(steps: HowItWorksStepStrip[]): HowItWorksStepStrip[] {
  if (steps.length !== 4) return steps;
  return [steps[0], steps[1], steps[3], steps[2]];
}

type HowItWorksStepStrip = {
  slug: string;
  stepNumber: number;
  title: string;
  screenImageUrl: string | null;
  iconName: string | null;
};

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
      <Image
        src={step.screenImageUrl}
        alt={step.title}
        width={width}
        height={height}
        className={className}
      />
    );
  }
  const Icon = resolveIcon(step.iconName);
  return (
    <div
      className={`flex items-center justify-center bg-[#0a1f6e]/10 rounded-xl ${className ?? ""}`}
      style={{ width, height }}
    >
      <Icon className="text-[#0a1f6e]" style={{ width: width * 0.4, height: height * 0.4 }} strokeWidth={1.6} aria-hidden="true" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPageClient({
  plans,
  stepsFlow,
}: {
  plans: PricingPlan[];
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

      {/* ── Section 1: Hero card + Pricing cards ──────────────────────────── */}
      <section className="relative w-full pb-10" style={{ background: "#DFE0E1" }}>

        {/* Hero card — more margin, narrower, slightly taller */}
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
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: 4 Easy Steps ───────────────────────────────────────── */}
      {stepsFlow.length > 0 && (
        <section className="py-14 md:py-20" style={{ background: "#DFE0E1" }}>
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0a1f6e] leading-tight text-center mb-12 md:mb-16">
              Drive more growth in just {stepsFlow.length} easy steps
            </h2>

            {/* ── Mobile: native vertical step timeline (single column) ── */}
            <ol className="md:hidden relative mx-auto max-w-sm pl-14">
              {/* Continuous vertical connector line */}
              <span
                aria-hidden="true"
                className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-[#0a1f6e]/20"
              />
              {mobileSteps.map((step) => (
                <li key={step.slug} className="relative pb-10 last:pb-0">
                  {/* Numbered node on the line */}
                  <span className="absolute -left-14 top-1 flex items-center justify-center w-11 h-11 rounded-full bg-[#0a1f6e] text-white font-bold text-base shadow-md ring-4 ring-[#DFE0E1]">
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
              Desktop layout: 4-col grid  [label-left | phone-left | phone-right | label-right]
              SVG arrows sit as an absolute overlay covering the two phone columns only.
            */}
            {orderedSteps.length === 4 && (
              <div className="hidden md:block relative max-w-2xl mx-auto">
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 560 520"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <marker id="pr-arrowR" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
                      <polygon points="0,0 9,4.5 0,9" fill="#22d3ee" />
                    </marker>
                    <marker id="pr-arrowL" markerWidth="9" markerHeight="9" refX="1" refY="4.5" orient="auto-start-reverse">
                      <polygon points="0,4.5 9,0 9,9" fill="#22d3ee" />
                    </marker>
                  </defs>

                  <path
                    d="M 140 148 L 420 148 A 30 30 0 0 1 450 178 L 450 342 A 30 30 0 0 1 420 372 L 140 372 A 30 30 0 0 1 110 342 L 110 178 A 30 30 0 0 1 140 148 Z"
                    stroke="#22d3ee"
                    strokeWidth="2.2"
                  />

                  <line x1="240" y1="148" x2="318" y2="148" stroke="#22d3ee" strokeWidth="2.2" markerEnd="url(#pr-arrowR)" />
                  <line x1="320" y1="372" x2="242" y2="372" stroke="#22d3ee" strokeWidth="2.2" markerEnd="url(#pr-arrowL)" />
                </svg>

                {/* Phone grid — raised above the SVG frame so it paints on top */}
                <div className="relative z-1 grid grid-cols-[1fr_auto_auto_1fr] gap-x-4 gap-y-8 items-center">

                  {/* ── Row 1 ── */}
                  <p className="text-xs sm:text-sm font-bold text-slate-700 text-right leading-tight">
                    {rowTopLeft.stepNumber}. {rowTopLeft.title}
                  </p>
                  <StepVisual step={rowTopLeft} width={140} height={286} className="object-contain" />
                  <StepVisual step={rowTopRight} width={140} height={286} className="object-contain" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700 text-left leading-tight">
                    {rowTopRight.stepNumber}. {rowTopRight.title}
                  </p>

                  {/* ── Row 2 ── */}
                  <p className="text-xs sm:text-sm font-bold text-slate-700 text-right leading-tight">
                    {rowBottomLeft.stepNumber}. {rowBottomLeft.title}
                  </p>
                  <StepVisual step={rowBottomLeft} width={140} height={286} className="object-contain" />
                  <StepVisual step={rowBottomRight} width={140} height={286} className="object-contain" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700 text-left leading-tight">
                    {rowBottomRight.stepNumber}. {rowBottomRight.title}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Section 3: CTA — light bg, text left, woman + ring right ────── */}
      <section className="py-10 md:py-14" style={{ background: "#DFE0E1" }}>
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-0">

            {/* Left: text block */}
            <div className="md:w-1/2 text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a1f6e] leading-tight mb-4">
                Run your campaign<br />in just a few seconds
              </h2>
              <p className="text-sm text-slate-500 mb-7 max-w-sm leading-relaxed">
                After registration, utilise automations and run your dynamic campaigns in just a few clicks anywhere, anytime.
              </p>
              <button className="inline-flex items-center gap-2 bg-[#0a1f6e] text-white font-semibold px-7 py-3 rounded-full hover:bg-[#0d2a8a] transition-colors text-sm shadow-md">
                Download now
              </button>
            </div>

            {/* Right: woman image + decorative ring arc */}
            <div className="w-full md:w-1/2 relative flex justify-center items-end overflow-hidden" style={{ minHeight: 220 }}>
              {/* Ring arc — large circle, cropped by overflow-hidden on parent */}
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
                  width={280}
                  height={300}
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
