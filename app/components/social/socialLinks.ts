/**
 * Official BalloAds social media accounts.
 *
 * The only visible placement is the top header social strip. TikTok is TBA, so
 * its URL stays null and renders as a non-interactive pending icon.
 */

export type SocialKey = "facebook" | "instagram" | "linkedin" | "tiktok";

export interface SocialLink {
  key: SocialKey;
  label: string;
  url: string | null;
}

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
