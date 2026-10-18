"use client";

import * as React from "react";

import type { HomeTestimonialItem } from "@/app/HomeClient";
import { clamp01, easeInOut, lerp } from "@/lib/cinematic";
import { AFTER_IN, ROW_TURN, THEN_IN } from "../sections/BrutusSection";
import { HANDOFF, PHONE_HANDOFF } from "./HeroSideExit";
import {
  INDUSTRY_COUNT,
  INDUSTRY_NAMES,
  JourneyScreens,
  type JourneyScreenId,
} from "./JourneyScreens";
import { Phone3D } from "./Phone3D";

/**
 * The phone, for the rest of the page (ADR 0017).
 *
 * The hero's pin owns the phone up to the Brutus film. At `HANDOFF` this one
 * takes over in the same landscape pose, playing the same film from the same
 * point, and the hero's is hidden (`data-phone-handoff` on `.cinematic-hero`).
 * From there it is a fixed layer that travels with the scroll, pose to pose:
 *
 *   - Who: back to portrait, in the middle of the curved row as its active
 *     slide, the screen turning over one campaign post per industry as the
 *     row turns.
 *   - "Backed by" / "Trusted by": aside, beside the logos, on a lock screen of
 *     glass notifications. A corner miniature where there is no aside.
 *   - Testimonials: in front of the wall, the quotes arriving as a chat. This
 *     is where the journey ends: once the section is on its way out, the
 *     phone rides up off the screen with it. Nothing below it has the phone.
 *
 * A pose is where the phone's centre is (viewport px), how tall it is in
 * portrait (px) and its turn. Each stop pins a pose to a scroll position
 * measured off the sections themselves, so the timeline follows the page's
 * layout rather than a table of numbers; between stops the pose eases from
 * one to the next. One transform written per frame, nothing else.
 *
 * Not rendered under reduced motion: the hero is static there, and so is
 * everything after it.
 */

interface Pose {
  x: number;
  y: number;
  /** Portrait height on screen; landscape, this is the width. */
  h: number;
  r: number;
}

interface Stop {
  y: number;
  pose: () => Pose;
}

interface Timeline {
  start: number;
  /** Where it has ridden off the top of the screen with the testimonials. */
  end: number;
  stops: Stop[];
  /** Scroll positions where the screen changes, in order. */
  cues: Array<[y: number, screen: JourneyScreenId]>;
  /** The scroll span the industry posts turn over. */
  row: [number, number];
}

function docTop(el: Element) {
  return el.getBoundingClientRect().top + window.scrollY;
}

const mid = (a: number, b: number) => (a + b) / 2;

export function JourneyPhone({
  film,
  testimonials,
}: {
  film: { src: string; poster: string };
  testimonials: HomeTestimonialItem[];
}) {
  const layerRef = React.useRef<HTMLDivElement>(null);
  const rigRef = React.useRef<HTMLDivElement>(null);
  const stackRef = React.useRef<HTMLDivElement>(null);
  const postsRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const timeline = React.useRef<Timeline | null>(null);
  /** The scene's portrait height at scale 1, and the rig's layout box. */
  const base = React.useRef({ h: 1, w: 0, hh: 0 });
  const shown = React.useRef(false);
  const [upright, setUpright] = React.useState(false);

  const place = React.useCallback(() => {
    const t = timeline.current;
    const layer = layerRef.current;
    const rig = rigRef.current;
    if (!t || !layer || !rig) return;
    const y = window.scrollY;
    const hero = document.querySelector<HTMLElement>(".cinematic-hero");

    hero?.toggleAttribute("data-phone-handoff", y >= t.start);
    const visible = y >= t.start && y < t.end;
    if (visible !== shown.current) {
      shown.current = visible;
      layer.style.visibility = visible ? "visible" : "hidden";
      // Pick the film up where the hero's left it, so the hand-off is the
      // same frame rather than a cut back to the start.
      const v = videoRef.current;
      const from = PHONE_HANDOFF.video;
      if (
        visible &&
        v &&
        from &&
        Math.abs(v.currentTime - from.currentTime) > 0.25
      ) {
        try {
          v.currentTime = from.currentTime;
        } catch {
          // Not seekable yet; it starts from the top instead.
        }
      }
    }
    if (!visible) {
      videoRef.current?.pause();
      return;
    }

    // Pose: ease between the two stops either side of the scroll.
    const { stops } = t;
    let i = 0;
    while (i < stops.length - 1 && y >= stops[i + 1].y) i++;
    let pose: Pose;
    if (i >= stops.length - 1) {
      pose = stops[stops.length - 1].pose();
    } else {
      const a = stops[i];
      const b = stops[i + 1];
      const k = easeInOut(clamp01((y - a.y) / Math.max(1, b.y - a.y)));
      const pa = a.pose();
      const pb = k > 0 ? b.pose() : pa;
      pose = {
        x: lerp(pa.x, pb.x, k),
        y: lerp(pa.y, pb.y, k),
        h: lerp(pa.h, pb.h, k),
        r: lerp(pa.r, pb.r, k),
      };
    }
    const { h, w, hh } = base.current;
    rig.style.transform =
      `translate3d(${(pose.x - w / 2).toFixed(1)}px, ${(pose.y - hh / 2).toFixed(1)}px, 0) ` +
      `rotate(${pose.r.toFixed(2)}deg) scale(${(pose.h / h).toFixed(4)})`;
    setUpright(Math.abs(pose.r) < 12);

    // Screen.
    let screen: JourneyScreenId = "film";
    for (const [at, id] of t.cues) if (y >= at) screen = id;
    const stack = stackRef.current;
    if (stack && stack.dataset.screen !== screen) stack.dataset.screen = screen;
    // Clear glass while the curved row is behind it.
    layer.toggleAttribute("data-glass", screen === "who");
    const v = videoRef.current;
    if (v) {
      if (screen === "film" && v.paused) void v.play().catch(() => {});
      else if (screen !== "film" && !v.paused) v.pause();
    }

    // Which industry's campaign is up. The screen is glass during Who, so
    // it names the tile actually showing through it: the one nearest the
    // phone's centre. Off the curved row (another Who variant, or before it
    // has laid out), it turns over with the scroll instead.
    const posts = postsRef.current;
    if (posts) {
      const u = clamp01((y - t.row[0]) / Math.max(1, t.row[1] - t.row[0]));
      let n = Math.min(INDUSTRY_COUNT - 1, Math.floor(u * INDUSTRY_COUNT));
      if (screen === "who") {
        let best = Infinity;
        document
          .querySelectorAll<HTMLElement>('.who-curved__band [class*="tgh-t-"]')
          .forEach((tile) => {
            const r = tile.getBoundingClientRect();
            if (!r.width) return;
            const d = Math.abs(r.left + r.width / 2 - pose.x);
            if (d >= best) return;
            const name = tile.querySelector(".tgh-label span")?.textContent;
            const j = name ? INDUSTRY_NAMES.indexOf(name) : -1;
            if (j >= 0) {
              best = d;
              n = j;
            }
          });
      }
      const idx = String(n);
      if (posts.dataset.index !== idx) {
        posts.dataset.index = idx;
        posts.querySelectorAll<HTMLElement>(".jp-post").forEach((el, j) => {
          el.dataset.pos = j === n ? "active" : j < n ? "prev" : "next";
        });
        posts.parentElement
          ?.querySelectorAll<HTMLElement>(".jp-dots > span")
          .forEach((d, j) => d.toggleAttribute("data-on", j === n));
      }
    }
  }, []);

  const survey = React.useCallback(() => {
    const rig = rigRef.current;
    const scene = rig?.querySelector<HTMLElement>(".phone3d-scene");
    const hero = document.querySelector<HTMLElement>(".cinematic-hero");
    const track = document.querySelector<HTMLElement>(".brutus-stage-track");
    const reviews = document.querySelector<HTMLElement>(".t3d");
    if (!rig || !scene || !hero || !track) return;

    const prev = rig.style.transform;
    rig.style.transform = "none";
    const sr = scene.getBoundingClientRect();
    rig.style.transform = prev;
    base.current = {
      h: sr.height || 1,
      w: rig.offsetWidth,
      hh: rig.offsetHeight,
    };

    const W = window.innerWidth;
    const H = window.innerHeight;
    const narrow = W <= 900;

    const heroY = (p: number) => docTop(hero) + p * (hero.offsetHeight - H);
    // The Brutus track runs from its top entering at the bottom of the screen
    // to its bottom reaching it (`offset={["start end", "end end"]}`).
    const trackTop = docTop(track);
    const stageY = (f: number) => trackTop - H + f * track.offsetHeight;

    const handoff = (): Pose => {
      const p = PHONE_HANDOFF.pose;
      return p
        ? { x: p.cx, y: p.cy, h: p.w, r: -90 }
        : { x: W / 2, y: H * 0.38, h: W * 0.6, r: -90 };
    };
    // The active slide of the curved row, which runs across the lower middle
    // of the stage under the Who heading.
    const whoHeading = document.querySelector<HTMLElement>(".who-curved__h2");
    const whoRow = document.querySelector<HTMLElement>(".who-curved__band");
    const who = (): Pose => {
      // As large as the screen allows below the heading: on desktop down to
      // just above the bottom edge. Placed so the row of cards crosses the
      // upper part of the glass (40% down), above the campaign card. Measured
      // live, because the stage is still settling when the phone arrives.
      const hr = whoHeading?.getBoundingClientRect();
      const top0 = (hr && hr.height ? hr.bottom : H * 0.2) + 18;
      const bottom = H - 22;
      const h = Math.max(
        H * 0.36,
        Math.min(bottom - top0, narrow ? H * 0.52 : 760),
      );
      const rr = whoRow?.getBoundingClientRect();
      const rowY = rr && rr.height ? rr.top + rr.height / 2 : top0 + h * 0.4;
      const top = Math.min(Math.max(rowY - h * 0.4, top0), bottom - h);
      return { x: W / 2, y: top + h / 2, h, r: 0 };
    };
    // Where a section's content runs the full width and is meant to be read,
    // the phone waits in the bottom-left corner as a miniature.
    const mini = (): Pose => ({ x: 62, y: H - 128, h: 170, r: -6 });
    // Beside the logos where there is room; they sit in a ~46rem column.
    const margin = (W - 760) / 2;
    const trusted = (): Pose =>
      margin >= 230
        ? {
            x: W - margin / 2,
            y: H * 0.55,
            h: Math.min(H * 0.62, margin * 1.75),
            r: 5,
          }
        : mini();
    // Low enough to clear the section's heading once it has scrolled up.
    const reviewsPose = (): Pose =>
      narrow
        ? mini()
        : { x: W / 2, y: H * 0.64, h: Math.min(H * 0.5, 460), r: -4 };
    const start = heroY(HANDOFF);
    const whoIn = stageY(AFTER_IN[1]);
    const rowEnd = stageY(ROW_TURN[1]);
    const trustedIn = stageY(THEN_IN[1]);
    const release = stageY(1);
    const reviewsTop = reviews ? docTop(reviews) : release + H;
    // It stays aside while the testimonials heading scrolls up past the middle,
    // then comes in front of the wall.
    const reviewsAside = Math.max(release + 1, reviewsTop);
    const reviewsIn = reviewsAside + H * 0.2;
    const reviewsHold = reviewsIn + H * 0.2;
    // Held until the section starts to leave, then carried off with it: from
    // here the phone moves with the page, pixel for pixel. The corner
    // miniature would ride up across the CTA instead, so it slides out to the
    // left.
    const reviewsH = reviews ? reviews.offsetHeight : H;
    const rideStart = Math.max(reviewsHold + 1, reviewsTop + reviewsH - H);
    const rest = reviewsPose();
    const leave: Stop = narrow
      ? { y: rideStart + H * 0.3, pose: () => ({ ...mini(), x: -160, r: -14 }) }
      : {
          y: rideStart,
          pose: () => ({ ...rest, y: rest.y - (window.scrollY - rideStart) }),
        };
    const end = narrow ? leave.y + 1 : rideStart + rest.y + rest.h * 0.6 + 40;
    const stops: Stop[] = [
      { y: start, pose: handoff },
      { y: whoIn, pose: who },
      { y: rowEnd, pose: who },
      { y: trustedIn, pose: trusted },
      { y: release, pose: trusted },
      { y: reviewsAside, pose: trusted },
      { y: reviewsIn, pose: reviewsPose },
      { y: reviewsHold, pose: reviewsPose },
      ...(narrow ? [{ y: rideStart, pose: reviewsPose }] : []),
      leave,
    ];
    // Never let a later stop sit above an earlier one, whatever the layout.
    for (let i = 1; i < stops.length; i++) {
      stops[i].y = Math.max(stops[i].y, stops[i - 1].y + 1);
    }

    timeline.current = {
      start,
      end,
      stops,
      cues: [
        [mid(start, whoIn), "who"],
        [mid(rowEnd, trustedIn), "lock"],
        [mid(reviewsAside, reviewsIn), "reviews"],
      ],
      row: [stageY(ROW_TURN[0]), rowEnd],
    };
  }, []);

  React.useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };
    const resurvey = () => {
      survey();
      place();
    };
    resurvey();
    // The film starts loading once the hero's act is near, not at page load.
    const v = videoRef.current;
    const preload = () => {
      const t = timeline.current;
      if (v && t && window.scrollY > t.start - window.innerHeight * 2) {
        v.preload = "auto";
        window.removeEventListener("scroll", preload);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", preload, { passive: true });
    window.addEventListener("resize", resurvey);
    // Sections settle their heights as fonts and CMS content land.
    const ro = new ResizeObserver(resurvey);
    ro.observe(document.body);
    void document.fonts?.ready.then(resurvey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", preload);
      window.removeEventListener("resize", resurvey);
      ro.disconnect();
      document
        .querySelector(".cinematic-hero")
        ?.removeAttribute("data-phone-handoff");
    };
  }, [place, survey]);

  return (
    <div
      ref={layerRef}
      className="journey-phone"
      aria-hidden="true"
      // Scenery: the onboarding mock's button must not take keyboard focus.
      inert
      style={{ visibility: "hidden" }}
    >
      <div ref={rigRef} className="journey-phone__rig">
        <Phone3D interactive={upright}>
          <JourneyScreens
            stackRef={stackRef}
            postsRef={postsRef}
            videoRef={videoRef}
            film={film}
            testimonials={testimonials}
          />
        </Phone3D>
      </div>
    </div>
  );
}
