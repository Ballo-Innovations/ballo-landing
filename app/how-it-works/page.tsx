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
import { getProcessSteps } from "@/lib/processStepsApi";
import { toHowItWorksStep } from "./steps";
import circuit from "@/public/Assets/hiw-circuit.png";

export const dynamic = "force-dynamic";

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

  return (
    <main className="how-it-works-page">
      {/* ---- Hero ---- */}
      <section className="hiw-hero px-4 pt-28 pb-14 md:px-8 md:pb-16">
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
        <div className="container mx-auto">
          <HowItWorksStage steps={steps} />
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
