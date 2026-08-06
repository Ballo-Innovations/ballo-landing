import { getFaqs } from "@/lib/faqApi";
import ResourcesPageClient from "./ResourcesPageClient";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const faqs = await getFaqs();
  return <ResourcesPageClient faqs={faqs} />;
}
