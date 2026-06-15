"use client";

import { ReactNode, useEffect } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Use native CSS smooth scroll on desktop only
    const isMobile = window.innerWidth < 768;

    if (!isMobile) {
      document.documentElement.style.scrollBehavior = "smooth";
    }

    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return <>{children}</>;
}
