import Link from "next/link";
import { ArrowRight, ArrowUp } from "lucide-react";

import { LegalToc } from "./LegalToc";
import { LegalDraftNotice } from "./LegalDraftNotice";
import type { LegalDocumentSummary, LegalVersionSummary, PublicLegalDocument } from "@/lib/legalApi";
import { formatLegalDate } from "@/lib/legal/format";
import { renderLegalHtml } from "@/lib/legal/renderLegalHtml";

type Props = {
  doc: PublicLegalDocument;
  versions: LegalVersionSummary[];
  others: LegalDocumentSummary[];
  /** Set when showing an older, superseded version. */
  archived?: { currentVersion: number | null };
};

export function LegalDocumentView({ doc, versions, others, archived }: Props) {
  const { html, toc } = renderLegalHtml(doc.bodyHtml);
  const date = doc.effectiveDate ?? doc.publishedAt?.slice(0, 10) ?? null;
  const older = versions.filter((v) => v.version !== doc.version);

  return (
    <div className="legal-shell">
      <nav aria-label="Breadcrumb" className="legal-crumbs legal-no-print">
        <Link href="/legal">Legal</Link>
        <span aria-hidden="true">/</span>
        {archived ? (
          <>
            <Link href={`/legal/${doc.slug}`}>{doc.title}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Version {doc.version}</span>
          </>
        ) : (
          <span aria-current="page">{doc.title}</span>
        )}
      </nav>

      <header className="legal-doc-head">
        <h1 className="legal-title">{doc.title}</h1>
        {doc.summary ? <p className="legal-intro">{doc.summary}</p> : null}
        <dl className="legal-facts">
          {date ? (
            <div>
              <dt>Last updated</dt>
              <dd>{formatLegalDate(date)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Version</dt>
            <dd>{doc.version}</dd>
          </div>
          {doc.audience ? (
            <div className="legal-facts__wide">
              <dt>Applies to</dt>
              <dd>{doc.audience}</dd>
            </div>
          ) : null}
        </dl>
      </header>

      {archived || doc.showReviewNotice ? (
        <div className="legal-doc-notices">
          {archived ? (
            <div role="note" className="legal-notice legal-notice--archived">
              <p>
                <strong>Earlier version.</strong> Kept for reference; it is no longer in force.{" "}
                <Link href={`/legal/${doc.slug}`}>Read the current version</Link>.
              </p>
            </div>
          ) : (
            <LegalDraftNotice />
          )}
        </div>
      ) : null}

      <div className="legal-doc-grid">
        <aside className="legal-doc-rail legal-no-print">
          {toc.length > 0 ? <LegalToc items={toc} /> : null}
        </aside>

        <article className="legal-doc-main">
          {toc.length > 0 ? (
            <div className="legal-doc-drawer legal-no-print">
              <LegalToc items={toc} variant="drawer" />
            </div>
          ) : null}

          <div className="legal-body" dangerouslySetInnerHTML={{ __html: html }} />

          <a href="#top" className="legal-top legal-no-print">
            <ArrowUp size={16} aria-hidden="true" /> Back to top
          </a>

          {older.length > 0 ? (
            <section className="legal-after legal-no-print" aria-labelledby="legal-versions">
              <h2 id="legal-versions" className="legal-after__title">
                Version history
              </h2>
              <p className="legal-after__desc">Earlier versions of this document, kept for reference.</p>
              <ul className="legal-versions">
                {older.map((v) => {
                  const vDate = v.effectiveDate ?? v.publishedAt?.slice(0, 10) ?? null;
                  return (
                    <li key={v.version}>
                      <Link href={v.isCurrent ? `/legal/${doc.slug}` : `/legal/${doc.slug}/v/${v.version}`}>
                        <span className="legal-versions__name">
                          Version {v.version}
                          {v.isCurrent ? " (current)" : ""}
                        </span>
                        {vDate ? <span className="legal-versions__date">{formatLegalDate(vDate)}</span> : null}
                      </Link>
                      {v.changeNote ? <p className="legal-versions__note">{v.changeNote}</p> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {others.length > 0 ? (
            <nav className="legal-after legal-no-print" aria-labelledby="legal-others">
              <h2 id="legal-others" className="legal-after__title">
                Other legal documents
              </h2>
              <ul className="legal-others">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link href={`/legal/${other.slug}`}>
                      <span>{other.title}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </article>
      </div>
    </div>
  );
}
