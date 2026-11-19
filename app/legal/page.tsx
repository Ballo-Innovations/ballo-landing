import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LegalDraftNotice } from "./LegalDraftNotice";
import { LEGAL_GROUPS, getLegalDocuments } from "@/lib/legalApi";
import { formatLegalAudience, formatLegalDate } from "@/lib/legal/format";

export const metadata: Metadata = {
  title: "Legal | BalloAds",
  description: "The terms, policies and data protection documents that govern BalloAds.",
};

export default async function LegalIndexPage() {
  const docs = await getLegalDocuments();
  const anyInReview = docs.some((d) => d.showReviewNotice);
  // A document saved with a group this page doesn't know still gets listed.
  const known = new Set(LEGAL_GROUPS.map((g) => g.key as string));
  const groups = [
    ...LEGAL_GROUPS.map((g) => ({ ...g, docs: docs.filter((d) => d.group === g.key) })),
    { key: "other", title: "Other documents", description: "", docs: docs.filter((d) => !known.has(d.group)) },
  ].filter((g) => g.docs.length > 0);

  return (
    <div className="legal-shell">
      <header className="legal-hero">
        <h1 className="legal-title">Legal</h1>
        <p className="legal-intro">
          The terms and policies that govern BalloAds, how we handle personal data, and what we expect from businesses
          that message their customers through us.
        </p>
      </header>

      {anyInReview ? (
        <div className="legal-hero-notice">
          <LegalDraftNotice plural />
        </div>
      ) : null}

      {groups.length === 0 ? (
        <p className="legal-empty">No documents are published yet.</p>
      ) : (
        <div className="legal-groups">
          {groups.map((group) => (
            <section key={group.key} className="legal-group" aria-labelledby={`legal-group-${group.key}`}>
              <div className="legal-group__head">
                <h2 id={`legal-group-${group.key}`} className="legal-group__title">
                  {group.title}
                </h2>
                {group.description ? <p className="legal-group__desc">{group.description}</p> : null}
              </div>
              <ul className="legal-doc-list">
                {group.docs.map((doc) => {
                  const date = doc.effectiveDate ?? doc.publishedAt?.slice(0, 10) ?? null;
                  return (
                    <li key={doc.slug}>
                      <Link href={`/legal/${doc.slug}`} className="legal-doc-row">
                        <span className="legal-doc-row__main">
                          <span className="legal-doc-row__title">{doc.title}</span>
                          {doc.summary ? <span className="legal-doc-row__summary">{doc.summary}</span> : null}
                          <span className="legal-doc-row__meta">
                            {doc.audience ? <span>{formatLegalAudience(doc.audience)}</span> : null}
                            {date ? <span>Updated {formatLegalDate(date)}</span> : null}
                          </span>
                        </span>
                        <ArrowRight className="legal-doc-row__arrow" size={20} aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

