import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftNotice } from "./LegalDraftNotice";
import { LEGAL_GROUPS, getLegalDocuments } from "@/lib/legalApi";
import { formatLegalDate } from "@/lib/legal/format";

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
    <div className="container mx-auto max-w-4xl px-4 pb-24 pt-28 md:pt-36">
      <header className="mb-10">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">Legal</h1>
        <p className="landing-body mt-4 max-w-2xl text-white/75">
          The terms and policies that govern BalloAds, how we handle personal data, and what we expect from businesses
          that message their customers through us.
        </p>
      </header>

      {anyInReview ? <LegalDraftNotice plural /> : null}

      {groups.length === 0 ? (
        <p className="mt-14 text-lg text-white/60">No documents are published yet.</p>
      ) : (
        <div className="mt-14 flex flex-col gap-14">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="mb-1 text-2xl font-bold">{group.title}</h2>
              {group.description ? <p className="mb-6 text-white/60">{group.description}</p> : null}
              <ul className="border-t border-white/15">
                {group.docs.map((doc) => {
                  const date = doc.effectiveDate ?? doc.publishedAt?.slice(0, 10) ?? null;
                  return (
                    <li key={doc.slug} className="border-b border-white/15">
                      <Link href={`/legal/${doc.slug}`} className="group block py-5">
                        <span className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                          <span className="text-xl font-bold text-white group-hover:text-[var(--cyan)]">
                            {doc.title}
                          </span>
                          {date ? (
                            <span className="text-sm text-white/65">Updated {formatLegalDate(date)}</span>
                          ) : null}
                        </span>
                        {doc.summary ? <span className="mt-1 block text-white/70">{doc.summary}</span> : null}
                        {doc.audience ? (
                          <span className="mt-1 block text-sm text-white/65">For: {doc.audience}</span>
                        ) : null}
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
