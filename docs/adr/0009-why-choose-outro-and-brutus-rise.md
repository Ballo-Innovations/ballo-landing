# ADR 0009: "Why Choose" leaves sideways; Brutus rises in

- Status: Accepted
- Date: 2026-10-17
- Deciders: George M'sapenda

## Context

The hero leaves sideways at the start of the pin (`HeroParts`), and the phone
rises in from below. At the end of the pin, though, "Why Choose BalloAds?"
simply scrolled away with the stage. George asked for it to leave the way
the hero does, with the Brutus section coming up from the bottom the way the
phone does.

## Decision

- **Outro range:** the pin (`TRACK_CLASS`) grows from 600vh to 700vh. The new
  last 1/7 of the track is the outro, `OUTRO = [6/7, 1]`. `HANDOVER_END` and
  the end of `PHONE_CONTENT` are scaled by 6/7, so the handover and the card
  sequence keep exactly their physical scroll.
- **Sideways exit:** `OutroLayer` wraps the phone, which travels left and
  carries the pills with it, and the copy column, which travels right. Like
  the hero's exit it is travel only, with the copy faster (×1.35) than the
  phone (×1). It is smoothstep-eased over the whole outro, so the stage is
  still clearing while Brutus is in view.
- **Brutus rise:** `.brutus-home` gets `margin-top: -86vh` (the outro's
  scroll) and sits above the stage (`z-index: 5`). It scrolls up over the
  still-pinned stage as the outro runs: the same move as the phone rising
  into the hero. This only applies under `prefers-reduced-motion:
  no-preference`, because without the pin nothing should overlap.
- **Card snap:** it no longer snaps once past the last card
  (`useSnapToCard`'s new `activeTo`). Before, it pulled readers back out of
  the outro.

## Consequences

- The home page is 100vh longer in scroll, all of it outro.
- The outro is tuned at 1440×900. Check phones before promoting.

## Update (2026-10-17): element by element

The outro now moves each element on its own, the way `HeroParts` does. The
lists are `OUTRO_LEFT` and `OUTRO_RIGHT`. On the left, the two store badges
go first, then each pill row, then the phone last. On the right, the button
goes first, then the paragraph, then the heading. Each has its own speed and
a small stagger. The movement is written to the CSS `translate` property, so
it composes with the phone tilt, the pill centring and the heading flip,
which all use `transform`.
