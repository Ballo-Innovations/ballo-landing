/**
 * Minimal fixed-window rate limiter for public, unauthenticated route handlers.
 *
 * Brutus has no throttling of its own, and /api/brutus-chat spends real LLM
 * tokens for anyone who can reach the marketing site — so the limit has to live
 * here, in front of it.
 *
 * Scope and honesty about it: the counter is in this process's memory. With
 * several server instances the effective limit is (limit x instances), and it
 * resets on deploy. That is a speed bump against casual abuse and accidental
 * loops, not a security control; the real ceiling is Brutus's own daily spend
 * cap (`costCeiling.dailyUsd`), keyed on the productId this site sends.
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window resets — feeds the Retry-After header. */
  retryAfterSeconds: number;
};

export type RateLimiter = {
  check(key: string, now?: number): RateLimitResult;
};

export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
  /** Cap on tracked keys, so a spray of unique IPs cannot grow the map forever. */
  maxKeys?: number;
}): RateLimiter {
  const { limit, windowMs } = options;
  const maxKeys = options.maxKeys ?? 10000;
  const windows = new Map<string, { count: number; resetAt: number }>();

  function sweep(now: number): void {
    for (const [key, window] of windows) {
      if (window.resetAt <= now) windows.delete(key);
    }
  }

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      const existing = windows.get(key);

      if (!existing || existing.resetAt <= now) {
        // Only sweep when the map is getting large — O(n) on every request would
        // make the limiter itself the bottleneck under load.
        if (windows.size >= maxKeys) {
          sweep(now);
          if (windows.size >= maxKeys) windows.clear();
        }
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
      }

      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

      if (existing.count >= limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds };
      }

      existing.count++;
      return {
        allowed: true,
        remaining: Math.max(0, limit - existing.count),
        retryAfterSeconds,
      };
    },
  };
}

/**
 * Best-effort client identity for rate limiting: the left-most address in
 * `x-forwarded-for`, which is the original client when the chain is added by
 * our own proxy. Spoofable in principle, hence "best effort" — see the note on
 * scope above.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
