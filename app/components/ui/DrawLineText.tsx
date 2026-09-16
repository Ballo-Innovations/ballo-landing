"use client";

import * as React from "react";

/**
 * Text that draws itself on, letter by letter, and then fills in.
 *
 * The 21st.dev "draw line text" effect, rebuilt on this project's terms. The
 * original runs on GSAP and, at mount, reads `getBoundingClientRect()` and
 * `getComputedTextLength()` for every character in order to place each one at
 * an `x` it computed itself, then writes the measured box into React state.
 *
 * Neither half of that is affordable here. This renders inside a hover
 * caption, so it mounts and unmounts every time a pointer crosses a cell — a
 * forced layout per letter, per hover — and GSAP would be a ~70 KB runtime on
 * the home page for one transition. The repo's rule for 21st.dev components is
 * to keep the effect and drop the runtime.
 *
 * So there is no measuring at all:
 *
 * - **Layout** is the browser's. One `<text>` with a `<tspan>` per character,
 *   rather than N absolutely positioned `<text>` elements, which means kerning
 *   and letter-spacing come out right for free.
 * - **The dash length** is a multiple of the font size (`--draw-len` in the
 *   stylesheet), not `getComputedTextLength()`. A glyph's outline scales with
 *   its type size, so one multiple covers every letter; the original's own
 *   `* 8` fudge factor says the exact number was never load-bearing either.
 * - **Sizing** is `text-anchor: middle` at `x="50%"` against a box the CSS
 *   sizes in `em`. The caption is centred in its cell, so nothing needs to
 *   know how wide the string came out.
 *
 * The animation itself is two CSS transitions per letter — `stroke-dashoffset`
 * to draw, `fill-opacity` to fill — staggered by `--i`. See
 * `styles/components/draw-line-text.css`.
 */
export function DrawLineText({
  text,
  className,
  title,
  delay,
}: {
  text: string;
  className?: string;
  /** Accessible name. The glyphs are `aria-hidden`; this is what is read. */
  title?: string;
  /**
   * How long before the first letter starts, as a CSS time. Added ahead of
   * every letter's own stagger, so a caller can hold the whole string back
   * without the letters bunching up.
   */
  delay?: string;
}) {
  /**
   * A transition needs two states, and a component that mounts already in its
   * end state has only one. So the letters mount undrawn and `data-draw` flips
   * on the next frame.
   *
   * Two frames, not one: a single `requestAnimationFrame` can land in the same
   * frame the element is first painted in, and the change is then coalesced
   * into the initial style — no transition, the text simply appears.
   */
  const [drawn, setDrawn] = React.useState(false);

  React.useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setDrawn(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  const chars = React.useMemo(() => Array.from(text), [text]);

  return (
    <svg
      className={["draw-text", className].filter(Boolean).join(" ")}
      data-draw={drawn ? "in" : "out"}
      style={delay ? ({ ["--draw-begin"]: delay } as React.CSSProperties) : undefined}
      role="img"
      aria-label={title ?? text}
    >
      {/* `xmlSpace="preserve"` keeps the spaces between words: SVG collapses
          runs of whitespace by default, and every space here is its own tspan,
          so without this a two-word caption closes up into one. */}
      <text
        className="draw-text__text"
        x="50%"
        y="0.82em"
        textAnchor="middle"
        xmlSpace="preserve"
        aria-hidden="true"
      >
        {chars.map((char, i) => (
          <tspan
            key={i}
            className="draw-text__char"
            style={{ ["--i" as string]: i } as React.CSSProperties}
          >
            {char}
          </tspan>
        ))}
      </text>
    </svg>
  );
}
