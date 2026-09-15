"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { HomeLogoItem } from "@/app/HomeClient";

/**
 * Client logos, as a static grid.
 *
 * Replaces the infinite "Trusted by" marquee, and started as the 21st.dev
 * "logo cloud swap" component, which wipes each mark behind a blur on a
 * repeating stagger. The wipe is gone at George's request: these marks are
 * there to be read, and one going soft every few seconds reads as the page
 * failing to load rather than as an effect. What is left is layout and a
 * hover lift, both CSS — nothing here animates on its own, so the section
 * needs no timer and nothing to park when it scrolls away.
 *
 * Styles: `.logo-cloud` in styles/components/logo-cloud.css.
 */

export type LogoCloudItem = HomeLogoItem & {
  /**
   * Render the mark as a white silhouette. Needed for logos supplied as dark
   * artwork (Bayport) that would otherwise disappear against this page.
   */
  invert?: boolean;
};

export type LogoCloudProps = {
  logos: LogoCloudItem[];
  title?: string;
  subtitle?: string;
  className?: string;
};

export function LogoCloud({
  logos,
  title = "Trusted by the very best",
  subtitle,
  className,
}: LogoCloudProps) {
  /**
   * Marks whose image failed to load, by name.
   *
   * A CMS row carries a URL the server cannot verify, so a dead asset would
   * otherwise put a browser's broken-image icon in the row. `src: null`
   * already means "render the name as a wordmark" — a URL that 404s is the
   * same situation discovered later, so it lands in the same place.
   */
  const [brokenLogos, setBrokenLogos] = React.useState<Set<string>>(new Set());
  const markLogoBroken = React.useCallback((alt: string) => {
    setBrokenLogos((prev) => {
      if (prev.has(alt)) return prev;
      const next = new Set(prev);
      next.add(alt);
      return next;
    });
  }, []);

  return (
    <div className={cn("logo-cloud", className)}>
      {(title || subtitle) && (
        <div className="mx-auto max-w-2xl text-center">
          {title && <p className="text-3xl text-shimmer">{title}</p>}
          {subtitle && <p className="mt-3 text-sm text-white/60">{subtitle}</p>}
        </div>
      )}

      <div className="logo-cloud__grid">
        {logos.map((logo, i) => (
          <div key={`${logo.alt}-${i}`} className="logo-cloud__item">
            <span className="logo-cloud__mark" aria-label={logo.alt}>
              {logo.src && !brokenLogos.has(logo.alt) ? (
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={128}
                  height={64}
                  loading="lazy"
                  sizes="128px"
                  onError={() => markLogoBroken(logo.alt)}
                  className="h-12 w-auto object-contain sm:h-16"
                  style={{
                    filter: logo.invert ? "brightness(0) invert(1)" : undefined,
                  }}
                />
              ) : (
                <span className="logo-cloud__wordmark text-base font-semibold tracking-wide text-white/70 sm:text-2xl">
                  {logo.alt}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LogoCloud;
