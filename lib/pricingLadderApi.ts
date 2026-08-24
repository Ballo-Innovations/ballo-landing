import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";
import type { LadderBand } from "@/lib/pricingLadderTypes";
import { cmsFetchInit } from "@/lib/cmsFetch";

export type {
  LadderPlatform,
  LadderPlatformRate,
  LadderBand,
} from "@/lib/pricingLadderTypes";
export { resolveRate, durationLabel } from "@/lib/pricingLadderTypes";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

async function fetchLadderJson<T>(path: string): Promise<T | null> {
  const base = await getBackendBaseUrl();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, cmsFetchInit());
    if (!res.ok) {
      console.error("[pricingLadderApi] non-OK response", { url, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[pricingLadderApi] fetch failed", { url, err });
    return null;
  }
}

/** Durations (days) configured in the backoffice for the Companies pricing ladder. `0` means "no expiry". */
export async function getLadderDurations(): Promise<number[]> {
  const json = await fetchLadderJson<number[]>("/pricing/ladder/durations");
  return Array.isArray(json) ? json : [];
}

/** Companies-segment volume tiers for a given duration, across all channels. */
export async function getLadder(duration: number): Promise<LadderBand[]> {
  const json = await fetchLadderJson<LadderBand[]>(`/pricing/ladder?duration=${duration}`);
  return Array.isArray(json) ? json : [];
}

/** Fetches the ladder for every configured duration in one shot, keyed by duration. */
export async function getAllLadders(): Promise<{ durations: number[]; laddersByDuration: Record<number, LadderBand[]> }> {
  const durations = await getLadderDurations();
  const ladders = await Promise.all(durations.map((d) => getLadder(d)));
  const laddersByDuration: Record<number, LadderBand[]> = {};
  durations.forEach((d, i) => {
    laddersByDuration[d] = ladders[i];
  });
  return { durations, laddersByDuration };
}
