"use client";

import * as React from "react";
import Image from "next/image";

import {
  RUNWAY_STEPS,
  STACK_SIZE,
  channelFor,
  lockScreenClock,
  previewFor,
  stackAt,
  trustedTicker,
  type Channel,
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

/**
 * The lock screen's clock in Lusaka, refreshed every 20 seconds. `null` until
 * mounted (and when off), so the server and the first client render agree on
 * the fixed 09:41 the lock screen shows without it.
 */
export function useLockScreenClock(on: boolean) {
  const [clock, setClock] = React.useState<{ time: string; date: string } | null>(null);
  React.useEffect(() => {
    if (!on) return;
    const tick = () => setClock(lockScreenClock(new Date()));
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [on]);
  return on ? clock : null;
}

const APP_NAME: Record<Channel, string> = {
  sms: "Messages",
  whatsapp: "WhatsApp",
  email: "Gmail",
};

/**
 * The app the message came through, as its own icon on the corner of the
 * sender's avatar, the way a phone shows a message from a person or business:
 * Messages for SMS, WhatsApp, and Gmail for email. Drawn inline (no image
 * requests), simplified from the real icons.
 */
function AppIcon({ channel }: { channel: Channel }) {
  if (channel === "whatsapp") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="16" fill="#25D366" />
        <path
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinejoin="round"
          d="M16 7.2a8.8 8.8 0 0 0-7.6 13.2L7.2 24.8l4.5-1.2A8.8 8.8 0 1 0 16 7.2z"
        />
        <path
          fill="#fff"
          d="M12.8 12c.3-.6.6-.6.9-.6h.6c.2 0 .5 0 .7.6l.8 2c.1.2.1.4 0 .6l-.6.8c-.2.2-.2.4 0 .7.9 1.4 2 2.4 3.4 3.1.3.1.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l2 1c.3.1.4.3.4.5 0 .6-.3 1.5-1.4 2-1 .5-2.2.4-4.3-.5-2.5-1.2-4.2-3.7-4.4-3.9-.1-.2-1.1-1.5-1.1-2.8s.7-1.9 1-2.2z"
        />
      </svg>
    );
  }
  if (channel === "email") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#fff" />
        <g transform="translate(5 8.5) scale(0.458)">
          <path fill="#4285F4" d="M3 36h8V16.6L0 8.4V33a3 3 0 0 0 3 3z" />
          <path fill="#34A853" d="M37 36h8a3 3 0 0 0 3-3V8.4l-11 8.2z" />
          <path fill="#FBBC04" d="M37 2.4v14.2l11-8.2V4c0-3.7-4.2-5.8-7.2-3.6z" />
          <path fill="#EA4335" d="M11 16.6V2.4l13 9.7 13-9.7v14.2L24 26.3z" />
          <path fill="#C5221F" d="M0 4v4.4l11 8.2V2.4L7.2-.4C4.2-2.6 0-.5 0 4z" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#34C759" />
      <path
        fill="#fff"
        d="M16 8c-5.5 0-10 3.6-10 8 0 2.5 1.4 4.7 3.6 6.1-.2 1.3-.8 2.5-1.8 3.4 2 0 3.8-.7 5.1-1.8 1 .2 2 .3 3.1.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z"
      />
    </svg>
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
        return (
          <li
            key={note.key}
            className="jp-note jp-note--live"
            data-leaving={note.slot >= STACK_SIZE ? "" : undefined}
            style={{ ["--slot" as string]: note.slot } as React.CSSProperties}
          >
            <span className="jp-note__avatar">
              <LogoMark logo={brand} className="jp-note__logo" sizes="48px" />
              <span className="jp-note__badge">
                <AppIcon channel={channel} />
              </span>
            </span>
            <span className="jp-note__text">
              <span className="jp-note__app">
                {APP_NAME[channel]} <time>now</time>
              </span>
              <b>{brand.alt}</b>
              {/* Blurred like a hidden preview; see `previewFor`. */}
              <span className="jp-note__preview">{previewFor(note.launch)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
