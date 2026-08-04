/**
 * Public marketing-site backend bases.
 *
 * Blog posts, waitlist, and announcements live on the full app-api surface.
 * The path-restricted developer hosts (api / api-dev / api-staging) do NOT
 * expose `/v1/blog-posts` — Traefik only forwards messaging/otp/dev-portal/
 * callbacks/payments there.
 */
export const DEV_APP_API_BASE =
  process.env.NEXT_PUBLIC_DEV_API_URL ?? "https://app-api-dev.balloads.com";
export const STAGING_APP_API_BASE =
  process.env.NEXT_PUBLIC_STAGING_API_URL ?? "https://app-api-staging.balloads.com";
export const PROD_APP_API_BASE =
  process.env.NEXT_PUBLIC_PROD_API_URL ?? "https://app-api.balloads.com";

export function normalizeApiBase(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Pick the app-api base from the incoming site host.
 * - localhost / 127.0.0.1 / *dev* → dev
 * - *staging* → staging
 * - everything else → prod
 */
export function resolvePublicApiBase(host: string | null | undefined): string {
  const h = (host ?? "").toLowerCase();
  if (
    h.includes("localhost") ||
    h.includes("127.0.0.1") ||
    h.startsWith("dev.") ||
    h.includes(".dev.") ||
    h.includes("dev-")
  ) {
    return normalizeApiBase(DEV_APP_API_BASE);
  }
  if (h.startsWith("staging.") || h.includes(".staging.") || h.includes("staging-")) {
    return normalizeApiBase(STAGING_APP_API_BASE);
  }
  return normalizeApiBase(PROD_APP_API_BASE);
}
