import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/blogApi";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://balloads.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await getPublishedPosts({ pageSize: 500 });

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt ?? undefined,
  }));

  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/blog` },
    ...postEntries,
  ];
}
