/**
 * Demo booking: types and validation shared by the browser and the
 * `/api/demo/*` routes. Mirrors the "Public (anonymous) routes" of the
 * BalloAds demo booking contract (`/v1/demo-bookings`).
 */

export const ZAMBIA_TZ = "Africa/Lusaka";

export type Slot = { start: string; end: string };

export type SlotsResponse = {
  timeZone: string;
  slotMinutes: number;
  captchaRequired: boolean;
  slots: Slot[];
};

export type BookedBooking = {
  reference: string;
  start: string;
  end: string;
  hostName: string | null;
  meetingUrl: string | null;
  manageToken: string;
};

export type BookResponse = {
  status: "booked" | "requested";
  booking: BookedBooking | null;
};

export type ManagedBooking = {
  reference: string;
  status: "booked" | "cancelled" | "completed" | "no_show";
  start: string;
  end: string;
  hostName: string | null;
  meetingUrl: string | null;
  name: string;
  company: string;
  canChange: boolean;
};

export const COMPANY_SIZES = [
  { value: "1-10", label: "1 to 10 people" },
  { value: "11-50", label: "11 to 50 people" },
  { value: "51-200", label: "51 to 200 people" },
  { value: "200+", label: "More than 200 people" },
] as const;

export const INTERESTS = [
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "ai", label: "AI copywriting" },
  { value: "api", label: "API" },
  { value: "crm", label: "CRM" },
] as const;

export const LIMITS = {
  name: 120,
  company: 160,
  email: 254,
  phone: 32,
  message: 2000,
  reason: 500,
  sourcePage: 200,
  utm: 200,
  timeZone: 64,
  turnstileToken: 4096,
} as const;

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length <= LIMITS.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/**
 * Phone check and normalisation. Zambian numbers are accepted as
 * 09x/07x/05x (10 digits) or +260 / 260 followed by 9 digits; anything else
 * must carry its own country code (+ and 8 to 15 digits).
 * Returns the number to send (Zambian numbers as +260...), or null when invalid.
 */
export function normalizePhone(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  if (!/^\+?[\d\s().-]+$/.test(raw)) return null;
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("260")) {
    return /^260[579]\d{8}$/.test(digits) ? `+${digits}` : null;
  }
  if (!hasPlus && digits.startsWith("0")) {
    return /^0[579]\d{8}$/.test(digits) ? `+260${digits.slice(1)}` : null;
  }
  if (hasPlus) {
    return /^\d{8,15}$/.test(digits) ? `+${digits}` : null;
  }
  return null;
}

/** ISO-8601 instant check (the wire format for slot starts). */
export function isIsoInstant(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 40) return false;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

/** Manage tokens are opaque URL-safe strings (43 chars today). */
export function isPlausibleToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/.test(value);
}
