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
