"use client";

import Image from "next/image";

import type { HomeLogoItem } from "@/app/HomeClient";

/**
 * "Backed by" as one line (ADR 0018, behind `trustedLockScreen`): the label,
 * the networks' marks, a hairline, then the regulator. Flat, in place of the
 * taped cards.
 *
 * Partners whose role mentions a regulator go after the hairline, so the
 * networks and the regulator read as two groups. The roles come from the CMS
 * row, or the fallback map in app/page.tsx. The label was "Delivered over"
 * at first; George chose "Backed by" (2026-11-17).
 */

const isRegulator = (logo: HomeLogoItem) => /regulat/i.test(logo.role ?? "");

function Mark({ logo }: { logo: HomeLogoItem }) {
  if (!logo.src) {
    return <span className="delivered-over__word">{logo.alt}</span>;
  }
  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={224}
      height={112}
      sizes="130px"
      className="delivered-over__logo"
    />
  );
}

export function DeliveredOver({
  logos,
  label = "Backed by",
}: {
  logos: HomeLogoItem[];
  label?: string;
}) {
  if (logos.length === 0) return null;
  const networks = logos.filter((logo) => !isRegulator(logo));
  const regulators = logos.filter(isRegulator);

  return (
    <div className="delivered-over">
      <p className="delivered-over__label">{label}</p>
      <ul className="delivered-over__marks">
        {networks.map((logo, i) => (
          <li key={`${logo.alt}-${i}`} className="delivered-over__item">
            <Mark logo={logo} />
          </li>
        ))}
        {regulators.map((logo, i) => (
          <li
            key={`${logo.alt}-${i}`}
            className="delivered-over__item delivered-over__item--regulator"
            data-first={i === 0 && networks.length > 0 ? "" : undefined}
          >
            <Mark logo={logo} />
            {logo.role ? <span className="sr-only">, {logo.role}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
