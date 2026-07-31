import { headers } from "next/headers";

const DEV_API_BASE = process.env.NEXT_PUBLIC_DEV_API_URL ?? "https://dev-api.balloads.com";
const PROD_API_BASE = process.env.NEXT_PUBLIC_PROD_API_URL ?? "https://api.balloads.com";

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, "");
}

async function getBackendBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host")?.toLowerCase() ?? "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return normalizeBase(DEV_API_BASE);
  }
  return normalizeBase(PROD_API_BASE);
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

  const res = await fetch(`${base}/v1/blog-posts?${search.toString()}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    return { data: [], pagination: { total: 0, page: 1, limit: 0, totalPages: 1 } };
  }
  return res.json();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const base = await getBackendBaseUrl();
  const res = await fetch(`${base}/v1/blog-posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) return null;
  return res.json();
}
