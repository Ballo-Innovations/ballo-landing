"use client";

import { createContext, useContext } from "react";
import type { MotionValue } from "framer-motion";

/**
 * 0–1 progress for a section shown on a pinned stage (ADR 0015): the Brutus
 * stage provides it over the stretch where "Who can use BalloAds?" holds on
 * screen, and the curved row turns with it. Null outside a stage, where the
 * row falls back to its own scroll position.
 */
export const StageRowProgress = createContext<MotionValue<number> | null>(null);

export const useStageRowProgress = () => useContext(StageRowProgress);
