/**
 * Shared request options for the public CMS endpoints.
 *
 * Every helper in lib/*Api.ts used to pass `cache: "no-store"` with no timeout,
 * which cost twice over:
 *
 *  - No caching meant a fresh app-api round-trip (~1.5s from outside the
 *    cluster) on EVERY render. `getSiteSettings` and `getSocialLinks` run in the
 *    root layout, so two of them sat in front of the first byte of every page on
 *    the site.
 *  - No timeout meant a hung upstream held the render open with it. That is the
 *    likely source of the intermittent "[siteSettingsApi] fetch failed" — the
 *    endpoint answers, just slowly and not always.
 *
 * All of it is public marketing content, so a short revalidate window is safe:
 * one upstream request per window instead of one per visitor.
 *
 * This is a function, not a constant, because an AbortSignal is single-use —
 * one timeout per request.
 */

export const CMS_REVALIDATE_SECONDS = 300;
export const CMS_TIMEOUT_MS = 8000;

export function cmsFetchInit(): RequestInit & { next?: { revalidate?: number } } {
  return {
    next: { revalidate: CMS_REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
  };
}
