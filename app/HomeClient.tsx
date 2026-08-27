"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Phone3D } from "./components/ui/Phone3D";
import { StoreBadge } from "./components/ui/StoreBadge";
import { PageGradient } from "./components/ui/PageGradient";
import dynamic from "next/dynamic";

// Why still needs `ssr: false` — it measures layout through GSAP on mount.
// Who does not: it is now plain flow + IntersectionObserver, so it is imported
// directly and its industry copy is server-rendered.
const WhyScrollSection = dynamic(
  () => import("./components/sections/WhyScrollSection").then(m => m.WhyScrollSection),
  { ssr: false }
);

import { WhoScrollSection } from "./components/sections/WhoScrollSection";
import { FadeUpReveal } from "./components/ui/FadeUpReveal";
import { useAnimateWhenVisible } from "./components/ui/useAnimateWhenVisible";
import { useWaitlist } from "./components/waitlist/WaitlistProvider";

import bglight from "@/public/Assets/2.png";
import logoIcon from "@/public/BalloAds Logo New/BalloAds-Icon.png";
import { CloudUpload } from "lucide-react";

import {
  ContainerAnimated,
  ContainerScroll,
  ContainerStagger,
  ContainerSticky,
  GalleryCol,
  GalleryContainer,
  GalleryImage,
} from "./components/ui/AnimatedGallery";

// Hero gallery art. All existing BalloAds renders — the six industry scenes,
// two street shots, and three product screens — so the hero shows the actual
// product and the sectors it serves rather than stock photography.
import artBank from "@/public/Assets/Bank.jpg";
import artHealth from "@/public/Assets/Health.png";
import artNGO from "@/public/Assets/NGO.jpg";
import artRetail from "@/public/Assets/Retail.png";
import artUniversity from "@/public/Assets/University.png";
import artFinancial from "@/public/Assets/Financial .png";
import artBankNGO from "@/public/Assets/BANK + NGO.png";
import artTower from "@/public/Assets/48.png";
import artStorefront from "@/public/Assets/52.png";
import artAnalytics from "@/public/Assets/analytics-D8Ni1S4n.png";
import artCampaign from "@/public/Assets/campaign-ZQacCUNF.png";
import artPackages from "@/public/Assets/packages-BliRP6bM.png";

// Referenced below for the one-off "invert to white" filter applied to the
// Bayport mark specifically — kept here even though the rest of the fallback
// client-logo images now live in page.tsx alongside FALLBACK_PARTNER_LOGOS.
import logoBayport from "@/public/Client Logos/bayport color.png";

export type HomeTestimonialItem = {
  quote: string;
  name: string;
  title: string;
  company: string;
};

export type HomeLogoItem = {
  /** null renders the name as a wordmark — used when no logo image exists yet. */
  src: StaticImageData | string | null;
  alt: string;
};

/**
 * Reduced-motion preference, without pulling an animation library in for it.
 * Every visual transition on this page is CSS, so this is only used to stop the
 * two autoplay timers — the animations themselves opt out via
 * `@media (prefers-reduced-motion: reduce)` in home.css.
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Hero gallery columns.
 *
 * Twelve tiles over three columns. The middle column is pulled up hard by the
 * layout (`mt-[-50%]`), so it carries the same count as its neighbours to keep
 * the grid filled through the full parallax travel.
 */
const GALLERY_COL_1 = [
  { src: artFinancial, alt: "Ballo Financial branch lit at night", priority: true },
  { src: artAnalytics, alt: "Campaign analytics dashboard showing delivery stats" },
  { src: artRetail, alt: "BalloRetail storefront lit at night" },
  { src: artStorefront, alt: "Ballo storefront on a rainy city street" },
];

const GALLERY_COL_2 = [
  { src: artCampaign, alt: "Creating a bulk message in the BalloAds dashboard", priority: true },
  { src: artHealth, alt: "Ballo Health facility lit at night" },
  { src: artTower, alt: "City tower lit in BalloAds cyan" },
  { src: artNGO, alt: "Ballo Public Impact building lit at night" },
];

/** Third from the top of the centre column — the tile the hero zooms into. */
const ZOOM_TILE_INDEX = 2;

const GALLERY_COL_3 = [
  { src: artUniversity, alt: "BalloUniversity campus lit at night", priority: true },
  { src: artPackages, alt: "Choosing an SMS and WhatsApp package" },
  { src: artBank, alt: "Ballo bank branch lit at night" },
  { src: artBankNGO, alt: "Ballo banking and public impact scene" },
];

export default function HomeClient({
  testimonials,
  partnerLogos,
  backerLogos,
}: {
  testimonials: HomeTestimonialItem[];
  partnerLogos: HomeLogoItem[];
  backerLogos: HomeLogoItem[];
}) {
  const { openWaitlist } = useWaitlist();
  // The tile the gallery zooms into at the end of the scroll: third from the top
  // of the centre column (the Ballo Bank tower).
  const zoomTileRef = useRef<HTMLDivElement>(null);

  const shouldReduceMotion = usePrefersReducedMotion();
  const testimonialsSectionRef = useRef<HTMLElement>(null);
  const isTestimonialsVisibleRef = useRef(false);

  // Infinite CSS marquee — parked while scrolled away (see the hook). The hero
  // marquee that used the other instance went with the old carousel.
  const trustedByRef = useAnimateWhenVisible<HTMLElement>();

  // Pause testimonials interval when section is off-screen
  useEffect(() => {
    const el = testimonialsSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { isTestimonialsVisibleRef.current = entry.isIntersecting; },
      { rootMargin: "100px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const t = setInterval(() => {
      if (!isTestimonialsVisibleRef.current) return;
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(t);
  }, [testimonials.length, shouldReduceMotion]);

  // Marquee loop needs the logo list duplicated end-to-end so the CSS
  // animation can scroll seamlessly — same doubling the hardcoded array used
  // to get inline in JSX, just applied to whichever list (CMS or fallback)
  // page.tsx resolved.
  const marqueeLogos = partnerLogos.concat(partnerLogos);

  // <main> clips the x axis with `overflow-x: clip`, NOT `hidden`.
  // `overflow-x: hidden` forces overflow-y to compute as `auto`, making the
  // element a scroll container, which silently breaks `position: sticky` for
  // every descendant — that is what kept the Who section's caption column from
  // sticking. `clip` does the same horizontal clipping (needed for the 200vw
  // hero marquee) without creating a scroll container.
  return (
    <main className="relative min-h-screen text-white overflow-x-clip">
      {/* <main> is deliberately transparent: the gradient now lives on a fixed
          viewport layer behind it (PageGradient) rather than as a document-tall
          background here, which is what a fast scroll was outrunning. */}
      <PageGradient />

      {/* Hero — 3D scroll gallery.

          Replaces the previous four-slide auto-rotating carousel. That carousel
          auto-advanced every 5s with no pause or prev/next control (WCAG 2.2.2),
          and mounted three of its four headlines as <p role="heading"
          aria-level={1}>, so the page announced four level-1 headings. Both
          problems are gone with it: one H1, stated once, and no timer. */}
      <section className="relative">
        <ContainerStagger className="relative z-20 -mb-16 place-self-center px-6 pt-32 text-center md:-mb-24">
          <ContainerAnimated>
            <h1 className="font-serif text-4xl font-extralight leading-tight md:text-6xl">
              Your{" "}
              <span className="font-serif font-extralight text-[var(--brand-color-4)]">
                one source
              </span>
            </h1>
          </ContainerAnimated>
          <ContainerAnimated>
            {/* Presentational continuation of the H1 above, so it must NOT be a
                second heading element. */}
            <p className="font-serif text-4xl font-extralight leading-tight md:text-6xl">
              for reaching every customer
            </p>
          </ContainerAnimated>

          <ContainerAnimated className="my-6">
            <p className="mx-auto max-w-[52ch] leading-relaxed tracking-tight text-white/70">
              SMS, WhatsApp and email campaigns from one platform,
              <br className="hidden sm:block" /> with the numbers to show what each one earned you.
            </p>
          </ContainerAnimated>

          <ContainerAnimated className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={openWaitlist} className="btn-primary group">
              Get started
            </button>
            <Link href="/how-it-works" className="btn-secondary group">
              How it works
            </Link>
          </ContainerAnimated>
        </ContainerStagger>

        <ContainerScroll className="relative h-[450vh]">
          {/* Stays a full viewport tall: the sticky child has to cover the
              viewport, or the scroll parent behind it shows through as an empty
              band. The tiles are centred within each column instead (see
              justify-center on GalleryCol) — on a phone three columns of
              aspect-video tiles only come to about 400px, which sat at the top
              of the box with a void beneath it. */}
          <ContainerSticky className="h-svh">
            <GalleryContainer zoomTarget={zoomTileRef} zoomRange={[0.78, 1]}>
              <GalleryCol yRange={["-10%", "0%"]} className="-mt-2 justify-center">
                {GALLERY_COL_1.map((item) => (
                  <GalleryImage key={item.alt} {...item} />
                ))}
              </GalleryCol>
              <GalleryCol className="mt-[-50%] justify-center" yRange={["15%", "0%"]}>
                {GALLERY_COL_2.map((item, i) => (
                  <GalleryImage
                    key={item.alt}
                    {...item}
                    innerRef={i === ZOOM_TILE_INDEX ? zoomTileRef : undefined}
                    // The zoom target is magnified to fill the screen, so it
                    // has to be fetched at viewport width, not tile width.
                    sizes={i === ZOOM_TILE_INDEX ? "100vw" : undefined}
                  />
                ))}
              </GalleryCol>
              <GalleryCol yRange={["-10%", "0%"]} className="-mt-2 justify-center">
                {GALLERY_COL_3.map((item) => (
                  <GalleryImage key={item.alt} {...item} />
                ))}
              </GalleryCol>
            </GalleryContainer>
          </ContainerSticky>
        </ContainerScroll>

      </section>

      {/* What We're About — normal-flow, transparent panel (page gradient shows
          through). Opens with the "POWERFUL AND VERSATILE" title card, then the
          phone mockup + copy. */}
      <section
        className="prlx-about-trigger about-cover relative overflow-hidden pb-20 pt-16 px-4 z-50"
      >
        <div className="prlx-about-1" aria-hidden="true" />

        {/* "POWERFUL AND VERSATILE" title card — heads the section and seats
            directly against the hero's clipped person image, so it must sit at
            its resting position (no scroll-reveal offset that would leave the
            image floating above it). */}
        <div className="pv-title-block flex w-full justify-center">
          <div className="pv-title-card">
            <h2
              className="pv-title-gradient relative z-10 text-center whitespace-nowrap text-[clamp(1rem,5.5vw,5.8rem)] font-black leading-none [transform:scaleY(1.24)_scaleX(0.9)]"
              style={{
                fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                letterSpacing: "0.005em",
                display: "block",
              }}
            >
              POWERFUL AND VERSATILE
            </h2>
          </div>
        </div>

        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - 3D Phone Mockup */}
          <FadeUpReveal yOffset={50} className="relative flex justify-center order-last md:order-first">
            <div className="relative flex justify-center scale-[0.9]">
            <Image
              src={bglight}
              alt=""
              loading="lazy"
              sizes="560px"
              className="about-phone-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              style={{ width: "560px", height: "560px", maxWidth: "none", maxHeight: "none", objectFit: "contain" }}
              aria-hidden="true"
            />
            <div className="relative">
              <Phone3D floating={
                <div
                  className="absolute hidden md:flex flex-col gap-2.5"
                  style={{ left: "-60px", top: "56%", transform: "translateZ(40px)" }}
                >
                  <StoreBadge store="apple" />
                  <StoreBadge store="play" />
                </div>
              }>
                <div
                  className="absolute rounded-full"
                  style={{ width: "150px", height: "150px", top: "-48px", left: "-48px", background: "var(--dark-blue-2)", zIndex: 1 }}
                />
                {/* App screen. Sized in cqw (container-query units) against the
                    screen itself, so every element keeps its proportion when
                    .phone3d shrinks at the mobile breakpoint — see .phone-ui in
                    home.css. */}
                <div className="phone-ui">
                  <div className="phone-ui-head">
                    <Image
                      src={logoIcon}
                      alt="BalloAds Logo"
                      width={112}
                      height={112}
                      className="phone-ui-logo"
                    />
                    <h3 className="phone-ui-tagline">
                      Your Digital Marketing<br />Assistant
                    </h3>
                  </div>

                  <div className="phone-ui-upload">
                    <CloudUpload className="phone-ui-cloud" strokeWidth={1.75} />
                    <span className="phone-ui-upload-text">Upload your<br />artwork here</span>
                  </div>

                  <button type="button" className="phone-ui-next">Next</button>
                </div>
              </Phone3D>
            </div>
            </div>
          </FadeUpReveal>

          {/* Right Side - Content Card */}
          <div
            className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
          >
            <div className="relative z-10">
              <FadeUpReveal>
                <h2 className="text-4xl md:text-7xl font-bold mb-6 text-gradient-silver-2">
                  What We&apos;re About
                </h2>
              </FadeUpReveal>
              <FadeUpReveal delay={0.15}>
                <p className="landing-body text-white/90">
                  BalloAds is an AI-powered digital advertising platform
                  designed to help businesses and organisations
                  connect with the right audience through bulk SMS,
                  targeted message ads, and data-driven campaign
                  management. Whether you&apos;re a startup, an
                  enterprise, or a service provider, BalloAds gives you
                  the tools to launch impactful marketing campaigns
                  with ease
                </p>
              </FadeUpReveal>
              <FadeUpReveal delay={0.3}>
                <div className="hero-actions mt-8 justify-start">
                  <button type="button" onClick={openWaitlist} className="btn-primary group">
                    Get Started
                  </button>
                  <Link href="/how-it-works" className="btn-secondary group">
                    Learn More
                  </Link>
                </div>
              </FadeUpReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BalloAds — lazy-loaded, self-contained GSAP section */}
      <WhyScrollSection />

      {/* Backed By Section. A short, CMS-driven list (partner-logo rows with
          "Backed by" switched on), so this is a static grid rather than a
          marquee — nothing to loop, and no always-on animation to park. Rows
          with no logo image yet render as wordmarks. */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <FadeUpReveal className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">Backed by</p>
          </FadeUpReveal>
          <FadeUpReveal yOffset={50} delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-20">
              {backerLogos.map((logo, i) => (
                <div key={`${logo.alt}-${i}`} className="flex items-center justify-center">
                  {logo.src ? (
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={224}
                      height={112}
                      loading="lazy"
                      sizes="160px"
                      className="h-16 w-auto object-contain md:h-20"
                    />
                  ) : (
                    <span className="text-2xl font-semibold tracking-wide text-white/70 md:text-3xl">
                      {logo.alt}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </FadeUpReveal>
        </div>
      </section>

      {/* Who can use BalloAds — lazy-loaded, self-contained GSAP section */}
      <WhoScrollSection />

      {/* Testimonials Section */}
      <section ref={testimonialsSectionRef} className="prlx-testi-trigger relative overflow-hidden py-20 px-4">
        <div className="prlx-testi-1" aria-hidden="true" />
        <div className="container mx-auto">
          <FadeUpReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
              <span className="text-gradient-cyan block">
                HEAR FROM THOSE WHO HAVE<br />TRIED AND TESTED
              </span>
            </h2>
          </FadeUpReveal>
          <div className="max-w-4xl mx-auto">
            <div className="testimonial-glass rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col">
              {/* Frosted-glass layer. This used to also carry
                  `filter: url(#glass-distortion)` — an SVG turbulence +
                  displacement-map refraction on top of a backdrop blur, over a
                  card this size. That filter chain cannot be composited, so the
                  whole card re-rasterized on every scroll frame; it was the
                  single most expensive thing on the page. The blur and glass
                  edge (see .testimonial-glass in home.css) carry the look. */}
              <div className="flex-1">
                {/* Remounting on index change replays the CSS reveal below —
                    same crossfade the AnimatePresence wrapper gave, with no
                    animation runtime driving it frame by frame. */}
                <div
                  key={testimonialIndex}
                  className="testimonial-slide flex flex-col items-center text-center"
                >
                    <p className="text-xl md:text-2xl leading-relaxed mb-8 italic line-clamp-4 overflow-hidden h-[8.5rem] md:h-[10rem]">
                      &quot;{testimonials[testimonialIndex].quote}&quot;
                    </p>
                    <p className="text-xl font-bold mb-1 line-clamp-1 overflow-hidden w-full min-h-[1rem]">{testimonials[testimonialIndex].name}</p>
                    <p className="text-white/80 line-clamp-1 overflow-hidden w-full min-h-[1rem]">{testimonials[testimonialIndex].title}</p>
                    <p className="text-white/60 text-sm mt-1 line-clamp-1 overflow-hidden w-full min-h-[1rem]">{testimonials[testimonialIndex].company}</p>
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`transition-all duration-300 rounded-full ${i === testimonialIndex
                      ? "w-6 h-3 bg-white"
                      : "w-3 h-3 bg-white/30 hover:bg-white/60"
                      }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section — sits directly below the testimonials it backs up.
          Both infinite animations in here — the logo track and the
          .text-shimmer heading — park while the section is off-screen; the
          shimmer in particular animates background-position through
          background-clip:text, which repaints the glyphs every frame. */}
      <section ref={trustedByRef} className="py-16">
        <FadeUpReveal className="text-center mb-10">
          <p className="text-3xl text-shimmer">Trusted by the very best</p>
        </FadeUpReveal>
        <FadeUpReveal yOffset={50} delay={0.1}>
        <div className="logo-marquee">
          <div className="logo-marquee-track">
            {marqueeLogos.map((logo, i) => (
              <div key={i} className="flex items-center justify-center px-5 shrink-0">
                {logo.src ? (
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={224}
                    height={112}
                    loading="lazy"
                    sizes="112px"
                    className="h-28 w-auto object-contain opacity-100 transition-opacity"
                    style={{ filter: logo.src === logoBayport ? 'brightness(0) invert(1)' : 'none' }}
                  />
                ) : (
                  <span className="text-2xl font-semibold tracking-wide text-white/70">
                    {logo.alt}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        </FadeUpReveal>
      </section>

      {/* Want a Feel of BalloAds? — app try-it CTA. A device mockup (SVG) rests
          over the cyan glow orb; the brand mark, headline and "Try it now"
          action sit on the screen. The whole visual opens the waitlist. */}
      <section className="try-section">
        <FadeUpReveal yOffset={50} className="try-phone-wrap">
          {/* Cyan glow orb behind the device */}
          <Image src={bglight} alt="" className="try-glow" aria-hidden="true" sizes="(max-width: 420px) 132vw, 540px" />
          <button
            type="button"
            onClick={openWaitlist}
            className="try-visual"
            aria-label="Try BalloAds now"
          >
            {/* Device artwork — scaled + clipped to the phone body. Served as
                the SVG rather than through next/image because the optimizer
                does not rasterize SVG; the file's three embedded bitmaps were
                downscaled to the size this actually renders at, which took it
                from 15MB to 0.4MB. Lazy + async-decoded: it is the last section
                on the page and must not compete with the hero. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Assets/try.it.now.svg"
              alt="Preview of the BalloAds app"
              className="try-art"
              width={810}
              height={1012}
              loading="lazy"
              decoding="async"
            />
            {/* On-screen content */}
            <span className="try-overlay">
              <Image
                src={logoIcon}
                alt="BalloAds"
                width={80}
                height={80}
                className="try-overlay-logo"
              />
              <span className="try-overlay-title">
                WANT A FEEL OF
                <br />
                BALLOADS?
              </span>
              <span className="try-overlay-btn">TRY IT NOW</span>
            </span>
          </button>
        </FadeUpReveal>
      </section>
    </main>
  );
}
