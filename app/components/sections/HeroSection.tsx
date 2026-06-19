"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Grainient from "@/components/Grainient";

const features = [
  { title: "WHATSAPP MARKETING WITH PRECISION" },
  { title: "TARGETED BULK MESSAGING SOLUTIONS" },
  { title: "INITIATE WEB POP UPS AND PUSH NOTIFICATIONS" },
  { title: "EMAIL MARKETING AT YOUR FINGERTIPS" },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAutoPlaying || shouldReduceMotion) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(id);
  }, [isAutoPlaying, shouldReduceMotion]);

  useEffect(() => {
    return () => { if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current); };
  }, []);

  const goToSlide = (index: number) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    if (!shouldReduceMotion) {
      resumeTimerRef.current = setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden">
      {/* Grainient background — pointer-events-none so fixed nav above receives clicks */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <Grainient
          color1="#E3E2DE"
          color2="#000063"
          color3="#E3E2DE"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.0}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      {/* Marquee watermark */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none z-10">
        <div className="marquee-track flex whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10 shrink-0">
              REBRANDING THE FUTURE
            </span>
          ))}
        </div>
      </div>


      {/* Centered content — pt-24 clears the floating nav pill */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 md:px-8 pt-24 pb-20 w-full max-w-5xl mx-auto" style={{ color: "#ffffff" }}>
        <div className="relative min-h-[180px] md:min-h-[220px] flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentSlide}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight uppercase features-hero w-full"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {shouldReduceMotion
                ? features[currentSlide].title
                : features[currentSlide].title.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.001 }}
                    >
                      {char}
                    </motion.span>
                  ))}
            </motion.h1>
          </AnimatePresence>
        </div>

        <Link
          href="#learn-more"
          className="mt-8 inline-flex items-center gap-3 bg-white text-[var(--dark-blue-2)] px-6 py-3 rounded-full font-bold text-xl md:text-2xl leading-none hover:bg-white/90 transition-all group shadow-sm"
        >
          Try it now
          <div className="w-8 h-8 rounded-full bg-[var(--dark-blue-2)]/15 flex items-center justify-center group-hover:bg-[var(--dark-blue-2)]/25 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Pagination dots */}
        <div className="flex items-center gap-3 mt-8">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full border border-white/85 transition-all ${
                index === currentSlide ? "bg-white" : "bg-transparent hover:bg-white/25"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
