"use client";

import * as React from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── the curved row ──────────────────────────────────────────────
 * From 21st.dev's "Tilted Grid Hero", adapted for this repo (see ADR 0003):
 * `bg-muted` is replaced by an inline placeholder colour (there is no shadcn
 * theme here), and a tile can carry a `label` that is sliced with its image
 * so it bends with the tile.
 *
 * Scroll Tilted Grid turned on its side, with the tilt drawn as a curve.
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you so each
 * end image curves along its length, and the ends fade into the page.
 *
 * A CSS box can't bend, so every tile is cut into SLICES vertical strips,
 * each a flat facet of the cylinder showing its share of the image. The
 * strips sit still inside their tile, each turned its own few degrees
 * round the cylinder's axis, and the tile (preserve-3d) is what moves: one
 * rotateY about that same axis carries the whole tile along the arc. A
 * tile is one animation, so its strips can never drift apart or show
 * different images. Only a tile's delay differs, and that sets where on
 * the arc it sits. The band is transform-only on the compositor; the fade
 * is a static mask over it.
 *
 * The only JS is a ResizeObserver that sizes the loop, and a handler that
 * hands a tile its next image each time it wraps, out of sight.
 * ─────────────────────────────────────────────────────────────── */

// Strips per tile. Each is a few degrees of arc, too little to read as a
// facet; fewer starts to show corners along the top and bottom edges.
const SLICES = 16;

// Camera distance from the screen, as a multiple of the cylinder's radius.
const CAMERA = 1.6;

/**
 * Cylinder radius, as a share of the hero's width, that puts the frame's
 * edge `bend` radians round the arc as seen through the camera:
 * r·sinθ · CAMERA / (CAMERA − 1 + cosθ) = width / 2, solved for r.
 */
function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

// A tile is never wider than this share of the hero, so a phone still
// shows its neighbours instead of one tile edge to edge.
const MAX_WIDTH = 55;

/**
 * Lays the loop on the cylinder. Angles come back in degrees: `unit` is the
 * arc one tile-height spans, `limit` how far round a tile's centre can go
 * before the whole tile is off-screen, and `sweep` how far round the loop's
 * ends sit. The loop reaches past `limit`, so a tile only ever wraps out of
 * sight, and is rounded up to a whole number of tiles so the gap never
 * stretches.
 */
function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const h = Math.min(
    (tile / 100) * height,
    ((MAX_WIDTH / 100) * width) / aspect,
  );
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0))
    return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  // Capped so a hero squeezed to a sliver can't mount thousands of tiles.
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
  };
}

export type TiltedGridImage = {
  src: string;
  /** Only used if you drop the decorative treatment; the band is aria-hidden. */
  alt?: string;
  /** Caption drawn on the tile's lower edge, bent with it. Decorative too. */
  label?: string;
};

export type TiltedGridHeroProps = {
  /**
   * Images run along the row in order. A tile takes its next image each
   * time it wraps off-screen, so the whole list plays through however
   * few tiles the frame needs. Short lists simply repeat.
   */
  images: TiltedGridImage[];
  /** Seconds for the row to advance by one tile. @default 4 */
  speed?: number;
  /** Tile height, as a percentage of the hero's height. @default 26 */
  tileHeight?: number;
  /** Tile width divided by tile height. @default 16 / 9 */
  aspectRatio?: number;
  /** Space between tiles, as a percentage of a tile's height. @default 6 */
  gap?: number;
  /** Vertical centre of the row, as a percentage of the hero's height. @default 56 */
  axis?: number;
  /** How far the row has bent round by the frame's edge, in degrees (5–85). @default 80 */
  curve?: number;
  /** Width of the fade at each end, as a percentage of the hero's width. @default 12 */
  fade?: number;
  /**
   * Drive the row from page scroll instead of time: it moves as the hero
   * crosses the viewport (forward scrolling down, back scrolling up) and
   * holds still otherwise. The value is how many tiles it travels over that
   * whole pass. 0 (the default) keeps the timed loop. See ADR 0009.
   */
  scrollDriven?: number;
  /** Content rendered above the band. */
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  scrollDriven = 0,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  // Null until the observer has measured the hero. The band stays hidden
  // until then, so a first paint laid out for the wrong size never shows.
  const [layout, setLayout] = React.useState<ReturnType<typeof measure> | null>(
    null,
  );

  // The image each tile shows, as a position in the run of images. It only
  // changes when the tile wraps, out of sight.
  const [shown, setShown] = React.useState<Record<number, number>>({});

  // Scroll-driven mode: the animations stay paused and their clock is the
  // page. `offset` is how many seconds of the loop the scroll has played;
  // each tile's delay is set from it directly, frame by frame, without a
  // React render. A tile's image is picked from the lap it is on, since a
  // paused animation never fires `animationiteration`.
  const offset = React.useRef(0);
  // Seconds of loop added by dragging (ADR 0013), on top of the scroll's.
  const dragOffset = React.useRef(0);
  const tileRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout((prev) =>
        prev?.columns === next.columns &&
        prev.sweep === next.sweep &&
        prev.unit === next.unit
          ? prev
          : next,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  // Fetch every image up front. A tile picks up its next one just before
  // it comes back into view, too late to start loading it then.
  React.useEffect(() => {
    for (const { src } of images) new Image().src = src;
  }, [images]);

  const { columns, sweep, unit, limit } =
    layout ?? measure(1200, 560, tileHeight, aspectRatio, gap, bend);

  // Every length is a multiple of the tile's height, which follows the
  // hero's height until MAX_WIDTH caps it on narrow screens.
  const u = (n: number) =>
    `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(
      MAX_WIDTH / aspectRatio
    ).toFixed(4)}cqw))`;

  const r = 100 * arc(bend);
  const radius = `${+r.toFixed(3)}cqw`;
  // Out to the axis, round it, back in.
  const turn = (deg: number) =>
    `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;

  // Beyond `limit` a tile is wholly off-screen, so it is hidden there.
  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    // Pausing rather than removing the motion keeps the band whole.
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;

  const share = aspectRatio / SLICES;
  const duration = columns * speed;

  const lapOf = (t: number, at: number) =>
    Math.floor((t * speed + at) / duration);
  const applyScroll = (p: number) => {
    if (!scrollDriven) return;
    // Dragging right takes the clock backwards. A negative offset gives the
    // tiles positive delays, so they sit unstarted (hidden) and the row
    // empties; a large whole number of loops ahead keeps it positive without
    // changing where any tile is or which image it shows.
    offset.current =
      p * scrollDriven * speed + dragOffset.current + duration * 1000;
    let changed = false;
    const next: Record<number, number> = {};
    tileRefs.current.forEach((node, t) => {
      if (!node) return;
      node.style.animationDelay = `${-(t * speed + offset.current)}s`;
      const image = lapOf(t, offset.current) * columns + (columns - 1 - t);
      next[t] = image;
      if (shown[t] !== image) changed = true;
    });
    if (changed) setShown(next);
  };
  useMotionValueEvent(scrollYProgress, "change", applyScroll);
  React.useEffect(() => {
    if (scrollDriven) applyScroll(scrollYProgress.get());
    // Re-place when the loop is re-measured (columns / duration change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollDriven, columns, duration]);
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${
    100 - fade
  }%,transparent)`;

  // Drag to scrub the row (ADR 0013). The row is CSS animations, so a drag
  // seeks them: the pointer's travel, in tile widths, becomes seconds of the
  // loop. They pause while held and resume where they were let go.
  const drag = React.useRef<{ x: number; tileW: number } | null>(null);
  const rowAnimations = () =>
    (ref.current?.getAnimations({ subtree: true }) ?? []).filter(
      (a) => (a as CSSAnimation).animationName === orbit,
    );
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const tileEl = ref.current?.querySelector<HTMLElement>(`.${tile}`);
    drag.current = { x: e.clientX, tileW: tileEl?.offsetWidth || 300 };
    if (!scrollDriven) rowAnimations().forEach((a) => a.pause());
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    // Dragging left carries the row on the way it already travels.
    const ms = (-dx / d.tileW) * speed * 1000;
    if (scrollDriven) {
      // The row's clock is the scroll here: shift that clock instead, so the
      // per-tile delays and the lap-based image choice stay consistent.
      dragOffset.current += ms / 1000;
      applyScroll(scrollYProgress.get());
      return;
    }
    rowAnimations().forEach((a) => {
      a.currentTime = Number(a.currentTime ?? 0) + ms;
    });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    if (!scrollDriven && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rowAnimations().forEach((a) => a.play());
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn("relative cursor-grab select-none overflow-hidden active:cursor-grabbing", className)}
      {...props}
      style={{ containerType: "size", touchAction: "pan-y", ...props.style }}
    >
      <style>{css}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: layout ? 1 : 0,
          perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          const first = columns - 1 - t;
          const img = images[(shown[t] ?? first) % Math.max(images.length, 1)];
          return (
            <div
              key={t}
              ref={(node) => {
                tileRefs.current[t] = node;
              }}
              className={cn(tile, "absolute")}
              style={{
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: "preserve-3d",
                animation: scrollDriven
                  ? `${orbit} ${duration}s linear ${-(t * speed + offset.current)}s infinite paused`
                  : `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
              onAnimationIteration={(e) => {
                if (scrollDriven) return;
                const lap = Math.round(e.elapsedTime / duration);
                setShown((prev) => {
                  const next = lap * columns + first;
                  return prev[t] === next ? prev : { ...prev, [t]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  className={cn(
                    "absolute top-0 overflow-hidden",
                    k === 0 && "rounded-l-lg",
                    k === SLICES - 1 && "rounded-r-lg",
                  )}
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    left: u((aspectRatio - share) / 2),
                    width:
                      k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn(
                      (aspectRatio / 2 - (k + 0.5) * share) * unit,
                    ),
                  }}
                >
                  {img ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element -- sliced 16 ways per tile; next/image would add a wrapper and a srcset per strip */}
                      <img
                        src={img.src}
                        alt={k === 0 ? (img.alt ?? "") : ""}
                        draggable={false}
                        className="absolute top-0 max-w-none object-cover"
                        style={{
                          left: u(-k * share),
                          width: u(aspectRatio),
                          height: u(1),
                        }}
                      />
                      {img.label ? (
                        // The whole caption, offset like the image, so each
                        // strip shows its share and the words bend with it.
                        <div
                          className="tgh-label absolute top-0"
                          style={{
                            left: u(-k * share),
                            width: u(aspectRatio),
                            height: u(1),
                          }}
                        >
                          <span>{img.label}</span>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default TiltedGridHero;
