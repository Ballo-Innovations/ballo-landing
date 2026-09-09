"use client";

import * as React from "react";

/**
 * The 21st.dev CTA's scrambling button: the label shuffles through random
 * characters and resolves back to itself, left to right, on hover.
 *
 * Four things are handled here that upstream's version does not, and the first
 * two are bugs rather than preferences:
 *
 *   - the interval is cleaned up. Upstream starts a 30ms `setInterval` and
 *     only clears it from inside its own callback, so unmounting mid-scramble
 *     leaks the timer and sets state on a dead component;
 *   - the re-entry guard is a ref, not state. `isScrambling` is read from the
 *     closure the handler was created in, so two hovers in quick succession
 *     could both pass the check and run two intervals over one label;
 *   - the accessible name stays put. The scrambling text is `aria-hidden` and
 *     the real label lives on the button, so a screen reader is never asked
 *     to read `x7#Qm` aloud;
 *   - it does nothing under `prefers-reduced-motion`.
 *
 * Spaces are preserved rather than scrambled, so the label keeps its word
 * shapes instead of collapsing into one run of noise. The face is the mono
 * family: every glyph is the same width, so a resolving label cannot change
 * the button's width from frame to frame.
 */

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

/** Upstream's cadence: a 30ms tick advancing a third of a character each time. */
const TICK_MS = 30;
const CHARS_PER_TICK = 1 / 3;

export function ScrambleButton({
  text,
  onClick,
  className = "",
}: {
  text: string;
  onClick?: () => void;
  className?: string;
}) {
  const [display, setDisplay] = React.useState(text);
  const runningRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = React.useCallback(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = null;
    runningRef.current = false;
  }, []);

  React.useEffect(() => stop, [stop]);

  // A prop change while a scramble is in flight would otherwise resolve to the
  // old string.
  React.useEffect(() => {
    stop();
    setDisplay(text);
  }, [text, stop]);

  const scramble = React.useCallback(() => {
    if (runningRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    runningRef.current = true;

    let revealed = 0;
    timerRef.current = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (i < revealed) return text[i];
            // Spaces stay spaces; scrambling them turns the label into one
            // long word and loses its shape.
            if (ch === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );

      if (revealed >= text.length) {
        stop();
        setDisplay(text);
      }
      revealed += CHARS_PER_TICK;
    }, TICK_MS);
  }, [text, stop]);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={scramble}
      // Keyboard users get it too, rather than it being pointer-only.
      onFocus={scramble}
      className={`scramble-btn ${className}`.trim()}
    >
      {/* The real label, for the accessibility tree and for nothing else. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </button>
  );
}
