"use client";

import * as React from "react";

/**
 * A shared handle on the phone's screen canvas, so the background band can
 * draw its own particles into it.
 *
 * The band and the phone are cousins, not parent and child — `HeroSideExit`
 * takes both as props (`backdrop` and `phoneScreen`) — so the canvas has to be
 * published somewhere they can both reach. That is all this is: one ref, and
 * the provider that decides which pin owns it.
 *
 * Consumers must tolerate `null`. The standalone "Why Choose" section has no
 * band behind it, so there is nothing for a phone screen to continue, and it
 * mounts with no provider at all.
 */
export type DustMirror = React.MutableRefObject<HTMLCanvasElement | null>;

const DustMirrorContext = React.createContext<DustMirror | null>(null);

export function DustMirrorProvider({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  return (
    <DustMirrorContext.Provider value={ref}>{children}</DustMirrorContext.Provider>
  );
}

export function useDustMirror() {
  return React.useContext(DustMirrorContext);
}
