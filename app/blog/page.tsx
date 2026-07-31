import type { Metadata } from "next";

import { getPublishedPosts } from "@/lib/blogApi";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, updates, and stories from the Ballo team.",
};

export default async function BlogPage() {
  const { data: posts } = await getPublishedPosts({ pageSize: 50 });
  return <BlogPageClient posts={posts} />;
}
