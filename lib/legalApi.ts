import { unstable_cache } from "next/cache";
import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";
import { CMS_REVALIDATE_SECONDS, cmsFetchInit } from "@/lib/cmsFetch";

/**
 * Legal documents are edited and published from the Content Studio CMS and the
 * backoffice (Backoffice/legal-documents). The public endpoints only return
 * published versions; every published version is kept, so older ones stay
 * readable at /legal/<slug>/v/<version>.
 */

export type LegalGroup = "using" | "privacy";

export type LegalDocumentSummary = {
  slug: string;
  group: LegalGroup;
  sortOrder: number;
  title: string;
  summary: string;
  audience: string;
  version: number;
  effectiveDate: string | null;
  publishedAt: string | null;
  showReviewNotice: boolean;
};

export type PublicLegalDocument = LegalDocumentSummary & { bodyHtml: string };

export type LegalVersionSummary = {
  version: number;
  title: string;
  effectiveDate: string | null;
  publishedAt: string | null;
  changeNote: string | null;
  isCurrent: boolean;
};

export const LEGAL_GROUPS: { key: LegalGroup; title: string; description: string }[] = [
  {
    key: "using",
    title: "Using BalloAds",
    description: "The agreement between BalloAds and the businesses that use it.",
  },
  {
    key: "privacy",
    title: "Privacy and data protection",
    description: "How personal data is handled, for our customers and for the people they message.",
  },
];

// unstable_cache stores null too, so a 404 costs one upstream call per window
// rather than one per visitor (same reasoning as lib/pagesApi.ts).
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, cmsFetchInit());
    if (!res.ok) {
      if (res.status !== 404) console.error("[legalApi] non-OK response", { url, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[legalApi] fetch failed", {
      url,
      err: err instanceof Error ? `${err.name}: ${err.message}` : err,
    });
    return null;
  }
}

const cachedList = unstable_cache(
  (base: string) => fetchJson<LegalDocumentSummary[]>(`${base}/v1/legal-documents`),
  ["legalApi:list"],
  { revalidate: CMS_REVALIDATE_SECONDS },
);

const cachedDocument = unstable_cache(
  (base: string, slug: string) =>
    fetchJson<PublicLegalDocument>(`${base}/v1/legal-documents/${encodeURIComponent(slug)}`),
  ["legalApi:document"],
  { revalidate: CMS_REVALIDATE_SECONDS },
);

const cachedVersions = unstable_cache(
  (base: string, slug: string) =>
    fetchJson<LegalVersionSummary[]>(`${base}/v1/legal-documents/${encodeURIComponent(slug)}/versions`),
  ["legalApi:versions"],
  { revalidate: CMS_REVALIDATE_SECONDS },
);

const cachedVersion = unstable_cache(
  (base: string, slug: string, version: number) =>
    fetchJson<PublicLegalDocument>(
      `${base}/v1/legal-documents/${encodeURIComponent(slug)}/versions/${version}`,
    ),
  ["legalApi:version"],
  { revalidate: CMS_REVALIDATE_SECONDS },
);

async function apiBase(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export async function getLegalDocuments(): Promise<LegalDocumentSummary[]> {
  return (await cachedList(await apiBase())) ?? [];
}

export async function getLegalDocument(slug: string): Promise<PublicLegalDocument | null> {
  return cachedDocument(await apiBase(), slug);
}

export async function getLegalVersions(slug: string): Promise<LegalVersionSummary[]> {
  return (await cachedVersions(await apiBase(), slug)) ?? [];
}

export async function getLegalVersion(slug: string, version: number): Promise<PublicLegalDocument | null> {
  return cachedVersion(await apiBase(), slug, version);
}
