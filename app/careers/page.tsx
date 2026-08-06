import { getContentPage } from "@/lib/pagesApi";
import { sanitizeBlogHtml } from "@/lib/contentFormat";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const page = await getContentPage("careers");

  if (!page) {
    return (
      <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-8">Careers</h1>
          <p className="text-xl text-white/80">
            Join the BalloAds team and help shape the future of digital marketing.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
      <div className="container mx-auto">
        <h1 className="text-5xl font-bold mb-8">{page.title}</h1>
        <div
          className="prose prose-invert max-w-none text-white/80"
          dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(page.body) }}
        />
      </div>
    </main>
  );
}
