# ADR 0003: "Who can use BalloAds?" as a curved row

- Status: Accepted (behind `whoCurvedRow`)
- Date: 2026-10-15
- Deciders: George M'sapenda

## Context

The section was copy on the left beside two counter-scrolling rows of square
industry tiles (`WhoCinematicSection`). We want it to look like 21st.dev's
"Tilted Grid Hero": one row of images streaming round the inside of a
cylinder, flat in the centre and bending toward the viewer at the ends.

## Decision

- **Component:** `app/components/ui/tilted-grid-hero.tsx`, the 21st.dev
  component with two changes. It goes in `app/components/ui`, this repo's
  component folder, rather than `/components/ui`. No shadcn setup is needed:
  TypeScript, Tailwind 4 and `cn` (`lib/utils.ts`) already exist.
  - `bg-muted` is replaced by an inline placeholder colour, since there is no
    shadcn theme.
  - Images take an optional `label`. It is rendered in every strip, offset
    like the image, so the caption bends with the tile.
- **Section:** `app/components/sections/WhoCurvedSection.tsx`. The heading,
  both lines and "Start your first campaign" are centred above a full-width
  band. The six industries and their copy are imported from
  `WhoCinematicSection`, so the two can't drift, and the photos are
  re-cropped 16:9 at 960px. The band is `aria-hidden`, so the industries are
  also listed in a visually-hidden list.
- **Flag:** `whoCurvedRow` (`NEXT_PUBLIC_FEATURE_WHO_CURVED_ROW`, aliases
  `curved`, `whocurved`). When it's on, this section wins; otherwise
  `whoStackSpread` / `WhoCinematicSection` render as before. It's on in
  Vercel Preview for the `Landing` branch, so preview.balloads.com shows it.
  It's off in Production.

## Consequences

- Motion is CSS transforms only. Reduced motion pauses the row as a still.
- Each tile is 16 strips, each with its own `<img>` (the same URL, so it is
  fetched once). That's about 16 × 6–8 image elements on the page. Fine at
  this size, but don't raise `SLICES` casually.
- Uses `<img>`, not `next/image`. The six Unsplash URLs are already sized.
- Industry names no longer pause on hover. The row keeps moving and each
  name stays on screen for several seconds.
- To retire the old sections, ship the flag to production first, then delete
  `WhoCinematicSection`'s marquee rows and `WhoStackSection`. Keep the
  `industries` list.
