import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

export type ContentPage = {
  id: number;
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getContentPage(slug: string): Promise<ContentPage | null> {
  const headerList = await headers();
  const base = resolvePublicApiBase(headerList.get("host"));
  const url = `${base}/v1/pages/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) {
      if (res.status !== 404) {
        console.error("[pagesApi] non-OK response", { url, status: res.status });
      }
      return null;
    }
    return (await res.json()) as ContentPage;
  } catch (err) {
    console.error("[pagesApi] fetch failed", { url, err });
    return null;
  }
}
