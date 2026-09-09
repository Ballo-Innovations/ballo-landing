"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { PageGradient } from "./components/ui/PageGradient";
import { HeroSideExit, PHONE_CONTENT } from "./components/ui/HeroSideExit";
import { HeroMarquee } from "./components/ui/HeroMarquee";
import { WhyFeatureChips } from "./components/ui/FeatureChips";

import { WhoCinematicSection } from "./components/sections/WhoCinematicSection";
import { BrutusSection } from "./components/sections/BrutusSection";
import { Testimonials3D } from "./components/sections/Testimonials3D";
import { FinalCta } from "./components/sections/FinalCta";
import { FadeUpReveal } from "./components/ui/FadeUpReveal";
import { useAnimateWhenVisible } from "./components/ui/useAnimateWhenVisible";
import { useWaitlist } from "./components/waitlist/WaitlistProvider";

import woman from "@/public/Assets/11.png";
import woman2 from "@/public/Assets/13.png";
import woman3 from "@/public/Assets/10.png";
import man from "@/public/Assets/14.png";
import ConcentricRings from "./components/ui/ConcentricRings";
// Not lazy, unlike the section it comes from: this runs on the hero's own pin,
// so it is on screen within a screen or two of the top.
import { WhyCardSequence } from "./components/sections/WhyScrollSection";
import { BackedBy } from "./components/ui/BackedBy";

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
  /**
   * What this partner is to BalloAds ("Network partner", "Regulator"). Read by
   * the "Backed by" rail, which spotlights one partner at a time and shows
   * this beside its name; omitted rows simply show the name. The CMS has no
   * field for it yet, so only the fallback list in page.tsx sets it.
   */
  role?: string;
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
  /**
   * Logos whose image failed to load, by name.
   *
   * A CMS row carries a URL the server cannot verify, so a dead asset used to
   * put a browser's broken-image icon in the marquee. `src: null` already
   * means "render the name as a wordmark" — a URL that 404s is the same
   * situation discovered later, so it lands in the same place.
   */
  const [brokenLogos, setBrokenLogos] = useState<Set<string>>(new Set());
  const markLogoBroken = useCallback((alt: string) => {
    setBrokenLogos((prev) => {
      if (prev.has(alt)) return prev;
      const next = new Set(prev);
      next.add(alt);
      return next;
    });
  }, []);
  const shouldReduceMotion = usePrefersReducedMotion();
  const resumeAutoPlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Infinite CSS marquee — parked while scrolled away (see the hook). Every
  // other section with an infinite animation (Brutus, testimonials, the
  // closing CTA) owns its own instance of the same hook.
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
        /* Act three, beat 2: "Why Choose"'s heading, crossfaded into the same
           spot as the "What We're About" copy once the phone has started
           showing its cards. This is the only place the "Why Choose" copy
           lives now — there is no separate section below repeating it. */
        whyHeading={
          <div className="why-copy">
            {/* No hard line breaks. Forcing "Why / Choose / BalloAds?" onto
                three lines made the heading a tall narrow stack whatever the
                column was doing: at 850px it filled 280px of a 786px column
                and pushed the body copy most of a viewport down. It wraps to
                the column now, balanced. */}
            <h2 className="why-copy-title font-black text-gradient-silver">
              Why Choose BalloAds?
            </h2>
            <span className="why-copy-rule" aria-hidden="true" />
            <p className="landing-body why-copy-body">
              Most tools make you choose between reach and relevance. BalloAds
              gives you both: one place to build an audience, send SMS, WhatsApp
              and email campaigns, and see exactly what each message earned you.
            </p>
            <WhyFeatureChips />
            <button
              type="button"
              onClick={openWaitlist}
              className="btn-primary group why-copy-cta"
            >
              Get Started
            </button>
          </div>
        }
        /* Act three, beat 1: the phone's own screen crossfades from the
           onboarding mock to the feature cards, then runs all five of them on
           the rest of this pin. There is no separate "Why Choose" section
           below any more — this is that section. */
        phoneScreen={<WhyCardSequence range={PHONE_CONTENT} />}
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

      {/* No "Why Choose BalloAds" section here: the hero's pin above is that
          scene now — heading, phone and all five feature cards, in one
          continuous scroll (see `whyHeading`/`phoneScreen` on HeroSideExit).
          Rendering `WhyScrollSection` as well would repeat all of it. */}

      {/* Backed By. A short, CMS-driven list (partner-logo rows with "Backed
          by" switched on) — too few to loop, so it is a rail with a travelling
          spotlight rather than a marquee. One partner is named at full size at
          a time; the pointer overrides the cycle, and the cycle itself stops
          while the section is off-screen. */}
      <section className="backers-section">
        {/* The reveal is only the trigger here: its own transform is turned
            off in CSS and the label and each mark animate themselves, so the
            logos arrive one after another instead of the whole rail fading in
            as one block. */}
        <FadeUpReveal yOffset={0} className="backers-reveal">
          <BackedBy logos={backerLogos} />
        </FadeUpReveal>
      </section>

      {/* Who can use BalloAds — the question and CTA beside two marquee rows
          of industry tiles. */}
      <WhoCinematicSection />

      {/* Brutus, the AI assistant — a trailer for /brutus, on the home page. */}
      <BrutusSection />

      {/* Testimonials — tilted marquee columns, no timers. */}
      <Testimonials3D items={testimonials} />

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
                  {logo.src && !brokenLogos.has(logo.alt) ? (
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={224}
                      height={112}
                      loading="lazy"
                      sizes="112px"
                      onError={() => markLogoBroken(logo.alt)}
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

      {/* Closing CTA: copy + feature-chip marquees beside the "Want a feel of
          BalloAds?" phone, which opens the waitlist. */}
      <FinalCta />
    </main>
  );
}
