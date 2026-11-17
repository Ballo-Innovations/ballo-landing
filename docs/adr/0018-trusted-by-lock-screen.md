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
"Backed by" is unchanged above it.

The phone is the section's own. The journey phone (ADR 0017) used to sit here
with a lock screen of its own, but it was archived the same day, so the
section brings a phone. It is the same `Phone3D` device with the journey
phone's `LockScreen`, so it looks as it did there.

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
- Layout: heading and runway on the left, the phone on the right. The pinned
  Brutus stage clips whatever falls below the screen, so the phone sits
  beside the copy, not under it. On screens up to 640px the phone sits
  beside the runway, the BalloAds mark is dropped, and the runway carries
  two logos instead of four (a 200px runway cannot hold four).
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
- If the journey phone comes back (`PHONE_JOURNEY`), it would sit beside this
  section's phone. Turn one of them off.
- On short phones (about 667px tall) the bottom of the phone is clipped by
  the stage, as the old grid's last rows were.
- Logo files with a lot of padding (several client PNGs are large squares)
  read small on the runway. Cropping them in the CMS fixes that.
- Bayport's CMS logo is dark artwork and is hard to see on the navy page,
  here as in the grid. The CMS row needs a light logo.
