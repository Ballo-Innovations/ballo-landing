import type { Metadata } from "next";
import { format } from "date-fns";

import { getAnnouncements, type Announcement } from "@/lib/announcementsApi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "What's New",
  description:
    "Stay up to date with the latest features, updates, and improvements to BalloAds.",
};

// Known CMS color names mapped to Tailwind pill classes. Unknown/missing
// values fall back to a neutral pill so a bad `badgeColor` never breaks
// rendering.
const BADGE_COLOR_CLASSES: Record<string, string> = {
  orange: "bg-orange-500/15 text-orange-300 border-orange-400/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-400/30",
  green: "bg-green-500/15 text-green-300 border-green-400/30",
  red: "bg-red-500/15 text-red-300 border-red-400/30",
  purple: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  yellow: "bg-yellow-500/15 text-yellow-300 border-yellow-400/30",
  pink: "bg-pink-500/15 text-pink-300 border-pink-400/30",
  cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
};

const DEFAULT_BADGE_CLASS = "bg-white/10 text-white/70 border-white/20";

function badgeClass(color: string | null): string {
  if (!color) return DEFAULT_BADGE_CLASS;
  return BADGE_COLOR_CLASSES[color.toLowerCase().trim()] ?? DEFAULT_BADGE_CLASS;
}

function formatDate(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "MMM d, yyyy");
}

function AnnouncementItem({ item }: { item: Announcement }) {
  const date = formatDate(item.createdAt);

  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        {item.badge && (
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass(
              item.badgeColor,
            )}`}
          >
            {item.badge}
          </span>
        )}
        {date && <span className="text-sm text-white/50">{date}</span>}
      </div>
      <h2 className="mt-3 text-2xl font-bold">{item.title}</h2>
      {item.description && <p className="mt-2 text-white/70">{item.description}</p>}
    </li>
  );
}

export default async function WhatsNewPage() {
  const announcements = await getAnnouncements();

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-5xl font-bold mb-4">What&apos;s New</h1>
        <p className="text-xl text-white/80 mb-12">
          Stay up to date with the latest features, updates, and improvements to
          BalloAds.
        </p>

        {announcements.length === 0 ? (
          <p className="text-lg text-white/60">Nothing new yet — check back soon.</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {announcements.map((item) => (
              <AnnouncementItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
