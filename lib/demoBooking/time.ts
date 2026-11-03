import type { Slot } from "./shared";
import { ZAMBIA_TZ } from "./shared";

/** The visitor's IANA time zone, or Zambia when the browser won't say. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ZAMBIA_TZ;
  } catch {
    return ZAMBIA_TZ;
  }
}

/** Calendar date (YYYY-MM-DD) of an instant in a time zone. */
export function dayKey(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export type SlotDay = { key: string; slots: Slot[] };

/** Groups slots by calendar day in `timeZone`, in order, dropping past slots. */
export function groupSlotsByDay(slots: Slot[], timeZone: string, now = Date.now()): SlotDay[] {
  const map = new Map<string, Slot[]>();
  const sorted = [...slots]
    .filter((s) => Date.parse(s.start) > now)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  for (const slot of sorted) {
    const key = dayKey(slot.start, timeZone);
    const list = map.get(key);
    if (list) list.push(slot);
    else map.set(key, [slot]);
  }
  return Array.from(map, ([key, list]) => ({ key, slots: list }));
}

/** Noon UTC on a day key, so formatting it never slips a day. */
function dayKeyToDate(key: string): Date {
  return new Date(`${key}T12:00:00Z`);
}

export function formatDayParts(key: string) {
  const d = dayKeyToDate(key);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(d);
  return {
    weekday: fmt({ weekday: "short" }),
    day: fmt({ day: "numeric" }),
    month: fmt({ month: "short" }),
    long: fmt({ weekday: "long", day: "numeric", month: "long" }),
  };
}

export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** "Thursday 5 November 2026, 09:00 to 09:30" */
export function formatRange(startIso: string, endIso: string, timeZone: string): string {
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(startIso));
  return `${date}, ${formatTime(startIso, timeZone)} to ${formatTime(endIso, timeZone)}`;
}

/** Friendly zone label: "Zambia time (CAT)" or the city plus its short name, e.g. "London (GMT)". */
export function zoneLabel(timeZone: string, at: Date = new Date()): string {
  if (timeZone === ZAMBIA_TZ) return "Zambia time (CAT)";
  let short = "";
  try {
    short =
      new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "short" })
        .formatToParts(at)
        .find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    /* ignore */
  }
  const city = timeZone.split("/").pop()?.replace(/_/g, " ") ?? timeZone;
  return short ? `${city} (${short})` : city;
}

/** True when two zones show the same wall-clock time for every given instant. */
export function sameOffsets(a: string, b: string, instants: string[]): boolean {
  if (a === b) return true;
  const sample = instants.length > 0 ? instants : [new Date().toISOString()];
  return sample.every((iso) => formatTime(iso, a) === formatTime(iso, b) && dayKey(iso, a) === dayKey(iso, b));
}
