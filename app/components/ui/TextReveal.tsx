"use client";

import * as React from "react";

/**
 * Text that rises into place a character at a time.
 *
 * Adapted from the 21st.dev "text reveal" component. Three departures from the
 * source, all of them because of where it is used:
 *
 *   - no `styled-jsx`. This project keeps its CSS in `app/styles` and imports
 *     it once from `index.css`; the styles are in `text-reveal.css`.
 *   - no replay button and no internal state. The original remounts itself
 *     through a `key` to replay; here the thing that decides when to play is
 *     the scroll — see `play` below.
 *   - split by WORD first, then by character. The source splits the whole
 *     string, which puts every character on its own inline-block and lets a
 *     line break fall inside a word. This heading wraps to two lines.
 *
 * The characters are `aria-hidden` and the accessible name comes from the
 * element's own `aria-label`, so this is one string to a screen reader rather
 * than a letter at a time.
 */
export function TextReveal({
  text,
  /**
   * Whether the reveal has been triggered.
   *
   * Not a mount-time animation: this is used inside the hero's pinned stage,
   * where the copy is in the viewport from the first frame and simply
   * invisible, so anything that plays on mount has finished long before the
   * reader sees it.
   *
   * Optional, and left out where an ANCESTOR is the thing that knows: the CSS
   * keys off `[data-reveal="in"]` anywhere above the characters, so on the
   * hero's pin the copy layer carries it (see `HeroAside`) and the reveal
   * plays with the block it belongs to rather than needing the scroll
   * progress threaded down to this component.
   */
  play,
  className,
  as: Tag = "span",
  /** Seconds between one character and the next. */
  stagger = 0.012,
}: {
  text: string;
  play?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  stagger?: number;
}) {
  // Kept with the spaces so they can be rendered as real gaps between the
  // word boxes; splitting on /\s+/ and re-joining loses a double space and
  // any non-breaking space the copy deliberately contains.
  const words = React.useMemo(() => text.split(/(\s+)/), [text]);

  let index = 0;

  return (
    <Tag
      /* `reveal-text` is the hook the stylesheet needs on the element itself:
         a split heading must stop painting its own text, or a gradient one
         paints a broken copy of the whole string behind the characters. */
      className={className ? `reveal-text ${className}` : "reveal-text"}
      aria-label={text}
      data-reveal={play === undefined ? undefined : play ? "in" : "out"}
    >
      {words.map((word, w) => {
        if (/^\s+$/.test(word)) {
          return (
            <span key={`s${w}`} aria-hidden="true">
              {word}
            </span>
          );
        }
        return (
          <span key={`w${w}`} className="reveal-word" aria-hidden="true">
            {Array.from(word).map((char, c) => (
              <span
                key={c}
                className="reveal-char"
                style={{ "--reveal-delay": `${(index++ * stagger).toFixed(3)}s` } as React.CSSProperties}
              >
                {char}
              </span>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}
