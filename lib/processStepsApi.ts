import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type ProcessStepDetailSection = {
  title: string;
  body: string;
};

export type ProcessStep = {
  id: number;
  slug: string;
  group: string;
  stepNumber: number;
  title: string;
  description: string;
  note: string | null;
  iconName: string | null;
  screenImageUrl: string | null;
  detailIntro: string | null;
  detailSections: ProcessStepDetailSection[];
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

async function fetchProcessStepJson<T>(path: string): Promise<T | null> {
  const base = await getBackendBaseUrl();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      // 404 is an expected outcome for getProcessStepBySlug (missing/unpublished
      // slug) — don't spam the console for it, only log genuine failures.
      if (res.status !== 404) {
        console.error("[processStepsApi] non-OK response", { url, status: res.status });
      }
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[processStepsApi] fetch failed", { url, err });
    return null;
  }
}

/**
 * Published process steps, ordered by group then stepNumber (server-side).
 * Pass `group` to scope to e.g. "how-it-works" or "pricing-cta" — omit it to
 * get every published step across all groups.
 */
export async function getProcessSteps(group?: string): Promise<ProcessStep[]> {
  const search = new URLSearchParams();
  if (group) search.set("group", group);
  const qs = search.toString();

  const json = await fetchProcessStepJson<ProcessStep[]>(`/v1/process-steps${qs ? `?${qs}` : ""}`);
  return Array.isArray(json) ? json : [];
}

export async function getProcessStepBySlug(slug: string): Promise<ProcessStep | null> {
  return fetchProcessStepJson<ProcessStep>(`/v1/process-steps/${encodeURIComponent(slug)}`);
}
