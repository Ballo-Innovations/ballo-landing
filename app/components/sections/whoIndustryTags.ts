/**
 * Two short lines per industry: who it covers, and an example of what they
 * send. Marketing copy we wrote, not customer claims. Shared by the "Who can
 * use BalloAds?" trials (ADRs 0005, 0007); keyed by `industries[].id`.
 */
export const TAGS: Record<string, { who: string; example: string }> = {
  sme: { who: "Shops, brands & companies", example: "e.g. a weekend offer to past buyers" },
  finance: { who: "Banks, lenders & insurers", example: "e.g. a loan-approval SMS" },
  nonprofit: { who: "NGOs, councils & ministries", example: "e.g. a community health alert" },
  retail: { who: "Stores & online sellers", example: "e.g. back-in-stock on WhatsApp" },
  health: { who: "Clinics, labs & pharmacies", example: "e.g. an appointment reminder" },
  education: { who: "Schools, colleges & universities", example: "e.g. fees due to parents" },
};
