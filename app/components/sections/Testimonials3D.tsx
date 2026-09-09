"use client";

import * as React from "react";
import { useScroll, useSpring } from "framer-motion";

import type { HomeTestimonialItem } from "@/app/HomeClient";
import { FadeUpReveal } from "../ui/FadeUpReveal";
import { useAnimateWhenVisible } from "../ui/useAnimateWhenVisible";

/**
 * The 21st.dev "3D testimonials": vertical marquee columns on a tilted
 * plane, alternating direction, fading out at every edge.
 *
 * What replaced it: one glass card with a 6s timer, five dots and a remount
 * per swap. This has no state and no timers — each column is a CSS keyframe
 * translating its track by half its height, and the whole section parks
 * under `[data-anim="paused"]` when scrolled away. Hover pauses it so a quote
 * can be read.
 *
 * Five testimonials do not fill five columns of four, so cards repeat across
 * columns at different offsets; the duplicates are aria-hidden and the first
 * copy of each column carries the readable text.
 *
 * Clicking any card lifts it off the plane: the quote flies from wherever it
 * was sitting on the tilt to the middle of the stage, square to the viewer and
 * at a readable size, with prev/next stepping through the rest. Reading a
 * quote on the plane itself means reading rotated, shrinking type that is
 * still moving — this is the way out of that, and it is why the marquee holds
 * while a card is open.
 */

const COLUMNS = 5;
const PER_COLUMN = 4;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function role(t: HomeTestimonialItem) {
  return [t.title, t.company].filter(Boolean).join(", ");
}

function Card({
  t,
  index,
  onOpen,
  duplicate,
}: {
  t: HomeTestimonialItem;
  /** Which testimonial this card shows, so the focused view can open on it. */
  index: number;
  onOpen: (index: number, from: HTMLElement) => void;
  /** A repeat of a card that already appears elsewhere: not in the tab order. */
  duplicate?: boolean;
}) {
  return (
    <figure className="t3d-card">
      {/* The hit target is a real button covering the card rather than a
          click handler on the figure: a quote has to be reachable by keyboard,
          and the duplicates opt out of the tab order instead of offering the
          same testimonial four times over. */}
      <button
        type="button"
        className="t3d-card__hit"
        tabIndex={duplicate ? -1 : undefined}
        aria-label={`Read ${t.name}'s testimonial in full`}
        onClick={(e) => onOpen(index, e.currentTarget)}
      />
      <blockquote className="t3d-card__quote">“{t.quote}”</blockquote>
      <figcaption className="t3d-card__who">
        <span className="t3d-card__avatar" aria-hidden="true">
          {initials(t.name)}
        </span>
        <span className="t3d-card__meta">
          <span className="t3d-card__name">{t.name}</span>
          <span className="t3d-card__role">{role(t)}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Where the focused card has to start so it is sitting exactly on top of the
 * card that was clicked — its position, its size, and the wall's own tilt.
 *
 * The tilt is the part that makes this the same card rather than a copy of
 * it. `.t3d__group` carries one rotation for the whole plane, so every card on
 * it is turned by the same matrix; composing that matrix into the start pose
 * means the card comes forward *turning*, out of the wall's angle and square
 * to the viewer, instead of sliding flat across a plane it was never flat on.
 *
 * The scale is not `from.width / to.width`: `from` is the axis-aligned box
 * around a card that is rotated inside it, which is narrower than the card.
 * Projecting the focused card's own box through the same matrix says how wide
 * it *would* measure at scale 1, and the ratio against that is the honest one.
 */
function pose(el: HTMLElement, from: DOMRect, plane: DOMMatrix | null) {
  const to = el.getBoundingClientRect();
  if (!to.width || !to.height) return null;

  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);

  const projected = plane
    ? Math.abs(plane.a) * to.width + Math.abs(plane.c) * to.height
    : to.width;
  const scale = Math.max(0.1, Math.min(1, from.width / projected));

  const tilt = plane ? ` ${plane.toString()}` : "";
  return `translate3d(${dx}px, ${dy}px, 0) scale(${scale})${tilt}`;
}

/** The plane's rotation on its own, with its translation dropped. */
function planeMatrix(group: Element | null): DOMMatrix | null {
  if (!group) return null;
  const raw = getComputedStyle(group).transform;
  if (!raw || raw === "none") return null;
  const m = new DOMMatrix(raw);
  m.m41 = 0;
  m.m42 = 0;
  m.m43 = 0;
  return m;
}

/**
 * How far down the screen the heading still is when the turn is over.
 *
 * Not the nav's height, which is what it started as: the spring lags the
 * scroll by design, so the wall reaches square a little after the number says
 * it should. Measured at 96 it was landing with the heading already tucked
 * under the header. This leaves the heading around a third of the way down the
 * screen at the formula's end, which puts the real one comfortably inside it.
 */
const HEAD_CLEARANCE = 240;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const FLIGHT_IN = 560;
const FLIGHT_OUT = 420;

export function Testimonials3D({ items }: { items: HomeTestimonialItem[] }) {
  const ref = useAnimateWhenVisible<HTMLElement>();
  /** Which testimonial is held forward, or null while the plane runs. */
  const [active, setActive] = React.useState<number | null>(null);
  /**
   * The flight is on when this is set: the pose the focused card starts from
   * and, unless the reader has stepped away with prev/next, returns to.
   */
  const [flying, setFlying] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  /** The card on the wall this one came out of. */
  const openerRef = React.useRef<HTMLElement | null>(null);
  /** That card's `figure`, hidden for as long as it is forward. */
  const sourceRef = React.useRef<HTMLElement | null>(null);
  const planeRef = React.useRef<DOMMatrix | null>(null);
  const cardRef = React.useRef<HTMLElement>(null);
  const groupRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const exitRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  /**
   * The wall unfurls as the section goes by: it arrives deep, turned away and
   * far back, and swings square to the viewer as it crosses the screen.
   *
   * Every angle is stated in CSS against `--p`; this writes that one number
   * per frame straight onto the node. A custom property is not a React
   * concern, and re-rendering forty cards on scroll would be.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /**
   * Scroll drives a spring, not the transform directly.
   *
   * A wall this size turning in lockstep with the wheel reads as a mechanism.
   * The spring gives it mass: it lags the scroll slightly and settles after it
   * stops, which is most of what makes the movement feel like an object rather
   * than a slider.
   */
  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });

  /**
   * Where in the pass the turn starts and finishes, as fractions of
   * `scrollYProgress`.
   *
   * Measured off the layout rather than tuned by hand, because the two ends
   * are stated in terms of what the reader can see: the turn begins as the
   * wall first appears at the bottom of the screen, and is over by the time
   * the heading reaches the nav — the wall has to be square while its own
   * title is still there to sit under. Both move with the viewport and with
   * whatever the heading wraps to, so both are read from the DOM.
   *
   * `offsetTop`, not `getBoundingClientRect`: the heading arrives on a
   * FadeUpReveal transform, which shifts its rect but not its layout box, and
   * measuring mid-reveal would put the end of the turn wherever the reveal
   * happened to be that frame.
   */
  const rangeRef = React.useRef({ from: 0.15, to: 0.5 });

  React.useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const measure = () => {
      const stage = section.querySelector(".t3d__stage") as HTMLElement | null;
      const head = section.querySelector(".t3d__head") as HTMLElement | null;
      if (!stage || !head) return;
      const span = section.offsetHeight + window.innerHeight;
      if (span <= 0) return;
      const from = clamp01(stage.offsetTop / span);
      const to = (head.offsetTop - HEAD_CLEARANCE + window.innerHeight) / span;
      rangeRef.current = { from, to: Math.min(1, Math.max(from + 0.05, to)) };
    };

    measure();
    window.addEventListener("resize", measure);
    // The heading's box settles after the webfont swaps, which moves the end
    // of the turn.
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [ref]);

  React.useEffect(() => {
    const write = (raw: number) => {
      const group = groupRef.current;
      const scene = sceneRef.current;
      const { from, to } = rangeRef.current;
      const p = clamp01((raw - from) / (to - from));
      if (group) group.style.setProperty("--p", String(p));
      // The frame opens over the first stretch of the turn, and is out of the
      // way well before the wall finishes it.
      if (scene) scene.style.setProperty("--u", String(clamp01(p / 0.3)));
    };
    write(smooth.get());
    return smooth.on("change", write);
  }, [smooth]);

  /**
   * Put the card on the wall back. Called when the flight home lands, and when
   * prev/next moves on to a quote that is not the one it came out of.
   */
  const releaseSource = React.useCallback(() => {
    if (sourceRef.current) sourceRef.current.style.visibility = "";
    sourceRef.current = null;
  }, []);

  const open = React.useCallback(
    (index: number, el: HTMLElement) => {
      if (exitRef.current !== null) {
        window.clearTimeout(exitRef.current);
        exitRef.current = null;
      }
      releaseSource();
      openerRef.current = el;
      // The card on the wall goes invisible for as long as it is forward, so
      // there is one of it rather than two: the one you clicked is the one
      // that flies. It keeps its space in the column — `visibility`, not
      // `display` — or the track would jump by a card's height.
      const figure = el.closest(".t3d-card") as HTMLElement | null;
      if (figure) {
        figure.style.visibility = "hidden";
        sourceRef.current = figure;
      }
      planeRef.current = planeMatrix(el.closest(".t3d__group"));
      setFlying(true);
      setActive(index);
    },
    [releaseSource],
  );

  const finishClose = React.useCallback(() => {
    exitRef.current = null;
    setActive(null);
    setFlying(false);
    releaseSource();
    // Back to the card it came from, so a keyboard reader is not dropped at
    // the top of the document.
    openerRef.current?.focus({ preventScroll: true });
    openerRef.current = null;
  }, [releaseSource]);

  const close = React.useCallback(() => {
    const el = cardRef.current;
    const source = sourceRef.current;
    // Straight back into the hole it left, measured now rather than at open:
    // the page may have scrolled since, and the wall's own position with it.
    if (!flying || reduced || !el || !source) {
      finishClose();
      return;
    }
    // Re-read the wall's angle: it has been turning under the reader the whole
    // time the card was forward, so the pose captured at open would put the
    // card back at a tilt the wall no longer has.
    planeRef.current = planeMatrix(source.closest(".t3d__group"));
    const back = pose(el, source.getBoundingClientRect(), planeRef.current);
    if (!back) {
      finishClose();
      return;
    }
    el.style.transition = `transform ${FLIGHT_OUT}ms cubic-bezier(0.55, 0, 0.85, 0.5), opacity ${FLIGHT_OUT}ms ease-in`;
    el.style.transform = back;
    el.style.opacity = "0";
    exitRef.current = window.setTimeout(finishClose, FLIGHT_OUT - 40);
  }, [flying, reduced, finishClose]);

  const step = React.useCallback(
    (delta: number) => {
      setActive((i) => (i === null ? i : (i + delta + items.length) % items.length));
      // A step is not a flight: the card stays where it is and only its
      // contents change — and it is no longer standing in for the card it came
      // out of, so that one goes back on the wall.
      setFlying(false);
      releaseSource();
    },
    [items.length, releaseSource],
  );

  // The flight out. Runs on the real element rather than inside the card so
  // the flight home can be driven from `close` with the same measurements.
  React.useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el || !flying || reduced) return;
    const source = sourceRef.current;
    if (!source) return;

    // Measure the resting layout, never a pose. If this effect runs twice —
    // StrictMode does exactly that in development — the second pass would
    // otherwise measure the card as the first pass had already shrunk it, come
    // out with `scale: 1`, and animate the card from where it already is to
    // where it already is. The flight silently does not happen.
    el.style.transition = "none";
    el.style.transform = "none";
    const start = pose(el, source.getBoundingClientRect(), planeRef.current);
    if (!start) return;

    el.style.transformOrigin = "center";
    el.style.transform = start;
    el.style.opacity = "0.6";

    // Two frames: one for the browser to take the start state, one to leave
    // it. A single rAF here lands often enough on the same style flush that
    // the transition is skipped and the card simply appears in place.
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform ${FLIGHT_IN}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms ease-out`;
        el.style.transform = "none";
        el.style.opacity = "1";
      });
    });
    return () => cancelAnimationFrame(id);
  }, [flying, reduced, active]);

  // A card left mid-flight — the section unmounting, or a fast route change —
  // must not leave a hole in the wall.
  React.useEffect(
    () => () => {
      if (exitRef.current !== null) window.clearTimeout(exitRef.current);
      if (sourceRef.current) sourceRef.current.style.visibility = "";
    },
    [],
  );

  // The stage takes the arrow keys while a card is forward. There is no
  // on-screen prev/next any more — the card is meant to be read on its own,
  // over the wall it came out of — but stepping still costs nothing to offer
  // to a keyboard. Bound to the dialog rather than the window so the page's
  // own scrolling is untouched the rest of the time.
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    },
    [close, step],
  );

  React.useEffect(() => {
    if (active === null) return;
    dialogRef.current?.focus({ preventScroll: true });
  }, [active]);

  const columns = React.useMemo(() => {
    if (items.length === 0) return [];
    return Array.from({ length: COLUMNS }, (_, c) =>
      Array.from({ length: PER_COLUMN }, (_, k) => {
        const index = (c + k * COLUMNS + Math.floor(c / 2)) % items.length;
        return { index, t: items[index] };
      }),
    );
  }, [items]);

  if (columns.length === 0) return null;

  const current = active === null ? null : items[active];

  return (
    <section
      ref={ref}
      className={`t3d prlx-testi-trigger${active !== null ? " t3d--focused" : ""}`}
    >
      <div className="prlx-testi-1" aria-hidden="true" />
      <div className="page-inner">
        <FadeUpReveal className="t3d__head">
          <span className="section-eyebrow">Testimonials</span>
          <h2 className="section-h2 text-gradient-silver">
            Hear from those who have tried and tested.
          </h2>
        </FadeUpReveal>
      </div>

      {/* The scene is masked at top and bottom and clips to itself; the
          focused card is a sibling of it inside this wrapper so it is neither
          faded by that mask nor cut off by that clip. */}
      <div className="t3d__stage">
        <div ref={sceneRef} className="t3d__scene">
          <div ref={groupRef} className="t3d__group">
            {columns.map((col, c) => (
              <div
                key={c}
                className={`t3d__col${c % 2 ? " t3d__col--rev" : ""}`}
                style={
                  { ["--dur" as string]: `${38 + c * 5}s` } as React.CSSProperties
                }
              >
                <div className="t3d__track">
                  {col.map((entry, i) => (
                    <Card
                      key={`a-${i}`}
                      t={entry.t}
                      index={entry.index}
                      onOpen={open}
                    />
                  ))}
                  <div aria-hidden="true" className="contents">
                    {col.map((entry, i) => (
                      <Card
                        key={`b-${i}`}
                        t={entry.t}
                        index={entry.index}
                        onOpen={open}
                        duplicate
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <span className="t3d__fade t3d__fade--t" aria-hidden="true" />
          <span className="t3d__fade t3d__fade--b" aria-hidden="true" />
          <span className="t3d__fade t3d__fade--l" aria-hidden="true" />
          <span className="t3d__fade t3d__fade--r" aria-hidden="true" />
        </div>

        {current ? (
          <div
            ref={dialogRef}
            className="t3d-focus"
            role="dialog"
            aria-label={`Testimonial from ${current.name}`}
            tabIndex={-1}
            onKeyDown={onKeyDown}
          >
            {/* Clicking off the card puts it back. A button, not a bare div
                with a handler, so it is announced and reachable. */}
            <button
              type="button"
              className="t3d-focus__scrim"
              aria-label="Close testimonial"
              onClick={close}
            />
            <div className="t3d-focus__shell">
              <figure ref={cardRef} className="t3d-focus__card">
                {/* Keyed on the quote so stepping through with prev/next
                    replays the content's own fade rather than swapping the
                    text in place. */}
                <div key={current.quote} className="t3d-focus__body">
                  <blockquote className="t3d-focus__quote">
                    “{current.quote}”
                  </blockquote>
                  <figcaption className="t3d-focus__who">
                    <span className="t3d-focus__avatar" aria-hidden="true">
                      {initials(current.name)}
                    </span>
                    <span className="t3d-card__meta">
                      <span className="t3d-focus__name">{current.name}</span>
                      <span className="t3d-focus__role">{role(current)}</span>
                    </span>
                  </figcaption>
                </div>
              </figure>
              <button
                type="button"
                className="t3d-focus__close"
                aria-label="Close testimonial"
                onClick={close}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
