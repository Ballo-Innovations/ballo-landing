"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

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
  vx: number;
  vy: number;

  constructor(x: number, y: number) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.originX = x;
    this.originY = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
  }

  /** Drop this particle back onto its origin, at rest. Used when recycling. */
  reset(originX: number) {
    this.originX = originX;
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
}: CursorDrivenParticleTypographyProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const interactiveRef = React.useRef(interactive);
  interactiveRef.current = interactive;

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

      const textColor = color || window.getComputedStyle(container).color || "#000";
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

      ctx.fillStyle = textColor;
    };

    const tick = (now: number) => {
      frame = null;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;

      const shift = speed * dt;
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();

      // Read per frame rather than captured: the prop can flip at any time and
      // -1000 is the sentinel `update` reads as "no pointer". Particles already
      // thrown keep their momentum and ease home on their own.
      const mx = interactiveRef.current ? mouseX : -1000;
      const my = interactiveRef.current ? mouseY : -1000;

      for (const p of particles) {
        if (shift) {
          p.originX -= shift;
          p.x -= shift;
          // Off the left edge with a tile to spare: send it round to the far
          // end of the track. It is out of frame, so the jump cannot be seen.
          if (p.originX < -tileWidth) p.reset(p.originX + trackWidth);
        }
        p.update(mx, my, dispersionStrength, returnSpeed);
        // One path for every particle rather than a fill each: at this count
        // the per-call overhead dominates the actual rasterising.
        ctx.moveTo(p.x + particleSize, p.y);
        ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
      }
      ctx.fill();

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
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
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
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex h-full w-full items-center justify-center touch-none", className)}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
