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

`BackedBy` renders one static pill per partner (no marquee). At rest a pill
shows only the partner's logo. Hovering it, focusing it, or tapping it on a
phone swaps the logo for the name and role. The two share one grid cell, so a
pill never changes size. On desktop the four are equal width, sized to the
widest caption.

- Each known partner's pill keeps the glass chip bitmap, recoloured to its
  brand: `public/Assets/chip-glass-pill-{airtel,mtn,meta,zicta}.png`, made by
  `scripts/recolor-chip-glass.py`, which maps the original's shading onto the
  brand colour and its highlights toward white. So the rim and speculars
  survive. home.css picks the file by `data-brand`. The logo sits straight on
  the pill in one colour (white, or black on MTN's yellow), with no disc.
- A partner not in `BRAND_PILLS` (a new CMS row) falls back to the blue glass
  chip (`.cta-chip`, the 9-slice `chip-glass-pill.png`) with its logo on a
  white disc, or a navy disc for marks whose file name contains "white".
- Pills match the header nav pills' height (`--chip-h` 3.375rem = 54px; 3.2rem on phones).
- The row is centred and wraps, so any count the CMS publishes fits.
- The role ("Mobile network", "ICT regulator", …) is printed under the name in
  the hover state. Name and role stay in the document, so screen readers read
  them without hovering. A partner with no logo shows its name at rest.
- Phones get an even two-column grid instead of a ragged wrap.
- The staggered entrance stays, now on each pill.
- Data is unchanged: the same CMS "Backed by" rows and fallbacks in `page.tsx`.

## Consequences

- The row is logos only at rest. Names need a hover, focus or tap, the trade-off we chose for a cleaner band.
- The drawn-on caption (`DrawLineText`) is no longer used by this section.
- Adding a backer in the CMS gets the generic blue pill until someone adds it
  to `BRAND_PILLS`, generates its PNG with the script, and adds its
  `data-brand` rule in home.css.
- The one-colour treatment assumes a single-colour mark. A multi-colour logo
  added to `BRAND_PILLS` would be flattened to a silhouette.
- A white logo uploaded to the CMS needs "white" in its file name to get the
  dark disc. Otherwise it will be invisible on the white one.
