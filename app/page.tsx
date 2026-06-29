"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Phone3D } from "./components/ui/Phone3D";
import { SilkBackground } from "./components/ui/SilkBackground";
import dynamic from "next/dynamic";

const WhyScrollSection = dynamic(
  () => import("./components/sections/WhyScrollSection").then(m => m.WhyScrollSection),
  { ssr: false }
);
const WhoScrollSection = dynamic(
  () => import("./components/sections/WhoScrollSection").then(m => m.WhoScrollSection),
  { ssr: false }
);

import { HeroPinSetup } from "./components/ui/HeroPinSetup";
import { FadeUpReveal } from "./components/ui/FadeUpReveal";

import playStore from "@/public/elements small/19.png";
import appleStore from "@/public/elements small/18.png";

import bglight from "@/public/Assets/2.png";
import logoIcon from "@/public/BalloAds Logo New/BalloAds-Icon.png";
import { CloudUpload } from "lucide-react";

import woman from "@/public/Assets/11.png";
import woman1 from "@/public/Assets/12.png";
import woman2 from "@/public/Assets/13.png";
import woman3 from "@/public/Assets/10.png";
import man from "@/public/Assets/14.png";
import ConcentricRings from "./components/ui/ConcentricRings";
import { ParallaxSetup } from "./components/ui/ParallaxSetup";
import bank from "@/public/Assets/19.png";
import glowBg from "@/public/Assets/glow-bg.png";

import logoMakhulu from "@/public/Client Logos/Makhulu High Res Logo white.png";
import logoParamount from "@/public/Client Logos/paramount-1 white.png";
import logoOmphile from "@/public/Client Logos/Omphile-White.png";
import logoInsizwe from "@/public/Client Logos/logo-2 white.png";
import logoMudenda from "@/public/Client Logos/Mudenda Capital Logo to send-03.png";
import logoFI from "@/public/Client Logos/Financial Insights Logo white.png";
import logoTinge from "@/public/Client Logos/Tinge logo white.png";
import logoIVLounge from "@/public/Client Logos/iv1.png";
import logoSWR from "@/public/Client Logos/SWR Logo white.png";
import logoShane from "@/public/Client Logos/Shane Investments logo.png";
import logoShreeji from "@/public/Client Logos/Shreeji.png";
import logoBayport from "@/public/Client Logos/bayport color.png";
import logoSeneca from "@/public/Client Logos/seneca-logo new-02.png";
import logo9 from "@/public/Client Logos/9.png";

function FeatureLabel({
  text,
  icon,
  position,
}: {
  text: string;
  icon: React.ReactNode;
  position: string;
}) {
  return (
    <div
      className={`absolute ${position} flex items-center gap-3 bg-white shadow-lg px-4 py-2 rounded-full text-[var(--dark-blue)] text-sm md:text-base font-semibold z-20`}
    >
      <span>{icon}</span>
      {text}
    </div>
  );
}

const features = [
  {
    title: "WHATSAPP MARKETING WITH PRECISION",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman3,
  },
  {
    title: "TARGETED BULK MESSAGING SOLUTIONS",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: man,
  },
  {
    title: "INITIATE WEB POP UPS AND PUSH NOTIFICATIONS",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman2,
  },
  {
    title: "EMAIL MARKETING AT YOUR FINGERTIPS",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman,
  },
];

const testimonials = [
  {
    quote: "Undoubtedly one of the best decisions I've made for my company. This platform is a game changer and I'm grateful for the impact it has had on our business.",
    name: "Maybin Mudenda",
    title: "Board Chairperson",
    company: "Insizwe Private Brokers",
  },
  {
    quote: "BalloAds made it incredibly easy to reach thousands of customers with a single campaign. Our response rate doubled within the first month.",
    name: "Sarah Nkosi",
    title: "Marketing Director",
    company: "Paramount Logistics",
  },
  {
    quote: "The targeted messaging feature is unlike anything we've used before. We saw a measurable uplift in foot traffic after our very first campaign.",
    name: "James Okafor",
    title: "CEO",
    company: "Mudenda Capital",
  },
  {
    quote: "From setup to launch took less than an afternoon. The dashboard is intuitive and the results speak for themselves.",
    name: "Tendai Moyo",
    title: "Head of Growth",
    company: "Tinge Technology",
  },
  {
    quote: "We've tried other platforms but nothing compares to the reach and affordability BalloAds offers for small businesses like ours.",
    name: "Linda Phiri",
    title: "Founder",
    company: "Shane Investments",
  },
];

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = (currentSlide + 1) % features.length;
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const resumeAutoPlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const testimonialsSectionRef = useRef<HTMLElement>(null);
  const isTestimonialsVisibleRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const tiltRafRef = useRef<number | null>(null);
  const tiltTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.willChange = "transform";
    el.style.transform = "none";
    return () => {
      if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
      if (tiltTimeoutRef.current) clearTimeout(tiltTimeoutRef.current);
    };
  }, []);

  const setTiltTransition = (ref: React.RefObject<HTMLDivElement | null>, glareRef: React.RefObject<HTMLDivElement | null>, timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    const el = ref.current;
    const glare = glareRef.current;
    if (!el) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    el.style.transition = `1200ms cubic-bezier(.03,.98,.52,.99)`;
    if (glare) glare.style.transition = `opacity 1200ms cubic-bezier(.03,.98,.52,.99)`;
    timeoutRef.current = setTimeout(() => {
      el.style.transition = "";
      if (glare) glare.style.transition = "";
    }, 1200);
  };

  const handleCardMouseEnter = () => setTiltTransition(cardRef, glareRef, tiltTimeoutRef);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    const clientX = e.clientX;
    const clientY = e.clientY;
    tiltRafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1400px) rotateX(${y * -15}deg) rotateY(${x * 15}deg) scale3d(1.04,1.04,1.04)`;
      const glare = glareRef.current;
      if (glare) {
        glare.style.transform = `rotate(${Math.atan2(y, x) * (180 / Math.PI) + 90}deg)`;
        glare.style.opacity = `${Math.min(Math.sqrt(x * x + y * y) * 0.5, 0.2)}`;
      }
    });
  };

  const handleCardMouseLeave = () => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    setTiltTransition(cardRef, glareRef, tiltTimeoutRef);
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(1400px) rotateY(-12deg) rotateX(2.5deg) scale3d(1,1,1)";
    const glare = glareRef.current;
    if (glare) glare.style.opacity = "0";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (!isAutoPlaying || shouldReduceMotion) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, shouldReduceMotion]);

  useEffect(() => {
    return () => {
      if (resumeAutoPlayTimeoutRef.current) {
        clearTimeout(resumeAutoPlayTimeoutRef.current);
      }
    };
  }, []);

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
  }, []);

  return (
    <main className="relative min-h-screen text-white pt-3 overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #070757 0%, #000000 100%)" }}>
      <SilkBackground />
      <ParallaxSetup />
      <HeroPinSetup />

      {/* Hero Section */}
      <section
        className="prlx-hero-trigger relative min-h-screen flex items-center justify-center px-6 sm:px-8 py-20 overflow-hidden"
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

        {/* Large Faded Text — pure CSS marquee */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none">
          <div className="marquee-track flex whitespace-nowrap">
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10 shrink-0">REBRANDING THE FUTURE</span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10 shrink-0">REBRANDING THE FUTURE</span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10 shrink-0">REBRANDING THE FUTURE</span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10 shrink-0">REBRANDING THE FUTURE</span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10 shrink-0">REBRANDING THE FUTURE</span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10 shrink-0">REBRANDING THE FUTURE</span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10 shrink-0">REBRANDING THE FUTURE</span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10 shrink-0">REBRANDING THE FUTURE</span>
          </div>
        </div>

        {/* Frame matches the header pill (72rem) so the hero aligns with the nav above */}
        <div className="mx-auto w-full max-w-[72rem] relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[70vh]">
            {/* Left Side - Content */}
            <div className="relative z-1 flex flex-col gap-6 md:gap-8 items-center text-center md:items-start md:text-left">
              {/* Rotating headline */}
              <div className="relative w-full min-h-[150px] sm:min-h-[200px] md:min-h-[250px] flex items-start justify-center md:justify-start">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`hero-text-${currentSlide}`}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -16 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" }}
                    className="w-full"
                  >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight uppercase text-balance max-w-[16ch] mx-auto md:mx-0">
                      {features[currentSlide].title}
                    </h1>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="hero-actions justify-center md:justify-start">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("open-waitlist"))}
                  className="btn-primary group"
                >
                  Join Waitlist
                </button>
                <Link href="/watch-demo" className="btn-secondary group">
                  Book A Free Demo
                </Link>
              </div>
              {/* Pagination Dots */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full border border-white/85 transition-all ${index === currentSlide
                      ? "bg-white"
                      : "bg-transparent hover:bg-white/25"
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-full max-w-md h-[260px] sm:h-[380px] md:h-[560px]">
                <div className="relative w-full h-full">
                  <div className="w-full h-auto absolute right-0 bottom-0 scale-[2] z-0">
                    <ConcentricRings />
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`hero-image-${currentSlide}`}
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 24, scale: 0.98 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
                      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -24, scale: 1.02 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: "easeOut" }}
                      className="z-10 relative w-full h-full will-change-transform"
                    >
                      <Image
                        src={features[currentSlide].image}
                        alt={features[currentSlide].title}
                        fill
                        sizes="(max-width: 768px) 85vw, 40vw"
                        className={`object-contain object-bottom ${features[currentSlide].title === "EMAIL MARKETING AT YOUR FINGERTIPS"
                          ? "scale-[1.42] mt-5 -ml-2"
                          : "scale-[1.35] mt-8 -ml-4"
                          }`}
                        priority={currentSlide === 0}
                      />
                    </motion.div>
                  </AnimatePresence>
                  {/* Preload upcoming slide image */}
                  <div className="hidden" aria-hidden="true">
                    <Image src={features[nextSlide].image} alt="" width={400} height={600} priority />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We're About — opaque (z-50) panel with the "Powerful and Versatile"
          heading at its top. It scrolls up normally and covers the PINNED hero
          (see HeroPinSetup); no pin/translate of its own. */}
      <section
        className="prlx-about-trigger about-cover relative overflow-hidden py-20 px-4 z-50"
        style={{ backgroundColor: "#06064d" /* opaque page-navy */ }}
      >
        <div className="prlx-about-1" aria-hidden="true" />

        {/* Relocated "POWERFUL AND VERSATILE" heading — styles kept identical */}
        <div className="container mx-auto flex justify-center relative z-40">
          <FadeUpReveal>
            <h2
              className="relative py-20 px-4 z-10 text-center whitespace-nowrap text-[clamp(1rem,5.5vw,5.8rem)] font-black leading-none [transform:scaleY(1.24)_scaleX(0.9)] overflow-hidden"
              style={{
                fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                letterSpacing: "0.005em",
                color: "#fff",
                display: "block",
              }}
            >
              POWERFUL AND VERSATILE
            </h2>
          </FadeUpReveal>
        </div>

        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - 3D Phone Mockup */}
          <FadeUpReveal yOffset={50} className="relative flex justify-center order-last md:order-first">
            <div className="relative flex justify-center scale-[0.9]">
            <Image
              src={glowBg}
              alt=""
              loading="lazy"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              style={{ width: "500px", height: "500px", objectFit: "contain" }}
              aria-hidden="true"
            />
            <div className="relative">
              <Phone3D floating={
                <div
                  className="absolute hidden md:flex flex-col gap-2.5"
                  style={{ left: "-60px", top: "56%", transform: "translateZ(40px)" }}
                >
                  <button type="button" className="store-btn">
                    <div className="flex flex-col items-start">
                      <span className="s1">Get it on the</span>
                      <span className="s2">App Store</span>
                    </div>
                  </button>
                  <button type="button" className="store-btn">
                    <div className="flex flex-col items-start">
                      <span className="s1">Get it on</span>
                      <span className="s2">Google Play</span>
                    </div>
                  </button>
                </div>
              }>
                <div
                  className="absolute rounded-full"
                  style={{ width: "150px", height: "150px", top: "-48px", left: "-48px", background: "var(--dark-blue-2)", zIndex: 1 }}
                />
                <div className="relative z-10 flex flex-col items-center justify-between px-4 py-8 h-full w-full pt-14">
                  <div className="flex flex-col items-center gap-3">
                    <Image src={logoIcon} alt="BalloAds Logo" width={56} height={56} className="object-contain" />
                    <h3 className="text-[var(--dark-blue-2)] font-black text-center text-[9px] tracking-[0.2em] uppercase leading-tight">
                      Your Digital Marketing<br />Assistant
                    </h3>
                  </div>
                  <div className="w-36 h-36 rounded-[1.75rem] bg-[#2273af] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                    <CloudUpload className="w-12 h-12 text-white mb-1.5" strokeWidth={1.5} />
                    <span className="text-white font-bold text-[11px] text-center leading-tight">Upload your<br />artwork here</span>
                  </div>
                  <button className="phone-next-btn">Next</button>
                </div>
              </Phone3D>
            </div>
            </div>
          </FadeUpReveal>

          {/* Right Side - Content Card */}
          <div
            ref={cardRef}
            className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
            style={{ transformOrigin: "center center" }}
            onMouseEnter={handleCardMouseEnter}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="relative z-10">
              <FadeUpReveal>
                <h2 className="text-4xl md:text-7xl font-bold mb-6 text-gradient-silver-2">
                  What We&apos;re About
                </h2>
              </FadeUpReveal>
              <FadeUpReveal delay={0.15}>
                <p className="text-lg md:text-xl leading-relaxed text-white/90">
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
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BalloAds — lazy-loaded, self-contained GSAP section */}
      <WhyScrollSection />

      {/* Trusted By Section */}
      <section className="py-16">
        <FadeUpReveal className="text-center mb-10">
          <p className="text-3xl text-shimmer">Trusted by the very best</p>
        </FadeUpReveal>
        <FadeUpReveal yOffset={50} delay={0.1}>
        <div className="logo-marquee">
          <div className="logo-marquee-track">
            {(
              [
                { src: logoMakhulu, alt: "Makhulu Investments" },
                { src: logoParamount, alt: "Paramount Logistics" },
                { src: logoOmphile, alt: "Omphile Visual Direction" },
                { src: logoInsizwe, alt: "Insizwe" },
                { src: logoMudenda, alt: "Mudenda Capital" },
                { src: logoFI, alt: "Financial Insights" },
                { src: logoTinge, alt: "Tinge Technology" },
                { src: logoIVLounge, alt: "The IV Lounge" },
                { src: logoSWR, alt: "SWR" },
                { src: logoShane, alt: "Shane Investments" },
                { src: logoShreeji, alt: "Shreeji" },
                { src: logoBayport, alt: "Bayport" },
                { src: logoSeneca, alt: "Seneca" },
                { src: logo9, alt: "Client" },
              ]
            ).concat([
              { src: logoMakhulu, alt: "Makhulu Investments" },
              { src: logoParamount, alt: "Paramount Logistics" },
              { src: logoOmphile, alt: "Omphile Visual Direction" },
              { src: logoInsizwe, alt: "Insizwe" },
              { src: logoMudenda, alt: "Mudenda Capital" },
              { src: logoFI, alt: "Financial Insights" },
              { src: logoTinge, alt: "Tinge Technology" },
              { src: logoIVLounge, alt: "The IV Lounge" },
              { src: logoSWR, alt: "SWR" },
              { src: logoShane, alt: "Shane Investments" },
              { src: logoShreeji, alt: "Shreeji" },
              { src: logoBayport, alt: "Bayport" },
              { src: logoSeneca, alt: "Seneca" },
              { src: logo9, alt: "Client" },
            ]).map((logo, i) => (
              <div key={i} className="flex items-center justify-center px-5 shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  height={112}
                  loading="lazy"
                  sizes="112px"
                  className="h-28 w-auto object-contain opacity-100 transition-opacity"
                  style={{ filter: logo.src === logoBayport ? 'brightness(0) invert(1)' : 'none' }}
                />
              </div>
            ))}
          </div>
        </div>
        </FadeUpReveal>
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
            <div className="gradient-blue-grey rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col">
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="flex flex-col items-center text-center"
                  >
                    <p className="text-xl md:text-2xl leading-relaxed mb-8 italic line-clamp-4 overflow-hidden h-[8.5rem] md:h-[10rem]">
                      &quot;{testimonials[testimonialIndex].quote}&quot;
                    </p>
                    <p className="text-xl font-bold mb-1 line-clamp-1 overflow-hidden w-full min-h-[1rem]">{testimonials[testimonialIndex].name}</p>
                    <p className="text-white/80 line-clamp-1 overflow-hidden w-full min-h-[1rem]">{testimonials[testimonialIndex].title}</p>
                    <p className="text-white/60 text-sm mt-1 line-clamp-1 overflow-hidden w-full min-h-[1rem]">{testimonials[testimonialIndex].company}</p>
                  </motion.div>
                </AnimatePresence>
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

          <div className="flex justify-center mt-12">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-waitlist"))}
              className="glow-button group"
            >
              <span className="glow-button__text">Join waitlist</span>
              <div className="glow-button__glow-core" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
