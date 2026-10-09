"use client";

import { useEffect, useState } from "react";

/** Steps through 0..count-1 on a timer (paused off-screen tabs by the browser; still for reduced motion). */
export function useRotatingIndex(count: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms]);
  return i;
}
