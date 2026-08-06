import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type ContentPageResponse = {
  id: number;
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * A single CMS content page by slug. Returns null if the slug doesn't exist
 * yet, isn't published (backend 404s), or the request fails — callers should
 * fall back to static placeholder content rather than showing a blank page.
 */
export async function getContentPage(slug: string): Promise<ContentPageResponse | null> {
  const base = await getBackendBaseUrl();
  const url = `${base}/v1/pages/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      if (res.status !== 404) {
        console.error("[pagesApi] non-OK response", { url, status: res.status });
      }
      return null;
    }
    return (await res.json()) as ContentPageResponse;
  } catch (err) {
    console.error("[pagesApi] fetch failed", { url, err });
    return null;
  }
}
