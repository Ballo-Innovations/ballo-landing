import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LegalDocumentView } from "../../../LegalDocumentView";
import { getLegalDocuments, getLegalVersion, getLegalVersions } from "@/lib/legalApi";

type Params = Promise<{ slug: string; version: string }>;

function parseVersion(raw: string): number | null {
  return /^[1-9]\d{0,5}$/.test(raw) ? Number(raw) : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, version } = await params;
  const n = parseVersion(version);
  const doc = n ? await getLegalVersion(slug, n) : null;
  if (!doc) return {};
  // Superseded text should not compete with the current version in search.
  return { title: `${doc.title} (version ${doc.version}) | BalloAds`, robots: { index: false } };
}

export default async function LegalVersionPage({ params }: { params: Params }) {
  const { slug, version } = await params;
  const n = parseVersion(version);
  if (!n) notFound();

  const [doc, versions, all] = await Promise.all([getLegalVersion(slug, n), getLegalVersions(slug), getLegalDocuments()]);
  if (!doc) notFound();

  const current = versions.find((v) => v.isCurrent)?.version ?? null;
  if (current === doc.version) redirect(`/legal/${slug}`);

  return (
    <LegalDocumentView
      doc={doc}
      versions={versions}
      others={all.filter((d) => d.slug !== doc.slug)}
      archived={{ currentVersion: current }}
    />
  );
}
