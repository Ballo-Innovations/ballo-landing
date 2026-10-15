# ADR 0006: "Who can use BalloAds?" as a circular split roll, without GSAP

- Status: Accepted (behind `whoRoll`, on trial against ADRs 0003–0005)
- Date: 2026-10-15
- Deciders: George M'sapenda

## Context

The next design for the section is 21st.dev's "Circular Split Roll"
(hyperiux). When the section reaches the top of the screen it pins. Scrolling
then turns the titles around one circle on the left and image cards around
another on the right, and the item at each circle's inner edge comes into
focus. The original is built on GSAP ScrollTrigger.

George asked for it without GSAP, and without any new library unless it is
unavoidable. The site already has framer-motion (scroll-linked motion values)
and Lenis, which moves the real scroll position.

## Decision

- **Component:** `app/components/ui/circular-split-roll.tsx`. The positioning
  and focus maths are the original's. The machinery is replaced:
  - **Pin:** a CSS `position: sticky` stage inside a section sized
    `100vh + sectionHeight% × items`, instead of ScrollTrigger's pin and
    pin-spacer.
  - **Progress:** framer-motion's `useScroll` over the section, smoothed
    by `useSpring` in place of `scrub`. Lenis needs no bridge, because it
    scrolls the window natively.
  - **Per-frame updates:** `useMotionValueEvent` writes transforms,
    opacity and z-index straight to the nodes, as `gsap.set` did, with no
    React re-render per frame.
  - **Helpers:** `gsap.utils` clamp, mapRange and interpolate became
    one-line helpers.
  - **Other changes:** no shadcn tokens (white type, navy card placeholder),
    the demo's embedded base64 images are removed (`items` is required),
    and the scroll length is 70% of a viewport per item.
- **Fallback:** under 1025px wide, and under reduced motion, the section
  renders the original's static grid of photos and titles. The orbit is
  `aria-hidden` and the grid always carries the content for screen readers.
- **Section:** `app/components/sections/WhoRollSection.tsx`. The heading and
  copy scroll in, then the roll pins, then "Start your first campaign"
  follows. Each item shows the title and photo only, from the shared
  `industries` list.
- **Flag:** `whoRoll` (`NEXT_PUBLIC_FEATURE_WHO_ROLL`, aliases `roll` and
  `whoroll`). It takes precedence over the earlier trials. It is on in Vercel
  Preview for `Landing` and off in Production.

## Consequences

- No dependency added. A GSAP install was started and fully reverted.
- The pin adds about 5 viewports of scroll on desktop (six items × 70% plus
  one). Tune `sectionHeight` if it feels long.
- Nothing above the section may set `overflow: hidden` or `auto`, or the
  sticky stage stops pinning (see the note in home.css).
- At 1440px the outer titles run off the left edge mid-orbit. That matches
  the original's composition (`columnOffsetPx`).

## Update (2026-10-15): resting and decoration

George found the first version too plain. Two changes:

- **Resting on each item (`hold`, default 0.45):** the original rolls
  continuously, so a title and its card only line up for an instant and
  usually look mismatched. Now about 45% of each item's scroll holds that
  pair together at the centre, then a smoothstep carries the roll to the
  next item. `focusPhase` defaults to whatever puts an item exactly in focus
  at rest (`0.75 × items mod 1`).
- **Decoration (`decorated`, default true):**
  - dashed rings along both orbits;
  - a soft blue and cyan light behind the two focus points;
  - a cyan beam joining the focused title to its card;
  - silver gradient titles, each with a cyan 01–06 number that fades in with
    focus;
  - a glass rim on each card, plus a blue glow that grows with focus. The
    focus value is written per frame as `--f`.
  - a "03 ─── 06" counter with progress ticks.

  All of it is static CSS, or driven by the same per-frame values: no new
  animations and no new dependencies.
