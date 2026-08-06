import { getFaqs } from "@/lib/faqApi";
import GuidesPageClient from "./GuidesPageClient";

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const faqs = await getFaqs();
  return <GuidesPageClient faqs={faqs} />;
}
