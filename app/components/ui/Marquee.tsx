"use client";

import * as React from "react";

/**
 * A horizontal marquee: content duplicated once and translated by -50%.
 *
 * `duration` is the time for one full loop. `reverse` runs it the other way.
 * `pauseOnHover` holds it still while the pointer is inside, which is what
 * makes a row of labelled tiles readable rather than something that merely
 * goes past. The animation is transform-only and is expected to sit under an
 * element that useAnimateWhenVisible parks off-screen. Styles: `.mq` in
 * home.css.
 */
export function Marquee({
  children,
  reverse = false,
  duration = 30,
  pauseOnHover = false,
  className = "",
}: {
  children: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  pauseOnHover?: boolean;
  className?: string;
}) {
  return (
    <div className={`mq${pauseOnHover ? " mq--pause" : ""} ${className}`.trim()}>
      <div
        className={`mq__track${reverse ? " mq__track--rev" : ""}`}
        style={{ ["--mq-dur" as string]: `${duration}s` } as React.CSSProperties}
      >
        <div className="mq__group">{children}</div>
        <div className="mq__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
