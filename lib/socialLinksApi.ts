import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";
import { cmsFetchInit } from "@/lib/cmsFetch";

export type SocialLinkResponse = {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getSocialLinks(): Promise<SocialLinkResponse[]> {
  const headerList = await headers();
  const base = resolvePublicApiBase(headerList.get("host"));
  const url = `${base}/v1/social-links`;
  try {
    const res = await fetch(url, cmsFetchInit());
    if (!res.ok) {
      console.error("[socialLinksApi] non-OK response", { url, status: res.status });
      return [];
    }
    const json = (await res.json()) as SocialLinkResponse[];
    return Array.isArray(json) ? json : [];
  } catch (err) {
    console.error("[socialLinksApi] fetch failed", { url, err });
    return [];
  }
}
