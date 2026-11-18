import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { easePull, silkPixelRatio, silkStrength, SILK_VISIBLE_MIN } from "./whySilk";

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
