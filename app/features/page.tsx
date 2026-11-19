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
  ChevronRight,
} from "lucide-react";
import type { StaticImageData } from "next/image";
import { FadeUpReveal } from "@/app/components/ui/FadeUpReveal";
import person from "@/public/Assets/15.png";
import phoneFrame from "@/public/Assets/features-phone/frame.png";
import screenSms from "@/public/Assets/features-phone/screen-sms.webp";
import screenWhatsapp from "@/public/Assets/features-phone/screen-whatsapp.webp";
import screenEmail from "@/public/Assets/features-phone/screen-email.webp";
import screenNotifications from "@/public/Assets/features-phone/screen-notifications.webp";
import screenHome from "@/public/Assets/features-phone/screen-home.webp";
import screenCalendar from "@/public/Assets/features-phone/screen-calendar.webp";
import screenBrutus from "@/public/Assets/features-phone/screen-brutus.webp";
import screenAnalytics from "@/public/Assets/features-phone/screen-analytics.webp";

// Real screenshots of the BalloAds web app on a phone, one per feature, shown
// inside one fixed frame so only the screen changes. See
// scripts/build-features-phone.cjs for how they were made.
const phoneScreens: { src: StaticImageData; alt: string }[] = [
  { src: screenSms, alt: "BalloAds app: writing an SMS campaign" },
  { src: screenWhatsapp, alt: "BalloAds app: connecting a WhatsApp Business account" },
  { src: screenEmail, alt: "BalloAds app: writing an email campaign" },
  { src: screenNotifications, alt: "BalloAds app: notifications" },
  { src: screenHome, alt: "BalloAds app: home, with shortcuts to create a bulk message, create an ad or view the library" },
  { src: screenCalendar, alt: "BalloAds app: campaign calendar" },
  { src: screenBrutus, alt: "BalloAds app: Brutus AI assistant suggesting campaigns" },
  { src: screenAnalytics, alt: "BalloAds app: analytics and reports" },
];

const featureLabels = [
  { text: "Bulk SMS & Targeted Message Ads", Icon: MessageSquare, side: "left" as const, tone: "dark" as const, ax: 200, ay: 150, screen: 0 },
  { text: "WhatsApp Marketing with Precision", Icon: MessageCircle, side: "left" as const, tone: "dark" as const, ax: 168, ay: 262, screen: 1 },
  { text: "Email marketing at your fingertips", Icon: Mail, side: "left" as const, tone: "dark" as const, ax: 168, ay: 378, screen: 2 },
  { text: "Pop-ups and Web Push Notifications", Icon: Bell, side: "left" as const, tone: "dark" as const, ax: 200, ay: 490, screen: 3 },
  { text: "User-Friendly Interface for Easy Navigation", Icon: Compass, side: "right" as const, tone: "light" as const, ax: 800, ay: 150, screen: 4 },
  { text: "Comprehensive Campaign Management Tools", Icon: LayoutGrid, side: "right" as const, tone: "light" as const, ax: 832, ay: 262, screen: 5 },
  { text: "AI-Powered Integration for Smart Campaigns", Icon: Cpu, side: "right" as const, tone: "light" as const, ax: 832, ay: 378, screen: 6 },
  { text: "Real-Time Analytics & Performance Tracking", Icon: BarChart3, side: "right" as const, tone: "dark" as const, ax: 800, ay: 490, screen: 7 },
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

// "Grow Your Audience" chart, drawn to the design: five points per line on a
// 0-100 scale, each line named beside it rather than in a legend.
const CHART = { w: 1000, h: 500, x0: 100, x1: 860, y0: 430, y1: 70 };
const chartGridY = [70, 160, 250, 340, 430];
const chartSeries = [
  { label: "Engagement", color: "#e3e8f0", values: [8, 10, 40, 42, 100], tag: { x: 835, y: 50, align: "end" as const } },
  { label: "ROI", color: "#7d818c", values: [3, 12, 44, 48, 90], tag: { x: 885, y: 106, align: "start" as const } },
  { label: "Leads", color: "#3a6cad", values: [36, 40, 66, 72, 78], tag: { x: 885, y: 153, align: "start" as const } },
  { label: "Reach", color: "#6fd8f7", values: [0, 24, 56, 56, 64], tag: { x: 885, y: 200, align: "start" as const } },
];

function chartPoint(value: number, index: number, count: number) {
  return {
    x: CHART.x0 + (index / (count - 1)) * (CHART.x1 - CHART.x0),
    y: CHART.y0 - (value / 100) * (CHART.y0 - CHART.y1),
  };
}

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
        onMouseEnter={() => setActive(i)}
        onFocus={() => setActive(i)}
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
      aria-label={`${activeLabel.text}: app preview`}
    >
      <span className="features-phone__glow" aria-hidden="true" />
      <div className="features-phone__display">
        {phoneScreens.map((screen, i) => (
          <Image
            key={i}
            src={screen.src}
            alt={i === activeScreen ? screen.alt : ""}
            aria-hidden={i !== activeScreen}
            priority
            sizes="(max-width: 900px) 30vw, 10rem"
            className={`features-phone__screen${i === activeScreen ? " is-active" : ""}`}
          />
        ))}
      </div>
      <Image
        src={phoneFrame}
        alt=""
        aria-hidden="true"
        priority
        sizes="(max-width: 900px) 58vw, 22rem"
        className="features-phone__frame"
      />
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

      <section className="features-growth">
        <div className="features-growth__inner">
          <FadeUpReveal className="features-growth__intro">
            <h2 className="features-growth__title">
              <span className="features-growth__lead">Grow</span>{" "}
              <span className="features-growth__rest">Your Audience</span>
            </h2>
            <p className="features-growth__text">
              With integrated tools and strategic management, we help you reach the full potential of
              your brand with our marketing expertise. We specialise in growing your audience across all
              platforms, from social media to search engines, ensuring maximum visibility and engagement.
              Let us help you reach new heights and connect with your target audience like never before!
            </p>
          </FadeUpReveal>

          <FadeUpReveal delay={0.12} yOffset={36}>
            <figure
              className="features-chart"
              role="img"
              aria-label="Chart: engagement, leads, ROI and reach all rising week on week"
            >
              <svg
                className="features-chart__svg"
                viewBox={`0 0 ${CHART.w} ${CHART.h}`}
                aria-hidden="true"
              >
                {chartGridY.map((y) => (
                  <line key={y} x1={40} x2={960} y1={y} y2={y} className="features-chart__grid" />
                ))}
                {chartSeries.map((series) => {
                  const pts = series.values.map((v, i) => chartPoint(v, i, series.values.length));
                  return (
                    <g key={series.label}>
                      <polyline
                        points={pts.map((pt) => `${pt.x},${pt.y}`).join(" ")}
                        fill="none"
                        stroke={series.color}
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {pts.map((pt, i) => (
                        <circle key={i} cx={pt.x} cy={pt.y} r={7} fill={series.color} />
                      ))}
                    </g>
                  );
                })}
              </svg>
              {chartSeries.map((series) => (
                <span
                  key={series.label}
                  className={`features-chart__tag features-chart__tag--${series.tag.align}`}
                  style={{
                    left: `${(series.tag.x / CHART.w) * 100}%`,
                    top: `${(series.tag.y / CHART.h) * 100}%`,
                  }}
                  aria-hidden="true"
                >
                  {series.label}
                </span>
              ))}
            </figure>
          </FadeUpReveal>
        </div>
      </section>

      <section className="features-stats">
        <FadeUpReveal delay={0.08} className="features-stats__row">
          <div className="features-stat">
            <p className="features-stat__value">3.5mill</p>
            <h3 className="features-stat__title">Reach</h3>
            <p className="features-stat__body">
              Get instant access to millions of active users across web push, pop-ups, SMS, email, and
              WhatsApp - putting your message exactly where people are already engaged. With smart
              targeting and strong delivery rates, your brand stays visible across key digital touchpoints.
            </p>
          </div>

          <div className="features-stat">
            <p className="features-stat__value">56%</p>
            <h3 className="features-stat__title">ROI</h3>
            <p className="features-stat__body">
              Powered by real-time analytics, every campaign becomes more efficient and cost-effective.
              Businesses gain higher conversions, lower acquisition costs, and clear, measurable returns
              that outperform traditional advertising.
            </p>
          </div>
        </FadeUpReveal>
      </section>

      <section className="features-cta">
        <div className="features-cta__inner">
          <FadeUpReveal className="features-cta__copy">
            <div className="glitch-text">
              <h3 className="features-cta__title">
                <span>Rebranding the</span> <span>future of your</span>{" "}
                <span>industry starts here.</span>
              </h3>
            </div>
            <Link href="https://crm.balloads.com/demo" className="features-cta__button">
              Book a free demo
              <span className="features-cta__button-icon" aria-hidden="true">
                <ChevronRight strokeWidth={2.25} />
              </span>
            </Link>
          </FadeUpReveal>

          <FadeUpReveal delay={0.15} yOffset={40} className="features-cta__art">
            <span className="features-cta__ring" aria-hidden="true" />
            <Image
              src={person}
              alt="Smiling customer using BalloAds on a phone"
              sizes="(max-width: 900px) 70vw, 26rem"
              className="features-cta__person"
            />
          </FadeUpReveal>
        </div>
      </section>
    </main>
  );
}
