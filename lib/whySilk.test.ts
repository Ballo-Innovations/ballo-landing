import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  easePull,
  fadeSettled,
  fadeStep,
  silkArrival,
  silkPixelRatio,
  silkStrength,
  SILK_MAX_FRAME_MS,
  SILK_PEAK_OPACITY,
  SILK_VISIBLE_MIN,
} from "./whySilk";

const ARRIVE: [number, number] = [0.5, 0.6];
const LEAVE: [number, number] = [0.8, 0.9];

describe("silkStrength", () => {
  it("is off before Why Choose arrives", () => {
    assert.equal(silkStrength(0, ARRIVE, LEAVE), 0);
    assert.equal(silkStrength(0.5, ARRIVE, LEAVE), 0);
  });

  it("is fully up while Why Choose is on the stage", () => {
    assert.equal(silkStrength(0.6, ARRIVE, LEAVE), 1);
    assert.equal(silkStrength(0.75, ARRIVE, LEAVE), 1);
  });

  it("rises through the arrival and falls through the exit", () => {
    const rising = silkStrength(0.55, ARRIVE, LEAVE);
    const falling = silkStrength(0.85, ARRIVE, LEAVE);
    assert.ok(rising > 0 && rising < 1);
    assert.ok(falling > 0 && falling < 1);
  });

  it("is off again once the section has left, so the Brutus act is untouched", () => {
    assert.ok(silkStrength(0.9, ARRIVE, LEAVE) < SILK_VISIBLE_MIN);
    assert.ok(silkStrength(1, ARRIVE, LEAVE) < SILK_VISIBLE_MIN);
  });
});

describe("silkPixelRatio", () => {
  it("draws below native resolution", () => {
    assert.equal(silkPixelRatio(1, 1280), 0.6);
    assert.equal(silkPixelRatio(2, 1280), 0.9);
  });

  it("treats a missing or tiny ratio as 1", () => {
    assert.equal(silkPixelRatio(0, 1280), 0.6);
    assert.equal(silkPixelRatio(0.5, 1280), 0.6);
  });

  it("thins out on very wide screens", () => {
    assert.ok(silkPixelRatio(2, 2880) < silkPixelRatio(2, 1440));
  });
});

describe("easePull", () => {
  it("moves toward the target without overshooting", () => {
    const next = easePull(0, 1, 16);
    assert.ok(next > 0 && next < 1);
    assert.ok(easePull(next, 1, 10_000) <= 1);
  });

  it("ignores negative time steps", () => {
    assert.equal(easePull(0.4, 1, -50), 0.4);
  });
});

describe("SILK_PEAK_OPACITY", () => {
  it("keeps the silk a subtle background, well short of opaque", () => {
    assert.ok(SILK_PEAK_OPACITY > SILK_VISIBLE_MIN);
    assert.ok(SILK_PEAK_OPACITY <= 0.6);
  });
});

function run(x: number, target: number, ms: number): number[] {
  const out: number[] = [];
  let v = 0;
  for (let t = 0; t < ms; t += 16) {
    [x, v] = fadeStep(x, v, target, 16);
    out.push(x);
  }
  return out;
}

describe("fadeStep", () => {
  it("starts gently instead of jumping", () => {
    const [first] = run(0, 0.55, 16);
    assert.ok(first < 0.01, `first frame moved ${first}`);
  });

  it("rises smoothly without overshooting and is nearly there in under 2s", () => {
    const xs = run(0, 0.55, 2000);
    for (let i = 1; i < xs.length; i++) assert.ok(xs[i] >= xs[i - 1] - 1e-9);
    assert.ok(Math.max(...xs) <= 0.55 + 1e-9);
    assert.ok(xs[xs.length - 1] > 0.53);
  });

  it("falls smoothly to zero without going below it", () => {
    const xs = run(0.55, 0, 1600);
    for (let i = 1; i < xs.length; i++) assert.ok(xs[i] <= xs[i - 1] + 1e-9);
    assert.ok(Math.min(...xs) >= 0);
    assert.ok(xs[xs.length - 1] < 0.01);
  });

  it("survives a long stalled frame", () => {
    const [x, v] = fadeStep(0, 0, 0.55, 5000);
    assert.ok(x >= 0 && x <= 0.55 && Number.isFinite(v));
  });

  it("ignores negative time steps", () => {
    assert.deepEqual(fadeStep(0.3, 0, 0.55, -40), [0.3, 0]);
  });
});

describe("fadeSettled", () => {
  it("is true only at rest on the target", () => {
    assert.equal(fadeSettled(0.55, 0, 0.55), true);
    assert.equal(fadeSettled(0.5, 0, 0.55), false);
    assert.equal(fadeSettled(0.55, 0.3, 0.55), false);
  });
});

describe("silkArrival", () => {
  it("doubles the length of the copy swap", () => {
    assert.deepEqual(silkArrival([0.5, 0.6]), [0.5, 0.7]);
  });
});

describe("SILK_MAX_FRAME_MS", () => {
  it("keeps one capped frame to a small, invisible step", () => {
    const [x] = fadeStep(0, 0, SILK_PEAK_OPACITY, SILK_MAX_FRAME_MS);
    assert.ok(x < 0.05, `one capped frame moved ${x}`);
  });
});
