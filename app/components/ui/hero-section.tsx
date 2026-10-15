"use client";

/**
 * From 21st.dev's "Financial Hero", adapted for this site (see ADR 0004):
 *
 * - No shadcn `Button` (and so no @radix-ui/react-slot or
 *   class-variance-authority). The call to action is an `action` node, so
 *   the caller passes the site's own button, e.g. `ShinyButton`.
 * - No shadcn theme tokens. `bg-background`, `--border` and
 *   `text-muted-foreground` become the site's dark page (transparent, over
 *   `.page-gradient`), a faint white grid and a 72% white body copy.
 * - The heading is an `h2` (this is a section mid-page, not the page's h1),
 *   and the entrance runs when it scrolls into view rather than on mount.
 * - Image alts are props; the demo hard-coded "Financial Card Front/Back".
 */

import React from "react";
import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface FinancialHeroProps {
  title: React.ReactNode;
  description: React.ReactNode;
  /** The call to action, rendered under the description. */
  action?: React.ReactNode;
  imageUrl1: string;
  imageUrl2: string;
  imageAlt1?: string;
  imageAlt2?: string;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardsVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.3 },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

export const FinancialHero = ({
  title,
  description,
  action,
  imageUrl1,
  imageUrl2,
  imageAlt1 = "",
  imageAlt2 = "",
  className,
}: FinancialHeroProps) => {
  const gridBackgroundStyle = {
    backgroundImage:
      "linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px)",
    backgroundSize: "3rem 3rem",
  };

  return (
    <section
      className={cn("relative w-full overflow-hidden text-white", className)}
    >
      {/* The grid fades out at every edge through a mask rather than the
          demo's `from-background` overlay: the page behind is a gradient,
          so painting a solid colour over the edges would cut visible bands. */}
      <div
        className="absolute inset-0"
        style={{
          ...gridBackgroundStyle,
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)",
        }}
      />

      <motion.div
        className="relative mx-auto flex min-h-[80vh] max-w-[76rem] flex-col items-center justify-between gap-12 px-6 py-20 lg:flex-row"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {/* Left: text */}
        <div className="flex flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
          <motion.h2
            className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
            variants={itemVariants}
          >
            {title}
          </motion.h2>
          <motion.div
            className="mt-6 max-w-xl text-lg text-white/70"
            variants={itemVariants}
          >
            {description}
          </motion.div>
          {action ? (
            <motion.div variants={itemVariants} className="mt-8">
              {action}
            </motion.div>
          ) : null}
        </div>

        {/* Right: the two cards. The box needs a height of its own: both
            cards are absolute, so without one it collapses to nothing. */}
        <motion.div
          className="relative flex h-64 w-full items-center justify-center md:h-96 lg:w-1/2"
          variants={cardsVariants}
        >
          {/* eslint-disable @next/next/no-img-element -- animated by framer-motion */}
          <motion.img
            src={imageUrl2}
            alt={imageAlt2}
            variants={cardItemVariants}
            whileHover={{ y: -10, rotate: -5, transition: { duration: 0.3 } }}
            className="absolute aspect-[4/5] h-48 translate-x-24 rotate-[-6deg] transform rounded-2xl object-cover shadow-2xl md:h-80"
          />
          <motion.img
            src={imageUrl1}
            alt={imageAlt1}
            variants={cardItemVariants}
            whileHover={{ y: -10, rotate: 5, transition: { duration: 0.3 } }}
            className="absolute aspect-[4/5] h-48 -translate-x-16 rotate-[6deg] transform rounded-2xl object-cover shadow-2xl md:h-80"
          />
          {/* eslint-enable @next/next/no-img-element */}
        </motion.div>
      </motion.div>
    </section>
  );
};
