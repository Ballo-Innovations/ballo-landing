# ADR 0008: "Who can use BalloAds?" as a coverflow

- Status: Accepted (behind `whoCoverflow`, on trial against ADRs 0003–0007)
- Date: 2026-10-17
- Deciders: George M'sapenda

## Context

This trial uses 21st.dev's "Coverflow Carousel": square cards on a raked 3D
ring that loops. The neighbours tilt away and recede, and a caption sits
under the front card. It needs only `lucide-react`, which is already
installed.

## Decision

- **Component:** `app/components/ui/coverflow-carousel.tsx`, in this repo's
  component folder. The behaviour is unchanged: drag, flick (capped at two
  cards), arrow keys, and looping without cloned nodes, all painted straight
  to the DOM. Changes:
  - **Colours:** the shadcn tokens (`bg-muted`, `text-foreground`,
    `bg-background`, `ring-ring`, `muted-foreground`) are replaced by the
    site's navy and white.
  - **Caption fade:** `animate-in fade-in` (tailwindcss-animate, which this
    repo does not have) is replaced by `.cf-caption-in`, a small CSS fade in
    home.css that is off under reduced motion.
  - **Caption spacing:** the meta list is spaced more tightly, and the
    caption is `aria-live`.
  - **Clicking a side card** brings it to the front.
- **Section:** `app/components/sections/WhoCoverflowSection.tsx`. A centred
  silver heading and two lines sit above the coverflow (cards 150–230px wide,
  with arrows and dots), with "Start your first campaign" below it. The
  caption shows the industry name, its description, and two meta rows, "For"
  and "Example", from `whoIndustryTags.ts`.
- **Flag:** `whoCoverflow` (`NEXT_PUBLIC_FEATURE_WHO_COVERFLOW`, aliases
  `coverflow` and `whocoverflow`). It takes precedence over the earlier
  trials. It is on in Vercel Preview for `Landing` and off in Production.

## Consequences

- No dependency added.
- The section is about 760px tall at 1440px wide.
- With six cards, at most five are visible at once. The far pair fade out
  at the half-turn, where they wrap round the ring.
- Whichever design wins, delete the others' sections, components and flags,
  and mark their ADRs superseded.
