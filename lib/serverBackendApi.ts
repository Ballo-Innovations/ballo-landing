import type { NextRequest } from "next/server";

// Server-side calls go to the full "app-api[-env]" surface. The path-restricted developer
// surface (api[-env].balloads.com) does not route /v1/waitlist and answers with Traefik's
// plain-text "404 page not found", which is what produced the 500s on the waitlist form.
// NEXT_PUBLIC_*_API_URL is deliberately not used here: on Vercel it points at that
// developer surface.
const DEV_API_BASE =
  process.env.BACKEND_APP_API_DEV_URL ?? "https://app-api-dev.balloads.com";
const PROD_API_BASE =
  process.env.BACKEND_APP_API_URL ?? "https://app-api.balloads.com";

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getPublicBackendBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return normalizeBase(DEV_API_BASE);
  }
  return normalizeBase(PROD_API_BASE);
}
