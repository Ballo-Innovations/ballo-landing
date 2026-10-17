# ADR 0010: Copy and pills slide in instead of flipping

- Status: Accepted
- Date: 2026-10-17
- Deciders: George M'sapenda

## Context

"What We're About" faded in beside the phone with a per-letter reveal, and
swapped to "Why Choose BalloAds?" with a per-letter hinge flip. The pills
behind the phone faded in. George asked for the same motion as the hero's
exit and the new outro (ADR 0009): pieces travelling in at different speeds.

## Decision

- **Copy:** each piece of the copy column (heading, paragraph, buttons)
  slides in from the right, the heading first and fastest, then each later
  piece slower and a step behind (`COPY_SPEEDS`, `slideCopy`). "What We're
  About" comes in over `ASIDE_IN`.
- **Swap:** at the text swap, its pieces leave to the right, last in first
  out, over the first half of the latched beat. "Why Choose" then slides in
  the same way over the second half.
- **No fade, no flip:** the column and its layers stay at full opacity and
  pieces are off-screen when not shown. Per-letter reveal and flip animations
  are switched off for these headings (`.hero-aside .aside-copy-title
  .reveal-char`).
- **Pills:** the pills behind the phone slide in from the left on
  `TEXT_SWAP`, each row at its own speed, instead of fading.
- **Mechanism:** the entrances write `left` (with `position: relative`) and
  the outro writes `translate`, so the two never overwrite each other.

## Consequences

- `setFlip` and the flip CSS are unused by the hero now, but left in place.
- Reduced motion is unchanged, because the static hero has no pin.

## Update (2026-10-17): pills arrive with What We're About

The pills now slide in on `ASIDE_IN`, alongside the "What We're About" copy,
and stay through "Why Choose" until the outro.
The App Store and Google Play badges now arrive with the pills too: shown
from `ASIDE_IN[0]` (was the end of `PHONE_ASIDE`) and scrubbed in from the
left just ahead of the pill rows.
