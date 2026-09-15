"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeUpReveal } from "../ui/FadeUpReveal";
import { ShinyButton } from "../ui/ShinyButton";
import { StoreBadge } from "../ui/StoreBadge";
import { useAnimateWhenVisible } from "../ui/useAnimateWhenVisible";
import { useWaitlist } from "../waitlist/WaitlistProvider";

import logoIcon from "@/public/BalloAds Logo New/BalloAds-Icon.png";

/**
 * The closing CTA: copy and actions on one side, and the "Want a feel of
 * BalloAds?" phone — the whole device is the CTA — on the other.
 */

export function FinalCta() {
  const { openWaitlist } = useWaitlist();
  const ref = useAnimateWhenVisible<HTMLElement>();

  return (
    <section ref={ref} className="cta-mq">
      <div className="page-inner cta-mq__grid">
        <div className="cta-mq__copy">
          <FadeUpReveal yOffset={40}>
            <span className="section-eyebrow">Ready when you are</span>
            <h2 className="section-h2 text-gradient-silver cta-mq__h2">
              Reach every customer, from one dashboard.
            </h2>
            <p className="landing-body cta-mq__lede">
              Build your audience, send across every channel and see what each
              message earned you. Start free, upgrade when it pays for itself.
            </p>
          </FadeUpReveal>

          <FadeUpReveal yOffset={24} delay={0.1} className="cta-mq__actions">
            <ShinyButton onClick={openWaitlist}>Get started free</ShinyButton>
            <Link href="/pricing" className="btn-secondary group">
              See pricing
            </Link>
          </FadeUpReveal>

          <FadeUpReveal yOffset={16} delay={0.2} className="cta-mq__stores">
            <StoreBadge store="apple" />
            <StoreBadge store="play" />
          </FadeUpReveal>
        </div>

        <FadeUpReveal yOffset={50} className="try-phone-wrap cta-mq__visual">
          <button
            type="button"
            onClick={openWaitlist}
            className="try-visual"
            aria-label="Try BalloAds now"
          >
            {/* Served as the SVG rather than through next/image because the
                optimizer does not rasterize SVG; its embedded bitmaps were
                already downscaled (15MB -> 0.4MB). Lazy and async-decoded: it
                is the last thing on the page. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Assets/try.it.now.svg"
              alt="Preview of the BalloAds app"
              className="try-art"
              width={810}
              height={1012}
              loading="lazy"
              decoding="async"
            />
            <span className="try-overlay">
              <Image
                src={logoIcon}
                alt="BalloAds"
                width={80}
                height={80}
                className="try-overlay-logo"
              />
              <span className="try-overlay-title">
                WANT A FEEL OF
                <br />
                BALLOADS?
              </span>
              <span className="try-overlay-btn">TRY IT NOW</span>
            </span>
          </button>
        </FadeUpReveal>
      </div>
    </section>
  );
}
