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
