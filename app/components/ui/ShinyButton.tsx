"use client";

import * as React from "react";
import Link from "next/link";

/**
 * The 21st.dev "shiny button", in CSS.
 *
 * A rotating conic highlight runs around the rim and a sheen sweeps across the
 * face. Both are transform/opacity animations on their own layers — nothing
 * here paints per frame — and they park with the rest of the section under
 * `[data-anim="paused"]` (see useAnimateWhenVisible). Styles: `.shiny-btn` in
 * styles/components/buttons.css.
 *
 * Renders a Link when given `href`, a button otherwise, so the CTA rows can
 * mix the two without two components.
 */
type Common = {
  children: React.ReactNode;
  className?: string;
};

type Props =
  | (Common & { href: string; onClick?: never })
  | (Common & { href?: undefined; onClick?: () => void });

export function ShinyButton({ children, className = "", ...rest }: Props) {
  const cls = `shiny-btn ${className}`.trim();
  const inner = (
    <>
      <span className="shiny-btn__ring" aria-hidden="true" />
      <span className="shiny-btn__face" aria-hidden="true" />
      <span className="shiny-btn__sheen" aria-hidden="true" />
      <span className="shiny-btn__label">{children}</span>
    </>
  );

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={rest.onClick} className={cls}>
      {inner}
    </button>
  );
}
