import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PHONE_ASIDE_SCALE_NARROW,
  PHONE_ASIDE_SCALE_WIDE,
  asideScaleFor,
} from "./heroAsideScale.ts";

test("full size on roomy laptops and desktops", () => {
  for (const [w, h] of [[1280, 800], [1440, 900], [1920, 1080], [1536, 864]]) {
    assert.equal(asideScaleFor(w, h), PHONE_ASIDE_SCALE_WIDE, `${w}x${h}`);
  }
});

test("short or narrow screens keep the old size", () => {
  for (const [w, h] of [[960, 600], [1366, 600], [960, 1000]]) {
    assert.equal(asideScaleFor(w, h), PHONE_ASIDE_SCALE_NARROW, `${w}x${h}`);
  }
});

test("in between, it eases and never leaves the range", () => {
  const mid = asideScaleFor(1080, 900);
  assert.ok(mid > PHONE_ASIDE_SCALE_NARROW && mid < PHONE_ASIDE_SCALE_WIDE);
  const short = asideScaleFor(1440, 680);
  assert.ok(short > PHONE_ASIDE_SCALE_NARROW && short < PHONE_ASIDE_SCALE_WIDE);
  // The device (567px at scale 1) leaves 80px clear above and below.
  assert.ok(567 * short <= 680 - 160 + 0.001);
});
