import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type SocialLinkResponse = {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Published social links, ordered by sortOrder (the backend already filters
 * and sorts). Returns an empty array on any failure so callers can fall back
 * to static defaults without needing to handle a thrown error.
 */
export async function getSocialLinks(): Promise<SocialLinkResponse[]> {
  const base = await getBackendBaseUrl();
  const url = `${base}/v1/social-links`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[socialLinksApi] non-OK response", { url, status: res.status });
      return [];
    }
    const json = await res.json();
    return Array.isArray(json) ? (json as SocialLinkResponse[]) : [];
  } catch (err) {
    console.error("[socialLinksApi] fetch failed", { url, err });
    return [];
  }
}
