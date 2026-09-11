"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import type { DustMirror } from "./DustMirror";

/**
 * Cursor-driven particle typography, in a marquee.
 *
 * Upstream draws one line of text once, centred and still. This adds a marquee
 * mode, which is not a matter of translating the canvas: the particles have to
 * keep their own physics while the line travels, so what moves is every
 * particle's ORIGIN, and a particle that reaches the left edge is recycled to
 * the right rather than wrapped in place.
 *
 * Wrapping in place is the obvious implementation and it visibly glitches. The
 * field is periodic, so shifting it back by one tile looks identical — but only
 * for particles sitting at rest. Any particle the cursor has just thrown is
 * somewhere else, and it jumps. Recycling one particle at a time, off-screen,
 * has no such moment.
 *
 * Other departures from upstream, all forced by where this is used:
 *
 *   - The pointer can be tracked on `window` rather than on the canvas. The
 *     hero's marquee band is `pointer-events: none` — it sits behind the hero
 *     and must never eat a click — so a listener on the canvas would never fire.
 *   - The rAF loop stops when the canvas scrolls off screen, and under
 *     `prefers-reduced-motion` the line does not travel at all.
 *   - No `Math.min(fontSize, containerWidth * 0.15)` clamp. That silently
 *     shrank the type to a fraction of what the caller asked for on narrow
 *     viewports; the caller here already computes a size per breakpoint.
 */

export interface CursorDrivenParticleTypographyProps {
  className?: string;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  particleSize?: number;
  /** Sampling step in px. Higher is coarser and cheaper. */
  particleDensity?: number;
  dispersionStrength?: number;
  returnSpeed?: number;
  color?: string;
  /** Scroll the line instead of centring it. */
  marquee?: boolean;
  /**
   * Travel speed in CSS px per second.
   *
   * Deliberately a speed and not a duration-per-copy. A duration ties the rate
   * to how wide one copy happens to be, so raising the font size silently
   * speeds the line up — which is exactly what happened here when the type went
   * from 150px to 200px. Pixels per second holds still across every font size
   * and breakpoint.
   */
  marqueeSpeedPxPerSec?: number;
  /** Space between repeats, in px at the rendered font size. */
  marqueeGapPx?: number;
  /**
   * Where to listen for the pointer. "window" for a canvas that cannot receive
   * events itself.
   */
  trackPointer?: "canvas" | "window";
  /**
   * A word to hold instead of the travelling line.
   *
   * The particles are not re-created for it: every one of them is given a new
   * origin taken from a sample of this word, and the spring that already pulls
   * each particle home carries the whole field there. So the band *becomes*
   * the word, in the same dust, and travel eases to a stop while it does.
   * Back to `null` and the field morphs home and picks the line up again.
   *
   * A value beginning with `#` names a PATTERN rather than a literal word —
   * `"#grid"` is the lattice of boxes the band becomes once the last feature
   * card has had its moment, and which `.page-dots` then carries down the rest
   * of the page. A token rather than an object because this prop is a
   * dependency of the effect below: an object literal would be a new identity
   * every render and would re-sample the field on each one.
   */
  morphTo?: string | null;
  /**
   * A second canvas to draw the same particles into — the phone's screen (see
   * `DustMirror`).
   *
   * One field, drawn twice. Not a second simulation: the phone is standing in
   * front of the band and covering part of the word, and what it shows has to
   * be *that* part, in register and reacting to the same pointer. Two
   * simulations could only ever be two similar-looking fields.
   *
   * Only the particles the current word is using are mirrored. The rest of the
   * band is the travelling line, which the phone's screen has no business
   * showing.
   */
  mirror?: DustMirror | null;
  /**
   * Where the held word sits across the band, as a fraction of the canvas
   * width off centre. Negative pulls it left.
   *
   * A word centred on the band is centred on the *viewport*, which is not the
   * middle of this composition: the copy column owns the right of the stage
   * and the phone stands left of centre. Centred, most of the word ran under
   * the copy — the half of it nobody can read — while the device had only its
   * first letter to show.
   */
  morphOffsetX?: number;
  /**
   * Square dots instead of round ones. Squares on a lattice read as pixels;
   * circles read as bokeh however far apart they are spaced.
   */
  dotShape?: "circle" | "square";
  /**
   * Whether the pointer disturbs the field. False leaves the particles at rest
   * — they still drift and settle, they just stop answering the cursor.
   *
   * Toggling this deliberately does NOT re-run the effect: re-sampling the text
   * and reallocating thousands of particles to change one boolean would throw
   * away every particle's current position mid-flight.
   */
  interactive?: boolean;
}

/** Above this the sampling step is coarsened rather than dropping frames. */
const MAX_PARTICLES = 14000;

const INTERACTION_RADIUS = 120;


class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  /**
   * Where this particle belongs in the travelling line, kept in step with the
   * line whether or not the particle is currently there. A morph overwrites
   * `origin`; `home` is what it morphs back to, so the band picks up exactly
   * where it stopped rather than snapping to a freshly sampled line.
   */
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;

  constructor(x: number, y: number) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.originX = x;
    this.originY = y;
    this.homeX = x;
    this.homeY = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
  }

  /** Drop this particle back onto its origin, at rest. Used when recycling. */
  reset(originX: number) {
    this.originX = originX;
    this.homeX = originX;
    this.x = originX;
    this.y = this.originY;
    this.vx = 0;
    this.vy = 0;
  }

  update(mouseX: number, mouseY: number, dispersion: number, returnSpd: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < INTERACTION_RADIUS && distance > 0 && mouseX !== -1000) {
      const force = (INTERACTION_RADIUS - distance) / INTERACTION_RADIUS;
      this.vx -= (dx / distance) * force * dispersion;
      this.vy -= (dy / distance) * force * dispersion;
    }

    this.vx += (this.originX - this.x) * returnSpd;
    this.vy += (this.originY - this.y) * returnSpd;
    this.vx *= 0.85;
    this.vy *= 0.85;

    this.x += this.vx;
    this.y += this.vy;
  }
}

export function CursorDrivenParticleTypography({
  className,
  text,
  fontSize = 120,
  fontFamily = "Inter, sans-serif",
  particleSize = 1.5,
  particleDensity = 6,
  dispersionStrength = 15,
  returnSpeed = 0.08,
  color,
  marquee = false,
  marqueeSpeedPxPerSec = 140,
  marqueeGapPx = 40,
  trackPointer = "canvas",
  interactive = true,
  morphTo = null,
  dotShape = "circle",
  mirror = null,
  morphOffsetX = 0,
}: CursorDrivenParticleTypographyProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const interactiveRef = React.useRef(interactive);
  interactiveRef.current = interactive;
  // Same reasoning as `interactive`: a morph must not re-run the effect, or
  // the field it is supposed to carry over would be thrown away and rebuilt.
  const morphRef = React.useRef(morphTo);
  morphRef.current = morphTo;
  const morphFnRef = React.useRef<((word: string | null) => void) | null>(null);
  const mirrorRef = React.useRef(mirror);
  mirrorRef.current = mirror;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame: number | null = null;
    let particles: Particle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let width = 0;
    let height = 0;
    let tileWidth = 0;
    let trackWidth = 0;
    let speed = 0;
    let last = 0;
    let visible = false;
    /** 0 while a word is held, 1 while the line runs. Eased, not switched. */
    let travel = 1;
    /** Resolved once in `init`; the mirror fills with the same colour. */
    let textColor = "#fff";
    /** Particles the current word uses; they sort to the front of the array. */
    let keptCount = 0;
    /** Opacity of everything past `keptCount`. Eased, so the band dissolves. */
    let surplus = 1;

    /**
     * Turn whatever the caller passed into a family a canvas will accept.
     *
     * `ctx.font` is parsed as the CSS `font` shorthand but WITHOUT the custom
     * property machinery: a `var(--font-ubuntu)` in there is a parse error, and
     * a font string that fails to parse is dropped silently. Setting the family
     * on a real element and reading it back is what performs the substitution,
     * because custom properties are resolved at computed-value time.
     */
    const resolveFamily = () => {
      if (!fontFamily.includes("var(")) return fontFamily;
      const prev = container.style.fontFamily;
      container.style.fontFamily = fontFamily;
      const resolved = window.getComputedStyle(container).fontFamily;
      container.style.fontFamily = prev;
      return resolved && !resolved.includes("var(") ? resolved : "sans-serif";
    };

    /**
     * Sample one copy of the text, then lay that sample out across enough
     * copies to cover the canvas with a tile of slack at each end — the slack
     * is where recycling happens, out of sight.
     */
    const init = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (!width || !height) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      textColor = color || window.getComputedStyle(container).color || "#000";
      const font = `bold ${fontSize}px ${resolveFamily()}`;

      // Measure on the visible context, sample from an offscreen one: the
      // sample has to be of a single copy, at a known origin, and reading it
      // back off the display canvas would mean clearing what is on screen.
      ctx.font = font;
      // A canvas font string the parser rejects is DISCARDED — the property
      // keeps its previous value, which on a fresh context is `10px sans-serif`.
      // There is no error, so the only symptom is text rendered at a tenth of
      // the size, sampled into a smear of dots. Verify the assignment took.
      if (!ctx.font.includes(`${fontSize}px`)) ctx.font = `bold ${fontSize}px sans-serif`;
      const textWidth = ctx.measureText(text).width;
      tileWidth = Math.max(1, Math.round(textWidth + marqueeGapPx));

      const copies = marquee ? Math.ceil((width + 2 * tileWidth) / tileWidth) + 1 : 1;
      trackWidth = tileWidth * copies;
      speed = marquee && !still ? marqueeSpeedPxPerSec : 0;

      const sampleW = marquee ? tileWidth : width;
      const sample = document.createElement("canvas");
      sample.width = Math.ceil(sampleW * dpr);
      sample.height = Math.ceil(height * dpr);
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) return;
      sctx.scale(dpr, dpr);
      sctx.fillStyle = "#fff";
      sctx.font = ctx.font;
      sctx.textBaseline = "middle";
      if (marquee) {
        sctx.textAlign = "left";
        sctx.fillText(text, 0, height / 2);
      } else {
        sctx.textAlign = "center";
        sctx.fillText(text, width / 2, height / 2);
      }

      const data = sctx.getImageData(0, 0, sample.width, sample.height).data;

      // One pass to count, so the step can be coarsened before allocating
      // rather than after — the cost this guards against is per-frame.
      let step = Math.max(1, Math.round(particleDensity * dpr));
      const countAt = (s: number) => {
        let n = 0;
        for (let y = 0; y < sample.height; y += s) {
          for (let x = 0; x < sample.width; x += s) {
            if ((data[(y * sample.width + x) * 4 + 3] || 0) > 128) n++;
          }
        }
        return n;
      };
      const budget = marquee ? MAX_PARTICLES / copies : MAX_PARTICLES;
      while (countAt(step) > budget) step += Math.max(1, Math.round(dpr));

      particles = [];
      for (let y = 0; y < sample.height; y += step) {
        for (let x = 0; x < sample.width; x += step) {
          if ((data[(y * sample.width + x) * 4 + 3] || 0) <= 128) continue;
          const px = x / dpr;
          const py = y / dpr;
          for (let k = 0; k < copies; k++) {
            particles.push(new Particle(px + k * tileWidth, py));
          }
        }
      }

      keptCount = particles.length;
      ctx.fillStyle = textColor;
      // A morph in force has to survive a re-init (a resize, or fonts landing
      // after first paint), or the band would snap back to the line under it.
      if (morphRef.current) applyMorph(morphRef.current);
    };

    /**
     * Sample one word, centred, at a face sized to the band rather than to the
     * line: a single word standing in for a whole scrolling sentence should
     * command the same space. Capped by the canvas height — the glyphs have to
     * fit the band they are drawn in, and there is no more room than that.
     *
     * Points come out ordered by x, which is what makes the mapping below a
     * sweep rather than a scramble.
     */
    const wordPoints = (word: string) => {
      const dpr = window.devicePixelRatio || 1;
      const family = resolveFamily();
      ctx.font = `bold ${fontSize}px ${family}`;
      if (!ctx.font.includes(`${fontSize}px`)) ctx.font = `bold ${fontSize}px sans-serif`;
      const baseWidth = ctx.measureText(word).width || 1;
      const face = Math.max(
        1,
        Math.round(
          Math.min(
            (width * 0.42 * fontSize) / baseWidth,
            fontSize * 2.4,
            // Cap height is about 0.72em, so a face the height of the band
            // still sits inside it.
            height,
          ),
        ),
      );

      const sample = document.createElement("canvas");
      sample.width = Math.ceil(width * dpr);
      sample.height = Math.ceil(height * dpr);
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) return [];
      sctx.scale(dpr, dpr);
      sctx.fillStyle = "#fff";
      sctx.font = `bold ${face}px ${family}`;
      if (!sctx.font.includes(`${face}px`)) sctx.font = `bold ${face}px sans-serif`;
      sctx.textAlign = "center";
      sctx.textBaseline = "middle";
      sctx.fillText(word, width / 2 + width * morphOffsetX, height / 2);

      const data = sctx.getImageData(0, 0, sample.width, sample.height).data;
      const ink = (x: number, y: number) =>
        (data[(y * sample.width + x) * 4 + 3] || 0) > 128;

      // The SAME sampling step as the line, so the word is the same lattice of
      // dots at the same spacing — it has to read as the band re-formed, not as
      // a solid glyph that replaced it. That means the word needs far fewer
      // particles than the line has, which is what the fade in `applyMorph`
      // deals with. Coarsened only if a long word would somehow outgrow the
      // field.
      let step = Math.max(1, Math.round(particleDensity * dpr));
      const countAt = (s: number) => {
        let n = 0;
        for (let x = 0; x < sample.width; x += s) {
          for (let y = 0; y < sample.height; y += s) if (ink(x, y)) n++;
        }
        return n;
      };
      while (countAt(step) > particles.length) step += Math.max(1, Math.round(dpr));

      const points: Array<{ x: number; y: number }> = [];
      for (let x = 0; x < sample.width; x += step) {
        for (let y = 0; y < sample.height; y += step) {
          if (ink(x, y)) points.push({ x: x / dpr, y: y / dpr });
        }
      }
      return points;
    };

    /**
     * Pitch of the `#grid` lattice, in canvas pixels.
     *
     * Stated so that it lands on `PAGE_DOT_PITCH` once the pin's 1.3 scale is
     * applied: the static layer that takes over below the hero has to have the
     * same spacing on screen, or the handover reads as one background being
     * replaced by a different one rather than as these boxes carrying on.
     */
    const GRID_STEP = Math.round(22 / 1.3);

    /**
     * A pattern's points, for a `#`-prefixed morph target.
     *
     * Ordered by x like `wordPoints`, so the same x-ordered mapping in
     * `applyMorph` sweeps the field into it rather than scrambling it.
     */
    const patternPoints = (name: string) => {
      const points: Array<{ x: number; y: number }> = [];
      if (name !== "grid") return points;
      // Centred, so the lattice is symmetrical about the middle of the band
      // instead of hanging off whichever edge the loop started at.
      const cols = Math.floor(width / GRID_STEP);
      const rows = Math.floor(height / GRID_STEP);
      const x0 = (width - (cols - 1) * GRID_STEP) / 2;
      const y0 = (height - (rows - 1) * GRID_STEP) / 2;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          points.push({ x: x0 + c * GRID_STEP, y: y0 + r * GRID_STEP });
        }
      }
      return points;
    };

    /**
     * Give the particles the word needs a new origin, and let the springs do
     * the rest. The ones it does not need stay where they are and fade out.
     *
     * A word at the line's own dot spacing is a few thousand points against a
     * field of fourteen thousand, so most of the band is surplus. Three things
     * were tried for it: sharing points between particles (stacked dots read as
     * a blotch, not as dust), and parking the surplus off-canvas (the whole
     * band visibly falls out of frame). Fading it where it stands is the one
     * that looks like the line dissolving into the word.
     *
     * The array is partitioned so the kept particles come first — `keptCount`
     * is then all the draw loop needs to know, and no per-particle flag has to
     * be read fourteen thousand times a frame.
     *
     * Particles are matched to points in x order, spread across the field, so
     * the word is drawn out of the whole band rather than out of the part of it
     * that happened to be nearest.
     */
    const applyMorph = (word: string | null) => {
      if (!particles.length) return;
      if (!word) {
        for (const p of particles) {
          p.originX = p.homeX;
          p.originY = p.homeY;
        }
        // `keptCount` is deliberately left alone. Restoring it here would put
        // the whole surplus back at full opacity in one frame, which is a pop;
        // the draw loop widens it again once the fade has actually caught up.
        return;
      }
      const points = word.startsWith("#")
        ? patternPoints(word.slice(1))
        : wordPoints(word);
      if (!points.length) return;

      const order = particles
        .map((_, i) => i)
        .sort((a, b) => particles[a].homeX - particles[b].homeX);
      const kept: Particle[] = [];
      const rest: Particle[] = [];
      const taken = new Uint8Array(particles.length);
      for (let k = 0; k < points.length; k++) {
        const pick = order[Math.floor((k * order.length) / points.length)];
        if (taken[pick]) continue;
        taken[pick] = 1;
        const p = particles[pick];
        p.originX = points[k].x;
        p.originY = points[k].y;
        kept.push(p);
      }
      for (let i = 0; i < particles.length; i++) {
        if (taken[i]) continue;
        const p = particles[i];
        p.originX = p.homeX;
        p.originY = p.homeY;
        rest.push(p);
      }
      particles = kept.concat(rest);
      keptCount = kept.length;
    };
    morphFnRef.current = applyMorph;

    /**
     * Draw the word again, into the phone's screen, in register.
     *
     * The mapping is read off the two canvases' own boxes every frame, and it
     * has to be: the band is translated and scaled by the pin as you scroll,
     * and the phone moves and scales independently of it. Both transform
     * chains are pure scale and translate — checked, no rotation anywhere —
     * so comparing rectangles is exact rather than an approximation.
     *
     * A particle at local x in the band is on screen at
     * `src.left + x * (src.width / width)`; the mirror shows the screen at
     * `dst.left + mx * (dst.width / mirrorCssWidth)`. Solving one for the
     * other is the `scale`/`offset` pair below.
     */
    const drawMirror = () => {
      const canvasEl = mirrorRef.current?.current;
      if (!canvasEl || !keptCount) return;
      const cssW = canvasEl.clientWidth;
      const cssH = canvasEl.clientHeight;
      if (!cssW || !cssH) return;

      const dpr = window.devicePixelRatio || 1;
      const mctx = canvasEl.getContext("2d");
      if (!mctx) return;
      // Sized here rather than on resize: this canvas belongs to the phone,
      // which is not the element the ResizeObserver above is watching.
      if (canvasEl.width !== Math.round(cssW * dpr)) {
        canvasEl.width = Math.round(cssW * dpr);
        canvasEl.height = Math.round(cssH * dpr);
      }
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, cssW, cssH);

      const src = canvas.getBoundingClientRect();
      const dst = canvasEl.getBoundingClientRect();
      if (!src.width || !dst.width) return;
      const scale = (src.width / width) * (cssW / dst.width);
      const offsetX = (src.left - dst.left) * (cssW / dst.width);
      const offsetY = (src.top - dst.top) * (cssH / dst.height);
      const radius = Math.max(0.5, particleSize * scale);

      mctx.fillStyle = textColor;
      mctx.beginPath();
      for (let i = 0; i < keptCount; i++) {
        const p = particles[i];
        const mx = p.x * scale + offsetX;
        if (mx < -radius || mx > cssW + radius) continue;
        const my = p.y * scale + offsetY;
        if (my < -radius || my > cssH + radius) continue;
        mctx.moveTo(mx + radius, my);
        mctx.arc(mx, my, radius, 0, Math.PI * 2);
      }
      mctx.fill();
    };

    const tick = (now: number) => {
      frame = null;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;

      // Travel eases to a stop under a morph rather than cutting out: the line
      // comes to rest as the word forms, which is one movement instead of two.
      const want = morphRef.current ? 0 : 1;
      travel += Math.sign(want - travel) * Math.min(Math.abs(want - travel), dt * 2.2);
      const shift = speed * travel * dt;
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();

      // Read per frame rather than captured: the prop can flip at any time and
      // -1000 is the sentinel `update` reads as "no pointer". Particles already
      // thrown keep their momentum and ease home on their own.
      const mx = interactiveRef.current ? mouseX : -1000;
      const my = interactiveRef.current ? mouseY : -1000;

      surplus += Math.sign(want - surplus) * Math.min(Math.abs(want - surplus), dt * 2.6);
      if (want === 1 && surplus > 0.999) keptCount = particles.length;

      // One path for every particle rather than a fill each: at this count the
      // per-call overhead dominates the actual rasterising. `rect` is cheaper
      // again — no curve to flatten.
      const side = particleSize * 2;
      const dot =
        dotShape === "square"
          ? (p: Particle) => {
              // Rounded to whole pixels. A square on a half pixel is
              // anti-aliased into a soft grey smudge, which is the one thing
              // that stops pixels reading as pixels.
              ctx.rect(Math.round(p.x), Math.round(p.y), side, side);
            }
          : (p: Particle) => {
              ctx.moveTo(p.x + particleSize, p.y);
              ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
            };

      // Every particle is still simulated — the surplus is faded, not frozen,
      // so it is in the right place the moment the word lets go of the field.
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (shift) {
          p.originX -= shift;
          p.homeX -= shift;
          p.x -= shift;
          // Off the left edge with a tile to spare: send it round to the far
          // end of the track. It is out of frame, so the jump cannot be seen.
          if (p.homeX < -tileWidth) p.reset(p.homeX + trackWidth);
        }
        p.update(mx, my, dispersionStrength, returnSpeed);
        if (i < keptCount) dot(p);
      }
      ctx.fill();

      if (keptCount < particles.length && surplus > 0.004) {
        const prev = ctx.globalAlpha;
        ctx.globalAlpha = surplus;
        ctx.beginPath();
        for (let i = keptCount; i < particles.length; i++) dot(particles[i]);
        ctx.fill();
        ctx.globalAlpha = prev;
      }

      drawMirror();

      if (visible) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (frame === null && visible) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Into the canvas's OWN coordinates, which is what the particles are in.
      // The offset from the canvas's left edge is in screen pixels, and this
      // canvas is not drawn at 1:1 — the pin scales the band up to 1.3 as it
      // rises. Taking the offset raw put the disturbance a third of the way
      // across the band from wherever the cursor actually was, so the dust
      // scattered somewhere the reader was not pointing.
      const sx = rect.width ? width / rect.width : 1;
      const sy = rect.height ? height / rect.height : 1;
      mouseX = (e.clientX - rect.left) * sx;
      mouseY = (e.clientY - rect.top) * sy;
    };
    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
      },
      { rootMargin: "200px" },
    );
    io.observe(container);

    const ro = new ResizeObserver(() => {
      init();
      wake();
    });
    ro.observe(container);

    // Fonts land after first paint, and the sample is only as good as the face
    // that was available when it was taken.
    const start = () => {
      init();
      wake();
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(start).catch(start);
    } else {
      start();
    }

    const target: Window | HTMLCanvasElement = trackPointer === "window" ? window : canvas;
    target.addEventListener("mousemove", onMouseMove as EventListener, { passive: true });
    target.addEventListener("mouseleave", onMouseLeave as EventListener);

    return () => {
      morphFnRef.current = null;
      io.disconnect();
      ro.disconnect();
      target.removeEventListener("mousemove", onMouseMove as EventListener);
      target.removeEventListener("mouseleave", onMouseLeave as EventListener);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [
    text,
    fontSize,
    fontFamily,
    particleSize,
    particleDensity,
    dispersionStrength,
    returnSpeed,
    color,
    marquee,
    marqueeSpeedPxPerSec,
    marqueeGapPx,
    trackPointer,
    morphOffsetX,
    dotShape,
  ]);

  // Separate from the effect above, and deliberately: this is the one prop
  // that must reach a running field instead of rebuilding it.
  React.useEffect(() => {
    morphFnRef.current?.(morphTo);
  }, [morphTo]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex h-full w-full items-center justify-center touch-none", className)}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
