/**
 * Ordering and geometry for the /guides carousel.
 *
 * `order[0]` is the guide showing in the big card on the left; `order[1...]`
 * are the tiles on the right, in slot order. The tiles are a queue: the guide
 * that comes forward leaves it, everything behind closes up by one place, and
 * the guide it replaces joins the back.
 */

/**
 * Bring the guide in grid slot `slot` (0-based) into the big card.
 *
 * The tiles that were ahead of it keep their places, the ones behind move up
 * one, and the guide that was in the big card goes to the last slot. Taking
 * slot 0 every time is therefore a plain rotation that gives every guide a
 * turn, which is what the auto-tour does.
 */
export function bringForward<T>(order: readonly T[], slot: number): T[] {
  const from = slot + 1;
  if (!Number.isInteger(slot) || from < 1 || from >= order.length) return [...order];
  const rest = order.slice(1);
  const [chosen] = rest.splice(slot, 1);
  return [chosen, ...rest, order[0]];
}

/** How far a card has to be moved back to appear where it used to be. */
export function slideOffset(from: Box, to: Box): { dx: number; dy: number } {
  return { dx: from.left - to.left, dy: from.top - to.top };
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
