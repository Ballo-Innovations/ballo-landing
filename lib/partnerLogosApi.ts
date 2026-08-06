import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

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
  createdAt: string;
  updatedAt: string;
};

export async function getPartnerLogos(): Promise<PartnerLogo[]> {
  const base = await getBackendBaseUrl();
  const url = `${base}/v1/partner-logos`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
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
