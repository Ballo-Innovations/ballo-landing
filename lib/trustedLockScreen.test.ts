import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import {
  COMPACT_RUNWAY_STEPS,
  RUNWAY_STEPS,
  STACK_SIZE,
  STEP_MS,
  channelFor,
  createTicker,
  itemAt,
  runwayAt,
  stackAt,
  withoutBackers,
} from "./trustedLockScreen";

describe("itemAt", () => {
  it("wraps in both directions", () => {
    const items = ["a", "b", "c"];
    assert.equal(itemAt(items, 0), "a");
    assert.equal(itemAt(items, 4), "b");
    assert.equal(itemAt(items, -1), "c");
  });

  it("returns undefined for an empty list", () => {
    assert.equal(itemAt([], 3), undefined);
  });
});

describe("runwayAt", () => {
  it("holds the logos launched in the last RUNWAY_STEPS steps, oldest first", () => {
    const runway = runwayAt({ step: 10, epoch: 2, epochStart: 4 });
    assert.deepEqual(
      runway.map((r) => r.launch),
      [7, 8, 9, 10],
    );
    assert.equal(runway.length, RUNWAY_STEPS);
  });

  it("starts logos already in flight when the clock (re)starts part-way along", () => {
    const runway = runwayAt({ step: 10, epoch: 3, epochStart: 10 });
    assert.deepEqual(
      runway.map((r) => r.delayMs),
      [-3 * STEP_MS, -2 * STEP_MS, -1 * STEP_MS, 0],
    );
  });

  it("starts logos launched after the clock started from the left edge", () => {
    const runway = runwayAt({ step: 10, epoch: 3, epochStart: 8 });
    assert.deepEqual(
      runway.map((r) => r.delayMs),
      [-1 * STEP_MS, 0, 0, 0],
    );
  });

  it("keys runners by epoch, so a restart remounts them with fresh delays", () => {
    const a = runwayAt({ step: 10, epoch: 1, epochStart: 4 });
    const b = runwayAt({ step: 10, epoch: 2, epochStart: 10 });
    assert.notEqual(a[0].key, b[0].key);
  });
});

describe("stackAt", () => {
  it("puts the logo that just reached the mark on top", () => {
    const stack = stackAt(10);
    // Launched RUNWAY_STEPS steps ago, so its runner ends on this step.
    assert.equal(stack[0].launch, 10 - RUNWAY_STEPS);
    assert.equal(stack[0].slot, 0);
  });

  it("shows STACK_SIZE notes plus one on its way out", () => {
    const stack = stackAt(10);
    assert.equal(stack.length, STACK_SIZE + 1);
    assert.deepEqual(
      stack.map((n) => n.slot),
      [0, 1, 2, 3, 4],
    );
  });

  it("never names a launch the runway is still carrying", () => {
    const step = 21;
    const onRunway = new Set(runwayAt({ step, epoch: 1, epochStart: 0 }).map((r) => r.launch));
    for (const note of stackAt(step)) assert.equal(onRunway.has(note.launch), false);
  });

  it("keys notes by launch only, so they survive a clock restart", () => {
    assert.equal(stackAt(10)[1].key, stackAt(11)[2].key);
  });
});

describe("a shorter runway (small screens)", () => {
  it("carries fewer logos and lands each one sooner, still in step", () => {
    const steps = COMPACT_RUNWAY_STEPS;
    const state = { step: 30, epoch: 1, epochStart: 0 };
    assert.deepEqual(
      runwayAt(state, steps).map((r) => r.launch),
      [29, 30],
    );
    assert.equal(stackAt(30, steps)[0].launch, 28);
    const onRunway = new Set(runwayAt(state, steps).map((r) => r.launch));
    for (const note of stackAt(30, steps)) assert.equal(onRunway.has(note.launch), false);
  });
});

describe("channelFor", () => {
  it("makes every third brand a WhatsApp message", () => {
    assert.deepEqual(
      [0, 1, 2, 3, 4, 5].map(channelFor),
      ["sms", "sms", "whatsapp", "sms", "sms", "whatsapp"],
    );
  });
});

describe("createTicker", () => {
  it("advances one step per interval while running, and not after stop", () => {
    mock.timers.enable({ apis: ["setInterval"] });
    try {
      const ticker = createTicker(1000, 5);
      const seen: number[] = [];
      const unsubscribe = ticker.subscribe(() => seen.push(ticker.getState().step));

      ticker.start();
      mock.timers.tick(3000);
      ticker.stop();
      mock.timers.tick(3000);
      unsubscribe();

      assert.equal(ticker.getState().step, 8);
      // One notification for the start (new epoch), then one per step.
      assert.deepEqual(seen, [5, 6, 7, 8]);
    } finally {
      mock.timers.reset();
    }
  });

  it("opens a new epoch at the current step on each start", () => {
    mock.timers.enable({ apis: ["setInterval"] });
    try {
      const ticker = createTicker(1000, 5);
      ticker.start();
      mock.timers.tick(2000);
      ticker.stop();
      ticker.start();
      assert.deepEqual(ticker.getState(), { step: 7, epoch: 2, epochStart: 7 });
    } finally {
      mock.timers.reset();
    }
  });

  it("ignores a second start while running", () => {
    mock.timers.enable({ apis: ["setInterval"] });
    try {
      const ticker = createTicker(1000, 0);
      ticker.start();
      ticker.start();
      mock.timers.tick(1000);
      assert.deepEqual(ticker.getState(), { step: 1, epoch: 1, epochStart: 0 });
      ticker.stop();
    } finally {
      mock.timers.reset();
    }
  });

  it("returns the same snapshot object until something changes", () => {
    const ticker = createTicker(1000, 0);
    assert.equal(ticker.getState(), ticker.getState());
  });
});

describe("withoutBackers", () => {
  const backers = [{ alt: "Airtel" }, { alt: "MTN" }, { alt: "Meta" }, { alt: "ZICTA" }];

  it("drops clients that are really the backers, including longer names", () => {
    const clients = [
      { alt: "Bayport" },
      { alt: "MTN Zambia" },
      { alt: " zicta " },
      { alt: "Airtel" },
      { alt: "Seneca" },
    ];
    assert.deepEqual(
      withoutBackers(clients, backers).map((c) => c.alt),
      ["Bayport", "Seneca"],
    );
  });

  it("keeps a client whose name merely starts with the same letters", () => {
    assert.deepEqual(
      withoutBackers([{ alt: "Metalworks Ltd" }, { alt: "MTNX" }], backers).map((c) => c.alt),
      ["Metalworks Ltd", "MTNX"],
    );
  });

  it("returns the clients unchanged when there are no backers", () => {
    const clients = [{ alt: "Bayport" }];
    assert.deepEqual(withoutBackers(clients, []), clients);
  });
});
