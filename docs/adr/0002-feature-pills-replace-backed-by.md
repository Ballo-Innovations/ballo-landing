# ADR 0002: Feature pills replace the "Backed by" band

- Status: Accepted
- Date: 2026-10-15
- Deciders: George M'sapenda

## Context

ADR 0001 took the scrolling feature pills out of "Why Choose BalloAds?" until
they had a better place. The section under Brutus showed the "Backed by" band:
the Airtel, MTN, Meta and ZICTA logos, one at a time swapping to the partner's
name and role.

## Decision

The pills go in that slot, and the logo band is hidden.

- `HomeClient.tsx`: `SHOW_BACKED_BY = false`. The `.backers-section` now
  holds `<FeatureChipRows />` in an `.aside-copy-rows.backers-chip-rows`
  wrapper.
- The pills keep the hero's pill face (`.aside-copy-rows .cta-chip`).
  `home.css` widens the rows to 72rem, enlarges the pills, keeps both rows
  on mobile and drops the hero's short-viewport hide, which only made sense
  inside the pin.
- The pills are not behind the `whyFeatureChips` flag. That flag was for
  their place in the hero. The closing CTA already shows the same rows without
  a flag.

`BackedBy`, its CSS, and the CMS "Backed by" rows (`isBacker`) are untouched.
`page.tsx` still builds `backerLogos`, so the band comes back by flipping the
constant.

## Consequences

- The home page no longer shows partner logos above "Who can use BalloAds?".
  The "Trusted by" client logos further down are unaffected.
- Editing "Backed by" rows in the CMS has no visible effect while this holds.
- The page now shows the same pills twice: here and in the closing CTA.
