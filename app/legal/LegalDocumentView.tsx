import Link from "next/link";

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
    <div className="container mx-auto max-w-6xl px-4 pb-24 pt-28 md:pt-36">
      <nav aria-label="Breadcrumb" className="legal-no-print mb-6 text-sm text-white/55">
        <Link href="/legal" className="hover:text-white">
          Legal
        </Link>
        <span aria-hidden="true"> / </span>
        {archived ? (
          <>
            <Link href={`/legal/${doc.slug}`} className="hover:text-white">
              {doc.title}
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-white/80">Version {doc.version}</span>
          </>
        ) : (
          <span className="text-white/80">{doc.title}</span>
        )}
      </nav>

      <header className="mb-10 max-w-3xl">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">{doc.title}</h1>
        <p className="mt-4 text-white/60">
          {date ? `Last updated ${formatLegalDate(date)}` : null}
          {date ? <span aria-hidden="true"> · </span> : null}
          Version {doc.version}
        </p>
      </header>

      {archived ? (
        <div role="note" className="mb-6 max-w-3xl rounded-lg border border-white/25 bg-white/[0.05] px-5 py-4 text-white/85">
          This is an earlier version, kept for reference. It is no longer in force.{" "}
          <Link href={`/legal/${doc.slug}`} className="text-[var(--cyan)] underline underline-offset-4 hover:text-white">
            Read the current version
          </Link>
          .
        </div>
      ) : null}

      {doc.showReviewNotice && !archived ? <LegalDraftNotice /> : null}

      <div className="mt-12 grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="legal-no-print hidden lg:block">
          {toc.length > 0 ? (
            <div className="sticky top-28">
              <LegalToc items={toc} />
            </div>
          ) : null}
        </aside>

        <article className="min-w-0 max-w-3xl">
          {doc.summary ? <p className="legal-lede mb-10">{doc.summary}</p> : null}

          <div className="legal-body" dangerouslySetInnerHTML={{ __html: html }} />

          {older.length > 0 ? (
            <section className="legal-no-print mt-16 border-t border-white/15 pt-10">
              <h2 className="mb-2 text-lg font-bold text-white">Version history</h2>
              <p className="mb-5 text-white/60">Earlier versions of this document, kept for reference.</p>
              <ul className="flex flex-col gap-3">
                {older.map((v) => {
                  const vDate = v.effectiveDate ?? v.publishedAt?.slice(0, 10) ?? null;
                  return (
                    <li key={v.version}>
                      <Link
                        href={v.isCurrent ? `/legal/${doc.slug}` : `/legal/${doc.slug}/v/${v.version}`}
                        className="text-white/80 underline-offset-4 hover:text-white hover:underline"
                      >
                        Version {v.version}
                        {vDate ? `, ${formatLegalDate(vDate)}` : ""}
                        {v.isCurrent ? " (current)" : ""}
                      </Link>
                      {v.changeNote ? <span className="block text-sm text-white/65">{v.changeNote}</span> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {others.length > 0 ? (
            <aside className="legal-no-print mt-16 border-t border-white/15 pt-10">
              <h2 className="mb-5 text-lg font-bold text-white">Other legal documents</h2>
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/legal/${other.slug}`}
                      className="text-white/75 underline-offset-4 hover:text-white hover:underline"
                    >
                      {other.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </article>
      </div>
    </div>
  );
}
