"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  MessageCircle,
  Mail,
  Bell,
  Compass,
  LayoutGrid,
  Cpu,
  BarChart3,
} from "lucide-react";
import type { StaticImageData } from "next/image";
import { FadeUpReveal } from "@/app/components/ui/FadeUpReveal";
import person from "@/public/Assets/15.png";
import circle from "@/public/Assets/9.png";
import screen37 from "@/public/Assets/37.png";
import screen38 from "@/public/Assets/38.png";
import screen39 from "@/public/Assets/39.png";
import screen40 from "@/public/Assets/40.png";
import screen41 from "@/public/Assets/41.png";
import screen42 from "@/public/Assets/42.png";
import screen43 from "@/public/Assets/43.png";
import screen44 from "@/public/Assets/44.png";
import screen45 from "@/public/Assets/45.png";

const phoneScreens: { src: StaticImageData; alt: string }[] = [
  { src: screen37, alt: "BalloAds app screen — sign up" },
  { src: screen38, alt: "BalloAds app screen — analytics" },
  { src: screen39, alt: "BalloAds app screen — packages" },
  { src: screen40, alt: "BalloAds app screen — channels" },
  { src: screen41, alt: "BalloAds app screen — campaigns" },
  { src: screen42, alt: "BalloAds app screen — messaging" },
  { src: screen43, alt: "BalloAds app screen — audience" },
  { src: screen44, alt: "BalloAds app screen — delivery" },
  { src: screen45, alt: "BalloAds app screen — performance" },
];

const featureLabels = [
  { text: "Bulk SMS & Targeted Message Ads", Icon: MessageSquare, side: "left" as const, tone: "dark" as const, ax: 200, ay: 150, screen: 0 },
  { text: "WhatsApp Marketing with Precision", Icon: MessageCircle, side: "left" as const, tone: "dark" as const, ax: 168, ay: 262, screen: 1 },
  { text: "Email marketing at your fingertips", Icon: Mail, side: "left" as const, tone: "dark" as const, ax: 168, ay: 378, screen: 2 },
  { text: "Pop-ups and Web Push Notifications", Icon: Bell, side: "left" as const, tone: "dark" as const, ax: 200, ay: 490, screen: 3 },
  { text: "User-Friendly Interface for Easy Navigation", Icon: Compass, side: "right" as const, tone: "light" as const, ax: 800, ay: 150, screen: 4 },
  { text: "Comprehensive Campaign Management Tools", Icon: LayoutGrid, side: "right" as const, tone: "light" as const, ax: 832, ay: 262, screen: 5 },
  { text: "AI-Powered Integration for Smart Campaigns", Icon: Cpu, side: "right" as const, tone: "light" as const, ax: 832, ay: 378, screen: 6 },
  { text: "Real-Time Analytics & Performance Tracking", Icon: BarChart3, side: "right" as const, tone: "dark" as const, ax: 800, ay: 490, screen: 8 },
];

// One independent L-shaped path per feature: ring → label (no shared spine).
const RING = { cx: 500, cy: 320, r: 205 };

function ringPoint(ax: number, ay: number) {
  const dx = ax - RING.cx;
  const dy = ay - RING.cy;
  const len = Math.hypot(dx, dy) || 1;
  return { x: RING.cx + (dx / len) * RING.r, y: RING.cy + (dy / len) * RING.r };
}

type PhoneLine = { id: string; d: string; delay: string; features: number[] };

function buildPhoneToItemLines(): PhoneLine[] {
  return featureLabels.map((f, i) => {
    const rp = ringPoint(f.ax, f.ay);
    return {
      id: `line-${i}`,
      d: `M ${rp.x} ${rp.y} L ${f.ax} ${rp.y} L ${f.ax} ${f.ay}`,
      delay: `${0.35 + i * 0.08}s`,
      features: [i],
    };
  });
}

const phoneToItemLines = buildPhoneToItemLines();

const diagramNodes = featureLabels.flatMap((f, i) => {
  const rp = ringPoint(f.ax, f.ay);
  const t = 0.4 + i * 0.06;
  return [
    { id: `n-${i}-ring`, x: rp.x, y: rp.y, delay: `${t}s` },
    { id: `n-${i}-tip`, x: f.ax, y: f.ay, delay: `${t + 0.08}s` },
  ];
});

function lineActive(activeFeature: number, line: PhoneLine) {
  return line.features.includes(activeFeature);
}

const chartSeries = [
  { label: "Engagement", color: "#6BDFFF", values: [20, 28, 45, 55, 72, 95] },
  { label: "Leads", color: "#90B6FF", values: [12, 22, 38, 44, 60, 82] },
  { label: "ROI", color: "#F4B942", values: [8, 15, 26, 40, 52, 88] },
  { label: "Reach", color: "#3D6BFF", values: [10, 18, 30, 42, 58, 76] },
];

const chartXAxisLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];

export default function FeaturesPage() {
  const [active, setActive] = useState(0);
  const radialRef = useRef<HTMLDivElement>(null);
  const [radialInView, setRadialInView] = useState(false);

  const activeScreen = featureLabels[active].screen;
  const activeLabel = featureLabels[active];

  useEffect(() => {
    const el = radialRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      const t = setTimeout(() => setRadialInView(true), 350);
      return () => clearTimeout(t);
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRadialInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const maxChartValue = Math.max(...chartSeries.flatMap((series) => series.values));
  const yTickValues = [25, 50, 75];

  const getPolylinePoints = (values: number[]) =>
    values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * 100;
        const y = 100 - (value / maxChartValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");

  const renderLabel = (f: (typeof featureLabels)[number], i: number, stacked = false) => {
    const Icon = f.Icon;
    const isActive = i === active;
    const style: React.CSSProperties | undefined = stacked
      ? undefined
      : {
          top: `${(f.ay / 640) * 100}%`,
          animationDelay: `${0.55 + i * 0.07}s`,
          ...(f.side === "left"
            ? { right: `${100 - (f.ax / 1000) * 100}%`, ["--features-label-from" as string]: "-14px" }
            : { left: `${(f.ax / 1000) * 100}%`, ["--features-label-from" as string]: "14px" }),
        };

    return (
      <button
        key={f.text}
        type="button"
        className={`features-label features-label--${f.tone}${isActive ? " is-active" : ""}`}
        style={style}
        onClick={() => setActive(i)}
        aria-pressed={isActive}
        aria-label={`Show ${f.text}`}
      >
        <span className="features-label__icon">
          <Icon strokeWidth={2} aria-hidden="true" />
        </span>
        <span>{f.text}</span>
      </button>
    );
  };

  const renderPhone = (className: string) => (
    <div
      className={`features-phone${className ? ` ${className}` : ""}`}
      aria-live="polite"
      aria-label={`${activeLabel.text} — app preview`}
    >
      <span className="features-phone__glow" aria-hidden="true" />
      {phoneScreens.map((screen, i) => (
        <Image
          key={i}
          src={screen.src}
          alt={i === activeScreen ? screen.alt : ""}
          aria-hidden={i !== activeScreen}
          priority
          sizes="(max-width: 900px) 58vw, 20rem"
          className={`features-phone__screen${i === activeScreen ? " is-active" : ""}`}
        />
      ))}
    </div>
  );

  return (
    <main className="features-page">
      <section className="features-radial-section relative px-4 py-14 md:px-8 md:py-20">
        <div className="features-radial-wrap">
        <div ref={radialRef} className="features-radial-host">
        <div
          className={`features-radial${radialInView ? " is-visible" : ""}`}
        >
          <svg
            className="features-radial__svg"
            viewBox="0 0 1000 640"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="features-ring-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d0e4e4" />
                <stop offset="100%" stopColor="#020055" />
              </linearGradient>
            </defs>

            <circle
              className="features-ring-circle"
              cx={RING.cx}
              cy={RING.cy}
              r={RING.r}
              stroke="url(#features-ring-grad)"
              pathLength={1}
            />

            {/* Phone → item connectors (#020055), each path starts on the ring */}
            {phoneToItemLines.map((line) => (
              <path
                key={line.id}
                className={`features-line features-line--connector${lineActive(active, line) ? " is-active" : ""}`}
                d={line.d}
                pathLength={1}
                style={{ animationDelay: line.delay }}
              />
            ))}

            {/* Nodes at elbows — unique id keys (MID_Y === RING.cy so coord keys collide) */}
            {diagramNodes.map((node) => (
              <circle
                key={node.id}
                className="features-node"
                cx={node.x}
                cy={node.y}
                r={3.5}
                style={{ animationDelay: node.delay }}
              />
            ))}
          </svg>

          {renderPhone("")}

          {featureLabels.map((f, i) => renderLabel(f, i))}
        </div>

        <div className={`features-stack${radialInView ? " is-visible" : ""}`}>
          <div className="features-stack__stage">
            <div className="features-stack__ring" aria-hidden="true" />
            <div className="features-stack__phone-wrap">{renderPhone("")}</div>
          </div>
          <p className="features-stack__caption" key={activeLabel.text}>
            {activeLabel.text}
          </p>
          <div className="features-stack__labels">
            {featureLabels.map((f, i) => renderLabel(f, i, true))}
          </div>
        </div>
        </div>
        </div>
      </section>

      <section className="features-growth relative px-4 md:px-8 py-24">
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col gap-8 max-w-4xl mx-auto text-center md:text-left">
            <FadeUpReveal className="flex flex-col gap-6">
              <h2 className="features-growth__title text-4xl md:text-5xl font-bold leading-tight">
                <span className="features-growth__lead">Grow</span>{" "}
                <span className="features-growth__rest">Your Audience</span>
              </h2>
              <p className="text-base md:text-lg text-[var(--dark-blue)]/70 leading-relaxed">
                With integrated tools and strategic management, we help you reach the full potential of your brand with our marketing expertise. We specialise
                in growing your audience across all platforms, from social media to search
                engines, ensuring maximum visibility and engagement.
              </p>
              <p className="text-base md:text-lg text-[var(--dark-blue)]/70 leading-relaxed">
                Let us help you reach new heights and connect with your target audience
                like never before!
              </p>
            </FadeUpReveal>

            <FadeUpReveal delay={0.12} yOffset={36}>
            <div className="features-chart rounded-[32px] bg-gradient-to-br from-[#0F1F4C] via-[#113474] to-[#0A4ACB] p-6 md:p-10 shadow-xl">
              <div className="features-chart__head">
                <span>Performance Overview</span>
                <span>01 Oct - 31 Oct</span>
              </div>
              <div className="mt-8">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-72">
                  <defs>
                    <linearGradient id="chart-grid" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="100" height="100" fill="url(#chart-grid)" rx="12" />
                  {yTickValues.map((value) => {
                    const y = 100 - (value / maxChartValue) * 100;
                    return (
                      <line
                        key={value}
                        x1="0"
                        x2="100"
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="0.4"
                      />
                    );
                  })}
                  {chartSeries[0].values.map((_, index, arr) => {
                    const x = (index / (arr.length - 1)) * 100;
                    return (
                      <line
                        key={`x-${x}`}
                        x1={x}
                        x2={x}
                        y1="0"
                        y2="100"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="0.4"
                      />
                    );
                  })}
                  {chartSeries.map((series) => (
                    <g key={series.label}>
                      <polyline
                        points={getPolylinePoints(series.values)}
                        fill="none"
                        stroke={series.color}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {series.values.map((value, index, arr) => {
                        const x = (index / (arr.length - 1)) * 100;
                        const y = 100 - (value / maxChartValue) * 100;
                        return (
                          <circle
                            key={`${series.label}-${index}`}
                            cx={x}
                            cy={y}
                            r="1.2"
                            fill={series.color}
                            stroke="rgba(15, 31, 76, 0.4)"
                            strokeWidth="0.6"
                          />
                        );
                      })}
                    </g>
                  ))}
                </svg>
                <div className="mt-4 flex flex-wrap justify-between text-xs md:text-sm text-white/70">
                  {chartXAxisLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {chartSeries.map((series) => (
                  <div key={series.label} className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: series.color }}
                    />
                    <span className="text-sm text-white/80 uppercase tracking-[0.18em]">
                      {series.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </FadeUpReveal>
          </div>
        </div>
      </section>

      <section className="features-stats relative flex flex-col gap-5 px-4 md:px-8 pb-24 md:flex-row items-center">
        <FadeUpReveal delay={0.08} className="flex flex-col gap-6 md:flex-row mx-auto max-w-5xl w-full">
          <div className="features-stat-card rounded-[28px] shadow-lg p-8 px-6 py-3 text-center">
            <p className="mt-4 text-5xl md:text-6xl font-bold text-white">3.5mill</p>
            <p className="text-3xl font-semibold uppercase tracking-[0.3em] text-white">Reach</p>
            <p className="mt-2 text-sm leading-relaxed text-white">
              Get instant access to millions of active users across SMS, email, and WhatsApp
              putting your message exactly where people are already engaged.
              With smart targeting and strong delivery rates, your brand stays visible across key digital touchpoints.
            </p>
          </div>

          <div className="features-stat-card rounded-[28px] shadow-lg p-8 px-6 py-3 text-center">
            <p className="mt-4 text-5xl md:text-6xl font-bold text-white">56%</p>
            <p className="text-3xl font-semibold uppercase tracking-[0.3em] text-white">ROI</p>
            <p className="mt-2 text-sm leading-relaxed text-white">
              Powered by real-time analytics from BalloDash, every campaign becomes more efficient and cost-effective.
              Businesses gain higher conversions, lower acquisition costs, and clear,
              measurable returns that outperform traditional advertising
            </p>
          </div>
        </FadeUpReveal>
      </section>

      <section className="features-cta relative overflow-hidden px-4 md:px-8 py-24">
        <div className="container mx-auto relative z-10 flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          <FadeUpReveal className="max-w-2xl flex flex-col gap-6">
            <div className="glitch-text">
              <h3 className="text-4xl md:text-5xl font-bold leading-tight text-[var(--dark-blue)]">
                Rebranding the future of your industry starts here.
              </h3>
            </div>
            <p className="text-base md:text-lg text-[var(--dark-blue)]/70 leading-relaxed max-w-xl">
              Book a tailored BalloAds demo and see how our omnichannel marketing platform can help you
              unlock new revenue, accelerate growth and engage your audience in real time.
            </p>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-3 w-fit px-8 py-4 rounded-full bg-[var(--brand-color-1)] text-white font-semibold text-lg shadow-lg hover:bg-[var(--brand-color-2)] transition-colors"
            >
              Book a free demo
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </Link>
          </FadeUpReveal>

          <FadeUpReveal delay={0.15} yOffset={40} className="relative flex justify-center md:justify-end w-full md:w-auto">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              <div className="absolute inset-4 rounded-full bg-white/70 shadow-2xl" />
              <div className="absolute inset-8 flex items-center justify-center">
                <Image
                  src={circle}
                  alt=""
                  width={1600}
                  height={1900}
                  className="w-full h-auto absolute right-0 -bottom-13 scale-[2]"
                  aria-hidden="true"
                />
                <Image
                  src={person}
                  alt="Happy customer using BalloAds"
                  width={280}
                  height={280}
                  className="object-contain drop-shadow-2xl bottom-5 scale-[1.5]"
                />
              </div>
            </div>
          </FadeUpReveal>
        </div>
      </section>
    </main>
  );
}
