# ADR 0004: "Who can use BalloAds?" as copy beside two tilted cards

- Status: Accepted (behind `whoCards`, on trial against ADR 0003)
- Date: 2026-10-15
- Deciders: George M'sapenda

## Context

ADR 0003 put the section on a curved row. We tried a wheel carousel next,
but it was dropped before shipping. This design is 21st.dev's "Financial
Hero": copy and a call to action on the left, two overlapping photo cards
tilted in opposite directions on the right, and a faint grid behind.

## Decision

- **Component:** `app/components/ui/hero-section.tsx` (`FinancialHero`), in
  this repo's component folder rather than `/components/ui`. TypeScript,
  Tailwind, `cn`, `framer-motion` and `lucide-react` were already present.
  Changes from the original:
  - **No shadcn `Button`**, so no `@radix-ui/react-slot` or
    `class-variance-authority` to install. The call to action is an `action`
    slot, and this section passes the site's `ShinyButton`, which opens the
    waitlist like every other call to action on the page.
  - **No shadcn theme tokens.** The grid is 6% white lines. It fades out
    through a radial mask rather than the demo's `from-background` overlay,
    because the page behind is a gradient and a solid overlay would band.
  - The heading is an `h2`, the entrance runs on scroll into view, the card
    box has its own height (both cards are absolute), and image alts are props.
- **Section:** `app/components/sections/WhoCardsSection.tsx`. The cards are
  SMEs & Corporations (front) and Education Institutions (back), from the
  shared `industries` list, cropped 4:5. All six industries are listed for
  screen readers.
- **Flag:** `whoCards` (`NEXT_PUBLIC_FEATURE_WHO_CARDS`, aliases `cards`,
  `whocards`). It takes precedence over `whoCurvedRow`. It's on in Vercel
  Preview for `Landing` and off in Production.

## Consequences

- Only two of the six industries are pictured. The copy names the rest.
- The cards move only on entrance and on hover, so this is the calmest of
  the three designs.
- Whichever design wins, delete the others' sections, components and flags,
  and mark their ADRs superseded.
