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

type BlogPostPage = {
  data: BlogPost[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

const REVALIDATE_SECONDS = 300;
const EMPTY_PAGE: BlogPostPage = {
  data: [],
  pagination: { total: 0, page: 1, limit: 0, totalPages: 1 },
};

export async function getPublishedPosts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
}): Promise<BlogPostPage> {
  const base = await getBackendBaseUrl();
  const search = new URLSearchParams();
  if (params?.page) search.set("pageNumber", String(params.page));
  search.set("pageSize", String(params?.pageSize ?? 50));
  if (params?.category) search.set("category", params.category);
  if (params?.tag) search.set("tag", params.tag);

  try {
    const res = await fetch(`${base}/v1/blog-posts?${search.toString()}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return EMPTY_PAGE;
    return res.json();
  } catch {
    return EMPTY_PAGE;
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const base = await getBackendBaseUrl();
  try {
    const res = await fetch(`${base}/v1/blog-posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
