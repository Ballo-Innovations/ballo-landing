"use client";

import * as React from "react";
import Image from "next/image";
import { MessageCircle, MessageSquare } from "lucide-react";

import {
  RUNWAY_STEPS,
  STACK_SIZE,
  channelFor,
  stackAt,
  trustedTicker,
} from "@/lib/trustedLockScreen";
import type { LogoCloudItem } from "./LogoCloud";

/**
 * The phone's side of the "Trusted by" lock screen (ADR 0018): the brand whose
 * logo just reached the BalloAds mark lands on top of the stack, and the
 * oldest slides off the bottom. Shares `trustedTicker` with the runway in
 * `TrustedLockScreen`.
 */

/**
 * Which phone shows the notes. The journey phone (ADR 0017) stops beside
 * "Trusted by" when it is on, so the section must not add a second phone:
 * the journey phone registers itself while mounted, the section publishes its
 * clients (and runway length), and the journey phone's lock screen reads them.
 * With no journey phone, the section shows its own.
 */
interface TrustedStage {
  journeyPhones: number;
  brands: LogoCloudItem[] | null;
  runwaySteps: number;
}

let stage: TrustedStage = { journeyPhones: 0, brands: null, runwaySteps: RUNWAY_STEPS };
const stageListeners = new Set<() => void>();
const setStage = (patch: Partial<TrustedStage>) => {
  stage = { ...stage, ...patch };
  stageListeners.forEach((l) => l());
};
const subscribeStage = (listener: () => void) => {
  stageListeners.add(listener);
  return () => {
    stageListeners.delete(listener);
  };
};
const getStage = () => stage;

export function useTrustedStage() {
  return React.useSyncExternalStore(subscribeStage, getStage, getStage);
}

/** Called by `JourneyPhone` while it is mounted. */
export function useRegisterJourneyPhone() {
  React.useEffect(() => {
    setStage({ journeyPhones: stage.journeyPhones + 1 });
    return () => setStage({ journeyPhones: stage.journeyPhones - 1 });
  }, []);
}

/** Called by the "Trusted by" runway, so the journey phone can show its clients. */
export function usePublishTrustedBrands(brands: LogoCloudItem[], runwaySteps: number) {
  React.useEffect(() => {
    setStage({ brands, runwaySteps });
    return () => setStage({ brands: null });
  }, [brands, runwaySteps]);
}

export function useTrustedTicker() {
  return React.useSyncExternalStore(
    trustedTicker.subscribe,
    trustedTicker.getState,
    trustedTicker.getState,
  );
}

export function LogoMark({
  logo,
  className,
  sizes,
}: {
  logo: LogoCloudItem;
  className: string;
  sizes: string;
}) {
  if (!logo.src) {
    return <span className={`${className} ${className}--word`}>{logo.alt}</span>;
  }
  return (
    <Image
      src={logo.src}
      alt=""
      width={160}
      height={80}
      sizes={sizes}
      className={className}
      style={{ filter: logo.invert ? "brightness(0) invert(1)" : undefined }}
    />
  );
}

export function TrustedLockNotes({
  brands,
  runwaySteps = RUNWAY_STEPS,
}: {
  brands: LogoCloudItem[];
  /** Must match the runway's, or notes land before or after their logos. */
  runwaySteps?: number;
}) {
  const { step } = useTrustedTicker();
  const count = brands.length;
  if (count === 0) return null;

  return (
    <ul className="jp-notes jp-notes--live">
      {stackAt(step, runwaySteps).map((note) => {
        const index = ((note.launch % count) + count) % count;
        const brand = brands[index];
        const channel = channelFor(index);
        const Icon = channel === "whatsapp" ? MessageCircle : MessageSquare;
        return (
          <li
            key={note.key}
            className="jp-note jp-note--live"
            data-leaving={note.slot >= STACK_SIZE ? "" : undefined}
            style={{ ["--slot" as string]: note.slot } as React.CSSProperties}
          >
            <span className="jp-note__avatar">
              <LogoMark logo={brand} className="jp-note__logo" sizes="48px" />
              <span className={`jp-note__badge jp-note__badge--${channel}`}>
                <Icon />
              </span>
            </span>
            <span className="jp-note__text">
              <span className="jp-note__app">
                {channel === "whatsapp" ? "WhatsApp" : "Messages"} <time>now</time>
              </span>
              <b>{brand.alt}</b>
              <span className="jp-note__lines">
                <i />
                <i />
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
