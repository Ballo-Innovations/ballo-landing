import { getContentPage } from "@/lib/pagesApi";
import { sanitizeBlogHtml } from "@/lib/contentFormat";

// No `force-dynamic`: this route already renders per-request because its CMS
// helpers read headers() to pick the environment's API base. All force-dynamic
// added was forcing `no-store` onto every fetch in the route, which overrode the
// revalidate window in lib/cmsFetch.ts and put an uncached upstream round-trip
// in front of every visitor.

export default async function CareersPage() {
  const page = await getContentPage("careers");

  if (!page) {
    return (
      <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-8">Careers</h1>
          <p className="landing-body text-white/80">
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
