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
import type { HomeLogoItem } from "@/app/HomeClient";
import { DeliveredOver } from "./DeliveredOver";
import type { LogoCloudItem } from "./LogoCloud";
import { Phone3D } from "./Phone3D";
import {
  LogoMark,
  usePublishTrustedBrands,
  useTrustedStage,
  useTrustedTicker,
} from "./TrustedLockNotes";

/**
 * "Trusted by" as a lock screen (ADR 0018, behind `trustedLockScreen`).
 *
 * Client logos travel along a runway into the BalloAds mark, and each one
 * lands as a notification from that brand on the phone beside it. That phone
 * is the journey phone (ADR 0017) when it is on, since it stops beside this
 * section anyway; when it is off (`PHONE_JOURNEY`), the section shows its own
 * Phone3D with the same lock screen, so it looks the same either way.
 *
 * Layout A, "Split stage" (George, 2026-11-17): one 1200px container, the
 * heading, runway and "Backed by" on the left, the phone slot on the right,
 * the left block centred on the phone. Stacked below 1024px.
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

/** Phone3D's own height; the slot scales it to fit. */
const PHONE_BASE_H = 516;

export function TrustedLockLane({
  logos,
  backers = [],
  eyebrow = "Trusted by",
  title = "From their brand to their customer's phone",
}: {
  logos: LogoCloudItem[];
  /** "Backed by", shown under the runway (layout A, ADR 0018). */
  backers?: HomeLogoItem[];
  eyebrow?: string;
  title?: string;
}) {
  const runwayRef = React.useRef<HTMLDivElement>(null);
  const slotRef = React.useRef<HTMLDivElement>(null);
  const [phoneScale, setPhoneScale] = React.useState(1);
  const state = useTrustedTicker();
  const runwaySteps = useCompact() ? COMPACT_RUNWAY_STEPS : RUNWAY_STEPS;
  const count = logos.length;
  // When the journey phone is on, it is the phone (it stops beside this
  // section); otherwise the section shows its own.
  const ownPhone = useTrustedStage().journeyPhones === 0;
  usePublishTrustedBrands(logos, runwaySteps);

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

  // The section's own phone is Phone3D at its native size, scaled to the slot.
  React.useEffect(() => {
    const slot = slotRef.current;
    if (!slot || !ownPhone) return;
    const fit = () => setPhoneScale(slot.clientHeight / PHONE_BASE_H || 1);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(slot);
    return () => ro.disconnect();
  }, [ownPhone]);

  if (count === 0) return null;

  return (
    <div className="trusted-lane">
      <div className="trusted-lane__head">
        <p className="trusted-lane__eyebrow">{eyebrow}</p>
        <p className="trusted-lane__title">{title}</p>
      </div>

      {/* Signal waves (option D) carry each message from the mark across
          the column gap to the phone (split layout only, see
          logo-cloud.css). */}
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
        {/* Keyed by the clock step, so the waves play once on every step,
            as the logo goes into the mark. A looping CSS animation would
            drift from the clock whenever the section's animations pause. */}
        <span key={`waves-${state.step}`} className="trusted-lane__waves">
          <i />
          <i />
          <i />
        </span>
      </div>

      {/* Where the phone stands. With the journey phone on, the slot stays
          empty and the journey phone lines up with it (JourneyPhone reads
          `.trusted-lane__slot`); otherwise the section's own phone is in it.
          Scenery either way: hidden from assistive tech and out of the tab
          order. The names are in the list below. */}
      <div ref={slotRef} className="trusted-lane__slot" aria-hidden="true" inert>
        {ownPhone ? (
          <div
            className="trusted-lane__phone-scale"
            style={{ ["--phone-scale" as string]: phoneScale } as React.CSSProperties}
          >
            <Phone3D>
              <div className="jp-screens" data-screen="lock">
                <LockScreen brands={logos} runwaySteps={runwaySteps} />
              </div>
            </Phone3D>
          </div>
        ) : null}
      </div>

      {backers.length > 0 ? (
        <div className="trusted-lane__backers">
          <DeliveredOver logos={backers} />
        </div>
      ) : null}

      <ul className="sr-only">
        {logos.map((logo, i) => (
          <li key={`${logo.alt}-${i}`}>{logo.alt}</li>
        ))}
      </ul>
    </div>
  );
}
