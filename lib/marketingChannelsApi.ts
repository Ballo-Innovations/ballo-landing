import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";
import { cmsFetchInit } from "@/lib/cmsFetch";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type MarketingChannelKey = "sms" | "email" | "whatsapp";

export type MarketingChannelFeature = {
  title: string;
  description: string;
};

export type MarketingChannelStep = {
  label: string;
  description: string;
};

export type MarketingChannel = {
  id: number;
  key: string;
  headline: string;
  intro: string;
  heroImageUrl: string | null;
  features: MarketingChannelFeature[];
  steps: MarketingChannelStep[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

async function fetchMarketingChannelJson<T>(path: string): Promise<T | null> {
  const base = await getBackendBaseUrl();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, cmsFetchInit());
    if (!res.ok) {
      console.error("[marketingChannelsApi] non-OK response", { url, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[marketingChannelsApi] fetch failed", { url, err });
    return null;
  }
}

export async function getMarketingChannel(key: MarketingChannelKey): Promise<MarketingChannel | null> {
  return fetchMarketingChannelJson<MarketingChannel>(`/v1/marketing-channels/${encodeURIComponent(key)}`);
}
