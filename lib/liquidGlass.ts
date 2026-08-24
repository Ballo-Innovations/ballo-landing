/**
 * Liquid Glass — SVG displacement-map generator.
 *
 * Port of nikdelvin/liquid-glass (`src/utils/liquidGlass.ts`, MIT). Kept
 * faithful to the original so values dialled in on that project's docs
 * transfer here unchanged.
 *
 * How it works, because the map is the whole trick: the image is neutral grey
 * (#808080 = zero displacement) everywhere except a `depth`-wide rim. An X and
 * a Y gradient are screened over a #000080 base, then a rounded rect inset by
 * `depth` and blurred by `depth` is painted back in neutral — so the middle of
 * the element refracts nothing and only the border bends the backdrop. That is
 * what reads as a lens rather than as frosted noise.
 *
 * Chromatic aberration is three displacement passes at slightly different
 * scales, each reduced to one channel and screened back together.
 *
 * The resulting filter is consumed from CSS as
 *   backdrop-filter: blur(b/2) url("<returned>") blur(b) brightness(x) saturate(y)
 * Chromium honours a `url()` inside `backdrop-filter` when it points at an
 * external (data:) SVG; a same-document `#id` reference is what it ignores.
 */

export type DisplacementOptions = {
  height: number;
  width: number;
  radius: number;
  depth: number;
  strength?: number;
  chromaticAberration?: number;
  /**
   * Suppress the rim on one or more edges by extending the neutral rect past
   * them. Use this when the element is masked on that side — a rim on a masked
   * edge refracts the boundary itself and reads as a hard seam.
   */
  openEdges?: Array<"top" | "bottom" | "left" | "right">;
};

type MapOptions = Omit<DisplacementOptions, "chromaticAberration" | "strength">;

export const getDisplacementMap = ({
  height,
  width,
  radius,
  depth,
  openEdges = [],
}: MapOptions) => {
  // How far to push the neutral rect past an edge so no rim is generated there.
  const over = (radius + depth) * 2;
  const x = openEdges.includes("left") ? -over : depth;
  const y = openEdges.includes("top") ? -over : depth;
  const right = openEdges.includes("right") ? width + over : width - depth;
  const bottom = openEdges.includes("bottom") ? height + over : height - depth;

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>.mix { mix-blend-mode: screen; }</style>
    <defs>
        <linearGradient id="Y" x1="0" x2="0" y1="${Math.ceil((radius / height) * 15)}%" y2="${Math.floor(100 - (radius / height) * 15)}%">
            <stop offset="0%" stop-color="#0F0" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
        <linearGradient id="X" x1="${Math.ceil((radius / width) * 15)}%" x2="${Math.floor(100 - (radius / width) * 15)}%" y1="0" y2="0">
            <stop offset="0%" stop-color="#F00" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
    </defs>
    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g filter="blur(2px)">
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
      <rect x="${x}" y="${y}" height="${bottom - y}" width="${right - x}" fill="#808080" rx="${radius}" ry="${radius}" filter="blur(${depth}px)" />
    </g>
</svg>`)
  );
};

export const getDisplacementFilter = ({
  height,
  width,
  radius,
  depth,
  strength = 100,
  chromaticAberration = 0,
  openEdges = [],
}: DisplacementOptions) => {
  const map = getDisplacementMap({ height, width, radius, depth, openEdges });

  // One pass when there is no aberration to split: three feDisplacementMaps on
  // a live backdrop is roughly 3x the per-frame cost, which matters as soon as
  // several of these share a page (or sit on a scroll-driven animation).
  const passes =
    chromaticAberration > 0
      ? `<feDisplacementMap transform-origin="center" in="SourceGraphic" in2="displacementMap" scale="${strength + chromaticAberration * 2}" xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedR" />
        <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${strength + chromaticAberration}" xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedG" />
        <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${strength}" xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="displacedB" />
        <feBlend in="displacedR" in2="displacedG" mode="screen" />
        <feBlend in2="displacedB" mode="screen" />`
      : `<feDisplacementMap transform-origin="center" in="SourceGraphic" in2="displacementMap" scale="${strength}" xChannelSelector="R" yChannelSelector="G" />`;

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="displace" color-interpolation-filters="sRGB">
            <feImage x="0" y="0" height="${height}" width="${width}" href="${map}" result="displacementMap" />
            ${passes}
        </filter>
    </defs>
</svg>`) +
    "#displace"
  );
};

export type GlassParams = {
  depth: number;
  strength: number;
  chromaticAberration: number;
  blur: number;
  brightness: number;
  saturate: number;
};

/** The backdrop-filter chain the upstream component applies, verbatim in order. */
export const getBackdropFilter = (
  { depth, strength, chromaticAberration, blur, brightness, saturate }: GlassParams,
  box: { width: number; height: number; radius: number },
  openEdges?: DisplacementOptions["openEdges"]
) =>
  `blur(${blur / 2}px) url("${getDisplacementFilter({
    width: Math.max(1, Math.round(box.width)),
    height: Math.max(1, Math.round(box.height)),
    radius: box.radius,
    depth,
    strength,
    chromaticAberration,
    openEdges,
  })}") blur(${blur}px) brightness(${brightness}) saturate(${saturate})`;

/** Chromium/Safari honour url() in backdrop-filter; Firefox does not. */
export const supportsBackdropFilterUrl = () => {
  if (typeof document === "undefined") return false;
  const el = document.createElement("div");
  el.style.cssText = "backdrop-filter: url(#test)";
  return el.style.backdropFilter === "url(#test)" || el.style.backdropFilter === 'url("#test")';
};
