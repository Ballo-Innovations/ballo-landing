"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";

import type { BlogPost } from "@/lib/blogApi";

export default function BlogPostContent({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}) {
  const [likes, setLikes] = useState(0);

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white">
      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Hero Banner */}
        <div className="relative h-96 md:h-[500px] rounded-4xl overflow-hidden mb-12 bg-white/5">
          {post.coverImageUrl && (
            <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4">
              {post.authorAvatarUrl && (
                <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white/30">
                  <Image src={post.authorAvatarUrl} alt={post.authorName} fill className="object-cover" />
                </div>
              )}
              <div className="flex justify-between w-full items-center">
                <div className="flex flex-col">
                  <span className="font-semibold">{post.authorName}</span>
                  {post.authorRole && <span className="text-sm text-white/80">{post.authorRole}</span>}
                  {publishedDate && <span className="text-sm text-white/70">{publishedDate}</span>}
                </div>
                <div>
                  <div className="flex flex-wrap gap-3 justify-end">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[var(--brand-color-1)] px-4 py-2 text-sm font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Main Article Content */}
          <article className="flex flex-col gap-8">
            <div className="prose prose-invert max-w-none text-white/90 leading-relaxed prose-headings:text-white prose-a:text-[var(--brand-color-1)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
            </div>

            {/* Interaction Icons */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setLikes((prev) => prev + 1)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                <span>{likes}</span>
              </button>
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            {relatedPosts.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold">Related Articles</h2>
                <div className="flex flex-col gap-4">
                  {relatedPosts.map((article) => (
                    <Link
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      className="flex items-center justify-between gap-4 rounded-xl bg-white/5 p-4 hover:bg-white/10 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-white/70">By {article.authorName}</p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/20 transition"
            >
              View all
            </Link>
          </aside>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <WaitlistButton className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[var(--brand-color-2)]">
            Get Started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </WaitlistButton>
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-transparent px-8 py-4 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Subscribe
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
