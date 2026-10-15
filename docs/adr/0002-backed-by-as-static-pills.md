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

- Pill face matches `.aside-copy-rows .cta-chip`: white top highlight over the
  `--brand-color-2` → `--brand-color-3` gradient, inset rim.
- The logo sits on a white disc so Meta's and ZICTA's blues don't vanish
  into the pill. A mark whose file name contains "white" (ZICTA's only file is
  `zicta-white.png`) gets a navy disc instead.
- The row is centred and wraps, so any count the CMS publishes fits.
- The role ("Mobile network", "ICT regulator", …) is kept as a tooltip and in
  screen-reader text. It is no longer printed.
- The staggered entrance stays, now on each pill.
- Data is unchanged: the same CMS "Backed by" rows and fallbacks in `page.tsx`.

## Consequences

- Every partner is named at once, on any device.
- The drawn-on caption (`DrawLineText`) is no longer used by this section.
- A white logo uploaded to the CMS needs "white" in its file name to get the
  dark disc. Otherwise it will be invisible on the white one.
