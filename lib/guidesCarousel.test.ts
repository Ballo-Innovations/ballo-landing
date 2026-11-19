import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { bringForward, flightFrames, sameBox, slideOffset } from "./guidesCarousel.ts";

const GUIDES = ["A", "B", "C", "D", "E", "F", "G"];

describe("bringForward", () => {
  it("takes the chosen tile out of the queue and sends the big card to the back", () => {
    assert.deepEqual(bringForward(GUIDES, 0), ["B", "C", "D", "E", "F", "G", "A"]);
    assert.deepEqual(bringForward(GUIDES, 3), ["E", "B", "C", "D", "F", "G", "A"]);
    assert.deepEqual(bringForward(GUIDES, 5), ["G", "B", "C", "D", "E", "F", "A"]);
  });

  it("leaves the tiles ahead of the chosen one where they were", () => {
    const next = bringForward(GUIDES, 3);
    assert.deepEqual(next.slice(1, 4), ["B", "C", "D"]);
  });

  it("moves the tiles behind it up exactly one place", () => {
    const next = bringForward(GUIDES, 2);
    assert.equal(next.indexOf("E"), GUIDES.indexOf("E") - 1);
    assert.equal(next.indexOf("G"), GUIDES.indexOf("G") - 1);
  });

  it("keeps every guide exactly once", () => {
    const next = bringForward(GUIDES, 4);
    assert.deepEqual([...next].sort(), [...GUIDES].sort());
  });

  it("gives every guide a turn when slot 0 is taken each time, then comes home", () => {
    let order = [...GUIDES];
    const seen = [order[0]];
    for (let i = 0; i < GUIDES.length - 1; i++) {
      order = bringForward(order, 0);
      seen.push(order[0]);
    }
    assert.deepEqual(seen, GUIDES);
    assert.deepEqual(bringForward(order, 0), GUIDES);
  });

  it("leaves the order alone for a slot that is not there", () => {
    for (const slot of [-1, 6, 99, 1.5, NaN]) {
      assert.deepEqual(bringForward(GUIDES, slot), GUIDES, `slot ${slot}`);
    }
  });

  it("does not mutate the order it was given", () => {
    const original = [...GUIDES];
    bringForward(GUIDES, 2);
    assert.deepEqual(GUIDES, original);
  });
});

describe("slideOffset", () => {
  it("is the way back to where the card was", () => {
    assert.deepEqual(
      slideOffset({ left: 300, top: 400, width: 10, height: 10 }, { left: 100, top: 250, width: 10, height: 10 }),
      { dx: 200, dy: 150 },
    );
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
