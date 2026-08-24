import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPostBySlug, getPublishedPosts } from "@/lib/blogApi";
import BlogPostContent from "./BlogPostContent";

// No `force-dynamic`: this route already renders per-request because its CMS
// helpers read headers() to pick the environment's API base. All force-dynamic
// added was forcing `no-store` onto every fetch in the route, which overrode the
// revalidate window in lib/cmsFetch.ts and put an uncached upstream round-trip
// in front of every visitor.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { data: related } = await getPublishedPosts({ category: post.category, pageSize: 5 });
  const relatedPosts = related.filter((p) => p.slug !== post.slug).slice(0, 4);

  return <BlogPostContent post={post} relatedPosts={relatedPosts} />;
}
