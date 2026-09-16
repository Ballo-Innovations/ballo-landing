"use client";

import * as React from "react";
import Image, { type StaticImageData } from "next/image";

import iconCloud from "@/public/Assets/glass-icon-cloud.png";
import iconEmail from "@/public/Assets/glass-icon-email.png";
import iconMessages from "@/public/Assets/glass-icon-messeges.png";
import iconShield from "@/public/Assets/glass-icon-shield.png";

/**
 * The glass marks drifting in the closing CTA's right-hand column.
 *
 * They stand where the "Want a feel of BalloAds?" phone used to, over the
 * tubes, and they answer the copy beside them: "reach every customer" names no
 * channels on its own.
 *
 * The glass is the artwork, not CSS. An earlier version built each tile out of
 * the header's recipe — a translucent tint under a `backdrop-filter` — which
 * works, but this art carries its own refraction and dispersion, and painting
 * a second pane behind it would only mute it. So the tiles have no background,
 * no border and no blur; they are the image and a shadow to seat it.
 *
 * They sit BEHIND the strands and are lit by them: dark glass on a dark page
 * until the light comes near, then the glass takes it. The light's position is
 * the pointer's — the strands converge on it, so it is where they are, and
 * reading it costs one event listener instead of a per-frame hand-off out of
 * the WebGL scene.
 *
 * The drift animates on no timer and in no JS: each tile is one infinite CSS
 * transform, and `.cta-mq` carries `useAnimateWhenVisible`, so the set parks
 * with `animation-play-state` the moment the section scrolls away.
 */

type FloatingIcon = {
  src: StaticImageData;
  /** Read out as part of the group's label; never rendered as text. */
  name: string;
  /** Rendered width; height follows the art's own aspect. */
  size: number;
  /**
   * Which side of the strands this one sits on. All four stand in front of
   * them today; `"behind"` is kept because it is a one-word edit per mark and
   * the arrangement has changed more than once. A mark set to it is lit
   * through the strands instead of occluding them.
   */
  depth: "behind" | "front";
  /** Seconds. Deliberately uneven so the set never falls into lockstep. */
  duration: number;
  delay: number;
  drift: string;
};

/**
 * Where a mark can stand, as the centre of its box within the field.
 *
 * Deliberately irregular and deliberately more slots than marks: an even grid
 * reads as a layout, and picking four of six means the arrangement differs
 * between loads rather than only the pairing within a fixed set.
 */
const SLOTS: Array<{ top: string; left: string }> = [
  { top: "16%", left: "26%" },
  { top: "30%", left: "74%" },
  { top: "50%", left: "18%" },
  { top: "58%", left: "70%" },
  { top: "80%", left: "38%" },
  { top: "86%", left: "80%" },
];

const ICONS: FloatingIcon[] = [
  { src: iconMessages, name: "messaging", depth: "front", size: 132, duration: 13, delay: 0, drift: "34px" },
  { src: iconEmail, name: "email", depth: "front", size: 112, duration: 17, delay: -4.5, drift: "-27px" },
  { src: iconCloud, name: "cloud delivery", depth: "front", size: 120, duration: 15, delay: -9, drift: "38px" },
  { src: iconShield, name: "security", depth: "front", size: 96, duration: 11, delay: -2, drift: "-30px" },
];

/*
 * glass-icon-shield.png arrived without an alpha channel — exported with the
 * editor's transparency checkerboard flattened into the pixels, so it rendered
 * as a grey chequered box. The file in this repo has had that background keyed
 * out: the checker is neutral and bright (234 and 254, R=G=B) while the art is
 * saturated or dark, so a flood fill inward from the frame removes it without
 * touching the shield's own white highlights, which are enclosed by it. If the
 * piece is ever re-exported from source with real transparency, that file is
 * better than this recovery and should simply replace it.
 */

/**
 * How far the light carries, as a fraction of the layer's diagonal.
 *
 * Generous on purpose. The strands converge ON the pointer, so a mark at the
 * pointer is the one they are covering — if only that mark lit, the light
 * would reveal exactly what it hides. A wide reach with a gentle falloff lights
 * the marks the strands are passing NEAR, which is what reads as a light
 * sweeping through them.
 */
const LIGHT_REACH = 0.95;

export function FloatingGlassIcons() {
  const fieldRef = React.useRef<HTMLDivElement>(null);

  /**
   * Which slot each mark stands in.
   *
   * Starts as the first four in order, because that is what the server
   * renders and the first client render has to match it; the shuffle happens
   * after mount. Same reason the `whoStackSpread` flag is read in an effect
   * rather than during render.
   */
  const [slots, setSlots] = React.useState(() => ICONS.map((_, i) => i));
  React.useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const box = field.getBoundingClientRect();
    if (!box.width || !box.height) return;

    /**
     * Whether a pick keeps the marks off each other.
     *
     * Needed because the float is wide enough that neighbouring slots collide:
     * a shuffle without this produced an overlapping pair roughly one load in
     * four. Measured against the field's real size rather than guessed in
     * percentages, since the two axes are not the same length. The 0.8 is
     * because the artwork does not fill its box — each piece has transparent
     * margin — so boxes may kiss without the glass appearing to touch.
     */
    /**
     * The worst clearance in a pick: how much room the tightest pair has,
     * beyond what they need at the extremes of their drift. Negative means
     * they can touch.
     *
     * Full half-widths, no fudge factor. An earlier version allowed a fifth of
     * that on the grounds that the artwork does not fill its box, and marks
     * duly overlapped on about one load in three.
     */
    const clearance = (pick: number[]) => {
      let worst = Infinity;
      for (let i = 0; i < pick.length; i++) {
        for (let j = i + 1; j < pick.length; j++) {
          const a = SLOTS[pick[i]];
          const b = SLOTS[pick[j]];
          const dx = ((parseFloat(a.left) - parseFloat(b.left)) / 100) * box.width;
          const dy = ((parseFloat(a.top) - parseFloat(b.top)) / 100) * box.height;
          const needed =
            (ICONS[i].size + ICONS[j].size) / 2 +
            Math.abs(parseFloat(ICONS[i].drift)) +
            Math.abs(parseFloat(ICONS[j].drift));
          worst = Math.min(worst, Math.hypot(dx, dy) - needed);
        }
      }
      return worst;
    };

    const shuffled = () => {
      const pool = SLOTS.map((_, i) => i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, ICONS.length);
    };

    // Bounded, and it keeps the genuinely roomiest candidate if none clears
    // outright — scored by that same worst-pair clearance, so a slot list that
    // cannot satisfy the rule degrades to its least bad arrangement rather
    // than looping, throwing, or picking one by a number that means nothing.
    let best = shuffled();
    let bestClearance = clearance(best);
    for (let attempt = 0; attempt < 60 && bestClearance < 0; attempt++) {
      const pick = shuffled();
      const room = clearance(pick);
      if (room > bestClearance) {
        bestClearance = room;
        best = pick;
      }
    }
    setSlots(best);
  }, []);

  // The pointer handler is installed once but has to read wherever the marks
  // ended up, so it reads this rather than closing over the initial order.
  const slotsRef = React.useRef(slots);
  slotsRef.current = slots;

  React.useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const tiles = Array.from(
      field.querySelectorAll<HTMLElement>(".floating-glass__tile")
    );

    const light = (event: PointerEvent) => {
      // One rect read for the whole set, not one per tile: each tile's centre
      // is already known as a percentage of this box, so the rest is
      // arithmetic. Reading four rects per pointer event would interleave
      // layout reads with the style writes below.
      const box = field.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const px = event.clientX - box.left;
      const py = event.clientY - box.top;
      const reach = Math.hypot(box.width, box.height) * LIGHT_REACH;

      tiles.forEach((tile, i) => {
        const { top, left } = SLOTS[slotsRef.current[i]];
        const cx = (parseFloat(left) / 100) * box.width;
        const cy = (parseFloat(top) / 100) * box.height;
        // Linear, and deliberately not eased. Squaring it — the first attempt
        // — made the falloff so sharp that only the mark directly under the
        // strands ever lit, which is the one they are covering.
        const lit = Math.max(0, 1 - Math.hypot(px - cx, py - cy) / reach);
        tile.style.setProperty("--fg-lit", lit.toFixed(3));
      });
    };

    const douse = () => tiles.forEach((t) => t.style.setProperty("--fg-lit", "0"));

    window.addEventListener("pointermove", light, { passive: true });
    // The pointer can leave through the top of the page or into devtools, where
    // no `pointerleave` arrives on any element we own.
    document.addEventListener("pointerleave", douse);
    window.addEventListener("blur", douse);
    return () => {
      window.removeEventListener("pointermove", light);
      document.removeEventListener("pointerleave", douse);
      window.removeEventListener("blur", douse);
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      className="floating-glass"
      role="img"
      aria-label={`BalloAds: ${ICONS.map((i) => i.name).join(", ")}`}
    >
      {ICONS.map(({ src, name, depth, size, duration, delay, drift }, i) => (
        <span
          key={name}
          className={`floating-glass__tile floating-glass__tile--${depth}`}
          style={
            {
              "--fg-top": SLOTS[slots[i]].top,
              "--fg-left": SLOTS[slots[i]].left,
              "--fg-size": `${size}px`,
              "--fg-duration": `${duration}s`,
              "--fg-delay": `${delay}s`,
              "--fg-drift": drift,
            } as React.CSSProperties
          }
        >
          {/* The source art is ~1300px wide for a tile rendered at ~130. The
              explicit `sizes` is what stops next/image serving the full-size
              file: without it these are four 1.4 MB PNGs at the foot of the
              page. Lazy for the same reason — this is the last section. */}
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            sizes="160px"
            loading="lazy"
            className="floating-glass__art"
          />
        </span>
      ))}
    </div>
  );
}
