"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface FadeUpRevealProps {
  children: ReactNode;
  delay?: number;
  yOffset?: number;
  duration?: number;
  className?: string;
}

function isNodeInViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

export function FadeUpReveal({
  children,
  delay = 0,
  yOffset = 100,
  duration = 1.05,
  className = "",
}: FadeUpRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (isNodeInViewport(node)) {
      setRevealed(true);
    }
  }, [className]);

  useEffect(() => {
    if (revealed) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed, className]);

  if (revealed) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, scale: 0.92 }}
      animate={{ opacity: 0, y: yOffset, scale: 0.92 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
