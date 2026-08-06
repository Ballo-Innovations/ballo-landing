import type { Metadata } from "next";

import { getFaqs, type FaqEntry } from "@/lib/faqApi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Find answers to frequently asked questions about BalloAds.",
};

type FaqGroup = { category: string; items: FaqEntry[] };

// Groups by category, preserving the order categories first appear in the
// already-sorted (category, then sortOrder) list from the backend — never
// alphabetized, so CMS-controlled ordering wins.
function groupByCategory(faqs: FaqEntry[]): FaqGroup[] {
  const order: string[] = [];
  const byCategory = new Map<string, FaqEntry[]>();

  for (const faq of faqs) {
    const category = faq.category?.trim() || "General";
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
      order.push(category);
    }
    byCategory.get(category)!.push(faq);
  }

  return order.map((category) => ({ category, items: byCategory.get(category)! }));
}

export default async function FAQPage() {
  const faqs = await getFaqs();
  const groups = groupByCategory(faqs);

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-5xl font-bold mb-4">FAQ</h1>
        <p className="text-xl text-white/80 mb-12">
          Find answers to frequently asked questions about BalloAds.
        </p>

        {groups.length === 0 ? (
          <p className="text-lg text-white/60">No FAQs published yet.</p>
        ) : (
          <div className="flex flex-col gap-12">
            {groups.map((group) => (
              <section key={group.category}>
                <h2 className="text-2xl font-bold mb-4">{group.category}</h2>
                <div className="flex flex-col gap-3">
                  {group.items.map((faq) => (
                    <details
                      key={faq.id}
                      className="group rounded-xl border border-white/10 bg-white/5 px-5 py-4 open:bg-white/10"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none">
                        <span>{faq.question}</span>
                        <span
                          className="shrink-0 text-xl text-white/50 leading-none transition-transform group-open:rotate-45"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-white/70">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
