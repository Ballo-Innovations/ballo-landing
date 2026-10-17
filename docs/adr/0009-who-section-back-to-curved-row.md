# ADR 0009: Back to the curved row for "Who can use BalloAds?"

- Status: Accepted
- Date: 2026-10-17
- Deciders: George M'sapenda

## Context

After trying the cards (0004), connected carousel (0005), circular split
roll (0006), hover list (0007) and coverflow (0008), George asked for the
tilted-grid curved row again. That is the 21st.dev "Tilted Grid Hero"
already integrated in ADR 0003, with sliced industry labels, behind
`whoCurvedRow`.

## Decision

Nothing is rebuilt. The section switch in `HomeClient.tsx` now checks
`whoCurvedRow` first, ahead of the later trials, which follow in their old
order. `NEXT_PUBLIC_FEATURE_WHO_CURVED_ROW` is already true in Vercel Preview
for `Landing`, so preview.balloads.com shows the curved row again. Locally,
every flag defaults on in development, so the curved row shows there too.
Production is unchanged and still shows the original section.

## Consequences

- The other trials' code and flags are still in the repo, unused while
  `whoCurvedRow` is on. Once the curved row is confirmed, delete those
  sections, components and flags (keep `industries` and
  `whoIndustryTags.ts`) and mark ADRs 0004–0008 superseded.

## Update (2026-10-17): slower

`speed` 4.5 → 8 seconds per tile, roughly half the pace.

## Update (2026-10-17): heading, row, button

The two lines under the heading are removed, and "Start your first campaign"
moved from above the row to below it (`.who-curved__cta`). The sr-only industry
list is unchanged.

## Update (2026-10-17): lines restored

The two lines under the heading are back. The button stays below the row.

## Update (2026-10-17): copy closer to the row

The copy sits lower, nearer the row. The section top padding is now
`clamp(6rem, 14vh, 9rem)`, and the band is pulled up by 10% of its height,
because the tiles fill only its middle 40%. At 20% the upward-curving edge
tiles touched the second line.

## Update (2026-10-18): button closer to the row

"Start your first campaign" is pulled up into the band's empty lower edge
(`margin-top: band height × -0.12`), clear of the edge tiles that curve below
the row's centre line. The section is about 740px tall at 1440px wide.
