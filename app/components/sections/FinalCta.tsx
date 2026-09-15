"use client";

import Link from "next/link";
import { FadeUpReveal } from "../ui/FadeUpReveal";
import { ShinyButton } from "../ui/ShinyButton";
import { StoreBadge } from "../ui/StoreBadge";
import { useAnimateWhenVisible } from "../ui/useAnimateWhenVisible";
import { useWaitlist } from "../waitlist/WaitlistProvider";

/**
 * The closing CTA: copy and actions on the left, and nothing on the right.
 *
 * The "Want a feel of BalloAds?" phone used to fill that column and was itself
 * the CTA. It is gone; the column is kept rather than collapsed, because the
 * space is what the tubes layer behind this section now occupies. The waitlist
 * is still reachable from "Get started free" here.
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

      </div>
    </section>
  );
}
