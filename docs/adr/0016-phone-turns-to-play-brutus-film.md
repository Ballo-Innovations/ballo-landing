# ADR 0016: The hero phone turns to landscape and plays the Brutus film

- Status: Accepted
- Date: 2026-10-18
- Deciders: George M'sapenda

## Decision

The Brutus film no longer opens out of a pill on a stage of its own. The
hero's phone carries on into it. This is the first step towards one phone
that runs through the whole page and changes what is on its screen.

The hero pin (`HeroSideExit`) gets a fourth act. The track grows from 700vh
to 880vh, and the earlier beats are restated through `TUNED`, so they keep
the same physical scroll.

- **Why Choose leaves (`WHY_OUT`):** the copy goes right, and the badges and
  pills go left, as before. The phone stays.
- **Phone comes home (`PHONE_HOME`) and turns (`PHONE_TURN`):** it moves back
  to the centre at full size. It then rotates a quarter turn to landscape and
  grows to fit the space above the copy. It only rises once it is turning,
  so the tall portrait device never slides under the header. The turn is on
  a new wrapper (`.hero-phone-turn`). Its pivot and target are measured from
  layout (`surveyTurn`).
- **Film on the screen (`FILM_IN`, latched):** the last card hands the
  screen to the film. The video is turned back a quarter inside the screen,
  so it plays upright. It preloads from the start of the act and plays only
  while it can be seen. Pointer tilt is off for the act.
- **Copy rises (`BRUTUS_IN`):** the Brutus copy (`BrutusStageCopy`) rises
  from below the stage, heading first.
- **Leaving (`BRUTUS_OUT`):** the pieces go out sideways, alternating, and
  the phone goes last. The pin then releases onto an empty stage.

`BrutusSection` keeps only the Who / Backed by / Trusted by stage. Its track
is 317vh, which drops the film's 123vh. It is pulled up a whole viewport
(`margin-top: -100vh`, `pointer-events: none`), so it pins as the hero's pin
releases. Who arrives as the Brutus act finishes leaving.

Reduced motion shows the film's poster and the copy, in normal page flow
after the hero.

## Consequences

- About 43vh more held scroll in total. The hero gains 180vh. The Brutus
  stage loses 123vh, plus 14vh of extra overlap.
- The `#brutus` id is gone. Nothing linked to it.
- The film loads only once the act starts, not when the section nears the
  viewport.
