# ADR 0014: "Who" leaves the way it came; "Backed by" fades in at the centre

- Status: Accepted
- Date: 2026-10-17
- Deciders: George M'sapenda

## Decision

The Brutus pin now carries two more beats. Its track is 390vh (was 240vh),
and ranges are stated in vh of the track (`vh()` in BrutusSection).

- **Who leaves (`AFTER_OUT`, 270–330vh):** after a short hold, "Who can use
  BalloAds?" goes out the way it came in. The copy goes right (button first,
  heading last) and the carousel cards go off to their own sides, last in
  first out.
- **"Backed by" arrives (`THEN_IN`, 320–375vh):** it fades in and scales from
  0.96 to 1 at the centre of the stage. It is passed in as `BrutusSection`'s
  new `then` slot, and its standalone section in HomeClient is removed.

When the pin releases, "Backed by" scrolls away with the stage and the
testimonials follow.

## Consequences

- About 150vh more held scroll on the home page.
- The Brutus entrance and outro keep their physical scroll (`TRACK_SCALE`
  and the `vh()` ranges).
- "Backed by" loses its per-logo entrance stagger, because the fade replaces
  it.
"Backed by" now fades in over 20vh (THEN_IN 318–338vh), down from 55vh.
