# ADR 0002: "Backed by" as static pills

- Status: Accepted
- Date: 2026-10-15
- Deciders: George M'sapenda

## Context

The "Backed by" section showed Airtel, MTN, Meta and ZICTA as logo cells in a
glass band. Hovering a cell swapped the logo for a drawn-on name and role, so
on touch screens, and to anyone not hovering, the partners were unnamed marks.

We want the section in the pill style of the feature chips (the pills archived
from "Why Choose" in ADR 0001), with the same organisations, and not moving.

(An earlier commit under this number replaced the section with the scrolling
feature chips. That misread the request and was reverted.)

## Decision

`BackedBy` renders one static pill per partner: the logo on a small disc, then
the name. No marquee, no hover swap.

- Each known partner's pill is filled with its own brand colour
  (`BRAND_PILLS` in `BackedBy.tsx`: Airtel red, MTN yellow, Meta blue, ZICTA
  navy), with the logo drawn straight onto it in one colour: white, or black
  on MTN's yellow. No disc. The glass highlights are CSS so the pills still sit
  with the site's glass chips.
- A partner not in `BRAND_PILLS` (a new CMS row) falls back to the blue glass
  chip (`.cta-chip`, the 9-slice `chip-glass-pill.png`) with its logo on a
  white disc, or a navy disc for marks whose file name contains "white".
- Pills are sized up for this section (`--chip-h` 4–5rem).
- The row is centred and wraps, so any count the CMS publishes fits.
- The role ("Mobile network", "ICT regulator", …) is printed under the name
  in small cyan caps, so each pill says what the partner is, not just its name.
- Phones get an even two-column grid instead of a ragged wrap.
- The staggered entrance stays, now on each pill.
- Data is unchanged: the same CMS "Backed by" rows and fallbacks in `page.tsx`.

## Consequences

- Every partner is named, with its role, at once on any device.
- The drawn-on caption (`DrawLineText`) is no longer used by this section.
- Adding a backer in the CMS gets the generic blue pill until someone adds its
  colour to `BRAND_PILLS`.
- The one-colour treatment assumes a single-colour mark. A multi-colour logo
  added to `BRAND_PILLS` would be flattened to a silhouette.
- A white logo uploaded to the CMS needs "white" in its file name to get the
  dark disc. Otherwise it will be invisible on the white one.
