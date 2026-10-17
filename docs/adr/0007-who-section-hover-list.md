# ADR 0007: "Who can use BalloAds?" as a hover list

- Status: Accepted (behind `whoHoverList`, on trial against ADRs 0003–0006)
- Date: 2026-10-17
- Deciders: George M'sapenda

## Context

This trial uses 21st.dev's "Services with animated hover modal": a stack of
large rows, one per service. Hovering a row brings up a photo card that
trails the pointer, with a round "View" cursor in front of it. The published
`Component` was a placeholder counter; the design is in its demo. The demo
uses GSAP's `quickTo` for the trailing motion. George asked for no GSAP and
no new libraries unless unavoidable (ADR 0006).

It is also the first trial with a place for the industry descriptions, which
George wanted to appear on hover.

## Decision

- **Component:** `app/components/ui/services-with-animated-hover-modal.tsx`
  (`ServicesHoverModal`), in this repo's component folder.
  - **Trailing motion:** `gsap.quickTo` is replaced by framer-motion
    springs on pointer motion values. The card is slowest, then the cursor,
    then its label, matching the demo's 0.8s, 0.5s and 0.45s durations.
  - **Positioning:** fixed, from `clientX` and `clientY`, rather than
    absolute from `pageX` and `pageY`. Page coordinates drift under Lenis,
    and the demo's absolute card attached to whichever ancestor happened to
    be positioned.
  - **The card:** a vertical strip of every image, shifted to the hovered
    row, as in the demo, so moving between rows slides from one image to
    the next.
  - **Descriptions:** each row's description is revealed under its title
    on hover or keyboard focus.
  - **Touch screens:** there is no hover, so the description and photo show
    inline in each row and the card is not rendered.
  - **Palette and clicks:** the site's palette (white type on navy, hairline
    rules, brand-blue cursor). Rows are buttons when `onSelect` is given.
- **Section:** `app/components/sections/WhoHoverSection.tsx`. A silver
  heading and the two lines sit at the top. Below them, one row per industry
  shows who it covers on the right (from `whoIndustryTags.ts`) and the
  description on hover. The cursor reads "Start", and clicking a row opens
  the waitlist, as the CTA below does.
- **Tags:** `TAGS` moved out of `WhoConnectedSection` into
  `whoIndustryTags.ts`. Importing it from a section module caused a
  module-order crash (`TAGS` was undefined at first read).
- **Flag:** `whoHoverList` (`NEXT_PUBLIC_FEATURE_WHO_HOVER_LIST`, aliases
  `hoverlist`, `whohoverlist`). It takes precedence over the earlier trials.
  It is on in Vercel Preview for `Landing` and off in Production.

## Consequences

- No dependency added.
- The pointer is hidden (`cursor: none`) over the rows on hover devices,
  because the "Start" circle stands in for it.
- On phones the section is long, because each row carries a full-width photo.
- Whichever design wins, delete the others' sections, components and flags,
  and mark their ADRs superseded.

## Update (2026-10-17): compact

George asked for the section at half the height. It now measures about 620px
at 1440px wide.

- Rows are shorter (py 3.5 on desktop) and titles smaller (up to 1.75rem).
- On hover, the description replaces the right-hand "who it covers" line
  in place. It no longer opens a new line under the title, so rows never
  change height. Only the title dims.
- The card is 280×240.
- Spacing around the head and the CTA is tighter.

Touch still shows the description and photo inline.
