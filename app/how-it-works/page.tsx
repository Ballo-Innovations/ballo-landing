import Link from "next/link";
import Image from "next/image";
import {
  Network,
  Rocket,
  HandCoins,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";
import HowItWorksStage from "@/app/components/sections/HowItWorksStage";
import HowItWorksScroll, {
  type HowItWorksScrollStep,
} from "@/app/components/sections/HowItWorksScroll";
import { resolveFlag } from "@/lib/featureFlags";
import { HowItWorksDesignFlag } from "./HowItWorksDesignFlag";
import { getProcessSteps } from "@/lib/processStepsApi";
import { toHowItWorksStep } from "./steps";
import circuit from "@/public/Assets/hiw-circuit.png";

// No `force-dynamic`: this route already renders per-request because its CMS
// helpers read headers() to pick the environment's API base. All force-dynamic
// added was forcing `no-store` onto every fetch in the route, which overrode the
// revalidate window in lib/cmsFetch.ts and put an uncached upstream round-trip
// in front of every visitor.

const benefits = [
  {
    title: "Seamless Integrations",
    description:
      "BalloAds connects effortlessly with your existing tools. Using our APIs creates a smooth, unified marketing workflow for your systems.",
    Icon: Network,
  },
  {
    title: "Boost Productivity",
    description:
      "Automated delivery and streamlined management free your team to focus on strategy, not manual tasks.",
    Icon: Rocket,
  },
  {
    title: "Reduce Marketing Costs",
    description:
      "Precision targeting and automated optimisation ensure you spend less while reaching more of the right people.",
    Icon: HandCoins,
  },
  {
    title: "Increase Lead Conversion",
    description:
      "Smart delivery and behaviour-based triggers turn more prospects into real, high-value customers.",
    Icon: TrendingUp,
  },
  {
    title: "Gain Actionable Insights",
    description:
      "Real-time analytics from BalloDash reveal what's working so you can make faster, data-driven decisions.",
    Icon: Lightbulb,
  },
  {
    title: "Enjoy Enterprise-Grade Security",
    description:
      "Your data stays fully protected with advanced, industry-level security across the entire Ballo ecosystem.",
    Icon: ShieldCheck,
  },
];

// The four steps as designed. Shown in the designed layout whenever the CMS
// has no "how-it-works" steps published, so the section never disappears.
const BUILT_IN_STEPS: HowItWorksScrollStep[] = [
  {
    key: "sign-up",
    number: "1",
    title: "Sign up & get verified",
    description: "Create an account and complete the quick KYC process.",
    href: null,
    screen: null,
  },
  {
    key: "audience",
    number: "2",
    title: "Select your audience",
    description: "Choose from bulk messaging to targeted ads.",
    href: null,
    screen: null,
  },
  {
    key: "campaign",
    number: "3",
    title: "Customise your campaign",
    description: "Craft engaging messages, set preferences, and launch.",
    href: null,
    screen: null,
  },
  {
    key: "monitor",
    number: "4",
    title: "Monitor & optimise",
    description: "Use analytics to improve engagement and maximise conversions.",
    href: null,
    screen: null,
  },
];

const RING_RADII = [196, 168, 140, 112, 84];

/** Outlined circle-arrow used on every CTA in the mockup. */
const CircleArrow = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8l4 4-4 4" />
  </svg>
);

export default async function HowItWorksPage() {
  const rawSteps = await getProcessSteps("how-it-works");
  const steps = rawSteps.map(toHowItWorksStep);

  // The designed layout is switched by data-design (see how-it-works.css).
  // HowItWorksDesignFlag re-applies it on the client for `?features=` overrides.
  const designOn = resolveFlag({
    env: process.env.NEXT_PUBLIC_FEATURE_HOW_IT_WORKS_DESIGN,
    defaultEnabled: process.env.NODE_ENV === "development",
  });
  // Plain data only: this crosses to a client component.
  const scrollSteps: HowItWorksScrollStep[] =
    rawSteps.length > 0
      ? rawSteps.map((raw) => ({
          key: raw.slug,
          number: String(raw.stepNumber),
          title: raw.title,
          description: raw.description,
          href: `/how-it-works/${raw.slug}`,
          screen: raw.screenImageUrl,
        }))
      : BUILT_IN_STEPS;

  return (
    <main className="how-it-works-page" data-design={designOn ? "on" : undefined}>
      <HowItWorksDesignFlag />
      {/* ---- Hero ---- */}
      <section className="hiw-hero px-4 pt-28 pb-14 md:px-8 md:pb-16">
        {/* Rings behind the heading. Designed layout only. */}
        <svg className="hiw-hero__rings" viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <linearGradient id="hiw-rings" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#c9d3e3" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#8f97c2" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#3b3f86" stopOpacity="1" />
            </linearGradient>
          </defs>
          {RING_RADII.map((radius) => (
            <circle
              key={radius}
              cx="200"
              cy="200"
              r={radius}
              fill="none"
              stroke="url(#hiw-rings)"
              strokeWidth="5"
            />
          ))}
        </svg>
        <div className="container mx-auto flex max-w-4xl flex-col items-center gap-7 text-center">
          <h1 className="hiw-hero__title">
            Seamless Marketing and Ad Automation in one Platform
          </h1>
          <p className="hiw-hero__desc">
            Effortlessly streamline your marketing and sales with an all-in-one platform designed to
            automate workflows, boost conversions, and drive business growth.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <WaitlistButton className="hiw-btn hiw-btn--primary">
              Get Started
              <CircleArrow />
            </WaitlistButton>
            <Link href="/guides" className="hiw-btn hiw-btn--secondary">
              Watch Demo
              <CircleArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Zig-zag step flow ---- */}
      <section className="hiw-flow-section px-4 pb-10 md:px-8 md:pb-14">
        <div className="container mx-auto hiw-flow-classic">
          <HowItWorksStage steps={steps} />
        </div>
        <div className="hiw-flow-design">
          <HowItWorksScroll steps={scrollSteps} />
        </div>
      </section>

      {/* ---- Video spotlight ---- */}
      <section className="hiw-spotlight px-4 pb-14 md:px-8 md:pb-20">
        <div className="container mx-auto flex max-w-5xl flex-col gap-7">
          <div className="hiw-spotlight__head">
            <p className="hiw-spotlight__copy">
              Get started and make use of your real performance data today!
            </p>
            <WaitlistButton className="hiw-btn hiw-btn--primary shrink-0">
              Try it Now
              <CircleArrow />
            </WaitlistButton>
          </div>

          <div className="hiw-video">
            <Image
              src={circuit}
              alt="BalloAds real-time performance data demo"
              className="hiw-video__thumb"
              priority
            />
            {/* TODO: swap for the real demo video when it's supplied. */}
            <Link href="/guides" className="hiw-video__play" aria-label="Watch the demo video">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-7 w-7">
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Benefits ---- */}
      <section className="hiw-benefits px-4 pb-28 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="hiw-benefits__grid">
            {benefits.map((benefit) => {
              const Icon = benefit.Icon;
              return (
                <article key={benefit.title} className="hiw-benefit">
                  <span className="hiw-benefit__icon">
                    <Icon strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <h3 className="hiw-benefit__title">{benefit.title}</h3>
                  <p className="hiw-benefit__text">{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
