import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocumentView } from "../LegalDocumentView";
import { getLegalDocument, getLegalDocuments, getLegalVersions } from "@/lib/legalApi";

// Renders per request (the API base comes from the host header) behind the
// CMS revalidate window in lib/legalApi.ts.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getLegalDocument(slug);
  if (!doc) return {};
  return { title: `${doc.title} | BalloAds`, description: doc.summary || undefined };
}

export default async function LegalDocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [doc, versions, all] = await Promise.all([
    getLegalDocument(slug),
    getLegalVersions(slug),
    getLegalDocuments(),
  ]);
  if (!doc) notFound();

  return <LegalDocumentView doc={doc} versions={versions} others={all.filter((d) => d.slug !== doc.slug)} />;
}
