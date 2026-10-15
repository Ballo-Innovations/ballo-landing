"use client";

import * as React from "react";
import Image from "next/image";
import type { HomeLogoItem } from "@/app/HomeClient";

/**
 * "Backed by": one static pill per partner, mark and name together.
 *
 * It used to be a glass band of logo cells where hovering a cell swapped the
 * mark for a drawn-on name and role. The names now sit on the pills, so every
 * partner is named at once without a pointer, which also covers touch. Each
 * pill also prints the partner's role under its name. See ADR 0002.
 */

/**
 * A mark drawn in white (ZICTA's only file is `zicta-white.png`) would vanish
 * on the pill's white disc, so it gets a dark one. Known by its file name —
 * the only signal there is without decoding the image.
 */
/**
 * Each partner's own colour for its pill, with the mark knocked out to one
 * colour on top of it — the way these brands present themselves on a solid
 * ground. `ink` is the text and mark colour: dark on MTN's yellow, white on the
 * rest. A partner not listed here (a new CMS row) keeps the blue glass pill
 * with its mark on a disc.
 */
const BRAND_PILLS: Record<string, { bg: string; ink: "light" | "dark" }> = {
  airtel: { bg: "#e40000", ink: "light" },
  mtn: { bg: "#ffcb05", ink: "dark" },
  meta: { bg: "#0866ff", ink: "light" },
  zicta: { bg: "#0b2a6f", ink: "light" },
};

function brandFor(name: string) {
  return BRAND_PILLS[name.trim().toLowerCase()];
}

function isLightMark(src: HomeLogoItem["src"]): boolean {
  const url = typeof src === "string" ? src : src?.src ?? "";
  return /white/i.test(url);
}

export function BackedBy({
  logos,
  eyebrow = "Backed by",
}: {
  logos: HomeLogoItem[];
  eyebrow?: string;
}) {
  if (logos.length === 0) return null;

  return (
    <div className="backers">
      <div className="backers__label">
        <p className="backers__eyebrow">{eyebrow}</p>
      </div>

      {/* Static pills in the feature chips' style (ADR 0002): one per partner,
          mark and name together, so nothing has to be hovered to say who a
          mark is. The role stays in the document for screen readers and as a
          tooltip. */}
      <ul className="backers__pills">
        {logos.map((logo, i) => {
          const brand = brandFor(logo.alt);
          return (
          <li
            key={`${logo.alt}-${i}`}
            className={brand ? "backers__pill backers__pill--brand" : "cta-chip backers__pill"}
            data-ink={brand?.ink}
            style={
              {
                ["--i" as string]: i,
                ...(brand ? { ["--pill-bg" as string]: brand.bg } : {}),
              } as React.CSSProperties
            }
          >
            {logo.src ? (
              <span
                className="backers__pill-mark"
                data-light={isLightMark(logo.src) ? "" : undefined}
                aria-hidden="true"
              >
                <Image
                  src={logo.src}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  sizes="32px"
                  className="max-h-full w-auto max-w-full object-contain"
                />
              </span>
            ) : null}
            <span className="backers__pill-text">
              <span className="backers__pill-name">{logo.alt}</span>
              {logo.role ? (
                <span className="backers__pill-role">
                  <span className="sr-only"> — </span>
                  {logo.role}
                </span>
              ) : null}
            </span>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
