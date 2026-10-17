# ADR 0011: "Backed by" fades in at the centre of the Brutus stage

- Status: Accepted
- Date: 2026-10-17
- Deciders: George M'sapenda

## Context

The Brutus section now leaves sideways, piece by piece, before its pin
releases. Afterwards, "Backed by" scrolled up from the bottom as the next
section. George wanted it to fade in at the centre instead.

## Decision

`BrutusSection` takes an `after` slot, rendered as an absolutely positioned,
centred layer on its pinned stage (`.brutus-stage__after`). Over the last
tenth of the track (`AFTER_IN = [0.9, 1]`) the layer fades in and scales from
0.96 to 1, as the last Brutus piece (the video) is clearing. `HomeClient`
passes the `BackedBy` band into that slot. The separate `backers-section` and
its `FadeUpReveal` are gone. When the pin releases, the band scrolls away
with the stage, and "Who can use BalloAds?" follows in normal flow.

## Consequences

- "Backed by" is part of the Brutus section's markup now. Moving it again
  means taking it out of the `after` slot.
- The band's own per-cell entrance stagger no longer runs, because its
  reveal trigger is gone. The fade replaces it.
