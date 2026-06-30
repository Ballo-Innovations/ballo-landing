import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import WaitlistButton from "../waitlist/WaitlistButton";
import "./channel-page.css";

/**
 * ChannelPage — shared layout for the marketing channel pages
 * (WhatsApp / SMS / Email). One presentational component driven by per-channel
 * config so the three routes stay consistent and DRY.
 *
 * Headlines come from the Canva channel hero designs (design DAGbVFwuiWs). The
 * capability/step copy is structural scaffolding; final marketing copy and
 * channel-specific imagery are pending stakeholder notes (see
 * docs/integration-boundaries.md). "Sign Up" uses the shared waitlist modal,
 * matching the header/hero CTA across the site.
 */

export interface ChannelFeature {
  title: string;
  description: string;
}

export interface ChannelStep {
  label: string;
  description: string;
}

export interface ChannelPageProps {
  /** Short channel name, e.g. "WhatsApp Marketing". */
  name: string;
  /** Hero headline (from the Canva channel hero). */
  headline: string;
  /** Supporting hero paragraph. */
  intro: string;
  heroImage: StaticImageData;
  heroImageAlt: string;
  features: ChannelFeature[];
  steps: ChannelStep[];
}

export default function ChannelPage({
  name,
  headline,
  intro,
  heroImage,
  heroImageAlt,
  features,
  steps,
}: ChannelPageProps) {
  return (
    <main className="channel-page">
      {/* Hero */}
      <section className="channel-hero">
        <div className="channel-hero__inner">
          <div className="channel-hero__copy">
            <p className="channel-eyebrow">BalloAds &middot; {name}</p>
            <h1 className="channel-hero__headline">{headline}</h1>
            <p className="channel-hero__intro">{intro}</p>
            <div className="channel-hero__actions">
              <WaitlistButton className="btn-primary" ariaLabel={`Sign up for BalloAds ${name}`}>
                Sign Up
              </WaitlistButton>
              <Link href="/pricing" className="btn-secondary">
                View Pricing
              </Link>
            </div>
          </div>

          <div className="channel-hero__media">
            <div className="channel-hero__media-panel">
              <Image
                src={heroImage}
                alt={heroImageAlt}
                className="channel-hero__media-img"
                priority
                sizes="(max-width: 768px) 80vw, 32rem"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="channel-section">
        <div className="channel-section__inner">
          <header className="channel-section__head">
            <h2 className="channel-section__title">What you can do with {name}</h2>
            <p className="channel-section__lede">
              Everything you need to plan, launch and measure {name.toLowerCase()} campaigns
              from one place.
            </p>
          </header>

          <div className="channel-features">
            {features.map((feature) => (
              <article key={feature.title} className="channel-feature">
                <h3 className="channel-feature__title">{feature.title}</h3>
                <p className="channel-feature__desc">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="channel-section channel-section--muted">
        <div className="channel-section__inner">
          <header className="channel-section__head">
            <h2 className="channel-section__title">How it works</h2>
          </header>

          <ol className="channel-steps">
            {steps.map((step, index) => (
              <li key={step.label} className="channel-step">
                <span className="channel-step__num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="channel-step__label">{step.label}</h3>
                <p className="channel-step__desc">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="channel-cta">
        <div className="channel-cta__inner">
          <h2 className="channel-cta__title">Ready to launch your first {name} campaign?</h2>
          <p className="channel-cta__lede">
            Join the waitlist and be first to reach your audience the moment BalloAds goes live.
          </p>
          <div className="channel-cta__actions">
            <WaitlistButton className="btn-primary" ariaLabel={`Sign up for BalloAds ${name}`}>
              Sign Up
            </WaitlistButton>
            <Link href="/how-it-works" className="btn-secondary">
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
