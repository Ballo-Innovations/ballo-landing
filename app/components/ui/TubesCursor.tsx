"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The 21st.dev "tubes cursor" — neon tubes that chase the pointer — as a
 * background layer for a run of sections rather than a full-screen page.
 *
 * This is the one three.js thing on the site, and it is deliberately fenced in:
 *
 *   - the module (~770 KB, three.js included) is only fetched once the section
 *     it decorates is within `rootMargin` of the viewport, so it never touches
 *     the initial load or anything above it;
 *   - it is skipped outright without a fine pointer (it is a *cursor* effect —
 *     on touch it would only idle-orbit), under `prefers-reduced-motion`, and
 *     with no WebGL context to render into;
 *   - the library's own `size: "parent"` mode sizes the canvas from this
 *     wrapper, and its internal IntersectionObserver + `visibilitychange`
 *     handler stop its rAF loop when the canvas scrolls away or the tab is
 *     hidden. That is the same "park it off-screen" rule the CSS animations
 *     here follow via `useAnimateWhenVisible`, enforced by the library itself.
 *
 * The wrapper is laid out over one section (see tubes-cursor.css), which is
 * what lets it render at the display's full pixel ratio and what keeps the
 * tubes from feeling stuck to the screen: the canvas scrolls with its section,
 * so they hold the content they were over and leave with it, and no scroll
 * bookkeeping of our own is needed.
 *
 * Upstream renders its own hero copy inside the component; here it renders
 * nothing but the canvas, and the section supplies the content over it.
 */

type TubesApp = {
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
    setLightsIntensity: (intensity: number) => void;
  };
  /** The library's Three wrapper. Its camera and pixel-ratio bounds are ours. */
  three: {
    minPixelRatio: number;
    maxPixelRatio: number;
    camera: {
      position: { z: number };
      updateProjectionMatrix: () => void;
    };
    resize: () => void;
  };
  dispose: () => void;
};

type BloomOptions = { strength: number; radius: number; threshold: number };

type TubesFactory = (
  canvas: HTMLCanvasElement,
  options: {
    tubes: {
      colors: string[];
      lights: { intensity: number; colors: string[] };
    };
    bloom: BloomOptions;
  }
) => TubesApp;

/**
 * Device-pixel-ratio the scene renders at, overriding the library's hardcoded 2.
 *
 * Matching the display keeps a retina screen at full sharpness — rendering
 * below the device ratio is exactly what makes the tubes look soft — while a
 * 1x display renders 1x, which is native for it and a quarter of the fill.
 *
 * This is only affordable because the canvas is one viewport rather than the
 * whole zone (see tubes-cursor.css). Over the full zone the bloom pass could
 * not allocate above 1: at 2 it silently drew nothing at all.
 *
 * Capped at 2: a 3x screen would be nine times the pixels of a 1x one for a
 * difference nobody can see on soft, bloomed light.
 */
const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

/**
 * The camera distance the library sets up for a viewport-sized canvas, and the
 * canvas height it implicitly assumes — one screen.
 *
 * The scene is framed by a fixed VERTICAL field of view, and the library only
 * corrects for aspect when the canvas is wider than 1.5:1. This canvas is the
 * whole zone, so it is far TALLER than the screen, and the same world height
 * gets painted over several times as many pixels: the tubes come out that many
 * times life size, filling the page. Pulling the camera back by the same factor
 * the canvas is taller restores their size on screen.
 */
const BASE_CAMERA_Z = 5;

const MODULE_URL =
  "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

/**
 * The halo around the strands, and the reason it is set here at all.
 *
 * The library blooms with `threshold: 0`, which means EVERY lit pixel is fed
 * into the glow, not just the bright cores — the dim body of each strand glows
 * as hard as its hot centre, and the result is a wash rather than light coming
 * off a filament. Lifting the threshold keeps the bloom for what is actually
 * bright and leaves the rest crisp; the strength comes down to match.
 *
 * Strength and threshold trade against each other. Raising the threshold alone
 * makes the halo smaller but no softer, and dropping the strength alone dims
 * the whole scene rather than tightening it.
 */
const DEFAULT_BLOOM: BloomOptions = { strength: 0.8, radius: 0.5, threshold: 0.22 };

/** Brand palette: the deep blues and cyan the rest of the page is built from. */
const DEFAULT_TUBE_COLORS = ["#1a3aff", "#3fdbff", "#7c3aed"];
const DEFAULT_LIGHT_COLORS = ["#3fdbff", "#7c3aed", "#1a3aff", "#00d4ff"];

export type TubesCursorProps = {
  className?: string;
  /** Tube colours, low to high along the strand. */
  colors?: string[];
  /** Exactly four point-light colours — the library indexes 0..3. */
  lightColors?: string[];
  /**
   * Brightness of those four lights. The library ships 200; this is raised
   * because the strands read as washed out against this page, which is close
   * to black and puts nothing else near them.
   *
   * Tune it by eye, not by screenshot: the strands wander and bunch, so how
   * bright a given frame looks depends far more on how spread out they are at
   * that instant than on this number.
   */
  lightIntensity?: number;
  /** Overrides the halo. See `DEFAULT_BLOOM` for why the library's is not used. */
  bloom?: BloomOptions;
  /** Re-roll both palettes on click. Off by default: the colours are brand. */
  recolorOnClick?: boolean;
};

const randomColors = (count: number) =>
  Array.from(
    { length: count },
    () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
  );

export function TubesCursor({
  className,
  colors = DEFAULT_TUBE_COLORS,
  lightColors = DEFAULT_LIGHT_COLORS,
  lightIntensity = 360,
  bloom = DEFAULT_BLOOM,
  recolorOnClick = false,
}: TubesCursorProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const appRef = React.useRef<TubesApp | null>(null);

  // Read through refs inside the effect so changing a palette prop never tears
  // the scene down and re-imports the module.
  const optionsRef = React.useRef({ colors, lightColors, lightIntensity, bloom });
  optionsRef.current = { colors, lightColors, lightIntensity, bloom };

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    // A context is created and immediately dropped rather than trusting a
    // `WebGL2RenderingContext in window` check: the constructor exists on
    // machines where creating a context still fails (blocklisted driver,
    // too many live contexts), and there the library would throw mid-init.
    const probe = document.createElement("canvas").getContext("webgl2");
    if (!probe) return;
    probe.getExtension("WEBGL_lose_context")?.loseContext();

    // Opens the connection to the CDN as soon as this mounts, rather than when
    // the module is finally wanted. DNS, TCP and TLS to a third-party origin
    // measured 114ms of the delay on a fast line from here, and that is the
    // part that grows worst on a slow one. It fetches nothing.
    const warm = document.createElement("link");
    warm.rel = "preconnect";
    warm.href = "https://cdn.jsdelivr.net";
    warm.crossOrigin = "anonymous";
    document.head.appendChild(warm);

    let cancelled = false;

    /** Keeps the tubes the same size on screen however tall the zone is. */
    const frameCamera = () => {
      const app = appRef.current;
      const canvas = canvasRef.current;
      if (!app || !canvas) return;
      const taller = Math.max(1, canvas.clientHeight / window.innerHeight);
      app.three.camera.position.z = BASE_CAMERA_Z * taller;
      app.three.camera.updateProjectionMatrix();
    };

    const start = () => {
      if (cancelled) return;

      import(/* webpackIgnore: true */ /* turbopackIgnore: true */ MODULE_URL)
        .then((module: { default: TubesFactory }) => {
          if (cancelled || !canvasRef.current) return;

          const { colors, lightColors, lightIntensity, bloom } = optionsRef.current;
          const app = module.default(canvasRef.current, {
            tubes: {
              colors,
              lights: { intensity: lightIntensity, colors: lightColors },
            },
            bloom,
          });
          appRef.current = app;

          // The factory pins the renderer to devicePixelRatio 2 — reasonable
          // for the full-screen demo it ships as, ruinous here. This canvas is
          // the whole zone, so at 2x a 1440-wide page renders ~28 megapixels a
          // frame THROUGH A BLOOM PASS, and it runs at single-digit fps. The
          // bounds are writable on the Three wrapper; `resize` reallocates the
          // buffers at the new ratio.
          const ratio = pixelRatio();
          app.three.minPixelRatio = ratio;
          app.three.maxPixelRatio = ratio;
          app.three.resize();
          frameCamera();
          // `resize` re-derives the fov but leaves the camera where it is, so
          // this only has to be re-applied when the canvas itself changes size.
          window.addEventListener("resize", frameCamera, { passive: true });
          // Drives the opacity transition in tubes-cursor.css, so the first
          // painted frame fades in instead of snapping on.
          wrapper.dataset.ready = "true";
        })
        .catch((error) => {
          // A decoration: a CDN that is blocked or offline leaves the section
          // exactly as it was without the effect.
          console.error("TubesCursor: failed to load", error);
        });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // One shot: from here the library's own observer decides when to render.
        observer.disconnect();

        start();
      },
      // Roughly a screen and a half of warning. At 200px the fetch, the WebGL
      // init and the fade all happened after the section was already on
      // screen, which is what made the strands look like they arrived late.
      // The section is several thousand pixels down the page, so this still
      // costs nothing to anyone who never scrolls that far.
      { rootMargin: "1400px" }
    );

    observer.observe(wrapper);

    return () => {
      cancelled = true;
      warm.remove();
      observer.disconnect();
      window.removeEventListener("resize", frameCamera);
      // Releases the WebGL context and the document-level pointer listeners the
      // library installs; without it a route change leaks both.
      appRef.current?.dispose();
      appRef.current = null;
    };
  }, []);

  const handleClick = React.useCallback(() => {
    if (!recolorOnClick || !appRef.current) return;
    appRef.current.tubes.setColors(randomColors(3));
    appRef.current.tubes.setLightsColors(randomColors(4));
  }, [recolorOnClick]);

  return (
    <div
      ref={wrapperRef}
      className={cn("tubes-cursor", className)}
      onClick={recolorOnClick ? handleClick : undefined}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="tubes-cursor__canvas" />
    </div>
  );
}

export default TubesCursor;
