"use client";

import * as React from "react";
import Image from "next/image";

import {
  ContainerScroll,
  ContainerSticky,
  useContainerScrollContext,
} from "../ui/AnimatedVideoOnScroll";
import { StoreBadge } from "../ui/StoreBadge";
import { useWaitlist } from "../waitlist/WaitlistProvider";
import { at, easeInOut, easeOut, lerp, staggered, type Range } from "@/lib/cinematic";

/**
 * "Who can use BalloAds?", on the cinematic panel.
 *
 * The panel is the 21st.dev cinematic-hero card, moved down here from the hero
 * and given this section's content: it rises from below the pin, opens out to
 * full bleed, the heading and the six industry tiles arrive, and then it pulls
 * back to a framed panel and hands over to the closing call to action.
 *
 * The tiles are the same markup and the same `.who-tile*` styling the section
 * had as a plain bento grid. What changed is what drives their entrance: it was
 * `FadeUpReveal`, one IntersectionObserver per tile keyed off the viewport, and
 * that cannot work inside a pin — the tiles are in view from the pin's first
 * frame, so every reveal would fire at once before the card had even opened.
 * They are staggered off the panel's own timeline instead.
 */

// Six tiles on an even 3-column grid, two rows of three. No spans: the grid's
// per-column entrance keys off nth-child, which only reads correctly when
// every tile occupies one column.
const useCases = [
  {
    id: "sme",
    num: "01",
    text: "SMEs & Corporations",
    subtext: "Promote products, services, and offers to your ideal customers.",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1100&auto=format&fit=crop&q=70",
  },
  {
    id: "finance",
    num: "02",
    text: "Financial Institutions",
    subtext: "Send loan approvals, transaction updates, and targeted offers.",
    src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=620&auto=format&fit=crop&q=70",
  },
  {
    id: "nonprofit",
    num: "03",
    text: "Nonprofits & Government",
    subtext: "Spread awareness and reach communities with mass communication.",
    src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=620&auto=format&fit=crop&q=70",
  },
  {
    id: "retail",
    num: "04",
    text: "Retail & E-commerce",
    subtext: "Drive sales, customer loyalty, and engagement at scale.",
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=620&auto=format&fit=crop&q=70",
  },
  {
    id: "healthcare",
    num: "05",
    text: "Healthcare & Clinics",
    subtext: "Send appointment reminders and targeted health campaigns.",
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=620&auto=format&fit=crop&q=70",
  },
  {
    id: "education",
    num: "06",
    text: "Education Institutions",
    subtext: "Notify students, parents, and staff with timely updates.",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1100&auto=format&fit=crop&q=70",
  },
];

/* ── The timeline ─────────────────────────────────────────────────────────
   Fractions of the pinned scroll, in order. Overlaps are intentional: each
   move starts before the last has finished, which is what keeps the sequence
   continuous rather than stepped. */

/** The panel rises from below the stage. */
const RISE: Range = [0, 0.16];
/** ...and opens out to full bleed. */
const EXPAND: Range = [0.14, 0.28];
/** The heading arrives. */
const HEAD_IN: Range = [0.24, 0.38];
/** The six tiles assemble in reading order. */
const TILES_IN: Range = [0.3, 0.54];
/** Everything on the panel leaves again. */
const CONTENT_OUT: Range = [0.68, 0.78];
/** The panel pulls back to a framed card. */
const PULLBACK: Range = [0.72, 0.86];
/** The closing call to action. */
const CTA_IN: Range = [0.75, 0.89];
/** And the panel exits upward. */
const EXIT: Range = [0.9, 1];

/** Gap between one tile's arrival and the next. */
const TILE_STAGGER = 0.11;

/** Shorter than the hero's sequence was: fewer moves, less to hold for. */
const TRACK_CLASS = "h-[500vh]";

/** Resting size of the panel, before it opens and after it pulls back. */
const PANEL_REST = { w: 88, h: 86, radius: 40 };

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);
  return reduced;
}

function IndustryTiles({ animated }: { animated: boolean }) {
  return (
    <ul className="who-bento">
      {useCases.map((item, i) => (
        <li key={item.id} className="who-bento-cell">
          {/* The wrapper only starts hidden when something is going to reveal
              it. On the reduced-motion path nothing writes styles, so an inline
              opacity of 0 would simply hide the grid. */}
          <div className="ch-anim-tile" style={animated ? { opacity: 0 } : undefined}>
            <article className="who-tile">
              <Image
                src={item.src}
                alt={item.text}
                fill
                sizes="(max-width: 700px) 92vw, (max-width: 1024px) 46vw, 380px"
                className="who-tile-img"
                priority={i < 3}
              />
              {/* The pane over the photo. A flat tint plus an inset rim, not a
                  backdrop-filter: six filtered backdrops on six tiles the
                  entrance is transforming is what dropped frames here before.
                  See .who-tile-liquid in home.css. */}
              <span className="who-tile-liquid" aria-hidden="true" />
              <div className="who-tile-body">
                <span className="who-tile-num" aria-hidden="true">
                  {item.num}
                </span>
                <h3 className="who-tile-title">{item.text}</h3>
                <p className="who-tile-sub">{item.subtext}</p>
              </div>
            </article>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Everything that moves.
 *
 * One scroll callback writing styles directly, rather than a few dozen
 * `useTransform` chains: eight overlapping ranges across four element groups
 * all derive from a single number, and writing them in one pass keeps the
 * ordering legible and the per-frame cost to one function call.
 */
function Panel({ onPrimaryAction }: { onPrimaryAction: () => void }) {
  const { scrollYProgress } = useContainerScrollContext();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const headRef = React.useRef<HTMLDivElement>(null);
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const tilesRef = React.useRef<HTMLElement[]>([]);

  React.useEffect(() => {
    const root = panelRef.current;
    if (!root) return;
    tilesRef.current = Array.from(root.querySelectorAll<HTMLElement>(".ch-anim-tile"));
  }, []);

  const place = React.useCallback(() => {
    const panel = panelRef.current;
    const stage = panel?.parentElement;
    if (!panel || !stage) return;

    const p = scrollYProgress.get();
    const vh = stage.clientHeight;

    /* The panel: rises, opens, pulls back, exits. Width and height are
       percentages of the stage so the open state is exactly full bleed. */
    const rise = easeInOut(at(p, RISE));
    const expand = easeInOut(at(p, EXPAND));
    const pull = easeInOut(at(p, PULLBACK));
    const exit = easeOut(at(p, EXIT));

    // Open, then closed again: the pullback runs the expansion backwards.
    const open = expand * (1 - pull);
    const y = lerp(vh + 200, 0, rise) - exit * (vh + 300);

    panel.style.width = `${lerp(PANEL_REST.w, 100, open)}%`;
    panel.style.height = `${lerp(PANEL_REST.h, 100, open)}%`;
    panel.style.borderRadius = `${lerp(PANEL_REST.radius, 0, open).toFixed(1)}px`;
    panel.style.transform = `translate(-50%, -50%) translate3d(0, ${y.toFixed(1)}px, 0)`;

    const out = at(p, CONTENT_OUT);

    /* Heading. */
    const head = easeOut(at(p, HEAD_IN));
    if (headRef.current) {
      headRef.current.style.opacity = String(head * (1 - out));
      headRef.current.style.transform =
        `translate3d(0, ${(lerp(36, 0, head) - 30 * out).toFixed(1)}px, 0)`;
    }

    /* Tiles, in reading order. Each rises out of depth and settles. */
    const tilesT = at(p, TILES_IN);
    const tiles = tilesRef.current;
    tiles.forEach((el, i) => {
      const t = easeOut(staggered(tilesT, i, tiles.length, TILE_STAGGER));
      el.style.opacity = String(t * (1 - out));
      // 28px, the offset this grid's reveal used before the panel existed. It
      // was 52, which is more than the slack between the grid's bottom row and
      // the panel's edge: mid-stagger the last tiles poked past it and were
      // clipped by the panel's overflow.
      el.style.transform =
        `translate3d(0, ${(lerp(28, 0, t) - 24 * out).toFixed(1)}px, 0) scale(${lerp(0.94, 1, t).toFixed(4)})`;
      el.style.willChange = t > 0.001 && t < 0.999 ? "transform, opacity" : "auto";
    });

    /* The closing CTA, arriving as the panel pulls back. */
    const cta = easeInOut(at(p, CTA_IN));
    if (ctaRef.current) {
      ctaRef.current.style.opacity = String(cta);
      ctaRef.current.style.transform = `scale(${lerp(0.86, 1, cta).toFixed(4)})`;
      ctaRef.current.style.filter = cta < 0.999 ? `blur(${(14 * (1 - cta)).toFixed(1)}px)` : "";
      ctaRef.current.style.pointerEvents = cta > 0.9 ? "auto" : "none";
    }
  }, [scrollYProgress]);

  React.useEffect(() => {
    const unsub = scrollYProgress.on("change", place);
    place();
    window.addEventListener("resize", place);
    return () => {
      unsub();
      window.removeEventListener("resize", place);
    };
  }, [scrollYProgress, place]);

  /* Pointer: the panel's sheen follows the cursor. */
  React.useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame: number | null = null;
    const onMove = (e: MouseEvent) => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const panel = panelRef.current;
        if (!panel) return;
        const r = panel.getBoundingClientRect();
        panel.style.setProperty("--ch-mx", `${e.clientX - r.left}px`);
        panel.style.setProperty("--ch-my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={panelRef} className="ch-card ch-panel">
      <div className="ch-sheen" aria-hidden="true" />

      <div className="ch-panel-inner">
        <div ref={headRef} className="who-stage-head ch-panel-head" style={{ opacity: 0 }}>
          <span className="who-eyebrow-tag">Industries We Serve</span>
          <h2 className="who-redesign-h2">Who can use BalloAds?</h2>
        </div>

        <IndustryTiles animated />
      </div>

      {/* The CTA rides the panel, so the pullback frames it. */}
      <div ref={ctaRef} className="ch-cta" style={{ opacity: 0 }}>
        <h2 className="ch-cta-heading ch-silver">Start your first campaign.</h2>
        <p className="ch-cta-body">
          Whichever industry you are in, reaching customers takes one campaign
          and one dashboard.
        </p>
        <div className="ch-cta-actions">
          <button type="button" onClick={onPrimaryAction} className="btn-primary group">
            Get Started
          </button>
          <StoreBadge store="apple" />
          <StoreBadge store="play" />
        </div>
      </div>
    </div>
  );
}

export function WhoCinematicSection() {
  const reduced = useReducedMotion();
  const { openWaitlist } = useWaitlist();

  // No pin and no sequence: the section is the bento grid it always was, in
  // normal flow, with its own entrance handled by CSS.
  if (reduced) {
    return (
      <section className="who-outer">
        <div className="who-inner">
          <div className="who-stage-head">
            <span className="who-eyebrow-tag">Industries We Serve</span>
            <h2 className="who-redesign-h2">Who can use BalloAds?</h2>
          </div>
          <IndustryTiles animated={false} />
        </div>
      </section>
    );
  }

  return (
    <ContainerScroll className={`cinematic-hero ${TRACK_CLASS}`}>
      <ContainerSticky className="ch-stage h-svh w-full">
        <Panel onPrimaryAction={openWaitlist} />
      </ContainerSticky>
    </ContainerScroll>
  );
}
