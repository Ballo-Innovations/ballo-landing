import type { Metadata } from "next";

import { getPublishedPosts } from "@/lib/blogApi";
import BlogPageClient from "./BlogPageClient";

// No `force-dynamic`: this route already renders per-request because its CMS
// helpers read headers() to pick the environment's API base. All force-dynamic
// added was forcing `no-store` onto every fetch in the route, which overrode the
// revalidate window in lib/cmsFetch.ts and put an uncached upstream round-trip
// in front of every visitor.

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, updates, and stories from the Ballo team.",
};

const PAGE_SIZE = 12;

// The backend has no dedicated "distinct categories" endpoint (GET /v1/blog-posts
// only returns paginated post data), so the category filter pills are built from a
// separate, uncapped-ish fetch instead of the current (paginated) page's posts.
// This keeps the pill list stable no matter which page/category/tag is active, at
// the cost of one extra request per page load. If the blog ever grows past this
// many published posts, pills for categories outside the scan window won't show up.
const CATEGORY_SCAN_SIZE = 200;

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function readPage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = readPage(params.page);
  const category = readParam(params.category);
  const tag = readParam(params.tag);

  const [{ data: posts, pagination }, { data: allPosts }] = await Promise.all([
    getPublishedPosts({ page, pageSize: PAGE_SIZE, category, tag }),
    getPublishedPosts({ pageSize: CATEGORY_SCAN_SIZE }),
  ]);

  const categories = Array.from(new Set(allPosts.map((p) => p.category).filter(Boolean)));

  return (
    <BlogPageClient
      posts={posts}
      pagination={pagination}
      categories={categories}
      activeCategory={category ?? null}
      activeTag={tag ?? null}
    />
  );
}
