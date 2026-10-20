"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { StackedCardCarousel, StackedCard } from "../components/ui/StackedCardCarousel";
import { CoverflowCarousel, type CoverflowSlide } from "../components/ui/coverflow-carousel";
import { FadeUpReveal } from "../components/ui/FadeUpReveal";
import ConcentricRings from "../components/ui/ConcentricRings";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";
import { isFeatureEnabled } from "@/lib/featureFlags";
import type { BlogPost, BlogPostPagination } from "@/lib/blogApi";
import { ArticleCard } from "./ArticleCard";

/** One titled band: big heading, intro line, then a horizontally scrolling row of cards. */
function ArticleRow({
  title,
  intro,
  posts,
  divider,
  wrap = false,
}: {
  title: string;
  intro: string;
  posts: BlogPost[];
  divider: boolean;
  wrap?: boolean;
}) {
  return (
    <section className="blog-band">
      {divider && <hr className="blog-band__divider" />}
      <FadeUpReveal yOffset={40} duration={0.7} className="blog-band__head">
        <h2 className="blog-band__title">{title}</h2>
        <p className="blog-band__intro">{intro}</p>
      </FadeUpReveal>
      <div className={wrap ? "blog-grid" : "blog-row"}>
        {posts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

function categoryIntro(category: string, count: number): string {
  return `Stories, guides and updates on ${category.toLowerCase()} from the Ballo team — ${count} article${
    count === 1 ? "" : "s"
  } to explore, with practical ideas you can put to work in your own campaigns.`;
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
  // Read after mount: a `?features=` override lives in localStorage, which the
  // server render can't see.
  const [coverflow, setCoverflow] = useState(false);
  useEffect(() => setCoverflow(isFeatureEnabled("blogCoverflow")), []);

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
    // Featured posts lead; the latest other posts fill the fan up to the
    // seven cards the design shows (three each side of the centre).
    const featured = withCover.filter((p) => p.featured);
    const rest = withCover.filter((p) => !p.featured);
    return [...featured, ...rest].slice(0, 7);
  }, [isDefaultView, posts]);

  const carouselItems: StackedCard[] = featuredPosts.map((p) => ({
    title: p.title,
    img: p.coverImageUrl!,
    href: `/blog/${p.slug}`,
  }));

  const coverflowSlides: CoverflowSlide[] = featuredPosts.map((p) => ({
    src: p.coverImageUrl!,
    alt: p.title,
    title: p.title,
    href: `/blog/${p.slug}`,
  }));

  const headingText = activeCategory ? `${activeCategory} articles` : isSearching ? "Search results" : "Latest articles";

  // Default view: one band per category, in the order categories first appear.
  // Filtered / searching: a single wrapping grid, since the result is one list.
  const byCategory = new Map<string, BlogPost[]>();
  for (const p of filteredPosts) {
    const key = p.category || "More from Ballo";
    byCategory.set(key, [...(byCategory.get(key) ?? []), p]);
  }
  const bands = Array.from(byCategory, ([category, list]) => ({ category, list }));
  const showBands = isDefaultView && !isSearching;

  return (
    <main className="blog-page min-h-screen text-white">
      {carouselItems.length > 0 && (
        <section
          className={
            coverflow
              ? "blog-cf relative overflow-hidden"
              : "relative overflow-hidden px-4 pt-32 pb-4 md:px-8"
          }
        >
          <div className="blog-hero-rings" aria-hidden="true" />
          {/* The coverflow fills the viewport edge to edge: it hides any card
              that wouldn't fit whole, so a column would only cost cards. */}
          <div className={`relative w-full mx-auto ${coverflow ? "" : "max-w-[1200px]"}`}>
            {coverflow ? (
              <CoverflowCarousel
                slides={coverflowSlides}
                label="Featured articles"
                cardWidth="var(--blog-cf-card)"
                cardAspect={1.25}
                showOverlay
                overlayAlways
                actionLabel="Read Article"
                fitToFrame
                autoPlay={4500}
              />
            ) : (
              <StackedCardCarousel items={carouselItems} initialCenter={0} />
            )}
          </div>
        </section>
      )}

      {/* Search and Categories */}
      <section className={`px-4 pb-4 md:px-8 ${carouselItems.length > 0 ? "pt-6" : "pt-32"}`}>
        <FadeUpReveal yOffset={40} duration={0.7} className="mx-auto flex max-w-[1200px] flex-col items-center gap-10">
          <label className="blog-search">
            <span className="blog-search__icon" aria-hidden="true">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search articles on this page"
            />
          </label>

          {categories.length > 0 && (
            <nav className="blog-categories" aria-label="Blog categories">
              <Link
                href={blogHref({ tag: activeTag })}
                className={`cta-chip blog-category-pill ${!activeCategory ? "blog-category-pill--active" : ""}`}
              >
                All
              </Link>
              {categories.map((category) => {
                const active = activeCategory === category;
                return (
                  <Link
                    key={category}
                    href={active ? blogHref({ tag: activeTag }) : blogHref({ category, tag: activeTag })}
                    className={`cta-chip blog-category-pill ${active ? "blog-category-pill--active" : ""}`}
                  >
                    {category}
                  </Link>
                );
              })}
            </nav>
          )}
        </FadeUpReveal>
      </section>

      <div className="pb-8">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
            <p className="text-lg font-semibold text-white">No articles found</p>
            <p className="text-sm text-white/70">
              {isSearching ? "Try a different search term." : "Try a different category."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {isSearching && (
                <button type="button" onClick={() => setSearchQuery("")} className="cta-chip blog-category-pill blog-category-pill--active">
                  Clear search
                </button>
              )}
              {activeCategory && (
                <Link href={blogHref({ tag: activeTag })} className="cta-chip blog-category-pill blog-category-pill--active">
                  View all categories
                </Link>
              )}
            </div>
          </div>
        ) : showBands ? (
          bands.map((band, i) => (
            <ArticleRow
              key={band.category}
              title={`Get the latest on ${band.category}`}
              intro={categoryIntro(band.category, band.list.length)}
              posts={band.list}
              divider={i > 0}
            />
          ))
        ) : (
          <ArticleRow
            title={headingText}
            intro={`${filteredPosts.length} article${filteredPosts.length === 1 ? "" : "s"}${
              isSearching ? ` matching “${searchQuery.trim()}” on this page` : " on this page"
            }${pagination.totalPages > 1 ? ` · page ${pagination.page} of ${pagination.totalPages}` : ""}.`}
            posts={filteredPosts}
            divider={false}
            wrap
          />
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-8">
            {pagination.page > 1 ? (
              <Link href={blogHref({ page: pagination.page - 1, category: activeCategory, tag: activeTag })} className="cta-chip blog-category-pill">
                Previous
              </Link>
            ) : (
              <span className="cta-chip blog-category-pill opacity-40 pointer-events-none">Previous</span>
            )}
            <span className="text-sm text-white/70">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            {pagination.page < pagination.totalPages ? (
              <Link href={blogHref({ page: pagination.page + 1, category: activeCategory, tag: activeTag })} className="cta-chip blog-category-pill">
                Next
              </Link>
            ) : (
              <span className="cta-chip blog-category-pill opacity-40 pointer-events-none">Next</span>
            )}
          </div>
        )}
      </div>

      {/* Subscribe + support */}
      <section className="blog-support">
        <div className="blog-support__inner">
          <FadeUpReveal yOffset={30} duration={0.6} className="blog-subscribe">
            <h3 className="blog-subscribe__title">Get more on what you like to see right here</h3>
            <WaitlistButton className="btn-secondary">
              Subscribe
            </WaitlistButton>
          </FadeUpReveal>

          <div className="blog-support__body">
            <div className="blog-support__rings" aria-hidden="true">
              <ConcentricRings />
            </div>
            <FadeUpReveal yOffset={40} duration={0.7} delay={0.1} className="blog-support__grid">
              {supportHighlights.map((highlight) => (
                <div key={highlight.title} className="blog-support__item">
                  <svg className="blog-support__check" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <path d="M24 16v10H4V6h16" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
                    <path d="M9 15l6 6L29 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <h4 className="blog-support__item-title">{highlight.title}</h4>
                    <p className="blog-support__item-text">{highlight.description}</p>
                  </div>
                </div>
              ))}
            </FadeUpReveal>

            <div className="blog-support__ctas">
              <WaitlistButton className="btn-primary">
                Get Started
              </WaitlistButton>
              <Link href="/live-chat" className="btn-secondary">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
