import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { clientKeyFromHeaders, createRateLimiter } from "./rateLimit";

describe("createRateLimiter", () => {
  it("allows up to the limit inside one window, then refuses", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });

    assert.equal(limiter.check("a", 0).allowed, true);
    assert.equal(limiter.check("a", 100).allowed, true);
    assert.equal(limiter.check("a", 200).allowed, true);

    const fourth = limiter.check("a", 300);
    assert.equal(fourth.allowed, false);
    assert.equal(fourth.remaining, 0);
    assert.equal(fourth.retryAfterSeconds, 60);
  });

  it("reports the remaining allowance", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    assert.equal(limiter.check("a", 0).remaining, 1);
    assert.equal(limiter.check("a", 1).remaining, 0);
  });

  it("starts a fresh window once the old one has expired", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    assert.equal(limiter.check("a", 0).allowed, true);
    assert.equal(limiter.check("a", 500).allowed, false);
    assert.equal(limiter.check("a", 1000).allowed, true);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    assert.equal(limiter.check("a", 0).allowed, true);
    assert.equal(limiter.check("b", 0).allowed, true);
    assert.equal(limiter.check("a", 0).allowed, false);
  });

  it("does not grow past maxKeys", () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 1000, maxKeys: 2 });

    // Two live keys fill the map; a third at the same instant forces a clear
    // rather than unbounded growth, and is still allowed.
    assert.equal(limiter.check("a", 0).allowed, true);
    assert.equal(limiter.check("b", 0).allowed, true);
    const third = limiter.check("c", 0);
    assert.equal(third.allowed, true);
    assert.equal(third.remaining, 4);
  });
});

describe("clientKeyFromHeaders", () => {
  it("takes the left-most forwarded address", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
    assert.equal(clientKeyFromHeaders(headers), "203.0.113.7");
  });

  it("falls back to x-real-ip, then to a constant bucket", () => {
    assert.equal(clientKeyFromHeaders(new Headers({ "x-real-ip": "198.51.100.4" })), "198.51.100.4");
    assert.equal(clientKeyFromHeaders(new Headers()), "unknown");
  });
});
