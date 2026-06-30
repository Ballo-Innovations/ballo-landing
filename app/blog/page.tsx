"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";
import { StackedCardCarousel, StackedCard } from "../components/ui/StackedCardCarousel";
import { FadeUpReveal } from "../components/ui/FadeUpReveal";
import WaitlistButton from "@/app/components/waitlist/WaitlistButton";

import article1 from "@/public/BalloAds Assets 2/19.png";
import article2 from "@/public/BalloAds Assets 2/8.png";
import article3 from "@/public/BalloAds Assets 2/2.png";
import article4 from "@/public/BalloAds Assets 2/18.png";
import article5 from "@/public/BalloAds Assets 2/3.png";
import article6 from "@/public/BalloAds Assets 2/7.png";
import article7 from "@/public/BalloAds Assets 2/10.png";
import article8 from "@/public/BalloAds Assets 2/11.png";
import article9 from "@/public/BalloAds Assets 2/22.png";
import handshake from "@/public/elements small/handshake.png";
import strategy from "@/public/BalloAds Assets 2/20.png";
import marketAnalysis from "@/public/BalloAds Assets 2/1.png";
import contentIcon from "@/public/elements small/content-icon.png";
import ConcentricRings from "../components/ui/ConcentricRings";


export default function FeaturedCarousel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const featuredArticles = [
    {
      title: "The latest on AI Technology",
      image: article1,
      featured: false,
    },
    {
      title: "You've heard about Teledoctor",
      image: article2,
      featured: false,
    },
    {
      title: "Get to know about Insurance",
      image: article3,
      featured: false,
    },
    {
      title: "Working From home remotely",
      image: article4,
      featured: false,
    },
    {
      title: "Big brands use marketing",
      image: article5,
      featured: false,
    },
    {
      title: "Lifestyle with Medicine",
      image: article6,
      featured: false,
    },
    {
      title: "Growing your business online",
      image: article7,
      featured: false,
    },
  ];

  // Map to the stacked carousel's item shape (string image src + slug href).
  const carouselItems: StackedCard[] = featuredArticles.map((a) => ({
    title: a.title,
    img: a.image.src,
    href: `/blog/${a.title.toLowerCase().replace(/\s+/g, "-")}`,
  }));
  const carouselCenter = Math.max(
    0,
    featuredArticles.findIndex((a) => a.title === "Get to know about Insurance")
  );
  
  const categories = [
    "Finance",
    "Retail",
    "Special Deals",
    "Popular",
    "Health",
    "AI",
    "Logistics",
  ];
  
  const articleSections = [
    {
      title: "Get the latest on AI in Zambia",
      description:
        "Zambia is making significant strides in artificial intelligence (AI) with the launch of its National AI Strategy (2024-2026), aiming to transform the nation into a digital economy. The strategy focuses on enhancing public services, fostering innovation, and creating jobs across sectors like healthcare, agriculture, and education.",
      articles: [
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article6,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article7,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article8,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article9,
          hasVideo: true,
        },
      ],
    },
    {
      title: "Ministry of Technology on AI",
      description:
        "The Ministry of Technology and Science is leading initiatives to integrate AI into government operations, improving efficiency and citizen services. Key projects include AI-powered healthcare diagnostics, smart agriculture systems, and educational technology platforms.",
      articles: [
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article8,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article9,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: strategy,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: marketAnalysis,
          hasVideo: true,
        },
      ],
    },
    {
      title: "The growth of Performance Marketing",
      description:
        "Performance marketing is revolutionizing how businesses reach their audiences in Zambia. With data-driven strategies and measurable results, companies are seeing unprecedented ROI from their marketing campaigns. Learn how BalloAds is at the forefront of this transformation.",
      articles: [
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article1,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article2,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article3,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article4,
          hasVideo: true,
        },
      ],
    },
  ];
  
  // Flatten + tag every article with a category so the tabs and search can filter.
  const CATEGORY_CYCLE = ["AI", "Health", "Logistics", "Special Deals", "Finance", "Retail", "Popular"];
  const taggedArticles = articleSections
    .flatMap((s) => s.articles)
    .map((a, i) => ({ ...a, category: CATEGORY_CYCLE[i % CATEGORY_CYCLE.length] }));

  const query = searchQuery.trim().toLowerCase();
  const isFiltering = selectedCategory !== null || query !== "";
  const filteredArticles = taggedArticles.filter((a) => {
    const catOk = !selectedCategory || a.category === selectedCategory;
    const searchOk =
      !query || `${a.title} ${a.description} ${a.category}`.toLowerCase().includes(query);
    return catOk && searchOk;
  });

  type ArticleCardData = {
    title: string;
    description: string;
    image: StaticImageData;
    hasVideo?: boolean;
  };

  const renderArticleCard = (article: ArticleCardData, key: React.Key, index = 0) => (
    <FadeUpReveal key={key} yOffset={40} duration={0.7} delay={(index % 4) * 0.08}>
      <Link
        href={`/blog/${article.title.toLowerCase().replace(/\s+/g, "-")}`}
        className="group relative flex h-64 md:h-72 flex-col justify-end overflow-hidden rounded-2xl"
      >
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="relative p-5 pr-12">
          <h3 className="text-base md:text-lg font-bold leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-1.5 text-[11px] md:text-xs text-white/70 line-clamp-2">
            {article.description}
          </p>
        </div>
        <span className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition group-hover:border-white group-hover:bg-white/20">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </Link>
    </FadeUpReveal>
  );

  const supportHighlights = [
    {
      title: "24/7 Support",
      description: "Our team is available around the clock to ensure your campaigns run smoothly without downtime."
    },
    {
      title: "Quick Response Time",
      description: "We resolve issues and questions promptly so your business keeps moving without delays."
    },
    {
      title: "Implementation & Support",
      description: "We handle the full setup and provide continuous assistance to guarantee a seamless transition into our platform."
    },
    {
      title: "System Integration",
      description: "BalloAds integrates effortlessly with your existing tools and workflows for a unified, efficient marketing ecosystem."
    },
    {
      title: "Free Training",
      description: "Your team receives comprehensive onboarding and training at no extra cost to help you maximise every feature from day one."
    },
    {
      title: "Dedicated Account Manager",
      description: "A specialised expert is assigned to your business to offer personalised guidance and strategic support whenever you need it."
    },
  ];
  

  return (
    <main className="min-h-screen text-white" style={{ background: "linear-gradient(180deg, #070858 0%, #000000 100%)" }}>
      <section className="relative overflow-hidden px-4 pt-32 pb-8 md:px-8">
        <div className="relative w-full max-w-[1200px] mx-auto">
          <StackedCardCarousel items={carouselItems} initialCenter={carouselCenter} />
        </div>
      </section>

      {/* Search and Categories */}
      <section className="px-4 pb-4 md:px-8">
        <FadeUpReveal yOffset={40} duration={0.7} className="container mx-auto flex flex-col items-center gap-7">
          <div className="relative w-full max-w-md">
            <svg
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--dark-blue)]/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search articles"
              className="w-full rounded-full bg-white/90 py-3 pl-12 pr-5 text-sm text-[var(--dark-blue)] placeholder-[var(--dark-blue)]/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--cyan-bright)]"
            />
          </div>

          <div className="blog-categories">
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(active ? null : category)
                  }
                  className={`blog-category-pill ${active ? "blog-category-pill--active" : ""}`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </FadeUpReveal>
      </section>

      {/* Filtered results (tabs / search) OR the curated sections */}
      {isFiltering ? (
        <section className="px-4 py-12 md:px-8">
          <div className="container mx-auto flex flex-col gap-7">
            <FadeUpReveal yOffset={40} duration={0.7}>
              <div className="flex flex-col gap-2 max-w-4xl">
                <h2 className="text-3xl md:text-5xl font-bold">
                  {selectedCategory ? `${selectedCategory} articles` : "Search results"}
                </h2>
                <p className="text-sm md:text-base text-white/70">
                  {filteredArticles.length} article{filteredArticles.length === 1 ? "" : "s"}
                  {selectedCategory ? ` in ${selectedCategory}` : ""}
                  {query ? ` matching “${searchQuery.trim()}”` : ""}
                </p>
              </div>
            </FadeUpReveal>

            {filteredArticles.length > 0 ? (
              <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
                {filteredArticles.map((article, i) =>
                  renderArticleCard(article, `${article.title}-${i}`, i)
                )}
              </div>
            ) : (
              <FadeUpReveal yOffset={30} duration={0.6}>
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <p className="text-lg font-semibold text-white">No articles found</p>
                  <p className="text-sm text-white/70">Try a different category or search term.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery("");
                    }}
                    className="blog-category-pill blog-category-pill--active mt-2"
                  >
                    Clear filters
                  </button>
                </div>
              </FadeUpReveal>
            )}
          </div>
        </section>
      ) : (
        articleSections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="px-4 py-12 md:px-8">
            <div className="container mx-auto flex flex-col gap-7">
              <FadeUpReveal yOffset={40} duration={0.7}>
                <div className="flex flex-col gap-3 max-w-4xl">
                  <h2 className="text-3xl md:text-5xl font-bold">{section.title}</h2>
                  <p className="text-sm md:text-base text-white/75 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </FadeUpReveal>

              <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
                {section.articles.map((article, articleIndex) =>
                  renderArticleCard(article, articleIndex, articleIndex)
                )}
              </div>
            </div>
          </section>
        ))
      )}

      {/* Subscribe Section */}
      <section className="relative z-10 overflow-hidden text-white px-4 sm:px-8 md:px-16 lg:px-24 pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Centered background rings */}
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
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
