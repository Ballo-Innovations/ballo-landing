/**
 * The silk behind the phone during "Why Choose" (ADR 0019): the timing and
 * sizing rules, kept free of React and WebGL so they can be tested.
 */
import { at, easeInOut, type Range } from "./cinematic";

/**
 * How much of the silk shows at pin progress `p`: up with the copy turning
 * over to "Why Choose" (`arrive`), down as that copy leaves the stage
 * (`leave`). Zero outside the two, so the hero, "What We're About" and the
 * Brutus act all keep their own background.
 */
export function silkStrength(p: number, arrive: Range, leave: Range): number {
  const up = easeInOut(at(p, arrive));
  const down = easeInOut(at(p, leave));
  return Math.max(0, Math.min(1, up * (1 - down)));
}

/**
 * The arrival stretched to twice the length of the copy swap it starts with,
 * so the silk rises in more slowly than the heading turns over.
 */
export function silkArrival([from, to]: Range): Range {
  return [from, to + (to - from)];
}

/**
 * How fast the shown opacity follows its target, as the angular frequency of
 * a critically damped spring (rad/s). Rising settles in about 1.6s, falling in
 * about 1.2s. The scroll only sets the target, so a fast scroll can never
 * snap the silk in or out (George, 2026-11-18: "very smooth and subtle").
 */
export const SILK_FADE_IN_OMEGA = 4;
export const SILK_FADE_OUT_OMEGA = 5.5;

/**
 * One step of a critically damped spring from `x` (moving at `v` per second)
 * toward `target`. It starts from rest, so a fade eases in rather than
 * jumping, and settles without overshooting. Long frames are split so a
 * stalled tab cannot make it unstable.
 */
export function fadeStep(
  x: number,
  v: number,
  target: number,
  dtMs: number,
): [number, number] {
  let t = Math.max(0, dtMs) / 1000;
  const w = target > x ? SILK_FADE_IN_OMEGA : SILK_FADE_OUT_OMEGA;
  while (t > 0) {
    const h = Math.min(t, 1 / 60);
    const a = w * w * (target - x) - 2 * w * v;
    v += a * h;
    x += v * h;
    t -= h;
  }
  if ((v > 0 && x > target) || (v < 0 && x < target)) {
    x = target;
    v = 0;
  }
  return [Math.max(0, Math.min(1, x)), v];
}

/** True once the fade has come to rest at its target. */
export function fadeSettled(x: number, v: number, target: number): boolean {
  return Math.abs(target - x) < 0.001 && Math.abs(v) < 0.002;
}

/** Below this the layer is invisible, so the shader does not run at all. */
export const SILK_VISIBLE_MIN = 0.002;

/**
 * The layer's opacity when fully up. The silk is atmosphere, not a feature:
 * at full strength it competed with the phone (George, 2026-11-18: "should be
 * more subtle"), so it peaks well below opaque.
 */
export const SILK_PEAK_OPACITY = 0.55;

/**
 * Backing-store pixels per CSS pixel. The silk has no hard edges, so it is
 * drawn at well under native resolution and scaled up by the browser: about
 * 0.6 of a CSS pixel on a 1x screen, at most 0.9 on retina, and less again on
 * very wide screens so the fragment count stays roughly flat (~0.5 MP at 1440).
 */
export function silkPixelRatio(devicePixelRatio: number, cssWidth: number): number {
  const dpr = Math.min(Math.max(devicePixelRatio || 1, 1), 1.5);
  const wide = cssWidth > 1440 ? 1440 / cssWidth : 1;
  return Math.round(dpr * 0.6 * wide * 1000) / 1000;
}

/**
 * The cursor's pull on the fabric eases toward 1 while a fine pointer is over
 * the stage and back to 0 when it leaves, so the swirl never snaps.
 */
export function easePull(current: number, target: number, dtMs: number): number {
  const k = 1 - Math.exp(-Math.max(0, dtMs) / 280);
  return current + (target - current) * k;
}

/**
 * The fragment shader. Domain-warped sine layers make the folds; a rotation
 * around the cursor, weighted by a gaussian, makes the swirl. Colours are the
 * site's: page navy, hero blue (#153D87), cyan (#3fdbff) highlights and a
 * little violet. Alpha is premultiplied; the CSS mask decides where it shows.
 */
export const SILK_FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPull;
void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  vec2 m = uMouse / uRes.y;
  vec2 d = uv - m;
  float a = exp(-dot(d, d) * 9.0) * uPull * 2.4;
  vec2 q = (uv - m) * 3.2;
  vec2 p = vec2(q.x * cos(a) - q.y * sin(a), q.x * sin(a) + q.y * cos(a)) + m * 3.2;
  float t = uTime * 0.18;
  for (int i = 1; i < 7; i++) {
    float fi = float(i);
    p.x += 0.55 / fi * sin(fi * p.y + t + 0.35 * fi) + 0.35;
    p.y += 0.55 / fi * cos(fi * p.x + t * 1.2 + 0.35 * fi) - 0.15;
  }
  float v = 0.5 + 0.5 * sin(p.x + p.y);
  float w = 0.5 + 0.5 * sin(p.x * 1.3 - p.y * 0.7 + t * 0.7);
  vec3 navy = vec3(0.012, 0.027, 0.24);
  vec3 hero = vec3(0.082, 0.239, 0.529);
  vec3 cyan = vec3(0.247, 0.859, 1.0);
  vec3 violet = vec3(0.55, 0.42, 0.95);
  vec3 col = mix(navy, hero, smoothstep(0.2, 1.0, v) * 0.75);
  col += cyan * pow(v, 18.0) * 0.18;
  col = mix(col, violet, pow(w, 12.0) * 0.2);
  float alpha = 0.35 + 0.45 * smoothstep(0.1, 0.9, v);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

export const SILK_VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;
