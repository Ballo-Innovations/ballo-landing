import Link from "next/link";
import Image from "next/image";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";
import HowItWorksStage from "@/app/components/sections/HowItWorksStage";
import { howItWorksSteps as steps } from "./steps";
import ring from "@/public/Assets/8.png";
import statsBoard from "@/public/elements small/stats-chart.PNG";

const benefits = [
  {
    title: "Seamless Integrations",
    description:
      "BalloAds connects effortlessly with your existing tools. Using our APIs creates a smooth, unified marketing workflow for your systems.",
  },
  {
    title: "Boost Productivity",
    description:
      "Automated delivery and streamlined management free your team to focus on strategy, not manual tasks.",
  },
  {
    title: "Reduce Marketing Costs",
    description:
      "Precision targeting and automated optimisation ensure you spend less while reaching more of the right people.",
  },
  {
    title: "Increase Lead Conversion",
    description:
      "Smart delivery and behaviour-based triggers turn more prospects into real, high-value customers.",
  },
  {
    title: "Gain Actionable Insights",
    description:
      "Real-time analytics from BalloDash reveal what’s working so you can make faster, data-driven decisions.",
  },
  {
    title: "Enjoy Enterprise-Grade Security",
    description:
      "Your data stays fully protected with advanced, industry-level security across the entire Ballo ecosystem.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-[#EEF2FF] text-[var(--dark-blue)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-24 pt-28 md:px-8">
        <div className="absolute inset-0">
          <Image
            src={ring}
            alt="Circles Ring"
            width={1600}
            height={1900}
            className="w-full h-auto absolute right-0 -top-150 scale-[0.5]"
            priority
          />
        </div>

        <div className="relative container mx-auto flex flex-col items-center gap-10 text-center max-w-4xl z-10">
          <span className="rounded-full bg-white/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-color-2)]">
            How It Works
          </span>
        <div className="glitch-text">
          <h1 className="text-4xl font-bold leading-tight text-[var(--dark-blue)] md:text-6xl">
            Seamless Marketing and Ad Automation in one Platform
          </h1>
        </div>
          <p className="max-w-2xl text-base text-[var(--dark-blue)]/70 md:text-lg">
            Effortlessly streamline your marketing and sales with an all-in-one platform designed to automate
            workflows, boost conversions, and drive business growth.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <WaitlistButton className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-8 py-4 text-base font-semibold text-white shadow-lg transition">
              Get Started
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </WaitlistButton>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-[var(--brand-color-1)] transition bg-white"
            >
              Book A Free Demo
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps — the phone switches screens on hover/click of each step tile */}
      <section className="relative px-4 pb-24 md:px-8">
        <div className="container mx-auto">
          <HowItWorksStage />

          {/* Preview notes — each opens that step's detailed sub-page */}
          <div className="hiw-notes">
            {steps.map((step) => (
              <article key={step.slug} className="hiw-note">
                <div className="hiw-note__head">
                  <span className="hiw-note__num">{step.number}</span>
                  <h3 className="hiw-note__title">{step.title}</h3>
                </div>
                <p className="hiw-note__text">{step.note}</p>
                <Link href={`/how-it-works/${step.slug}`} className="hiw-note__link">
                  Read more
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AI Highlight + Benefits */}
      <section className="relative px-4 pb-28 md:px-8">
        <div className="container mx-auto flex flex-col gap-16">
          <div className="overflow-hidden rounded-[48px] bg-gradient-to-tr from-[#050C31] via-[#0F245C] to-[#1B3C9E] p-4 shadow-2xl">
            <div className="relative overflow-hidden rounded-[36px] bg-black/30">
              <Image
                src={statsBoard}
                alt="AI powered insights"
                width={1600}
                height={900}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-[32px] bg-gradient-to-br from-[#0F1F4C] via-[#133A7C] to-[#0A4ACB] p-[2px] shadow-lg"
              >
                <div className="h-full rounded-[30px] bg-[var(--brand-color-1)] p-6">
                  <h4 className="text-xl font-bold text-white">
                    {benefit.title}
                  </h4>
                  <p className="mt-3 text-sm text-white">
                    {benefit.description}
        </p>
      </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}


