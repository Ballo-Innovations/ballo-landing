/**
 * Official BalloAds social media accounts.
 *
 * Placed in both the header social strip and the footer's "Our Socials"
 * column. TikTok is TBA, so its URL stays null and renders as a
 * non-interactive pending icon.
 *
 * This static array is the fallback shown until the CMS has published
 * SocialLink rows (see `resolveSocialLinks` below) — keep it, don't delete it.
 */

import type { SocialLinkResponse } from "@/lib/socialLinksApi";

export type SocialKey = "facebook" | "instagram" | "linkedin" | "tiktok";

export interface SocialLink {
  key: SocialKey;
  label: string;
  url: string | null;
}

const SOCIAL_LABELS: Record<SocialKey, string> = {
  facebook: "BalloAds on Facebook",
  instagram: "BalloAds on Instagram",
  linkedin: "BalloAds on LinkedIn",
  tiktok: "BalloAds on TikTok",
};

export const socialLinks: SocialLink[] = [
  {
    key: "facebook",
    label: "BalloAds on Facebook",
    url: "https://www.facebook.com/share/1ENMCGHXCy/?mibextid=wwXIfr",
  },
  {
    key: "instagram",
    label: "BalloAds on Instagram",
    url: "https://www.instagram.com/balloads",
  },
  {
    key: "linkedin",
    label: "BalloAds on LinkedIn",
    url: "https://www.linkedin.com/company/balloads/",
  },
  {
    key: "tiktok",
    label: "BalloAds on TikTok",
    url: null,
  },
];

function isSocialKey(value: string): value is SocialKey {
  return value === "facebook" || value === "instagram" || value === "linkedin" || value === "tiktok";
}

/**
 * Maps CMS SocialLink rows onto the {key,label,url} shape the header/footer
 * already render. Unknown platform strings (no matching icon) are dropped.
 * Falls back to the static `socialLinks` array above when the CMS has no
 * published rows yet.
 */
export function resolveSocialLinks(fetched: SocialLinkResponse[]): SocialLink[] {
  if (!fetched.length) return socialLinks;

  const mapped = fetched
    .filter((row) => isSocialKey(row.platform.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => {
      const key = row.platform.toLowerCase() as SocialKey;
      return { key, label: SOCIAL_LABELS[key], url: row.url };
    });

  return mapped.length > 0 ? mapped : socialLinks;
}
