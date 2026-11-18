/**
 * Ordering and geometry for the /guides carousel.
 *
 * `order[0]` is the guide showing in the big card on the left; `order[1...]`
 * are the tiles on the right, in slot order. Promoting a tile SWAPS it with
 * the big card rather than re-sorting the grid, so exactly two cards move per
 * step: the tile flies into the big card and the big card drops into the slot
 * the tile just left. Anything else makes the whole grid jump at once.
 */

/** Promote the guide in grid slot `slot` (0-based) into the big card. */
export function promote<T>(order: readonly T[], slot: number): T[] {
  const next = [...order];
  const from = slot + 1;
  if (!Number.isInteger(slot) || from < 1 || from >= next.length) return next;
  [next[0], next[from]] = [next[from], next[0]];
  return next;
}

/**
 * Which slot the auto-tour promotes on its `tick`-th step.
 *
 * It walks the slots in turn (0, 1, 2, ... and round again) rather than always
 * taking slot 0, because always taking slot 0 just swings between the same two
 * guides forever. Walking gives every guide a turn in the big card.
 */
export function tourSlot(tick: number, slotCount: number): number {
  if (slotCount <= 0) return 0;
  return ((tick % slotCount) + slotCount) % slotCount;
}

export type Box = { left: number; top: number; width: number; height: number };

/**
 * A card in flight is drawn at `to` and animated FROM `from`, so the browser
 * lands it on the real element's exact pixels however the layout resolved.
 * Returned as a WAAPI keyframe pair.
 */
export function flightFrames(from: Box, to: Box): [Record<string, string>, Record<string, string>] {
  return [
    {
      transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`,
      width: `${from.width}px`,
      height: `${from.height}px`,
    },
    {
      transform: "translate(0px, 0px)",
      width: `${to.width}px`,
      height: `${to.height}px`,
    },
  ];
}

/** True when the two boxes are close enough that animating between them is pointless. */
export function sameBox(a: Box, b: Box, tolerance = 1): boolean {
  return (
    Math.abs(a.left - b.left) <= tolerance &&
    Math.abs(a.top - b.top) <= tolerance &&
    Math.abs(a.width - b.width) <= tolerance &&
    Math.abs(a.height - b.height) <= tolerance
  );
}
