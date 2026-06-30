# BalloAds Front-End Progress Report

This report reflects the current repo state after the top-header social and home
hero correction pass.

## Completed In This Pass

### Top-only social icons

- Moved social icons out of the footer and into a top header strip above the
  approved liquid-glass navigation.
- Matched the clarified Ballo Innovations behavior:
  - visible at the very top of the page,
  - hidden once the user scrolls,
  - stays hidden while the user remains away from the top.
- Preserved official BalloAds destinations:
  - Facebook live,
  - Instagram live,
  - LinkedIn live,
  - TikTok pending/non-interactive.
- Moved the social config to `app/components/social/socialLinks.ts`.

### Home hero brief fixes

- Changed the home hero primary CTA from `Join Waitlist` to `Sign Up`.
- Changed the home hero secondary CTA from `Book A Free Demo` to `Learn More`.
- Added the `AI-Powered Performance Marketing` hero label.
- Routed the Learn More CTA contextually:
  - WhatsApp slide -> `/whatsapp-marketing`
  - SMS slide -> `/sms-marketing`
  - Email slide -> `/email-marketing`
  - Web Push / Pop-ups slide -> `/features` pending stakeholder confirmation.

### Typography

- Aligned the global font stack to the brief:
  - headings use Ubuntu,
  - body text uses Calibri with Carlito, Segoe UI, Arial, and sans-serif fallbacks.

### Channel pages

- Created structural shells for the three brief-authorized channel pages:
  - `/sms-marketing`
  - `/email-marketing`
  - `/whatsapp-marketing`
- Left body sections intentionally placeholder-based because the brief says the
  longer channel notes/copy are still to be provided.

## Remaining Decisions

- Confirm whether the Web Push / Pop-ups slide needs a fourth channel page.
- Provide final channel-page body copy and any dedicated designs.
- Decide whether non-hero CTAs such as secondary `Join Waitlist` and demo labels
  should be normalized globally or left as-is outside the home hero.

## Implementation Notes

- Header social rendering lives in `app/components/header/Header.tsx`.
- Header social styling lives in `app/styles/components/header.css`.
- Social account data lives in `app/components/social/socialLinks.ts`.
- Footer social markup was removed from `app/components/footer/Footer.jsx`.
- The footer component still imports its local stylesheet:
  `app/components/footer/footer.css`.

## Reconciliation & Hardening Pass (2026-06-30)

Review of the previous pass surfaced two issues, now fixed:

### Typography — Carlito was referenced but never loaded
The font stack named `Carlito` but no Carlito font was bundled, so on
Mac/iOS/Android/Linux (most visitors + all mobile) body text silently fell back
to **Arial** — neither Calibri nor the brand's Ubuntu. Fixed by self-hosting
Carlito via **`@fontsource/carlito`** (imported in `app/layout.tsx`, weights
400/700 + italics). Calibri is proprietary and can't be served on the web;
Carlito is its metric-compatible open-source equivalent. Verified in-browser:
the Carlito latin faces load and resolve, so non-Windows users now get Carlito
(visually identical to Calibri) instead of Arial. Headings remain Ubuntu.
> Note: this reverses the earlier "M1 = No Changes Required (all-Ubuntu)"
> decision in favour of the brief's literal "Calibri body", at the stakeholder's
> direction. If all-Ubuntu is preferred instead, revert the `--font-sans` stack
> and remove the `@fontsource/carlito` imports.

### Channel pages — rebuilt from bare shells into a proper component
The three pages were near-duplicated placeholder shells whose "Sign Up" linked
to `/subscription`. Rebuilt as one reusable, config-driven component
`app/components/channel/ChannelPage.tsx` (+ `channel-page.css`): dark hero
(Canva headline) → light capabilities grid → "How it works" steps → dark closing
CTA. **Sign Up now opens the shared waitlist modal** (consistent with the rest of
the site). Pages are explicitly light/theme-independent per the brief. Body copy
is structural scaffolding pending stakeholder notes — no fabricated claims.

### Verification
- `tsc --noEmit`: clean.
- `pnpm build`: succeeds, all 32 routes (incl. the 3 channel pages) prerender.
  (A first build hit a stale-`.next` `PageNotFoundError`; a clean rebuild passed.)
- Browser preview: channel hero/sections/CTA render correctly on desktop + mobile;
  eyebrow clears the sticky nav; Sign Up opens the waitlist modal; home hero shows
  the kicker + `Sign Up` (modal) + slide-contextual `Learn More`.
