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

## Update (2026-10-17): four rows

Four rows instead of two (`FeatureChipRows rows={4}`). Each row carries the
whole list from a different starting point, alternating direction and pace.
Callers that pass nothing still get the original two rows.
The block also fades in from the left inside the viewport (a mask on
`.hero-phone-chips`), because the rows' own end fades fall off-screen there.

## Update (2026-10-17): three rows, no fades

Three rows (`rows={3}`), and no end fades: the rows' own marquee masks are
turned off inside `.hero-phone-chips`, and the left-edge mask was removed.
The rows leave the screen on the left and are clipped by the hero stage on
the right, short of the copy.

## Update (2026-10-17): back to the first version

After trying four and three rows, a left-edge fade, and no fades, George
chose the first version: two rows with the marquees' own end fades. The
`rows` prop on `FeatureChipRows` stays (it defaults to two).
The right end now fades out just before the copy beside the phone (a
right-only mask on `.hero-phone-chips`, #000 80% to transparent 95%). The
left keeps the marquees' own fades.
Correction: the ask was less blank space between the pills and the copy,
not a fade. The right-only mask is gone; instead the block is wider
(`min(65.5rem, 131vw)`), so the rows reach to about 25px short of the copy
at 1440px, and end in the marquees' own fade.
Reverted to the first version's width (`min(60rem, 120vw)`) at George's request.

## Update (2026-10-17): Why Choose only

The pills now fade in on `TEXT_SWAP` (the heading turning over to "Why Choose
BalloAds?") instead of `HALO_IN`, so they are absent during "What We're
About".
