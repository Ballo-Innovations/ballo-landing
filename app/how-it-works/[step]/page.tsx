import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";
import { howItWorksSteps, getStep } from "../steps";

export function generateStaticParams() {
  return howItWorksSteps.map((step) => ({ step: step.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ step: string }>;
}): Promise<Metadata> {
  const { step: slug } = await params;
  const step = getStep(slug);
  if (!step) return { title: "How It Works | BalloAds" };
  return {
    title: `${step.title} | How It Works | BalloAds`,
    description: step.description,
  };
}

const Arrow = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
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
);

export default async function HowItWorksStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step: slug } = await params;
  const step = getStep(slug);
  if (!step) notFound();

  const index = howItWorksSteps.findIndex((s) => s.slug === step.slug);
  const prev = index > 0 ? howItWorksSteps[index - 1] : null;
  const next = index < howItWorksSteps.length - 1 ? howItWorksSteps[index + 1] : null;
  const Icon = step.Icon;

  return (
    <main className="how-it-works-page">
      <section className="relative px-4 pb-24 pt-28 md:px-8">
        <div className="container mx-auto">
          <div className="hiw-detail">
            <Link href="/how-it-works" className="hiw-detail__back">
              <span aria-hidden="true">←</span>
              Back to How It Works
            </Link>

            <div className="mt-6 flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-color-1)] text-white shadow-lg">
                <Icon strokeWidth={2} aria-hidden="true" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-color-3)]">
                  Step {step.number}
                </span>
                <h1 className="text-3xl font-bold leading-tight text-[var(--dark-blue)] md:text-4xl">
                  {step.title}
                </h1>
              </div>
            </div>

            <p className="hiw-detail__intro">{step.detail.intro}</p>

            <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                {step.detail.sections.map((section) => (
                  <section key={section.heading} className="hiw-detail__section">
                    <h2 className="hiw-detail__heading">{section.heading}</h2>
                    <p className="hiw-detail__body">{section.body}</p>
                  </section>
                ))}
              </div>

              {/* The in-app screen for this step */}
              <div className="mx-auto w-48 md:w-56">
                <Image
                  src={step.screen}
                  alt={step.screenAlt}
                  sizes="14rem"
                  className="h-auto w-full"
                />
              </div>
            </div>

            <div className="hiw-detail__nav">
              {prev ? (
                <Link href={`/how-it-works/${prev.slug}`} className="hiw-detail__back">
                  <span aria-hidden="true">←</span>
                  Step {prev.number}: {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/how-it-works/${next.slug}`} className="hiw-detail__back">
                  Step {next.number}: {next.title}
                  <Arrow />
                </Link>
              )}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <WaitlistButton className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-8 py-4 text-base font-semibold text-white shadow-lg transition">
                Get Started
                <Arrow className="h-5 w-5" />
              </WaitlistButton>
              <Link
                href="/live-chat"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[var(--brand-color-1)] transition"
              >
                Talk to us
                <Arrow className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
