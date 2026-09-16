"use client";

import Link from "next/link";
import { FadeUpReveal } from "../ui/FadeUpReveal";
import { FloatingGlassIcons } from "../ui/FloatingGlassIcons";
import { ShinyButton } from "../ui/ShinyButton";
import { StoreBadge } from "../ui/StoreBadge";
import { useAnimateWhenVisible } from "../ui/useAnimateWhenVisible";
import { useWaitlist } from "../waitlist/WaitlistProvider";

/**
 * The closing CTA: copy and actions on the left, channels on glass on the right.
 *
 * The "Want a feel of BalloAds?" phone used to fill that column and was itself
 * the CTA. In its place the column carries the tubes layer behind this section
 * and the drifting channel tiles over it — which is also what answers the copy,
 * since "reach every customer" names no channels on its own. The waitlist is
 * still reachable from "Get started free" here.
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

        {/* The right-hand column. Positioned so the tiles can be placed
            against it rather than against the section, which is wider than the
            grid and would scatter them under the copy. */}
        <div className="cta-mq__visual">
          <FloatingGlassIcons />
        </div>
      </div>
    </section>
  );
}
