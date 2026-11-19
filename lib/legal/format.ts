const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-11-12" -> "12 November 2026", without timezone surprises. */
export function formatLegalDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/**
 * "Businesses with a BalloAds account" -> "For businesses with a BalloAds account".
 * Leaves names and acronyms (BalloAds, API) capitalised.
 */
export function formatLegalAudience(audience: string): string {
  const text = audience.trim();
  if (!text) return "";
  const first = text.split(/\s/)[0];
  const keep = /^[A-Z]{2,}/.test(first) || /^BalloAds\b/.test(first);
  return `For ${keep ? text : text[0].toLowerCase() + text.slice(1)}`;
}
