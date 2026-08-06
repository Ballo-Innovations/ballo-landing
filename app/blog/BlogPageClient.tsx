"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { StackedCardCarousel, StackedCard } from "../components/ui/StackedCardCarousel";
import { FadeUpReveal } from "../components/ui/FadeUpReveal";
import ConcentricRings from "../components/ui/ConcentricRings";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";
import type { BlogPost, BlogPostPagination } from "@/lib/blogApi";

type ArticleCardData = {
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  slug: string;
};

function renderArticleCard(article: ArticleCardData, key: React.Key, index = 0) {
  return (
    <FadeUpReveal key={key} yOffset={40} duration={0.7} delay={(index % 4) * 0.08}>
      <Link
        href={`/blog/${article.slug}`}
        className="group relative flex h-64 md:h-72 flex-col justify-end overflow-hidden rounded-2xl bg-white/5"
      >
        {article.coverImageUrl && (
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="relative p-5 pr-12">
          <h3 className="text-base md:text-lg font-bold leading-snug line-clamp-2">{article.title}</h3>
          <p className="mt-1.5 text-[11px] md:text-xs text-white/70 line-clamp-2">{article.excerpt}</p>
        </div>
        <span className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition group-hover:border-white group-hover:bg-white/20">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </Link>
    </FadeUpReveal>
  );
}

const supportHighlights = [
  {
    title: "24/7 Support",
    description: "Our team is available around the clock to ensure your campaigns run smoothly without downtime.",
  },
  {
    title: "Quick Response Time",
    description: "We resolve issues and questions promptly so your business keeps moving without delays.",
  },
  {
    title: "Implementation & Support",
    description: "We handle the full setup and provide continuous assistance to guarantee a seamless transition into our platform.",
  },
  {
    title: "System Integration",
    description: "BalloAds integrates effortlessly with your existing tools and workflows for a unified, efficient marketing ecosystem.",
  },
  {
    title: "Free Training",
    description: "Your team receives comprehensive onboarding and training at no extra cost to help you maximise every feature from day one.",
  },
  {
    title: "Dedicated Account Manager",
    description: "A specialised expert is assigned to your business to offer personalised guidance and strategic support whenever you need it.",
  },
];

/** Build a `/blog` URL preserving whichever of page/category/tag are relevant. */
function blogHref({
  page,
  category,
  tag,
}: {
  page?: number;
  category?: string | null;
  tag?: string | null;
}): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export default function BlogPageClient({
  posts,
  pagination,
  categories,
  activeCategory,
  activeTag,
}: {
  posts: BlogPost[];
  pagination: BlogPostPagination;
  categories: string[];
  activeCategory: string | null;
  activeTag: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Only the current (already server-paginated + server-filtered) page of posts is
  // available client-side, so search can only ever narrow down what's already on
  // screen — it is not a full-dataset search.
  const query = searchQuery.trim().toLowerCase();
  const isSearching = query !== "";
  const filteredPosts = posts.filter((p) => {
    if (!query) return true;
    return `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(query);
  });

  // The featured carousel is a "hero" for the default blog view only — showing it
  // for an arbitrary filtered/paginated slice of posts would be misleading.
  const isDefaultView = pagination.page === 1 && !activeCategory && !activeTag;
  const featuredPosts = useMemo(() => {
    if (!isDefaultView) return [];
    const withCover = posts.filter((p) => p.coverImageUrl);
    const featured = withCover.filter((p) => p.featured);
    return (featured.length > 0 ? featured : withCover).slice(0, 7);
  }, [isDefaultView, posts]);

  const carouselItems: StackedCard[] = featuredPosts.map((p) => ({
    title: p.title,
    img: p.coverImageUrl!,
    href: `/blog/${p.slug}`,
  }));

  const headingText = activeCategory ? `${activeCategory} articles` : isSearching ? "Search results" : "Latest articles";

  return (
    <main className="min-h-screen text-white" style={{ background: "linear-gradient(180deg, #070858 0%, #000000 100%)" }}>
      {carouselItems.length > 0 && (
        <section className="relative overflow-hidden px-4 pt-32 pb-8 md:px-8">
          <div className="relative w-full max-w-[1200px] mx-auto">
            <StackedCardCarousel items={carouselItems} initialCenter={0} />
          </div>
        </section>
      )}

      {/* Search and Categories */}
      <section className="px-4 pb-4 pt-16 md:px-8">
        <FadeUpReveal yOffset={40} duration={0.7} className="container mx-auto flex flex-col items-center gap-3">
          <div className="relative w-full max-w-md">
            <svg
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--dark-blue)]/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search this page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search articles on this page"
              className="w-full rounded-full bg-white/90 py-3 pl-12 pr-5 text-sm text-[var(--dark-blue)] placeholder-[var(--dark-blue)]/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)]"
            />
          </div>
          <p className="text-xs text-white/50">
            Searches only the {posts.length} article{posts.length === 1 ? "" : "s"} shown on this page — use pagination
            below to browse more.
          </p>

          {categories.length > 0 && (
            <div className="blog-categories mt-4">
              <Link
                href={blogHref({ tag: activeTag })}
                className={`blog-category-pill ${!activeCategory ? "blog-category-pill--active" : ""}`}
              >
                All
              </Link>
              {categories.map((category) => {
                const active = activeCategory === category;
                return (
                  <Link
                    key={category}
                    href={active ? blogHref({ tag: activeTag }) : blogHref({ category, tag: activeTag })}
                    className={`blog-category-pill ${active ? "blog-category-pill--active" : ""}`}
                  >
                    {category}
                  </Link>
                );
              })}
            </div>
          )}
        </FadeUpReveal>
      </section>

      {/* Article grid */}
      <section className="px-4 py-12 md:px-8">
        <div className="container mx-auto flex flex-col gap-7">
          <FadeUpReveal yOffset={40} duration={0.7}>
            <div className="flex flex-col gap-2 max-w-4xl">
              <h2 className="text-3xl md:text-5xl font-bold">{headingText}</h2>
              <p className="text-sm md:text-base text-white/70">
                {filteredPosts.length} article{filteredPosts.length === 1 ? "" : "s"}
                {isSearching ? ` matching “${searchQuery.trim()}” on this page` : " on this page"}
                {pagination.totalPages > 1 ? ` · page ${pagination.page} of ${pagination.totalPages}` : ""}
              </p>
            </div>
          </FadeUpReveal>

          {filteredPosts.length > 0 ? (
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {filteredPosts.map((post, i) =>
                renderArticleCard(
                  { title: post.title, excerpt: post.excerpt, coverImageUrl: post.coverImageUrl, slug: post.slug },
                  post.id,
                  i,
                ),
              )}
            </div>
          ) : (
            <FadeUpReveal yOffset={30} duration={0.6}>
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-lg font-semibold text-white">No articles found</p>
                <p className="text-sm text-white/70">
                  {isSearching ? "Try a different search term." : "Try a different category."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  {isSearching && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="blog-category-pill blog-category-pill--active"
                    >
                      Clear search
                    </button>
                  )}
                  {activeCategory && (
                    <Link href={blogHref({ tag: activeTag })} className="blog-category-pill blog-category-pill--active">
                      View all categories
                    </Link>
                  )}
                </div>
              </div>
            </FadeUpReveal>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              {pagination.page > 1 ? (
                <Link
                  href={blogHref({ page: pagination.page - 1, category: activeCategory, tag: activeTag })}
                  className="blog-category-pill"
                >
                  Previous
                </Link>
              ) : (
                <span className="blog-category-pill opacity-40 pointer-events-none">Previous</span>
              )}
              <span className="text-sm text-white/70">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              {pagination.page < pagination.totalPages ? (
                <Link
                  href={blogHref({ page: pagination.page + 1, category: activeCategory, tag: activeTag })}
                  className="blog-category-pill"
                >
                  Next
                </Link>
              ) : (
                <span className="blog-category-pill opacity-40 pointer-events-none">Next</span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="relative z-10 overflow-hidden text-white px-4 sm:px-8 md:px-16 lg:px-24 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-2xl opacity-20">
            <ConcentricRings />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <FadeUpReveal yOffset={40} duration={0.7}>
            <h3 className="text-2xl sm:text-3xl md:text-[40px] font-bold text-center leading-tight">
              Learn more about how we can support your growth
            </h3>
          </FadeUpReveal>

          <FadeUpReveal yOffset={40} duration={0.7} delay={0.1} className="mt-8 md:mt-10 grid gap-6 sm:grid-cols-2">
            {supportHighlights.map((highlight) => (
              <div key={highlight.title} className="flex gap-3">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/60">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l4 4L19 6" />
                  </svg>
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg md:text-xl font-semibold">{highlight.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{highlight.description}</p>
                </div>
              </div>
            ))}
          </FadeUpReveal>

          <div className="mt-12 md:mt-16 flex flex-col items-center gap-4 md:flex-row md:justify-center">
            <WaitlistButton className="inline-flex items-center gap-2 rounded-full bg-(--brand-color-1) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--brand-color-2)">
              Get Started
            </WaitlistButton>
            <Link
              href="/live-chat"
              className="inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-semibold text-(--brand-color-1) transition hover:border-white hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
