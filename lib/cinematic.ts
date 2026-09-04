/**
 * Shared timing for the scroll-driven panels.
 *
 * Both the hero's exit and the Who panel read one scroll-progress value and
 * derive every transform from it. These are the primitives that turn that one
 * number into a timeline: a range is a [start, end] pair in fractions of the
 * pinned scroll, and `at` reports how far through a given range the scroll is.
 *
 * Stating timelines as explicit fractions rather than as chained relative
 * offsets is deliberate. Relative positions read compactly but compose into an
 * absolute duration you cannot work out by reading the source, which makes the
 * ordering of a dozen overlapping moves impossible to reason about later.
 */

export type Range = [number, number];

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** How far through `range` progress `p` is, clamped at both ends. */
export function at(p: number, [from, to]: Range) {
  if (to <= from) return p >= to ? 1 : 0;
  return clamp01((p - from) / (to - from));
}

/** Decelerating. For arrivals: things that fly in and settle. */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Both ends eased. For travel: things that set off and come to rest. */
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * A staggered member of a group: item `i` runs the same shape of move as its
 * neighbours, offset in time. The span shrinks so the last item still finishes
 * exactly at the end of the range rather than being cut off by it.
 */
export function staggered(groupT: number, i: number, count: number, step: number) {
  const span = Math.max(0.001, 1 - step * Math.max(0, count - 1));
  return clamp01((groupT - i * step) / span);
}
