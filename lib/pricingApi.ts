import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";
import { cmsFetchInit } from "@/lib/cmsFetch";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type PricingPlanChannel = "Sms" | "Email" | "WhatsApp";
export type PricingPlanType = "Recurring" | "Unlimited";

export type PricingFeature = {
  text: string;
  included: boolean;
};

export type PricingPlan = {
  id: number;
  channel: PricingPlanChannel;
  planType: PricingPlanType;
  title: string;
  currency: string;
  subtitle: string;
  iconName: string | null;
  features: PricingFeature[];
  basePrice: number;
  pricePerUnit: number;
  unitSize: number;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

async function fetchPricingJson<T>(path: string): Promise<T | null> {
  const base = await getBackendBaseUrl();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, cmsFetchInit());
    if (!res.ok) {
      console.error("[pricingApi] non-OK response", { url, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[pricingApi] fetch failed", { url, err });
    return null;
  }
}

/**
 * Published pricing plans, ordered by channel then sortOrder (server-side).
 * Pass `planType` to scope to the "monthly" (Recurring) or "unlimited" tab —
 * omit it to get every published plan across both.
 */
export async function getPricingPlans(planType?: PricingPlanType): Promise<PricingPlan[]> {
  const search = new URLSearchParams();
  if (planType) search.set("planType", planType);
  const qs = search.toString();

  const json = await fetchPricingJson<PricingPlan[]>(`/v1/pricing-plans${qs ? `?${qs}` : ""}`);
  return Array.isArray(json) ? json : [];
}
