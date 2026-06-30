# Top Header Social Icons Report

## What was fixed

- Removed the footer social icon rendering so the site now has one visible social
  placement.
- Added a top social strip above the liquid-glass navigation.
- Matched the clarified Ballo Innovations behavior:
  - icons are visible only at the top of the page,
  - icons hide when the user scrolls,
  - icons stay hidden while the user remains scrolled away from the top.
- Kept TikTok as a pending, non-interactive icon because the stakeholder has not
  supplied the URL.
- Moved social account data to a neutral shared config:
  `app/components/social/socialLinks.ts`.

## Files changed

- `app/components/header/Header.tsx`
  - Renders the top social strip.
  - Uses `useScroll()` to hide the strip once `scrollY > 12`.
  - Keeps the liquid-glass nav as the approved primary nav.

- `app/styles/components/header.css`
  - Positions `.header__top-socials` above the nav.
  - Moves the nav down at page top and returns it to its normal top offset after
    scrolling.
  - Adds focus, hover, disabled, and responsive icon sizing states.

- `app/components/social/socialLinks.ts`
  - Single source of truth for Facebook, Instagram, LinkedIn, and TikTok.

- `app/components/footer/Footer.jsx`
  - Footer social markup removed.

- `app/components/footer/footer.css`
  - Removed old footer-social classes.

## How to implement or update top header icons

1. Add or update a platform in `app/components/social/socialLinks.ts`.
2. If the platform needs a new icon, add it to `socialIconMap` in
   `app/components/header/Header.tsx`.
3. Use `url: null` for pending accounts. The header renders those as disabled
   icons, not dead links.
4. Keep visual styling in `app/styles/components/header.css`.
5. Do not re-add footer icons unless the stakeholder explicitly asks for a second
   social placement.

## Recommendations

- Keep the top strip minimal: icon-only, no labels, no chip background.
- Do not add WhatsApp as a social link unless BalloAds confirms a social
  destination. The WhatsApp marketing product page is separate from a WhatsApp
  social account.
- If TikTok is supplied later, only update `url` in `socialLinks.ts`; no header
  markup change is needed.
- If the nav becomes crowded on mobile, hide only the pending TikTok icon first
  rather than shrinking the approved glass nav.
