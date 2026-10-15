# ADR 0005: "Who can use BalloAds?" as a connected carousel

- Status: Accepted (behind `whoConnected`, on trial against ADRs 0003 and 0004)
- Date: 2026-10-15
- Deciders: George M'sapenda

## Context

This is the third design for the section. It's 21st.dev's "Connected
Carousel": one large card in the centre, with smaller cards on each side
joined to it by notch-shaped connectors. It autoplays, with a progress bar
in the tabs underneath.

## Decision

- **Component:** `app/components/ui/connected-carousel.tsx`
  (`CalendlyCarousel`), in this repo's component folder rather than
  `/components/ui`. Next, framer-motion, TypeScript, Tailwind and `cn` were
  already present, so there is nothing to install. Changes from the original:
  - **No shadcn theme tokens.** One `PALETTE` of the site's navy replaces
    card, secondary, muted and foreground. The card colour also fills the
    connectors, so they always match.
  - **`quoted` (default true).** The original renders a serif quotation. We
    have no customer quotes for these industries, and inventing them would be
    fake testimonials. This section passes `quoted={false}`, so each card's
    description is plain copy.
  - **Labels.** `ariaLabel` replaces the hard-coded "Customer stories". Each
    tab is labelled with its card's title rather than "Use case N".
  - **Images.** Images go through Next's optimiser with `sizes`; Unsplash is
    allowed in `next.config`. The original set `unoptimized`.
  - **Autoplay.** It pauses when the carousel is off-screen, when the tab is
    hidden, and under reduced motion. The original's requestAnimationFrame
    loop ran forever.
- **Section:** `app/components/sections/WhoConnectedSection.tsx`. Heading and
  copy above, carousel, then "Start your first campaign" below. There is one
  card per industry: the name as the title, the existing one-line
  description, and two tags (who it's for, and an example message). The tags
  are new copy and live in `TAGS` in that file.
- **Flag:** `whoConnected` (`NEXT_PUBLIC_FEATURE_WHO_CONNECTED`, aliases
  `connected`, `whoconnected`). It takes precedence over `whoCards` and
  `whoCurvedRow`. It's on in Vercel Preview for `Landing` and off in
  Production.

## Consequences

- The section is tall: a 513px card on desktop, and 490px on phones.
- The example messages ("a loan-approval SMS", …) are marketing copy we
  wrote, not customer claims. Review them like any other copy.
- Whichever design wins, delete the others' sections, components and flags,
  and mark their ADRs superseded.

## Update (2026-10-15): title and image only

The cards now show only the industry name and its photo. The component's new
`showDetails` prop (default true) hides the description and tags, and the
section passes `false`. The text stays in `TAGS` and `industries`, and a
visually-hidden list keeps it for screen readers. Showing it on hover is
still to be decided.
