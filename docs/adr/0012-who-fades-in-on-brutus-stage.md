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
