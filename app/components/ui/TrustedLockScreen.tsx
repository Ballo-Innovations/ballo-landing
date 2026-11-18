"use client";

import * as React from "react";
import Image from "next/image";

import balloMark from "@/public/BalloAds Logo New/BalloAds-Icon.png";
import {
  RUNWAY_STEPS,
  STEP_MS,
  itemAt,
  launchTime,
  runwayAt,
  runwayStepsFor,
  trustedTicker,
} from "@/lib/trustedLockScreen";
import { LockScreen } from "./JourneyScreens";
import type { HomeLogoItem } from "@/app/HomeClient";
import { DeliveredOver } from "./DeliveredOver";
import type { LogoCloudItem } from "./LogoCloud";
import { Phone3D } from "./Phone3D";
import { SectionTitle } from "./SectionTitle";
import { useArrival } from "./useArrival";
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
/**
 * How many logos the runway carries at once, measured from its width and
 * its box size (`--slot-w` in logo-cloud.css), so the widest logos never
 * crowd each other (`runwayStepsFor`). Re-measured when the runway resizes.
 */
function useRunwaySteps(runwayRef: React.RefObject<HTMLDivElement | null>) {
  const [steps, setSteps] = React.useState(RUNWAY_STEPS);
  React.useEffect(() => {
    const el = runwayRef.current;
    if (!el) return;
    const measure = () => {
      const slot = parseFloat(getComputedStyle(el).getPropertyValue("--slot-w")) || 200;
      setSteps(runwayStepsFor(el.clientWidth, slot));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [runwayRef]);
  return steps;
}

/**
 * One logo's run. Its delay is fixed when it mounts, from when it should
 * have set off on the clock (`launchTime`), so a step that renders late
 * still puts the logo exactly where it belongs: the spacing comes from the
 * clock, not from when React got round to it.
 */
function Runner({ startAt, children }: { startAt: number; children: React.ReactNode }) {
  const [delayMs] = React.useState(() => Math.round(startAt - performance.now()));
  return (
    <span className="trusted-lane__runner" style={{ animationDelay: `${delayMs}ms` }}>
      {children}
    </span>
  );
}

/**
 * The headline for the masked entrance (option C). Each word sits in its own
 * mask, and the words on one line share a delay, so the lines rise one after
 * another however the heading wraps: two lines on a laptop, three or four on
 * a phone. The line of each word is measured after layout and again whenever
 * the heading's width changes.
 */
function MaskedTitle({ text }: { text: string }) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const number = () => {
      const masks = Array.from(el.querySelectorAll<HTMLElement>(".trusted-lane__word-mask"));
      let line = -1;
      let top = -Infinity;
      for (const m of masks) {
        if (m.offsetTop > top + 2) {
          line++;
          top = m.offsetTop;
        }
        m.style.setProperty("--line", String(line));
      }
    };
    number();
    const ro = new ResizeObserver(number);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <h2 ref={ref} className="trusted-lane__title trusted-lane__title--lines">
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="trusted-lane__word-mask">
            <span className="trusted-lane__word text-gradient-silver">{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </h2>
  );
}

/** Phone3D's own height; the slot scales it to fit. */
const PHONE_BASE_H = 516;

export function TrustedLockLane({
  logos,
  backers = [],
  eyebrow = "Trusted by",
  title = "The brands that trust BalloAds",
  entrance = false,
}: {
  logos: LogoCloudItem[];
  /** "Backed by", shown under the runway (layout A, ADR 0018). */
  backers?: HomeLogoItem[];
  eyebrow?: string;
  title?: string;
  /**
   * Option C entrance (flag `trustedEntrance`, George 2026-11-18): once the
   * section is showing, the eyebrow fades in, the headline's lines slide up
   * out of a mask, the runway follows from the left, the BalloAds mark pops
   * and "Backed by" comes last. Timings live in logo-cloud.css under
   * `[data-entrance]`. The journey phone does its part on the scroll: it
   * comes in from the right (JourneyPhone).
   */
  entrance?: boolean;
}) {
  const laneRef = React.useRef<HTMLDivElement>(null);
  const arrived = useArrival(laneRef, { enabled: entrance });
  const runwayRef = React.useRef<HTMLDivElement>(null);
  const slotRef = React.useRef<HTMLDivElement>(null);
  const [phoneScale, setPhoneScale] = React.useState(1);
  const state = useTrustedTicker();
  const runwaySteps = useRunwaySteps(runwayRef);
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
    <div
      ref={laneRef}
      className="trusted-lane"
      data-entrance={entrance ? (arrived ? "in" : "out") : undefined}
    >
      <div className="trusted-lane__head">
        <p className="trusted-lane__eyebrow">{eyebrow}</p>
        {entrance ? (
          <MaskedTitle text={title} />
        ) : (
          <SectionTitle as="h2" className="trusted-lane__title" text={title} />
        )}
      </div>

      {/* A message hops (option C) from the mark across the column gap into
          the phone on every step (split layout only, see logo-cloud.css). */}
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
              <Runner
                key={`${runwaySteps}:${runner.key}`}
                startAt={launchTime(state, runner.launch, STEP_MS)}
              >
                <LogoMark logo={logo} className="trusted-lane__logo" sizes="176px" />
              </Runner>
            );
          })}
        </div>
        <span className="trusted-lane__hub">
          <Image src={balloMark} alt="" width={64} height={64} sizes="64px" />
        </span>
        {/* Keyed by the clock step, so the hop plays once on every step, as
            the logo goes into the mark. A looping CSS animation would drift
            from the clock whenever the section's animations pause. The arc
            is two animations: the outer span crosses the gap, the inner one
            rises and falls. */}
        <span key={`hop-${state.step}`} className="trusted-lane__hop">
          <span className="trusted-lane__hop-lift">
            <span className="trusted-lane__bubble">
              <i />
              <i />
            </span>
          </span>
        </span>
      </div>

      {/* Where the phone stands. With the journey phone on, the slot stays
          empty and the journey phone lines up with it (JourneyPhone reads
          `.trusted-lane__slot`); otherwise the section's own phone is in it.
          Scenery either way: hidden from assistive tech and out of the tab
          order. The names are in the list below. */}
      <div
        ref={slotRef}
        className={`trusted-lane__slot${ownPhone ? " trusted-lane__slot--own" : ""}`}
        aria-hidden="true"
        inert
      >
        {ownPhone ? (
          <div
            className="trusted-lane__phone-scale"
            style={{ ["--phone-scale" as string]: phoneScale } as React.CSSProperties}
          >
            {/* No pointer tilt in this section (George, 2026-11-18). */}
            <Phone3D interactive={false}>
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
