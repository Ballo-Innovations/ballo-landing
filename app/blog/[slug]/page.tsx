import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPostBySlug, getPublishedPosts } from "@/lib/blogApi";
import BlogPostContent from "./BlogPostContent";

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
