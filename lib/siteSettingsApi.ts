import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

/**
 * Flat key/value site settings (e.g. contact_phone, contact_email). Missing
 * keys mean "no value set in the CMS yet" — callers should fall back to
 * their own defaults. Returns {} on any failure.
 */
export async function getSiteSettings(): Promise<Record<string, string>> {
  const base = await getBackendBaseUrl();
  const url = `${base}/v1/site-settings`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[siteSettingsApi] non-OK response", { url, status: res.status });
      return {};
    }
    const json = await res.json();
    if (!json || typeof json !== "object" || Array.isArray(json)) return {};
    return json as Record<string, string>;
  } catch (err) {
    console.error("[siteSettingsApi] fetch failed", { url, err });
    return {};
  }
}
