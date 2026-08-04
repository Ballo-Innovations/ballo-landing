import type { NextRequest } from "next/server";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

export function getPublicBackendBaseUrl(request: NextRequest): string {
  return resolvePublicApiBase(request.headers.get("host"));
}
