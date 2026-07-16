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
//import background from "@/public/Backgrounds/hero-bg.png";
//import pattern from "@/public/Backgrounds/pattern.png";
import woman from "@/public/Assets/11.png";
import woman1 from "@/public/Assets/12.png";
import man from "@/public/Assets/14.png";
import woman2 from "@/public/Assets/13.png";
import ring from "@/public/Assets/8.png"
import person from "@/public/Assets/15.png";
import circle from "@/public/Assets/9.png"
import phone from "@/public/Assets/38.png"
import circles from "@/public/Assets/9.png"

// Radial-diagram feature labels. `ax`/`ay` are the label's inner-edge anchor in
// the SVG's 1000×640 space; the same values position the HTML label and the end
// of its connector line, so they always align. `side` picks which edge anchors.
const featureLabels = [
  { text: "Bulk SMS & Targeted Message Ads", Icon: MessageSquare, side: "left", ax: 300, ay: 150 },
  { text: "WhatsApp Marketing with Precision", Icon: MessageCircle, side: "left", ax: 268, ay: 262 },
  { text: "Email marketing at your fingertips", Icon: Mail, side: "left", ax: 268, ay: 378 },
  { text: "Pop-ups and Web Push Notifications", Icon: Bell, side: "left", ax: 300, ay: 490 },
  { text: "User-Friendly Interface for Easy Navigation", Icon: Compass, side: "right", ax: 700, ay: 150 },
  { text: "Comprehensive Campaign Management Tools", Icon: LayoutGrid, side: "right", ax: 732, ay: 262 },
  { text: "AI-Powered Integration for Smart Campaigns", Icon: Cpu, side: "right", ax: 732, ay: 378 },
  { text: "Real-Time Analytics & Performance Tracking", Icon: BarChart3, side: "right", ax: 700, ay: 490 },
] as const;

// Point on the ring perimeter in the direction of an anchor (ring centred at
// 500,320 with radius 205 in the 1000×640 viewBox).
const RING = { cx: 500, cy: 320, r: 205 };
function ringPoint(ax: number, ay: number) {
  const dx = ax - RING.cx;
  const dy = ay - RING.cy;
  const len = Math.hypot(dx, dy) || 1;
  return { x: RING.cx + (dx / len) * RING.r, y: RING.cy + (dy / len) * RING.r };
}


const features = [
  {
    title: "WHATSAPP MARKETING WITH PRECISION",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman1, // Placeholder - replace with actual image
  },
  {
    title: "TARGETED BULK MESSAGING SOLUTIONS",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: man, // Placeholder - replace with actual image
  },
  {
    title: "INITIATE WEB POP UPS AND PUSH NOTIFICATIONS",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman2, // Placeholder - replace with actual image
  },
  {
    title: "EMAIL MARKETING AT YOUR FINGERTIPS",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman, // Placeholder - replace with actual image
  },
];

const chartSeries = [
  {
    label: "Engagement",
    color: "#6BDFFF",
    values: [20, 28, 45, 55, 72, 95],
  },
  {
    label: "Leads",
    color: "#90B6FF",
    values: [12, 22, 38, 44, 60, 82],
  },
  {
    label: "ROI",
    color: "#F4B942",
    values: [8, 15, 26, 40, 52, 88],
  },
  {
    label: "Reach",
    color: "#3D6BFF",
    values: [10, 18, 30, 42, 58, 76],
  },
];

const chartXAxisLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];

export default function FeaturesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Trigger the connector-line draw-in when the diagram is on screen. It's the
  // hero (above the fold), so if it's already in view on mount we play after a
  // beat — letting the hidden state paint first — and otherwise fall back to an
  // observer for when the user scrolls down to it.
  const radialRef = useRef<HTMLDivElement>(null);
  const [radialInView, setRadialInView] = useState(false);
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

  const maxChartValue = Math.max(
    ...chartSeries.flatMap((series) => series.values)
  );
  const yTickValues = [25, 50, 75];

  const getPolylinePoints = (values: number[]) =>
    values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * 100;
        const y = 100 - (value / maxChartValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white">
      {/* Hero Section with Carousel */}
    

  <section className="features-radial-section relative px-4 py-14 md:px-8 md:py-20">
    {/* Desktop radial diagram: SVG ring + animated connector lines */}
    <div
      ref={radialRef}
      className={`features-radial${radialInView ? " is-visible" : ""}`}
    >
      <svg
        className="features-radial__svg"
        viewBox="0 0 1000 640"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="features-ring-grad" x1="0%" y1="12%" x2="100%" y2="88%">
            <stop offset="0%" stopColor="#c2ccd8" />
            <stop offset="52%" stopColor="#4f57a0" />
            <stop offset="100%" stopColor="#1e1f6b" />
          </linearGradient>
        </defs>

        <circle
          className="features-ring-circle"
          cx={RING.cx}
          cy={RING.cy}
          r={RING.r}
          stroke="url(#features-ring-grad)"
        />

        {featureLabels.map((f, i) => {
          const p = ringPoint(f.ax, f.ay);
          return (
            <line
              key={f.text}
              className="features-line"
              x1={p.x}
              y1={p.y}
              x2={f.ax}
              y2={f.ay}
              pathLength={1}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          );
        })}
      </svg>

      <Image
        src={phone}
        alt="BalloAds analytics dashboard on a phone"
        width={450}
        height={700}
        className="features-radial__phone"
        priority
      />

      {featureLabels.map((f, i) => {
        const Icon = f.Icon;
        const style: React.CSSProperties = {
          top: `${(f.ay / 640) * 100}%`,
          animationDelay: `${0.25 + i * 0.1}s`,
          ...(f.side === "left"
            ? { right: `${100 - (f.ax / 1000) * 100}%` }
            : { left: `${(f.ax / 1000) * 100}%` }),
        };
        return (
          <div key={f.text} className="features-label" style={style}>
            <span className="features-label__icon">
              <Icon strokeWidth={2} aria-hidden="true" />
            </span>
            <span>{f.text}</span>
          </div>
        );
      })}
    </div>

    {/* Mobile: simple stacked list (no diagram) */}
    <div className="features-stack">
      <Image
        src={phone}
        alt="BalloAds analytics dashboard on a phone"
        width={220}
        height={340}
        className="features-stack__phone"
      />
      {featureLabels.map((f) => {
        const Icon = f.Icon;
        return (
          <div key={f.text} className="features-label">
            <span className="features-label__icon">
              <Icon strokeWidth={2} aria-hidden="true" />
            </span>
            <span>{f.text}</span>
          </div>
        );
      })}
    </div>
  </section>

      {/* Audience Growth Section */}
      <section className="relative bg-white text-[var(--dark-blue)] px-4 md:px-8 py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-white blur-3xl" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid gap-12 lg:grid-cols items-start">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Grow Your Audience
                </h2>
                <p className="text-base md:text-lg text-[var(--dark-blue)]/70  leading-relaxed">
                  With integrated tools and strategic management, we help you reach the full potential of your brand with our marketing expertise. We specialise
                  in growing your audience across all platforms, from social media to search
                  engines, ensuring maximum visibility and engagement.
                </p>
                <p className="text-base md:text-lg text-[var(--dark-blue)]/70 max-w-3xl leading-relaxed">
                  Let us help you reach new heights and connect with your target audience
                  like never before!
                </p>
              </div>

              <div className="rounded-[32px] bg-gradient-to-br from-[#0F1F4C] via-[#113474] to-[#0A4ACB] p-6 md:p-10 shadow-xl">
                <div className="flex justify-between items-center text-white/70 text-sm uppercase tracking-[0.2em]">
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
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex flex-col bg-white text-[var(--dark-blue)] gap-5 px-4 md:px-8 py-24 md:flex-row items-center">
            <div className="flex flex-col gap-6 md:flex-row mx-auto max-w-5xl">
              <div className="rounded-[28px] bg-[var(--brand-color-2)] shadow-lg p-8 px-6 py-3 text-center">
                <p className="mt-4 text-5xl md:text-6xl font-bold text-white">
                  3.5mill
                </p>
                <p className="text-3xl font-semibold uppercase tracking-[0.3em] text-white">
                  Reach
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white">
                Get instant access to millions of active users across SMS, email, and WhatsApp 
                putting your message exactly where people are already engaged. 
                With smart targeting and strong delivery rates, your brand stays visible across key digital touchpoints.
                </p>
              </div>

              <div className="rounded-[28px] bg-[var(--brand-color-2)] shadow-lg p-8 px-6 py-3 text-center">
                <p className="mt-4 text-5xl md:text-6xl font-bold text-white">
                  56%
                </p>
                <p className="text-3xl font-semibold uppercase tracking-[0.3em] text-white">
                  ROI
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white">
                Powered by real-time analytics from BalloDash, every campaign becomes more efficient and cost-effective. 
                Businesses gain higher conversions, lower acquisition costs, and clear, 
                measurable returns that outperform traditional advertising
                </p>
              </div>
            </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-white text-[var(--dark-blue)] px-4 md:px-8 py-24">
        <div className="container mx-auto relative z-10 flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl flex flex-col gap-6">
          <div className="glitch-text">
            <h3 className="text-4xl md:text-5xl font-bold drop-shadow-2xl leading-tight text-[var(--dark-blue)]">
              Rebranding the future of your industry starts here.
            </h3>
          </div>
            <p className="text-base md:text-lg text-[var(--dark-blue)]/70 leading-relaxed max-w-xl">
              Book a tailored BalloAds demo and see how our omnichannel marketing platform can help you
              unlock new revenue, accelerate growth and engage your audience in real time.
            </p>
            {/* Exception: on the Features page itself this demo CTA routes to
                /how-it-works to avoid a self-link. See docs/integration-boundaries.md. */}
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
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="relative flex justify-center md:justify-end w-full md:w-auto">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-full bg-[#F5F7FF] blur-2xl" />
              <div className="absolute inset-4 rounded-full bg-[#F5F7FF] shadow-2xl" />
              <div className="absolute inset-8 flex items-center justify-center">
              <Image
                  src={circle}
                  alt="Circles Ring"
                  width={1600}
                  height={1900}
                  className="w-full h-auto absolute right-0 -bottom-13 scale-[2]"
                  priority
                />
                <Image
                  src={person}
                  alt="Happy customer using BalloAds"
                  width={280}
                  height={280}
                  className="object-contain drop-shadow-2xl bottom-5 scale-[1.5]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-[#F5F7FF] blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-[#F5F7FF] blur-[120px]" />
        </div>
      </section>
    </main>
  );
}
