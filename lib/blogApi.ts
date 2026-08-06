import { headers } from "next/headers";

import { resolvePublicApiBase } from "@/lib/publicApiBase";

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  return resolvePublicApiBase(headerList.get("host"));
}

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string | null;
  authorAvatarUrl: string | null;
  featured: boolean;
  publishedAt: string | null;
};

export type BlogPostPagination = { total: number; page: number; limit: number; totalPages: number };

type BlogPostPage = {
  data: BlogPost[];
  pagination: BlogPostPagination;
};

const EMPTY_PAGE: BlogPostPage = {
  data: [],
  pagination: { total: 0, page: 1, limit: 0, totalPages: 1 },
};

async function fetchBlogJson<T>(path: string): Promise<T | null> {
  const base = await getBackendBaseUrl();
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[blogApi] non-OK response", { url, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[blogApi] fetch failed", { url, err });
    return null;
  }
}

export async function getPublishedPosts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
}): Promise<BlogPostPage> {
  const search = new URLSearchParams();
  search.set("pageNumber", String(params?.page ?? 1));
  search.set("pageSize", String(params?.pageSize ?? 50));
  if (params?.category) search.set("category", params.category);
  if (params?.tag) search.set("tag", params.tag);

  const json = await fetchBlogJson<BlogPostPage>(`/v1/blog-posts?${search.toString()}`);
  if (!json || !Array.isArray(json.data)) return EMPTY_PAGE;
  return json;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return fetchBlogJson<BlogPost>(`/v1/blog-posts/${encodeURIComponent(slug)}`);
}
