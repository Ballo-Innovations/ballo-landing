"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// --- Typewriter blank for the fill-in-the-blank hero ---

// A real text input whose placeholder is an animated typewriter cycling
// example words. The animation only runs while the field is empty and
// unfocused, so it never fights with what the user types. Adapted from the
// KokonutUI Typewriter reference, using the project's framer-motion for the
// blinking caret instead of the "motion/react" package.
export const GapTypewriter: React.FC<{
  name: string;
  words: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  startDelay?: number;
  /** Classes for the underline. The designed page passes its own. */
  lineClassName?: string;
  /** Accessible name. Falls back to the field name. */
  label?: string;
}> = ({
  name,
  words,
  value,
  onChange,
  className = '',
  startDelay = 200,
  lineClassName = 'mx-2 border-b-2 border-white/40 focus-within:border-white',
  label,
}) => {
  const [display, setDisplay] = useState('');
  const [focused, setFocused] = useState(false);
  const wordIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordsRef = useRef(words);
  wordsRef.current = words;

  // The animated placeholder is only visible while the blank is untouched.
  const showPlaceholder = value.length === 0 && !focused;

  useEffect(() => {
    if (!showPlaceholder) {
      if (timeout.current) clearTimeout(timeout.current);
      return;
    }

    const typingSpeed = 90;
    const deleteSpeed = 45;
    const holdAfterType = 1600;
    const holdAfterDelete = 350;

    // +/- variance so each keystroke feels hand-typed rather than metronomic.
    const jitter = (base: number) => base * (0.7 + Math.random() * 0.6);

    const tick = () => {
      const current = wordsRef.current[wordIndex.current] ?? '';

      if (deleting.current) {
        charIndex.current -= 1;
        setDisplay(current.slice(0, Math.max(0, charIndex.current)));
        if (charIndex.current <= 0) {
          deleting.current = false;
          wordIndex.current = (wordIndex.current + 1) % wordsRef.current.length;
          timeout.current = setTimeout(tick, holdAfterDelete);
        } else {
          timeout.current = setTimeout(tick, jitter(deleteSpeed));
        }
      } else {
        charIndex.current += 1;
        setDisplay(current.slice(0, charIndex.current));
        if (charIndex.current >= current.length) {
          deleting.current = true;
          timeout.current = setTimeout(tick, holdAfterType);
        } else {
          timeout.current = setTimeout(tick, jitter(typingSpeed));
        }
      }
    };

    timeout.current = setTimeout(tick, startDelay);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [showPlaceholder, startDelay]);

  return (
    <span
      className={`relative inline-block align-baseline ${lineClassName} ${className}`}
    >
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label ?? name}
        autoComplete="off"
        className="w-full bg-transparent px-2 text-white outline-none"
      />
      {showPlaceholder && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-2 whitespace-nowrap"
          style={{ color: '#535A8D' }}
        >
          {display}
          <motion.span
            className="ml-[2px] inline-block w-[3px] align-middle bg-[var(--cyan-bright)]"
            style={{ height: '0.9em' }}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </span>
      )}
    </span>
  );
};
