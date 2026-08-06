import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type FeaturedBusinessChannel = {
  id: number;
  channelName: string;
  profileImageUrl: string | null;
  // Marketing-curated free-text field (e.g. "12.4k") — NOT a live subscriber
  // count. Treat as opaque display text.
  displaySubscriberCount: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getFeaturedBusinessChannels(): Promise<FeaturedBusinessChannel[]> {
  const base = await getBackendBaseUrl();
  const url = `${base}/v1/featured-business-channels`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[featuredChannelsApi] non-OK response", { url, status: res.status });
      return [];
    }
    const json = await res.json();
    return Array.isArray(json) ? (json as FeaturedBusinessChannel[]) : [];
  } catch (err) {
    console.error("[featuredChannelsApi] fetch failed", { url, err });
    return [];
  }
}
