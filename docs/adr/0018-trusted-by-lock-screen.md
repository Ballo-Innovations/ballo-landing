# ADR 0018: "Trusted by" runs into a phone's lock screen

- Status: Accepted, behind the `trustedLockScreen` flag
- Date: 2026-11-17
- Deciders: George M'sapenda

## Decision

George chose "B3, Lock screen" from a set of options for the Backed by /
Trusted by section. The taped grid of client logos under "Trusted by" becomes
a runway: each logo rides left to right into the BalloAds mark, and as it
arrives a notification from that brand lands on top of a phone's lock screen
beside it. The lock screen keeps four notes and the oldest slides off the
bottom.

Heading: "Trusted by" / "From their brand to their customer's phone".

"Backed by" becomes one line above it, as George asked: "Backed by", the
Airtel, MTN and Meta marks, a hairline, then ZICTA (`DeliveredOver`; the
label first read "Delivered over", and George chose "Backed by"). Partners
whose role mentions a regulator go after the hairline, so the networks and
the regulator read as two groups. It does not move, so it shows under
reduced motion too.

Which phone: the journey phone (ADR 0017) stops beside this section when it
is on, so it shows the lock screen and the section adds no phone. It
registers itself while mounted, and the section publishes its clients for
its lock screen to read. When the journey phone is off (`PHONE_JOURNEY`
false, or reduced motion), the section shows its own `Phone3D` with the same
`LockScreen`, beside the copy.

## Layout A, "Split stage" (2026-11-17)

George picked layout A from three drawn options. The stage was lopsided: the
content centred on the page, the phone 32px from the right edge, a 76px gap
between the BalloAds mark and the phone, and about 410px empty under the
runway at 1440 x 900.

- One container, 1200px wide at 1440 (`.trusted-lane`, `min(100%, 79rem)`
  with 2rem padding). Left column: eyebrow, heading (46px, solid white, no
  shimmer), the runway ending in the mark, then a hairline and the "Backed
  by" line. Right column: the phone slot, 600px tall where the screen allows
  (`min(600px, 100svh - 230px)`).
- Empty first and last grid rows centre the left block on the phone. The
  stage centres the whole section under the nav
  (`.brutus-stage__then:has(.trusted-by-section--split)`).
- A message hops across the column gap: on every clock step, as a logo
  goes into the mark, a small message bubble pops out of it and arcs into
  the phone (option C, George's pick from five drawn options, after trying
  signal waves; it replaced the first dashed line). The arc is two
  animations, one across the gap and one up and down, so it fits any gap
  width. It lands at 640ms, and each new notification is held back 420ms
  to land with it. The hop is keyed by the step so it plays once per step;
  a looping CSS animation drifted from the clock whenever the section's
  animations paused. Hidden in the stacked layout, where there is no gap
  beside the phone.
- "Backed by" moves into the section, under the runway. Under reduced motion
  it stays above the logo grid as before.
- Below 1024px the columns stack: heading, runway, the phone centred, then
  "Backed by". The phone no longer waits as a corner miniature there.
- The journey phone stands in `.trusted-lane__slot`: its pose is the slot's
  place inside the pinned `.brutus-stage`, so it holds still while the stage
  fades in and after it lets go. On narrow screens it shrinks to the corner
  as the testimonials come in. The section's own phone (journey phone off)
  is Phone3D scaled to the slot, with the scene's `scale-110` cancelled.

## The journey ends here (2026-11-17)

George: the lock screen is the journey phone's last stage. With
`END_AT_TRUSTED` (JourneyPhone.tsx) the phone holds its place in the slot
while the stage is pinned, then moves up with the section, pixel for pixel,
until it is off the screen. It no longer goes on to the testimonials chat,
and nothing below this section has the phone. Together with `STOP_AT_WHO`,
its path is now: the Brutus film, off the top through Who, up from below
into the slot, off the top with the section.

## How it is built

- `lib/trustedLockScreen.ts` holds the timing, with unit tests. One step
  counter (`trustedTicker`, a step every 2.2s) drives the runway and the
  notes. Two CSS loops started at different moments would drift apart and
  put one brand's logo in and another brand's message out.
- A logo's travel is one CSS animation lasting a whole number of steps,
  measured in `cqw` against the runway. It arrives on the step its
  notification lands. Notes move by CSS transition. React renders once per
  step; nothing runs per frame.
- The runway starts the clock while it is near the screen and stops it
  otherwise. A restart opens a new epoch, so runners that were in flight
  remount part-way along, not all at the left edge.
- Layout: see layout A above. On screens up to 640px the runway carries two
  logos instead of four (a short runway cannot hold four without overlap).
- Clients that are also backers are left out (`withoutBackers`): on a lock
  screen every client becomes a sender, and the CMS has carried Airtel, MTN,
  "MTN Zambia", Meta and ZICTA in both lists. A network or the regulator
  must not appear to send marketing through BalloAds.
- The notes show the brand's logo with an SMS or WhatsApp badge and the brand
  name. The message is two grey bars, not copy: these are real clients and any
  wording would be ours. The channel mix (every third brand on WhatsApp) is
  illustrative.
- Under reduced motion the section keeps the old logo grid. With the flag
  off, nothing changes.

## Consequences

- One 2.2s timer while the section is near the screen.
- The phone's height follows the screen (`--slot-h`), so the stacked layout
  fits a 375 x 667 phone with "Backed by" on screen. The site's Ask Brutus
  bubble sits over the end of that line on phones, as it sits over anything
  in that corner.
- Logo files with a lot of padding (several client PNGs are large squares)
  read small on the runway. Cropping them in the CMS fixes that.
- Bayport's CMS logo is dark artwork and is hard to see on the navy page,
  here as in the grid. The CMS row needs a light logo.
