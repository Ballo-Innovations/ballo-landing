# ADR 0001: Archive the phone halo and the "Why Choose" pills

- Status: Accepted
- Date: 2026-10-15
- Deciders: George M'sapenda

## Context

In the home hero's "Why Choose BalloAds?" scene, two decorations competed with
the content:

- **The phone halo** (`.hero-phone-halo` in `HeroSideExit`): rings and a cyan
  bloom that fade in behind the phone once "What We're About" has arrived.
- **The scrolling pills** (`WhyFeatureChips`, rendered in `HomeClient` between
  the blurb and the Get Started button).

We like both but they don't fit here. The scene reads better as heading, blurb,
button and phone on a plain background.

## Decision

Stop rendering both, without deleting them:

- `HeroSideExit.tsx`: `SHOW_PHONE_HALO = false` gates the halo element.
  The halo's scroll timing (`HALO_IN`, `placeHalo`) stays; with no element it
  does nothing.
- `HomeClient.tsx`: `SHOW_WHY_CHIPS = false` gates `<WhyFeatureChips />`.

Components, CSS and timings are untouched, so restoring either one is a
one-line change. The standalone `WhyScrollSection` (not mounted on the home
page) still renders its chips and is unaffected.

These are code constants, not `lib/featureFlags.ts` flags: this is a design
decision, not a rollout, and it should not vary by environment.

## Consequences

- The scene matches the agreed screenshot: no glow behind the phone, nothing
  between the blurb and the button.
- `FeatureChips.tsx` and the `.hero-phone-halo` styles become dead code on the
  home page until reused. Don't delete them.
- When they find a new home, either move them there and remove the constant,
  or flip it back to `true` and supersede this ADR.
