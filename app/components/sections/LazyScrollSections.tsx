"use client";

import dynamic from "next/dynamic";

export const WhyScrollSectionLazy = dynamic(
  () => import("./WhyScrollSection").then((m) => m.WhyScrollSection),
  { ssr: false }
);

export const WhoScrollSectionLazy = dynamic(
  () => import("./WhoScrollSection").then((m) => m.WhoScrollSection),
  { ssr: false }
);
