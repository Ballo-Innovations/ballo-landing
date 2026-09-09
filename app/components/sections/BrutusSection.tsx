"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import {
  ContainerAnimated,
  ContainerInset,
  ContainerScroll,
  ContainerSticky,
  HeroVideo,
} from "../ui/AnimatedVideoOnScroll";
import { ShinyButton } from "../ui/ShinyButton";
import { useAnimateWhenVisible } from "../ui/useAnimateWhenVisible";

/**
 * Brutus, as a section of the home page.
 *
 * A trailer for /brutus rather than a copy of it: a pinned stage where the
 * copy rises out of a blur and the demo film opens from a rounded pill to full
 * bleed as you scroll.
 *
 * The stage is the 21st.dev "animated video on scroll" component, which this
 * project already had at `ui/AnimatedVideoOnScroll` — the hero's own pin runs
 * on the same four primitives (see `HeroSideExit`), so this adds no dependency
 * and no second copy of them. `HeroVideo` was the one export that had never
 * been needed before and is ported now.
 *
 * What this replaced, and why: a "lamp" header, a phone mock and pulse beams
 * running between them, and below the stage a set of capability cards and
 * chips. The film is a far stronger centrepiece than any of it, and all of
 * that detail still lives on /brutus, which is where the CTA sends anyone who
 * wants it — the six capabilities included, from the same shared module.
 */

export function BrutusSection() {
  const animRef = useAnimateWhenVisible<HTMLElement>();

  return (
    <section id="brutus" ref={animRef} className="brutus-home">
      {/* ── The pinned stage ── */}
      <ContainerScroll className="brutus-stage-track">
        <ContainerSticky className="brutus-stage">
          {/* Blur-to-sharp plus a rise, which is `ContainerAnimated`'s own
              variant. It fires as the stage scrolls up into view, which is the
              right moment here — unlike the hero, this pin is not on screen at
              page load. */}
          <ContainerAnimated className="brutus-stage__copy">
            <span className="section-eyebrow">
              <Sparkles size={13} aria-hidden="true" />
              Meet Brutus
            </span>
            <h2 className="section-h2 brutus-stage__h2">
              Your AI assistant that never clocks off.
            </h2>
            <p className="landing-body brutus-stage__lede">
              Brutus answers customers, qualifies leads and sends campaigns for
              you, across WhatsApp, SMS, email and the web, in a voice that
              sounds like your brand.
            </p>
          </ContainerAnimated>

          {/* The film, opening out of a pill. `ContainerInset` drives a
              clip-path from a 1000px-radius capsule to a full-bleed rectangle
              as the track scrolls. */}
          {/* `closeAt` is this project's addition to the component (upstream
              hardcodes 0.8). At 0.8 the film reached full bleed with a fifth
              of the pin still to scroll — nearly 40vh of held scroll in which
              nothing moved. */}
          <ContainerInset closeAt={0.95} className="brutus-stage__inset">
            {/* The clip from the component's own demo, self-hosted rather
                than pointed at `cdn.21st.dev`: a third-party demo asset can be
                moved or rate-limited at any time, and a hotlink would put a
                render of this section in someone else's hands.

                Re-encoded from the 2560x1440, 14MB source to 1152 wide with
                its audio track dropped — the player is muted, so the AAC
                stream was pure overhead. 437KB.

                `aria-hidden`, not a label: it is atmosphere, and the heading
                beside it already says what the section is. */}
            <HeroVideo
              className="brutus-stage__video"
              src="/brutus/demo.mp4"
              poster="/brutus/demo-poster.jpg"
              aria-hidden="true"
            />
          </ContainerInset>

          {/* Comes up from below rather than down from above, and late, so it
              arrives once the film has opened. */}
          <ContainerAnimated
            transition={{ delay: 0.4 }}
            inputRange={[0, 0.7]}
            outputRange={[-120, 0]}
            className="brutus-stage__cta"
          >
            <ShinyButton href="/brutus">Meet Brutus</ShinyButton>
            <Link href="/live-chat" className="btn-secondary group">
              Talk to us
            </Link>
          </ContainerAnimated>
        </ContainerSticky>
      </ContainerScroll>
    </section>
  );
}
