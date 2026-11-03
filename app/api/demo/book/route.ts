import { NextRequest, NextResponse } from "next/server";
import {
  callBackend,
  flagOffResponse,
  jsonError,
  readJsonBody,
  safeMeetingUrl,
  str,
  unwrapData,
} from "@/lib/demoBooking/proxy";
import {
  COMPANY_SIZES,
  INTERESTS,
  isIsoInstant,
  isPlausibleToken,
  isValidEmail,
  LIMITS,
  normalizePhone,
} from "@/lib/demoBooking/shared";

export const dynamic = "force-dynamic";

const SIZE_VALUES = new Set<string>(COMPANY_SIZES.map((s) => s.value));
const INTEREST_VALUES = new Set<string>(INTERESTS.map((i) => i.value));
const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** POST /api/demo/book -> POST /v1/demo-bookings */
export async function POST(request: NextRequest) {
  const off = flagOffResponse();
  if (off) return off;

  const body = await readJsonBody(request);
  if (!body) return jsonError("Please check your details and try again.", 400);

  const name = text(body.name);
  const company = text(body.company);
  const email = text(body.email);
  const phoneInput = text(body.phone);
  const companySize = text(body.companySize);
  const message = text(body.message);
  const start = body.start;
  const timeZone = text(body.timeZone);
  const sourcePage = text(body.sourcePage);
  const turnstileToken = text(body.turnstileToken);
  const website = typeof body.website === "string" ? body.website : "";

  if (!name) return jsonError("Please tell us your name.", 400);
  if (name.length > LIMITS.name) return jsonError("That name is too long.", 400);
  if (!company) return jsonError("Please tell us your company name.", 400);
  if (company.length > LIMITS.company) return jsonError("That company name is too long.", 400);
  if (!isValidEmail(email)) return jsonError("Please enter a valid email address.", 400);

  let phone: string | undefined;
  if (phoneInput) {
    const normalized = phoneInput.length <= LIMITS.phone ? normalizePhone(phoneInput) : null;
    if (!normalized) {
      return jsonError("Please enter a valid phone number, for example 0971 234 567 or +260 97 123 4567.", 400);
    }
    phone = normalized;
  }

  if (companySize && !SIZE_VALUES.has(companySize)) return jsonError("Please pick a company size from the list.", 400);

  const interests = Array.isArray(body.interests) ? body.interests : [];
  if (interests.length > INTEREST_VALUES.size || interests.some((i) => typeof i !== "string" || !INTEREST_VALUES.has(i))) {
    return jsonError("Please pick topics from the list.", 400);
  }

  if (message.length > LIMITS.message) {
    return jsonError(`Please keep your message under ${LIMITS.message} characters.`, 400);
  }
  if (start !== undefined && start !== null && !isIsoInstant(start)) {
    return jsonError("Please pick a time from the calendar.", 400);
  }
  if (timeZone && (timeZone.length > LIMITS.timeZone || !isValidTimeZone(timeZone))) {
    return jsonError("Please check your details and try again.", 400);
  }
  if (sourcePage && (sourcePage.length > LIMITS.sourcePage || !sourcePage.startsWith("/"))) {
    return jsonError("Please check your details and try again.", 400);
  }
  if (turnstileToken.length > LIMITS.turnstileToken) return jsonError("Captcha check failed", 400);

  let utm: Record<string, string> | undefined;
  if (body.utm && typeof body.utm === "object" && !Array.isArray(body.utm)) {
    const raw = body.utm as Record<string, unknown>;
    const picked: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const v = text(raw[key]);
      if (v) picked[key] = v.slice(0, LIMITS.utm);
    }
    if (Object.keys(picked).length > 0) utm = picked;
  }

  const result = await callBackend(request, "/v1/demo-bookings", {
    method: "POST",
    body: {
      name,
      company,
      email,
      phone,
      companySize: companySize || undefined,
      interests: interests.length > 0 ? interests : undefined,
      message: message || undefined,
      start: typeof start === "string" ? start : undefined,
      timeZone: timeZone || undefined,
      sourcePage: sourcePage || undefined,
      utm,
      turnstileToken: turnstileToken || undefined,
      website,
    },
  });
  if (!result.ok) return result.response;

  const data = unwrapData(result.data);
  const status = data?.status === "booked" ? "booked" : "requested";
  const raw = data?.booking && typeof data.booking === "object" ? (data.booking as Record<string, unknown>) : null;
  const manageToken = str(raw?.manageToken);
  const booking =
    status === "booked" && raw && isPlausibleToken(manageToken)
      ? {
          reference: str(raw.reference) ?? "",
          start: str(raw.start) ?? "",
          end: str(raw.end) ?? "",
          hostName: str(raw.hostName),
          meetingUrl: safeMeetingUrl(raw.meetingUrl),
          manageToken,
        }
      : null;

  return NextResponse.json({ data: { status: booking ? "booked" : "requested", booking } }, { status: 201 });
}
