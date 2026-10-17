# ADR 0008: Feature pills behind the hero phone

- Status: Accepted
- Date: 2026-10-17
- Deciders: George M'sapenda

## Context

ADR 0001 archived the scrolling feature pills from under "Why Choose
BalloAds?" until they had a new home. The spot behind the phone, once it has
moved left beside "What We're About", was empty after the halo there was
archived too.

## Decision

Both counter-scrolling pill rows (`FeatureChipRows`) render behind the
phone in `HeroSideExit`, in the phone's own layer, so they travel and scale
with it. They fade in on the archived halo's timing (`HALO_IN`, the end of
"What We're About" arriving), stay through "Why Choose BalloAds?", and leave
with the phone. The pill face is `.aside-copy-rows .cta-chip`, set larger in
`.hero-phone-chips` because the phone layer is scaled down. Under 900px and
on short screens both rows stay, overriding the old aside rules.

The pills under "Why Choose" stay archived (`SHOW_WHY_CHIPS`), and the halo
stays off.

## Consequences

- No flag: this is a placement for already-shipped UI, like ADR 0001.
- The rows run under the phone and are masked at both ends, so they read as
  passing behind the device.
