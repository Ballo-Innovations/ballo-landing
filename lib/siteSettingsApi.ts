import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

export async function getSiteSettings(): Promise<Record<string, string>> {
  const headerList = await headers();
  const base = resolvePublicApiBase(headerList.get("host"));
  const url = `${base}/v1/site-settings`;
  try {
    const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.error("[siteSettingsApi] non-OK response", { url, status: res.status });
      return {};
    }
    const json = (await res.json()) as Record<string, string>;
    return json && typeof json === "object" ? json : {};
  } catch (err) {
    console.error("[siteSettingsApi] fetch failed", { url, err });
    return {};
  }
}
