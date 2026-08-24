import type { Metadata } from "next";

import { GlassPlayground } from "./GlassPlayground";

// Internal tuning page: keep it out of search and out of the sitemap.
export const metadata: Metadata = {
  title: "Liquid Glass playground",
  robots: { index: false, follow: false },
};

export default function GlassPlaygroundPage() {
  return <GlassPlayground />;
}
