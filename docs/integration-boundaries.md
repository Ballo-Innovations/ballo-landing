# Front-End Integration Boundaries

Purpose: keep the front-end CTA/social behavior explicit for backend integration
and future stakeholder review.

Last updated: 2026-06-30 — Carlito self-hosted (typography), channel pages
rebuilt as a reusable component with their Sign Up wired to the waitlist modal.

---

## Implemented

### Waitlist / Sign Up

- Trigger: `useWaitlist().openWaitlist()` via the shared modal in
  `app/components/waitlist/`.
- Endpoint: `POST /api/waitlist`, proxying to `${BACKEND}/v1/waitlist`.
- Current visible labels:
  - Header CTA: `Sign Up`
  - Home hero primary CTA: `Sign Up`
  - Some secondary sections still say `Join Waitlist`; these were not part of the
    home hero relabel instruction and can be normalized in a separate CTA pass.

### Home Hero Learn More

The home hero secondary CTA is now labeled `Learn More` and routes based on the
active hero slide:

| Hero slide | Destination |
|---|---|
| WhatsApp Marketing with Precision | `/whatsapp-marketing` |
| Targeted Bulk Messaging Solutions | `/sms-marketing` |
| Email Marketing at Your Fingertips | `/email-marketing` |
| Web Pop Ups and Push Notifications | `/features` |

The brief authorizes SMS, Email, and WhatsApp channel pages. The Web Push slide
remains on `/features` until the stakeholder confirms whether it should become a
fourth channel page.

### Channel Pages

The three brief-authorized channel pages share one reusable, config-driven
component — `app/components/channel/ChannelPage.tsx` (+ `channel-page.css`):

- `/sms-marketing`
- `/email-marketing`
- `/whatsapp-marketing`

Each route is a thin config (`name`, Canva-sourced `headline`, `intro`, hero
image, `features[]`, `steps[]`) passed to `<ChannelPage>`. Layout: dark hero
(headline from the Canva channel hero) → light "What you can do" capabilities
grid → "How it works" steps → dark closing CTA. The page is explicitly light
and theme-independent (does not follow OS dark mode), per the brief's
"light backgrounds after the hero" rule.

- **Sign Up** on these pages opens the shared waitlist modal (consistent with the
  header/home hero), not a `/subscription` link.
- The capability/step copy is **structural scaffolding** — final marketing copy
  and channel-specific imagery are pending stakeholder notes ("notes to follow").
  No fabricated stats/testimonials were added.

### Typography

- Headings: Ubuntu (loaded via `next/font`).
- Body: `Calibri, "Carlito", "Segoe UI", Arial, sans-serif`. **Carlito is now
  self-hosted** via `@fontsource/carlito` (imported in `layout.tsx`, weights
  400/700 + italics). Calibri is proprietary and cannot be served on the web;
  Carlito is its metric-compatible open-source equivalent, so non-Windows/mobile
  visitors render Carlito (visually identical to Calibri) instead of falling back
  to Arial.

### Top Header Social Icons

- Config: `app/components/social/socialLinks.ts`
- Visible placement: top header strip only, above the liquid-glass nav.
- Behavior: visible only at the top of the page; once the user scrolls, the strip
  hides and stays hidden until the page returns to the top.
- Footer social icons were removed so there is no second visible social placement.
- Confirmed accounts:
  - Facebook: `https://www.facebook.com/share/1ENMCGHXCy/?mibextid=wwXIfr`
  - Instagram: `https://www.instagram.com/balloads`
  - LinkedIn: `https://www.linkedin.com/company/balloads/`
  - TikTok: TBA, rendered as a non-interactive pending icon.

### Other Interim CTA Mappings

These mappings remain from the earlier real-button pass:

| Original route | Current destination | Notes |
|---|---|---|
| `/signup` | Waitlist modal | Backend/auth flow still pending. |
| `/contact` | `/live-chat` | Existing communication route. |
| `/subscribe` | `/subscription` | Existing subscription route. |
| Feature-page demo CTA | `/how-it-works` | Avoids self-linking to `/features`. |

## Recommendations

- Decide whether the Web Push / Pop-ups hero slide should have its own page.
- Replace the placeholder body copy on the three channel pages when stakeholder
  notes arrive.
- Normalize remaining non-hero `Join Waitlist` / demo labels in a dedicated CTA
  language pass if the stakeholder wants `Sign Up` and `Learn More` everywhere.
