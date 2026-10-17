# ADR 0012: "Who can use BalloAds?" fades in on the Brutus stage

- Status: Accepted
- Date: 2026-10-17
- Deciders: George M'sapenda

## Context

After the Brutus pieces leave sideways (the Brutus outro), "Who can use
BalloAds?" scrolled up from the bottom. George wanted it to fade in instead.

## Decision

`HomeClient` passes whichever Who section is active (the flag chain is
unchanged) into `BrutusSection`'s `after` slot, the same mechanism ADR 0011
first used for "Backed by". It sits centred on the pinned stage at full
width (`.brutus-stage__after > * { width: 100% }`). It fades in and scales
from 0.96 to 1 over `AFTER_IN = [0.93, 1]`, once the video has nearly
cleared. When the pin releases it scrolls away with the stage, and "Backed
by" follows in normal flow.

## Consequences

- Each Who section has to fit in one viewport. The curved row does at
  1440×900.
- The Who section's own in-view reveal fires early, while the stage is still
  hidden, so the fade is its effective entrance.

## Update: carousel rises, copy fades

The layer now stays at full opacity and writes `--after-t` and
`--after-rise` instead. In home.css the heading, lines and button fade with
`--after-t`, and the carousel (`.who-curved__band`) rises from 70vh below
with `--after-rise`, at full opacity.
The heading, lines and button no longer fade. They slide in from the right
piece by piece, heading first and fastest, like "What We're About" (ADR
0010). `After` writes `left` on `.who-curved__copy > *` and
`.who-curved__cta`.

## Update: cards fly in

The carousel no longer rises as one band. Each card (tile) flies in from
its own direction (from a set of six vectors) at its own speed and settles
into the curve. This is written to the CSS `translate` property, so it
composes with the tile's orbit transform and the row keeps moving
underneath.
Then: the cards come in straight from the left or the right, alternating,
with no vertical component.
