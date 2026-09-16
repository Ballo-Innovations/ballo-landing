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
  /** Placement of the tile's CENTRE within the column. */
  top: string;
  left: string;
  /** Rendered width; height follows the art's own aspect. */
  size: number;
  /** Seconds. Deliberately uneven so the set never falls into lockstep. */
  duration: number;
  delay: number;
  drift: string;
};

const ICONS: FloatingIcon[] = [
  { src: iconMessages, name: "messaging", top: "20%", left: "30%", size: 132, duration: 11, delay: 0, drift: "16px" },
  { src: iconEmail, name: "email", top: "44%", left: "72%", size: 112, duration: 13, delay: -3.5, drift: "-13px" },
  { src: iconCloud, name: "cloud delivery", top: "70%", left: "32%", size: 120, duration: 15, delay: -7, drift: "19px" },
  { src: iconShield, name: "security", top: "88%", left: "70%", size: 96, duration: 12, delay: -1.5, drift: "-15px" },
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
        const { top, left } = ICONS[i];
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
      {ICONS.map(({ src, name, top, left, size, duration, delay, drift }) => (
        <span
          key={name}
          className="floating-glass__tile"
          style={
            {
              "--fg-top": top,
              "--fg-left": left,
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
