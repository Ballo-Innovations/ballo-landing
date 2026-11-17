"use client";

import * as React from "react";
import Image from "next/image";

import balloMark from "@/public/BalloAds Logo New/BalloAds-Icon.png";
import {
  COMPACT_RUNWAY_STEPS,
  RUNWAY_STEPS,
  STEP_MS,
  itemAt,
  runwayAt,
  trustedTicker,
} from "@/lib/trustedLockScreen";
import { LockScreen } from "./JourneyScreens";
import type { LogoCloudItem } from "./LogoCloud";
import { Phone3D } from "./Phone3D";
import { LogoMark, useTrustedTicker } from "./TrustedLockNotes";

/**
 * "Trusted by" as a lock screen (ADR 0018, behind `trustedLockScreen`).
 *
 * Client logos travel along a runway into the BalloAds mark, and each one
 * lands as a notification from that brand on the phone beside it. The phone
 * is the section's own: the journey phone that used to sit here was archived
 * on 2026-11-17 (ADR 0017). It reuses the journey phone's lock screen, so the
 * device and the glass notes look the same as they did there.
 *
 * The runway and the notes share `trustedTicker` rather than each running a
 * CSS loop, so the logo going in and the message coming out are always the
 * same brand. The runway owns the clock: it runs while the runway is near the
 * screen and stops otherwise, so nothing ticks once the section has gone.
 */
const COMPACT_QUERY = "(max-width: 640px)";

/** True on small screens, where the runway is short (see logo-cloud.css). */
function useCompact() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(COMPACT_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false,
  );
}

export function TrustedLockLane({
  logos,
  eyebrow = "Trusted by",
  title = "From their brand to their customer's phone",
}: {
  logos: LogoCloudItem[];
  eyebrow?: string;
  title?: string;
}) {
  const runwayRef = React.useRef<HTMLDivElement>(null);
  const state = useTrustedTicker();
  const runwaySteps = useCompact() ? COMPACT_RUNWAY_STEPS : RUNWAY_STEPS;
  const count = logos.length;

  React.useEffect(() => {
    const node = runwayRef.current;
    if (!node || count === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) trustedTicker.start();
        else trustedTicker.stop();
      },
      { rootMargin: "150px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      trustedTicker.stop();
    };
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="trusted-lane">
      <div className="trusted-lane__head">
        <p className="trusted-lane__eyebrow">{eyebrow}</p>
        <p className="trusted-lane__title text-shimmer">{title}</p>
      </div>

      {/* On phones the mark is hidden and the runway runs straight into the
          phone beside it (see logo-cloud.css). */}
      <div className="trusted-lane__track" aria-hidden="true">
        <div
          ref={runwayRef}
          className="trusted-lane__runway"
          style={
            { ["--run-ms" as string]: `${runwaySteps * STEP_MS}ms` } as React.CSSProperties
          }
        >
          {runwayAt(state, runwaySteps).map((runner) => {
            const logo = itemAt(logos, runner.launch);
            if (!logo) return null;
            return (
              <span
                key={runner.key}
                className="trusted-lane__runner"
                style={{ animationDelay: `${runner.delayMs}ms` }}
              >
                <LogoMark logo={logo} className="trusted-lane__logo" sizes="150px" />
              </span>
            );
          })}
        </div>
        <span className="trusted-lane__hub">
          <Image src={balloMark} alt="" width={64} height={64} sizes="64px" />
        </span>
      </div>

      {/* Scenery, like the journey phone was: hidden from assistive tech and
          out of the tab order. The names are in the list below. */}
      <div className="trusted-lane__phone" aria-hidden="true" inert>
        <div className="trusted-lane__phone-scale">
          <Phone3D>
            <div className="jp-screens" data-screen="lock">
              <LockScreen brands={logos} runwaySteps={runwaySteps} />
            </div>
          </Phone3D>
        </div>
      </div>

      <ul className="sr-only">
        {logos.map((logo, i) => (
          <li key={`${logo.alt}-${i}`}>{logo.alt}</li>
        ))}
      </ul>
    </div>
  );
}
