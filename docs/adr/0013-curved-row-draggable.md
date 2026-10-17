# ADR 0013: The curved row is draggable

- Status: Accepted
- Date: 2026-10-17
- Deciders: George M'sapenda

## Decision

`TiltedGridHero` (the "Who can use BalloAds?" carousel) can be dragged
sideways with a mouse or finger. The row is pure CSS animation, so a drag
seeks those animations through the Web Animations API (`getAnimations`,
`currentTime`). The pointer's travel, measured in tile widths, becomes
seconds of the loop, so the row follows the pointer and keeps its curve and
off-screen wrapping. The animations pause while held and resume on release,
unless reduced motion is on. `touch-action: pan-y` keeps vertical page
scrolling on touch screens.

## Consequences

- A tile swaps to its next image only when its animation wraps naturally,
  so a drag can show an image out of order until the next wrap. This is
  harmless with six industries.
- No new dependency.
