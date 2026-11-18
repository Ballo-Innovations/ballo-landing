import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { flightFrames, promote, sameBox, tourSlot } from "./guidesCarousel.ts";

const GUIDES = ["A", "B", "C", "D", "E", "F", "G"];

describe("promote", () => {
  it("swaps the chosen slot with the big card", () => {
    assert.deepEqual(promote(GUIDES, 0), ["B", "A", "C", "D", "E", "F", "G"]);
    assert.deepEqual(promote(GUIDES, 3), ["E", "B", "C", "D", "A", "F", "G"]);
    assert.deepEqual(promote(GUIDES, 5), ["G", "B", "C", "D", "E", "F", "A"]);
  });

  it("keeps every guide exactly once", () => {
    const next = promote(GUIDES, 4);
    assert.equal(next.length, GUIDES.length);
    assert.deepEqual([...next].sort(), [...GUIDES].sort());
  });

  it("leaves the order alone for a slot that is not there", () => {
    for (const slot of [-1, 6, 99, 1.5, NaN]) {
      assert.deepEqual(promote(GUIDES, slot), GUIDES, `slot ${slot}`);
    }
  });

  it("does not mutate the order it was given", () => {
    const original = [...GUIDES];
    promote(GUIDES, 2);
    assert.deepEqual(GUIDES, original);
  });
});

describe("tourSlot", () => {
  it("walks every slot in turn, so every guide gets the big card", () => {
    const slots = [0, 1, 2, 3, 4, 5, 6, 7].map((t) => tourSlot(t, 6));
    assert.deepEqual(slots, [0, 1, 2, 3, 4, 5, 0, 1]);
  });

  it("gives each guide a turn over a full tour", () => {
    let order = [...GUIDES];
    const seen = new Set([order[0]]);
    for (let tick = 0; tick < GUIDES.length - 1; tick++) {
      order = promote(order, tourSlot(tick, order.length - 1));
      seen.add(order[0]);
    }
    assert.deepEqual([...seen].sort(), [...GUIDES].sort());
  });

  it("survives a negative or empty count", () => {
    assert.equal(tourSlot(-1, 6), 5);
    assert.equal(tourSlot(3, 0), 0);
  });
});

describe("flightFrames", () => {
  it("starts on the old box and lands on the new one", () => {
    const [from, to] = flightFrames(
      { left: 900, top: 140, width: 220, height: 165 },
      { left: 120, top: 150, width: 640, height: 430 },
    );
    assert.equal(from.transform, "translate(780px, -10px)");
    assert.equal(from.width, "220px");
    assert.equal(from.height, "165px");
    assert.equal(to.transform, "translate(0px, 0px)");
    assert.equal(to.width, "640px");
    assert.equal(to.height, "430px");
  });
});

describe("sameBox", () => {
  const box = { left: 10, top: 10, width: 100, height: 100 };
  it("accepts sub-pixel drift", () => {
    assert.equal(sameBox(box, { ...box, left: 10.4 }), true);
  });
  it("rejects a real move", () => {
    assert.equal(sameBox(box, { ...box, left: 400 }), false);
    assert.equal(sameBox(box, { ...box, height: 300 }), false);
  });
});
