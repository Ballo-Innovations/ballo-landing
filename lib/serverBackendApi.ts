import type { NextRequest } from "next/server";

const DEV_API_BASE =
  process.env.NEXT_PUBLIC_DEV_API_URL ?? "https://dev-api.balloads.com";
const PROD_API_BASE =
  process.env.NEXT_PUBLIC_PROD_API_URL ?? "https://api.balloads.com";

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
