import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";
import { cmsFetchInit } from "@/lib/cmsFetch";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type KnowledgeBaseFieldResponse = {
  key: string;
  sub: string;
  value: string;
};

export type KnowledgeBaseSectionResponse = {
  id: number;
  groupId: number;
  slug: string;
  sectionNumber: string;
  title: string;
  claim: string;
  body: string[];
  fields: KnowledgeBaseFieldResponse[];
  screenshotLabel: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeBaseHubGroup = {
  id: number;
  label: string;
  sortOrder: number;
  sections: KnowledgeBaseSectionResponse[];
};

export type KnowledgeBaseHubResponse = {
  groups: KnowledgeBaseHubGroup[];
};

const EMPTY_HUB: KnowledgeBaseHubResponse = { groups: [] };

async function fetchKnowledgeBaseJson<T>(path: string): Promise<T | null> {
  const base = await getBackendBaseUrl();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, cmsFetchInit());
    if (!res.ok) {
      console.error("[knowledgeBaseApi] non-OK response", { url, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[knowledgeBaseApi] fetch failed", { url, err });
    return null;
  }
}

export async function getKnowledgeBaseHub(): Promise<KnowledgeBaseHubResponse> {
  const json = await fetchKnowledgeBaseJson<KnowledgeBaseHubResponse>("/v1/knowledge-base");
  if (!json || !Array.isArray(json.groups)) return EMPTY_HUB;
  return json;
}
