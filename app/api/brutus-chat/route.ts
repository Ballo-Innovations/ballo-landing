import { NextRequest, NextResponse } from "next/server";

import { callBrutusChat, validateBrutusChatRequest } from "@/lib/brutusChat";
import { clientKeyFromHeaders, createRateLimiter } from "@/lib/rateLimit";

/** Leaves headroom over the client's 25s upstream timeout. */
export const maxDuration = 30;

/**
 * Per-IP throttle. This route is public and unauthenticated, and every call
 * spends LLM tokens — see lib/rateLimit.ts for what this does and does not
 * protect. Module scope so the window survives across requests on an instance.
 */
const limiter = createRateLimiter({ limit: 12, windowMs: 60_000 });

export async function POST(request: NextRequest) {
  const key = clientKeyFromHeaders(request.headers);
  const rate = limiter.check(key);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "That is a lot of questions at once. Give it a few seconds and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const validated = validateBrutusChatRequest(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const result = await callBrutusChat(validated.value);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.answer);
}
