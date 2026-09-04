"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { PageGradient } from "./components/ui/PageGradient";
import { HeroSideExit } from "./components/ui/HeroSideExit";
import { HeroMarquee } from "./components/ui/HeroMarquee";
import dynamic from "next/dynamic";

// Why keeps `ssr: false` for now. It no longer measures layout on mount — the
// pin is CSS sticky and the carousel is framer-motion — but its cards are
// decorative and there is nothing to gain from server-rendering five of them.
// Who is plain flow + IntersectionObserver, so it is imported directly and its
// industry copy IS server-rendered.
const WhyScrollSection = dynamic(
  () =>
    import("./components/sections/WhyScrollSection").then(
      (m) => m.WhyScrollSection,
    ),
  { ssr: false },
);

import { WhoCinematicSection } from "./components/sections/WhoCinematicSection";
import { FadeUpReveal } from "./components/ui/FadeUpReveal";
import { useAnimateWhenVisible } from "./components/ui/useAnimateWhenVisible";
import { useWaitlist } from "./components/waitlist/WaitlistProvider";

import bglight from "@/public/Assets/2.png";
import logoIcon from "@/public/BalloAds Logo New/BalloAds-Icon.png";

import woman from "@/public/Assets/11.png";
import woman2 from "@/public/Assets/13.png";
import woman3 from "@/public/Assets/10.png";
import man from "@/public/Assets/14.png";
import ConcentricRings from "./components/ui/ConcentricRings";

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

const features = [
  {
    title: "WHATSAPP MARKETING WITH PRECISION",
    titleLines: ["WHATSAPP", "MARKETING", "WITH PRECISION"],
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman3,
    imageFrame: { scale: 1, x: "0%", y: "0%" },
    href: "/whatsapp-marketing",
  },
  {
    title: "TARGETED BULK SMS SOLUTIONS",
    titleLines: ["TARGETED", "BULK SMS", "SOLUTIONS"],
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: man,
    imageFrame: { scale: 0.9, x: "0%", y: "0%" },
    href: "/sms-marketing",
  },
  {
    title: "EMAIL MARKETING AT YOUR FINGERTIPS",
    titleLines: ["EMAIL MARKETING", "AT YOUR", "FINGERTIPS"],
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman,
    imageFrame: { scale: 1.2, x: "-18%", y: "0%" },
    href: "/email-marketing",
  },
  {
    title: "INITIATE POP UP AND WEB PUSH NOTIFICATIONS",
    titleLines: ["INITIATE POP UP", "AND WEB PUSH", "NOTIFICATIONS"],
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman2,
    imageFrame: { scale: 1, x: "-15%", y: "0%" },
    href: "/features",
  },
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const shouldReduceMotion = usePrefersReducedMotion();
  const resumeAutoPlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const testimonialsSectionRef = useRef<HTMLElement>(null);
  const isTestimonialsVisibleRef = useRef(false);

  // Infinite CSS marquee — parked while scrolled away (see the hook). The hero
  // band no longer needs one: it is a canvas now and pauses its own rAF loop
  // when it scrolls out of view.
  const trustedByRef = useAnimateWhenVisible<HTMLElement>();

  useEffect(() => {
    return () => {
      if (resumeAutoPlayTimeoutRef.current)
        clearTimeout(resumeAutoPlayTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || shouldReduceMotion) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, shouldReduceMotion]);

  // Pause testimonials interval when section is off-screen
  useEffect(() => {
    const el = testimonialsSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        isTestimonialsVisibleRef.current = entry.isIntersecting;
      },
      { rootMargin: "100px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const goToSlide = (index: number) => {
    if (resumeAutoPlayTimeoutRef.current) {
      clearTimeout(resumeAutoPlayTimeoutRef.current);
    }
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    if (!shouldReduceMotion) {
      resumeAutoPlayTimeoutRef.current = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 10000);
    }
  };

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      if (!isTestimonialsVisibleRef.current) return;
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(t);
  }, [testimonials.length]);

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

      {/* Hero Section. Pinned by HeroSideExit: the elements marked
          data-hero-exit leave sideways, each toward whichever edge it already
          sits nearer, and the phone rises into the space they vacate. */}
      <HeroSideExit
        /* On the pin, behind the hero, unaffected by the exits: it keeps
           scrolling at its own size and rises as the items go. */
        backdrop={<HeroMarquee />}
        /* Act two. This copy used to sit in the section below, beside a second
           phone mockup; now that the hero's own phone arrives and steps aside
           for it, that pairing happens up here and the section keeps only its
           title card. No FadeUpReveal on these: inside a pinned stage they are
           in the viewport from the first frame, so a viewport-triggered reveal
           would fire before the phone had arrived. */
        aside={
          <>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient-silver-2">
              What We&apos;re About
            </h2>
            <p className="landing-body text-white/90">
              BalloAds is an AI-powered digital advertising platform designed to
              help businesses and organisations connect with the right audience
              through bulk SMS, targeted message ads, and data-driven campaign
              management. Whether you&apos;re a startup, an enterprise, or a
              service provider, BalloAds gives you the tools to launch impactful
              marketing campaigns with ease
            </p>
            <div className="hero-actions mt-8 justify-start">
              <button type="button" onClick={openWaitlist} className="btn-primary group">
                Get Started
              </button>
              <Link href="/how-it-works" className="btn-secondary group">
                Learn More
              </Link>
            </div>
          </>
        }
      >
        <section
          className="prlx-hero-trigger relative h-full min-h-screen pt-24 pb-12 overflow-hidden"
          style={{
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Parallax depth layers — behind all content */}
          <div className="prlx-hero-1" aria-hidden="true" />
          <div className="prlx-hero-2" aria-hidden="true" />

          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundSize: "cover" }}
          />

          {/* Frame uses the EXACT header-pill width formula so the hero's left
            edge tracks the nav's at every viewport. Two-column carousel: the
            rotating text (left) and person (right) change together as one slide;
            the person stands on the full-width "POWERFUL AND VERSATILE" card,
            which is pulled up to mask the cutout's clipped bottom edge. */}
          <div className="hero-frame relative z-[1]">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-end">
              {/* Left — rotating copy (text half of the carousel slide) */}
              <div className="hero-copy min-w-0 relative z-[1] mt-4 md:mt-0 md:self-center flex flex-col gap-6 md:gap-8 items-center text-center md:items-start md:text-left">
                <p className="hero-kicker text-shimmer" data-hero-exit>
                  AI-Powered Performance Marketing
                </p>

                {/* Rotating headline. All four headlines are mounted and stacked;
                  only the `is-active` class moves, so a slide change is a pure
                  opacity/transform crossfade on the compositor — no React
                  remount, no re-layout of the hero column. Slide 1 is the H1
                  (one per page); the rest are presentational. */}
                <div className="hero-headline-stack" data-hero-exit>
                  {features.map((feature, index) => {
                    const lines = feature.titleLines.map((line) => (
                      <span key={line}>{line}</span>
                    ));
                    const active = index === currentSlide;
                    return index === 0 ? (
                      <h1
                        key={feature.title}
                        className={`hero-headline${active ? " is-active" : ""}`}
                        aria-hidden={!active}
                      >
                        {lines}
                      </h1>
                    ) : (
                      <p
                        key={feature.title}
                        role="heading"
                        aria-level={1}
                        className={`hero-headline${active ? " is-active" : ""}`}
                        aria-hidden={!active}
                      >
                        {lines}
                      </p>
                    );
                  })}
                </div>

                {/* Pagination Dots — above the CTAs */}
                <div
                  className="flex items-center justify-center md:justify-start gap-3"
                  data-hero-exit
                >
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full border border-white/85 transition-all ${
                        index === currentSlide
                          ? "bg-white"
                          : "bg-transparent hover:bg-white/25"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="hero-actions justify-center md:justify-start" data-hero-exit>
                  <button
                    type="button"
                    onClick={openWaitlist}
                    className="btn-primary group"
                  >
                    Sign Up
                  </button>
                  <Link
                    href={features[currentSlide].href}
                    className="btn-secondary group"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right-side visual. The concentric rings hold their position while the
            rotating person rests on the bottom of the hero (desktop); on mobile
            the whole block flows in below the copy. Anchored to the section (not
            the grid) so the person can reach the viewport floor. */}
          {/* The rings and the figure leave separately, not as one block: they
              sit at different depths, so they travel at different rates. The
              container itself is not marked. */}
          <div className="hero-visual">
            <div className="hero-rings" aria-hidden="true" data-hero-exit="slow">
              <ConcentricRings />
            </div>
            <div className="hero-person-stage" data-hero-exit="fast">
              {/* All four cutouts are mounted and stacked, crossfading via CSS.
                Previously each change unmounted the old <Image> and mounted the
                new one, so every 5s the browser re-created and re-decoded an
                image — and a hidden copy of the *next* slide had to be rendered
                with `priority` to hide the cost, which competed with the real
                LCP image for bandwidth. Mounting all four decodes each once and
                deletes the preload hack outright. */}
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`hero-person-figure${index === currentSlide ? " is-active" : ""}`}
                  aria-hidden={index !== currentSlide}
                >
                  <Image
                    src={feature.image}
                    alt={index === currentSlide ? feature.title : ""}
                    fill
                    sizes="(max-width: 768px) 90vw, 45vw"
                    className="hero-person-img object-contain object-bottom"
                    style={
                      {
                        ["--person-scale" as string]: feature.imageFrame.scale,
                        ["--person-x" as string]: feature.imageFrame.x,
                        ["--person-y" as string]: feature.imageFrame.y,
                      } as React.CSSProperties
                    }
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </HeroSideExit>

      {/* Why Choose BalloAds — lazy-loaded, self-contained GSAP section */}
      <WhyScrollSection />

      {/* Backed By Section. A short, CMS-driven list (partner-logo rows with
          "Backed by" switched on), so this is a static grid rather than a
          marquee — nothing to loop, and no always-on animation to park. Rows
          with no logo image yet render as wordmarks. */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <FadeUpReveal className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">
              Backed by
            </p>
          </FadeUpReveal>
          <FadeUpReveal yOffset={50} delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-20">
              {backerLogos.map((logo, i) => (
                <div
                  key={`${logo.alt}-${i}`}
                  className="flex items-center justify-center"
                >
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
      <WhoCinematicSection />

      {/* Testimonials Section */}
      <section
        ref={testimonialsSectionRef}
        className="prlx-testi-trigger relative overflow-hidden py-20 px-4"
      >
        <div className="prlx-testi-1" aria-hidden="true" />
        <div className="container mx-auto">
          <FadeUpReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
              <span className="text-gradient-cyan block">
                HEAR FROM THOSE WHO HAVE
                <br />
                TRIED AND TESTED
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
                  <p className="text-xl font-bold mb-1 line-clamp-1 overflow-hidden w-full min-h-[1rem]">
                    {testimonials[testimonialIndex].name}
                  </p>
                  <p className="text-white/80 line-clamp-1 overflow-hidden w-full min-h-[1rem]">
                    {testimonials[testimonialIndex].title}
                  </p>
                  <p className="text-white/60 text-sm mt-1 line-clamp-1 overflow-hidden w-full min-h-[1rem]">
                    {testimonials[testimonialIndex].company}
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === testimonialIndex
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
                <div
                  key={i}
                  className="flex items-center justify-center px-5 shrink-0"
                >
                  {logo.src ? (
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={224}
                      height={112}
                      loading="lazy"
                      sizes="112px"
                      className="h-28 w-auto object-contain opacity-100 transition-opacity"
                      style={{
                        filter:
                          logo.src === logoBayport
                            ? "brightness(0) invert(1)"
                            : "none",
                      }}
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
          <Image
            src={bglight}
            alt=""
            className="try-glow"
            aria-hidden="true"
            sizes="(max-width: 420px) 132vw, 540px"
          />
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
