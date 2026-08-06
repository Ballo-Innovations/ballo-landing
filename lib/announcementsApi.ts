import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type Announcement = {
  id: number;
  title: string;
  description: string | null;
  badge: string | null;
  badgeColor: string | null;
  iconName: string | null;
  isPublished: boolean;
  sortOrder: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

async function fetchAnnouncementsJson<T>(path: string): Promise<T | null> {
  const base = await getBackendBaseUrl();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[announcementsApi] non-OK response", { url, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[announcementsApi] fetch failed", { url, err });
    return null;
  }
}

/**
 * Published, non-expired announcements, ordered by sortOrder then createdAt
 * desc. Filtering/ordering is already done server-side — render as-is.
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  const json = await fetchAnnouncementsJson<Announcement[]>("/v1/announcements");
  if (!json || !Array.isArray(json)) return [];
  return json;
}
