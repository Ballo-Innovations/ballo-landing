"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import WaitlistButton from "@/app/components/waitlist/WaitlistButton";
import ConcentricRings from "@/app/components/ui/ConcentricRings";
import { FadeUpReveal } from "@/app/components/ui/FadeUpReveal";
import { BlogBody } from "@/components/blog/BlogBody";
import type { BlogPost } from "@/lib/blogApi";
import { ArrowCircle, ArticleCard } from "../ArticleCard";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Share via the native sheet where there is one, otherwise copy the link. */
function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed the share sheet */
    }
  };
  return (
    <button type="button" onClick={share} className="post-action" aria-label="Share this article">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" />
      </svg>
      {copied && <span className="post-action__note">Link copied</span>}
    </button>
  );
}

export default function BlogPostContent({
  post,
  relatedPosts,
  morePosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
  morePosts: BlogPost[];
}) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  // The sidebar promo card is the first "more" post that isn't already listed as related.
  const relatedSlugs = new Set(relatedPosts.map((p) => p.slug));
  const promoPost = morePosts.find((p) => !relatedSlugs.has(p.slug));

  return (
    <main className="blog-page post-page min-h-screen text-white">
      {/* Hero banner */}
      <header className="post-hero">
        {post.coverImageUrl && (
          <Image src={post.coverImageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="post-hero__shade" />
        <div className="post-hero__inner">
          <h1 className="post-hero__title">{post.title}</h1>
          <div className="post-hero__meta">
            <div className="post-author">
              <span className="post-author__avatar">
                {post.authorAvatarUrl ? (
                  <Image src={post.authorAvatarUrl} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  initials(post.authorName || "Ballo")
                )}
              </span>
              <span className="post-author__text">
                <span className="post-author__name">{post.authorName}</span>
                {post.authorRole && <span className="post-author__role">{post.authorRole}</span>}
              </span>
            </div>
            {post.tags.length > 0 && (
              <div className="post-hero__tags">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="cta-chip post-tag">
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {publishedDate && <time className="post-hero__date">{publishedDate}</time>}
        </div>
      </header>

      <div className="post-layout">
        <article className="post-article">
          <BlogBody body={post.body} />
          <div className="post-actions">
            <ShareButton title={post.title} />
            <button type="button" onClick={() => window.print()} className="post-action" aria-label="Save as PDF">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12M7 10l5 5 5-5M4 17v3h16v-3" />
              </svg>
            </button>
          </div>
        </article>

        <aside className="post-aside">
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="post-aside__title">Related Articles</h2>
              <div className="post-related">
                {relatedPosts.map((article) => (
                  <Link key={article.id} href={`/blog/${article.slug}`} className="post-related__item">
                    <span className="post-related__name">{article.title}</span>
                    <span className="post-related__by">
                      By {article.authorName}
                      <ArrowCircle />
                    </span>
                  </Link>
                ))}
                <Link href="/blog" className="post-related__all">
                  View all
                </Link>
              </div>
            </section>
          )}
          {promoPost && <ArticleCard post={promoPost} className="post-aside__card" />}
        </aside>
      </div>

      {morePosts.length > 0 && (
        <section className="post-more">
          <div className="post-more__rings" aria-hidden="true">
            <ConcentricRings />
          </div>
          <FadeUpReveal yOffset={40} duration={0.7}>
            <h2 className="post-section-title">More from the blog</h2>
          </FadeUpReveal>
          <div className="post-more__grid">
            {morePosts.map((p) => (
              <ArticleCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      <div className="post-ctas">
        <WaitlistButton className="btn-primary">Get Started</WaitlistButton>
        <Link href="/subscription" className="btn-secondary">
          Subscribe
        </Link>
      </div>
    </main>
  );
}
