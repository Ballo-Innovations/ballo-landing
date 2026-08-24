import { unstable_cache } from "next/cache";
import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";
import { CMS_REVALIDATE_SECONDS, cmsFetchInit } from "@/lib/cmsFetch";

export type ContentPage = {
  id: number;
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Wrapped in unstable_cache rather than relying on the fetch cache alone,
 * because several of these slugs are not seeded in the CMS and answer 404 —
 * and Next does NOT cache a non-OK response. Every request to /careers,
 * /privacy-policy, /resources and /subscription was therefore re-paying the
 * upstream round-trip for a result it already knew (measured ~1s, and 6.5s on
 * one occasion). unstable_cache stores the resolved value INCLUDING null, so a
 * miss now costs one upstream call per window instead of one per visitor.
 *
 * The API base is resolved by the caller and passed in: headers() is dynamic
 * data and cannot be read inside a cached function. It is an argument, so it
 * forms part of the cache key — dev/staging/prod cannot collide.
 */
const getCachedContentPage = unstable_cache(
  async (base: string, slug: string): Promise<ContentPage | null> => {
    const url = `${base}/v1/pages/${encodeURIComponent(slug)}`;
    try {
      const res = await fetch(url, cmsFetchInit());
      if (!res.ok) {
        if (res.status !== 404) {
          console.error("[pagesApi] non-OK response", { url, status: res.status });
        }
        return null;
      }
      return (await res.json()) as ContentPage;
    } catch (err) {
      console.error("[pagesApi] fetch failed", {
        url,
        err: err instanceof Error ? `${err.name}: ${err.message}` : err,
      });
      return null;
    }
  },
  ["pagesApi:getContentPage"],
  { revalidate: CMS_REVALIDATE_SECONDS },
);

export async function getContentPage(slug: string): Promise<ContentPage | null> {
  const headerList = await headers();
  const base = resolvePublicApiBase(headerList.get("host"));
  return getCachedContentPage(base, slug);
}
