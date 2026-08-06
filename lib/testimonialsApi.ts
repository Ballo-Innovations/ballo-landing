import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type Testimonial = {
  id: number;
  quote: string;
  authorName: string;
  authorTitle: string | null;
  authorCompany: string | null;
  authorAvatarUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getTestimonials(): Promise<Testimonial[]> {
  const base = await getBackendBaseUrl();
  const url = `${base}/v1/testimonials`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[testimonialsApi] non-OK response", { url, status: res.status });
      return [];
    }
    const json = await res.json();
    return Array.isArray(json) ? (json as Testimonial[]) : [];
  } catch (err) {
    console.error("[testimonialsApi] fetch failed", { url, err });
    return [];
  }
}
