import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type ProfessionalServiceCard = {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getProfessionalServiceCards(): Promise<ProfessionalServiceCard[]> {
  const base = await getBackendBaseUrl();
  const url = `${base}/v1/professional-services`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[professionalServicesApi] non-OK response", { url, status: res.status });
      return [];
    }
    const json = await res.json();
    return Array.isArray(json) ? (json as ProfessionalServiceCard[]) : [];
  } catch (err) {
    console.error("[professionalServicesApi] fetch failed", { url, err });
    return [];
  }
}
