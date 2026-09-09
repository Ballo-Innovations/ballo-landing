import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveFlag } from "./featureFlags";

describe("resolveFlag", () => {
  it("a stored override wins over everything", () => {
    assert.equal(resolveFlag({ stored: true, env: "false", defaultEnabled: false }), true);
    assert.equal(resolveFlag({ stored: false, env: "true", defaultEnabled: true }), false);
  });

  it("an explicit env value beats the mode default", () => {
    assert.equal(resolveFlag({ stored: null, env: "true", defaultEnabled: false }), true);
    assert.equal(resolveFlag({ stored: null, env: "false", defaultEnabled: true }), false);
  });

  it("falls back to the mode default", () => {
    assert.equal(resolveFlag({ stored: null, env: null, defaultEnabled: true }), true);
    assert.equal(resolveFlag({ stored: null, env: null, defaultEnabled: false }), false);
  });

  it("treats junk env values as unset rather than as false", () => {
    assert.equal(resolveFlag({ stored: null, env: "yes", defaultEnabled: true }), true);
    assert.equal(resolveFlag({ stored: null, env: "", defaultEnabled: false }), false);
  });
});
