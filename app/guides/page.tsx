import { getFaqs } from "@/lib/faqApi";
import GuidesPageClient from "./GuidesPageClient";

// No `force-dynamic`: this route already renders per-request because its CMS
// helpers read headers() to pick the environment's API base. All force-dynamic
// added was forcing `no-store` onto every fetch in the route, which overrode the
// revalidate window in lib/cmsFetch.ts and put an uncached upstream round-trip
// in front of every visitor.

export default async function GuidesPage() {
  const faqs = await getFaqs();
  return <GuidesPageClient faqs={faqs} />;
}
