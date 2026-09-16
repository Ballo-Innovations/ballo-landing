"use client";

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
 * Nothing animates on a timer or in JS: each tile is one infinite CSS
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

export function FloatingGlassIcons() {
  return (
    <div
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
