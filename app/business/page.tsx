"use client";
// components/marketing/HeroSection.tsx

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import Link from 'next/link';
import clsx from 'clsx'; // Utility for conditionally joining class names
import person from "@/public/Assets/15.png";
import circle from "@/public/Assets/9.png";
import man from "@/public/BalloAds Assets 2/18.png";

// --- Prop Types & Variants ---

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string; // Optional: Makes the button act as a Next.js Link
}

// --- Base Styles (Shared) ---

const baseStyles = 'font-semibold rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-4';

const sizeStyles: Record<ButtonSize, string> = {
  medium: 'px-5 py-2 text-base',
  large: 'px-8 py-3 text-lg shadow-xl', // Used in the Hero Section
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300/50',
  ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500/20',
};


// --- Component ---

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className,
  href,
  ...props
}) => {
  const classes = clsx(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  // If href is provided, render as a Next.js Link
  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <a className={classes}>
          {children}
        </a>
      </Link>
    );
  }

  // Otherwise, render as a standard <button>
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
// --- Typewriter blank for the fill-in-the-blank hero ---

// A real text input whose placeholder is an animated typewriter cycling
// example words. The animation only runs while the field is empty and
// unfocused, so it never fights with what the user types. Adapted from the
// KokonutUI Typewriter reference, using the project's framer-motion for the
// blinking caret instead of the "motion/react" package.
const GapTypewriter: React.FC<{
  name: string;
  words: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  startDelay?: number;
}> = ({ name, words, value, onChange, className = '', startDelay = 200 }) => {
  const [display, setDisplay] = useState('');
  const [focused, setFocused] = useState(false);
  const wordIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordsRef = useRef(words);
  wordsRef.current = words;

  // The animated placeholder is only visible while the blank is untouched.
  const showPlaceholder = value.length === 0 && !focused;

  useEffect(() => {
    if (!showPlaceholder) {
      if (timeout.current) clearTimeout(timeout.current);
      return;
    }

    const typingSpeed = 90;
    const deleteSpeed = 45;
    const holdAfterType = 1600;
    const holdAfterDelete = 350;

    // +/- variance so each keystroke feels hand-typed rather than metronomic.
    const jitter = (base: number) => base * (0.7 + Math.random() * 0.6);

    const tick = () => {
      const current = wordsRef.current[wordIndex.current] ?? '';

      if (deleting.current) {
        charIndex.current -= 1;
        setDisplay(current.slice(0, Math.max(0, charIndex.current)));
        if (charIndex.current <= 0) {
          deleting.current = false;
          wordIndex.current = (wordIndex.current + 1) % wordsRef.current.length;
          timeout.current = setTimeout(tick, holdAfterDelete);
        } else {
          timeout.current = setTimeout(tick, jitter(deleteSpeed));
        }
      } else {
        charIndex.current += 1;
        setDisplay(current.slice(0, charIndex.current));
        if (charIndex.current >= current.length) {
          deleting.current = true;
          timeout.current = setTimeout(tick, holdAfterType);
        } else {
          timeout.current = setTimeout(tick, jitter(typingSpeed));
        }
      }
    };

    timeout.current = setTimeout(tick, startDelay);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [showPlaceholder, startDelay]);

  return (
    <span
      className={`relative inline-block mx-2 border-b-2 border-white/40 align-baseline focus-within:border-white ${className}`}
    >
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={name}
        autoComplete="off"
        className="w-full bg-transparent px-2 text-white outline-none"
      />
      {showPlaceholder && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-2 whitespace-nowrap"
          style={{ color: '#535A8D' }}
        >
          {display}
          <motion.span
            className="ml-[2px] inline-block w-[3px] align-middle bg-[var(--cyan-bright)]"
            style={{ height: '0.9em' }}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </span>
      )}
    </span>
  );
};

// --- Component Definition ---

const HeroSection: React.FC = () => {
  // Captures the user's business needs. Blanks show an animated placeholder
  // until the user types their own answer.
  const [formData, setFormData] = useState({
    businessType: '',
    location: '',
    businessName: '',
    offering: '',
    customerIssue: '',
    ourStruggle: '',
    reachCount: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-[var(--brand-color-1)]">
      <section className="min-h-screen flex flex-col justify-center pt-24 pb-12 bg-[var(--brand-color-1)]">
        {/* Content box matches the nav bar bounds. Nav = 100vw-1rem under 640px, else min(100vw-1.5rem, 84rem). */}
        <div className="relative overflow-hidden w-[calc(100%-1rem)] sm:w-[calc(100%-1.5rem)] max-w-[84rem] mx-auto">
          <h3
            className="text-xl md:text-2xl text-center mb-8 uppercase tracking-widest bg-clip-text text-transparent"
            style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #d0e4e4, #020055)" }}
          >
            HI! WONDERING WHICH PLAN BEST SUITS YOU? WE WILL MEET YOU WHERE YOU ARE.
          </h3>

          {/* The "Sentence" UI. Each blank types out example scenarios on a
              loop, so the statement reads like a live-filling fill-in-the-blank
              form. */}
          <div className="text-3xl md:text-5xl lg:text-6xl text-white leading-tight md:leading-relaxed text-center lg:text-left">
            I have a
            <GapTypewriter
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              words={["e-commerce", "salon", "boutique", "bakery"]}
              className="w-48 md:w-72"
              startDelay={200}
            />
            business in
            <GapTypewriter
              name="location"
              value={formData.location}
              onChange={handleChange}
              words={["Lusaka", "Kitwe", "Ndola", "Kabwe"]}
              className="w-40 md:w-60"
              startDelay={500}
            />
            called
            <GapTypewriter
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              words={["my brand", "my shop", "my store", "our team"]}
              className="w-48 md:w-72"
              startDelay={800}
            />
            and what we do is
            <GapTypewriter
              name="offering"
              value={formData.offering}
              onChange={handleChange}
              words={["sell online", "sell food", "book jobs", "run ads"]}
              className="w-48 md:w-72"
              startDelay={1100}
            />
            . Right now, customers
            <GapTypewriter
              name="customerIssue"
              value={formData.customerIssue}
              onChange={handleChange}
              words={["not replying", "going quiet", "not buying", "ghosting us"]}
              className="w-48 md:w-72"
              startDelay={1400}
            />
            is costing us money and sales, and we
            <GapTypewriter
              name="ourStruggle"
              value={formData.ourStruggle}
              onChange={handleChange}
              words={["lose track", "miss leads", "lose sales", "fall behind"]}
              className="w-48 md:w-72"
              startDelay={1700}
            />
            . I need to reach
            <GapTypewriter
              name="reachCount"
              value={formData.reachCount}
              onChange={handleChange}
              words={["50,000", "10,000", "5,000", "everyone"]}
              className="w-40 md:w-60"
              startDelay={2000}
            />
            people without turning it into a full-time job.
          </div>

          {/* Optional: Add a 'Find My Plan' button */}
          <div className="mt-6 text-center lg:text-right">
            <button className="bg-white text-[var(--brand-color-1)] font-bold py-4 px-10 rounded-full hover:bg-opacity-90 transition shadow-lg">
              GET RECOMMENDED PLAN
            </button>
          </div>
        </div>
      </section>
      <section className="px-4 pb-10 md:px-8 bg-[var(--brand-color-1)]">
        <div className="biz-bulk-card relative overflow-hidden rounded-[48px] bg-gradient-to-br from-[#0F1F4C] via-[#133A7C] to-[#0A4ACB] p-[2px] shadow-2xl">
          <div className="biz-bulk-card__inner flex flex-col gap-8 rounded-[46px] gradient-blue-grey p-6 md:flex-row md:p-8">
            <div className="flex flex-1 flex-col justify-center gap-4 text-white">
              <div className="glitch-text">
                <h1 className="text-5xl font-bold md:text-7xl">
                  Bulk SMS!
                </h1>
              </div>
              <p className="text-base text-white">
                With this service, you can send bulk SMS campaigns
                instantly to thousands of recipients with just a few
                clicks. The platform ensures fast delivery, detailed
                analytics, and personalised messaging, helping......
              </p>
              <Link href="/sms-marketing" className="biz-bulk-card__link">
                read more
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="biz-bulk-card__media flex-1">
              <div className="absolute -top-8 -right-6 h-48 w-48 rounded-full bg-[var(--brand-color-2)]/10 blur-2xl" />
              <Image
                src={man}
                alt="Smiling marketer"
                width={360}
                height={320}
                className="relative rounded-[46px]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-[var(--dark-blue)] text-white px-4 md:px-8 py-24">
        <div className="container mx-auto relative z-10 flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="glitch-text">
              <h3 className="text-4xl md:text-5xl font-bold drop-shadow-2xl leading-tight text-white">
                Rebranding the future of your industry starts here.
              </h3>
            </div>
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-xl">
              Book a tailored BalloAds demo and see how our omnichannel marketing platform can help you
              unlock new revenue, accelerate growth and engage your audience in real time.
            </p>
            <Link
              href="https://crm.balloads.com/demo"
              className="inline-flex items-center gap-3 w-fit px-8 py-4 rounded-full bg-white text-[var(--dark-blue)] font-semibold text-lg shadow-lg hover:bg-[var(--brand-color-2)] transition-colors"
            >
              Book a free demo
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="relative flex justify-center md:justify-end w-full md:w-auto">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-full bg-[#F5F7FF] blur-2xl" />
              <div className="absolute inset-4 rounded-full bg-[var(--dark-blue)] shadow-2xl" />
              <div className="absolute inset-8 flex items-center justify-center">
                <Image
                  src={circle}
                  alt="Circles Ring"
                  width={1600}
                  height={1900}
                  className="w-full h-auto absolute right-0 -bottom-13 scale-[2]"
                  priority
                />
                <Image
                  src={person}
                  alt="Happy customer using BalloAds"
                  width={280}
                  height={280}
                  className="object-contain drop-shadow-2xl bottom-5 scale-[1.5]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-[#F5F7FF] blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-[#F5F7FF] blur-[120px]" />
        </div>
      </section>
    </div>

  );
};

export default HeroSection;