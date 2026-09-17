import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";
import { cmsFetchInit } from "@/lib/cmsFetch";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type PartnerLogo = {
  id: number;
  name: string;
  logoUrl: string;
  sortOrder: number;
  isPublished: boolean;
  /** True = "Backed by" strip; false = "Trusted by the very best" marquee. */
  isBacker: boolean;
  /**
   * What this partner is to BalloAds, revealed when its mark is hovered in the
   * "Backed by" strip. Null on marquee rows, and on any backer row published
   * before the field existed — those reveal the name alone.
   */
  role: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getPartnerLogos(): Promise<PartnerLogo[]> {
  const base = await getBackendBaseUrl();
  const url = `${base}/v1/partner-logos`;
  try {
    const res = await fetch(url, cmsFetchInit());
    if (!res.ok) {
      console.error("[partnerLogosApi] non-OK response", { url, status: res.status });
      return [];
    }
    const json = await res.json();
    return Array.isArray(json) ? (json as PartnerLogo[]) : [];
  } catch (err) {
    console.error("[partnerLogosApi] fetch failed", { url, err });
    return [];
  }
}
