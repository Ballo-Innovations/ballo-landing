# ADR 0017: One phone runs from the hero to the testimonials

- Status: Accepted
- Date: 2026-10-18
- Deciders: George M'sapenda

## Decision

The phone stays on screen from the hero to the end of the testimonials. Its
screen changes with each section.

The hero's pin owns the phone up to the Brutus film (ADR 0016). At `HANDOFF`
(the start of `BRUTUS_OUT`), `JourneyPhone` takes over. It is a fixed layer
(z-index 50, under the header) and starts in the same landscape pose,
playing the same film from the same playhead. `HeroPhone` publishes that
pose and its video in `PHONE_HANDOFF`. The hero's phone is then hidden by
`data-phone-handoff` on `.cinematic-hero`.

From there the phone moves from pose to pose. A pose is its centre, its
portrait height and its rotation. Each stop is measured from the sections
themselves, so the timeline follows the layout:

| Section | Pose | Screen |
| --- | --- | --- |
| Who | Back to portrait, as the active slide in the middle of the curved row | One campaign post per industry, carousel style, turning with the row |
| Backed by / Trusted by | Beside the logos; a corner miniature when there is no room | Lock screen with glass notification cards |
| Testimonials | Waits beside the section until the heading has passed, then comes in front of the wall | The quotes arriving as a chat |

Once the testimonials section starts to leave, the phone rides off the top
of the screen with it. Nothing below that has the phone.

On narrow screens the phone waits as a corner miniature during Trusted by and
the testimonials, because their content fills the width there. It then
slides out to the left instead, so it never crosses the closing CTA.

## Update (2026-10-18): ends at the testimonials

At George's request, the phone no longer docks in the closing CTA or flies
into the footer logo. The results and home screens were removed with those
two stops.

The inspiration was the Yapay glass card and the Instagram post carousel
references George shared.

## Consequences

- One rig transform per frame. The screens' entrances are CSS transitions keyed off
  `data-screen`. The typing dots only animate while their screen is up.
- A second `<video>` with the same source. The browser caches it, and it
  only loads once the Brutus act is near.
- Not rendered under reduced motion.
- The layer is `inert` and `aria-hidden`, and ignores the pointer.

## Update (2026-10-18): clear glass in the Who section

At George's request, the phone's screen is see-through while it sits in the
curved row. `data-glass` on the layer clears every surface behind the
display: the screen, the black inner bezel, the silver bezel and the back
panel. The two bezels keep their rims as rings: an inset shadow for the
black one, and a masked copy of the silver gradient for the other.

All the screen keeps is the status bar and a glass card at the bottom with
the industry's sample campaign. That replaces the in-app post, which had a
photo and an app bar. The card now names the tile nearest the phone's
centre, so it always describes what shows through the glass. If the curved
row isn't there, it falls back to the scroll position.
