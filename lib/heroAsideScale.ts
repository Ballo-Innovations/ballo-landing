/**
 * Scale of the hero phone while it sits beside the "What We're About" and
 * "Why Choose BalloAds" copy (`HeroSideExit`).
 */
/** The phone's size beside the "What We're About" copy, as before 2026-11-18. */
export const PHONE_ASIDE_SCALE_NARROW = 0.86;
const PHONE_ASIDE_SCALE = PHONE_ASIDE_SCALE_NARROW;
/**
 * Beside the copy (wider than 900px) there is room for a larger device, and
 * at 0.86 it read small next to the "What We're About" heading. It only gets
 * the extra size where it fits: the device is vertically centred, so its
 * height has to leave the nav pill clear above it, and its store badges hang
 * ~100px off its left, so narrow laptops have no width to give. Below either
 * limit it eases back to PHONE_ASIDE_SCALE (the 960x600 look is unchanged).
 * Below 900px the copy sits underneath the phone and it stays at 0.86.
 */
export const PHONE_ASIDE_SCALE_WIDE = 0.96;
/** Device height at scale 1, in CSS px (Phone3D plus the scene's scale-110). */
const PHONE_FULL_HEIGHT = 567;
/** Kept clear above and below the device: the fixed nav pill is ~70px tall. */
const PHONE_ASIDE_CLEAR_Y = 80;
/** Viewport widths over which the extra size phases in. */
const PHONE_ASIDE_WIDE_FROM = 960;
const PHONE_ASIDE_WIDE_AT = 1200;

/** Aside scale for a viewport wider than 900px; see PHONE_ASIDE_SCALE_WIDE. */
export function asideScaleFor(w: number, h: number): number {
  const byHeight = (h - 2 * PHONE_ASIDE_CLEAR_Y) / PHONE_FULL_HEIGHT;
  const t = Math.min(
    1,
    Math.max(0, (w - PHONE_ASIDE_WIDE_FROM) / (PHONE_ASIDE_WIDE_AT - PHONE_ASIDE_WIDE_FROM)),
  );
  const byWidth = PHONE_ASIDE_SCALE + (PHONE_ASIDE_SCALE_WIDE - PHONE_ASIDE_SCALE) * t;
  return Math.max(PHONE_ASIDE_SCALE, Math.min(PHONE_ASIDE_SCALE_WIDE, byHeight, byWidth));
}
