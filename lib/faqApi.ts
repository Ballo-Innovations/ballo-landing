import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";
import { cmsFetchInit } from "@/lib/cmsFetch";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type FaqEntry = {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

async function fetchFaqJson<T>(path: string): Promise<T | null> {
  const base = await getBackendBaseUrl();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, cmsFetchInit());
    if (!res.ok) {
      console.error("[faqApi] non-OK response", { url, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[faqApi] fetch failed", { url, err });
    return null;
  }
}

/**
 * Published FAQ entries, ordered by category then sortOrder. Filtering/
 * ordering is already done server-side — render as-is.
 */
export async function getFaqs(): Promise<FaqEntry[]> {
  const json = await fetchFaqJson<FaqEntry[]>("/v1/faqs");
  if (!json || !Array.isArray(json)) return [];
  return json;
}
