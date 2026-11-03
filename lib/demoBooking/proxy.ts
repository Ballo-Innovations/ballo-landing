import { NextRequest, NextResponse } from "next/server";
import { getPublicBackendBaseUrl } from "@/lib/serverBackendApi";
import { isFeatureEnabled } from "@/lib/featureFlags";

/**
 * Server-side helpers for the `/api/demo/*` routes. They forward to the
 * BalloAds `/v1/demo-bookings` routes, pass through the client-facing status
 * codes (400, 404, 409, 429) with the backend's message, and never return the
 * backend's own body, host names or stack traces to the browser.
 */

export const GENERIC_ERROR = "Something went wrong on our side. Please try again in a minute.";

export const BOOKING_NOT_FOUND = "We couldn't find that booking. The link may be incomplete or out of date.";

const UPSTREAM_TIMEOUT_MS = 15_000;

/** The routes 404 like any unknown path while the landing flag is off. */
export function flagOffResponse(): NextResponse | null {
  if (isFeatureEnabled("bookDemo")) return null;
  return new NextResponse("Not Found", { status: 404 });
}

export function jsonError(message: string, status: number, headers?: HeadersInit): NextResponse {
  return NextResponse.json({ error: message }, { status, headers });
}

/** First hop of X-Forwarded-For (Vercel sets it to the visitor), else X-Real-IP. */
export function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return request.headers.get("x-real-ip")?.trim() || null;
}

function parseJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export type UpstreamResult =
  | { ok: true; status: number; data: Record<string, unknown> | null }
  | { ok: false; response: NextResponse };

type Messages = { notFound?: string };

/**
 * Calls the backend and either returns the parsed JSON (2xx) or a ready-made
 * error response for the browser.
 */
export async function callBackend(
  request: NextRequest,
  path: string,
  init: { method: "GET" | "POST"; body?: unknown },
  messages: Messages = {},
): Promise<UpstreamResult> {
  const base = getPublicBackendBaseUrl(request);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  const ip = clientIp(request);
  if (ip) headers["X-Forwarded-For"] = ip;
  const ua = request.headers.get("user-agent");
  if (ua) headers["User-Agent"] = ua.slice(0, 300);

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Demo booking upstream unreachable", path, error);
    return { ok: false, response: jsonError(GENERIC_ERROR, 502) };
  }

  const text = await res.text();
  const data = parseJson(text);
  if (res.ok) return { ok: true, status: res.status, data };

  console.error("Demo booking upstream error", res.status, path, text.slice(0, 200));
  const upstreamMessage = typeof data?.error === "string" ? data.error : null;

  if (res.status === 404) {
    return { ok: false, response: jsonError(messages.notFound ?? "Not found.", 404) };
  }
  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    return {
      ok: false,
      response: jsonError(
        upstreamMessage ?? "Too many tries in a short time. Please wait a minute and try again.",
        429,
        retryAfter ? { "Retry-After": retryAfter } : undefined,
      ),
    };
  }
  if (res.status === 400 || res.status === 409 || res.status === 422) {
    const fallback =
      res.status === 409
        ? "That time was just taken. Please pick another."
        : "Please check your details and try again.";
    return { ok: false, response: jsonError(upstreamMessage ?? fallback, res.status === 422 ? 400 : res.status) };
  }
  return { ok: false, response: jsonError(GENERIC_ERROR, 502) };
}

/** Reads a JSON object body, or null when the body is missing or malformed. */
export async function readJsonBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** `{ data: {...} }` envelope from the backend, or null. */
export function unwrapData(data: Record<string, unknown> | null): Record<string, unknown> | null {
  const inner = data?.data;
  return inner && typeof inner === "object" && !Array.isArray(inner)
    ? (inner as Record<string, unknown>)
    : null;
}

export function str(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** Only the booking fields the browser needs, so nothing else leaks through. */
export function pickManagedBooking(raw: Record<string, unknown> | null) {
  if (!raw) return null;
  return {
    reference: str(raw.reference) ?? "",
    status: str(raw.status) ?? "booked",
    start: str(raw.start) ?? "",
    end: str(raw.end) ?? "",
    hostName: str(raw.hostName),
    meetingUrl: safeMeetingUrl(raw.meetingUrl),
    name: str(raw.name) ?? "",
    company: str(raw.company) ?? "",
    canChange: raw.canChange === true,
  };
}

/** Meeting links are shown as links, so only http(s) URLs get through. */
export function safeMeetingUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
