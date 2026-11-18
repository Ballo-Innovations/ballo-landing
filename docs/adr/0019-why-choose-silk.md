# 0019: Silk shader behind the phone in "Why Choose"

Status: accepted for preview (flag `whySilk`), 2026-11-18

## Context

During "Why Choose BalloAds?" the phone sits on the left of the pinned hero
stage on flat navy, and George found that side plain. Twelve directions were
shown as an artifact, then twelve bolder 21st.dev-inspired ones
(https://claude.ai/artifact/6yjgDGDdqwE2cZZBPeN7wt). George picked option A,
"Silk shader".

## Decision

`WhySilk` (app/components/ui/WhySilk.tsx) renders a WebGL fragment shader of
flowing silk in the site's colours (page navy, hero blue #153D87, cyan
highlights, a touch of violet) into `HeroSideExit`'s `glow` slot, so it sits
above the band and behind the phone.

- Timing: up with the copy swap (`TEXT_SWAP`), down as "Why Choose" leaves
  (`WHY_OUT`); zero during the hero, "What We're About" and the Brutus act.
  Pure rules in `lib/whySilk.ts`, tested in `lib/whySilk.test.ts`.
- A CSS mask keeps it on the phone's side and dissolves it before the heading;
  below 900px it is a pool around the centred phone, clear of the copy.
- The cursor twists the fabric (fine pointers only).
- Cost: drawn at 0.6 to 0.9 backing pixels per CSS pixel (about 0.5 MP at
  1440), only while visible and the tab is shown; the context is created on
  first use and released on unmount.
- No WebGL, reduced motion (no pin) or flag off: nothing renders and the stage
  looks as before.

## Consequences

Flag `whySilk` (`NEXT_PUBLIC_FEATURE_WHY_SILK`, `?features=silk`) is on for
Preview (Landing) only. Production needs George's approval.
