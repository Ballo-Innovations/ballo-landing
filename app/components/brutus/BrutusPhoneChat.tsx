"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

import phoneFrame from "@/public/Assets/phone-frame.png";
import { BRUTUS_CHAT } from "./content";

/**
 * The phone showing a Brutus conversation.
 *
 * Shared by the /brutus page and the home page's Brutus section. Styles live
 * in styles/pages/brutus.css (`.brutus-phone*`, `.brutus-chat*`), which is
 * loaded globally through styles/index.css.
 *
 * `animated` staggers the bubbles in as the phone scrolls into view, driven by
 * `data-fur` from a surrounding FadeUpReveal — pure CSS, no timers.
 */
export function BrutusPhoneChat({
  animated = false,
  onCta,
  priority = false,
}: {
  animated?: boolean;
  onCta?: () => void;
  priority?: boolean;
}) {
  return (
    <div className={`brutus-phone${animated ? " brutus-phone--animated" : ""}`}>
      <Image
        src={phoneFrame}
        alt=""
        aria-hidden="true"
        className="brutus-phone__frame"
        sizes="18rem"
        priority={priority}
      />
      <div className="brutus-phone__screen">
        {BRUTUS_CHAT.map((m, i) => (
          <div
            key={i}
            className={`brutus-chat brutus-chat--${m.from === "brutus" ? "in" : "out"}`}
            style={{ ["--i" as string]: i } as React.CSSProperties}
          >
            {m.from === "brutus" ? (
              <span className="brutus-chat__avatar">
                <Sparkles size={12} aria-hidden="true" />
              </span>
            ) : null}
            <p>{m.text}</p>
          </div>
        ))}
        <button type="button" className="brutus-phone__cta" onClick={onCta}>
          TRY IT NOW
        </button>
      </div>
    </div>
  );
}
