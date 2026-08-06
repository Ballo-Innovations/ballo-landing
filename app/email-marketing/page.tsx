import type { Metadata } from "next";
import ChannelPage from "../components/channel/ChannelPage";
import { getMarketingChannel } from "@/lib/marketingChannelsApi";
import heroImage from "@/public/BalloAds Assets 2/23.png";

export const metadata: Metadata = {
  title: "Email Marketing | BalloAds",
  description:
    "Design, send and track email campaigns with BalloAds — a visual builder, audience segments and performance analytics in one place.",
};

const FALLBACK_HEADLINE = "Email marketing at your fingertips";
const FALLBACK_INTRO =
  "Design campaigns that convert and send them with confidence. Build, segment and track email from a single, simple workspace.";
const FALLBACK_HERO_ALT = "BalloAds email marketing preview";
const FALLBACK_FEATURES = [
  {
    title: "Campaign builder",
    description:
      "Compose on-brand emails quickly with a visual builder — no code required.",
  },
  {
    title: "Audience segments",
    description:
      "Target the right readers by grouping subscribers around what matters to them.",
  },
  {
    title: "Performance tracking",
    description:
      "Follow opens, clicks and conversions to see exactly how each campaign performs.",
  },
];
const FALLBACK_STEPS = [
  {
    label: "Choose your audience",
    description: "Segment subscribers so every email reaches the most relevant readers.",
  },
  {
    label: "Design your email",
    description: "Build an on-brand campaign with the visual editor and a clear CTA.",
  },
  {
    label: "Send and track",
    description: "Schedule the send, then track opens, clicks and conversions.",
  },
];

export default async function EmailMarketingPage() {
  const cms = await getMarketingChannel("email");
  // Only trust the CMS response once it has an uploaded hero image — otherwise
  // fall back to the full hardcoded set so the page never mixes real copy
  // with the placeholder image (or renders broken/empty before the CMS row exists).
  const useCms = cms !== null && cms.heroImageUrl !== null;

  return (
    <ChannelPage
      name="Email Marketing"
      headline={useCms ? cms.headline : FALLBACK_HEADLINE}
      intro={useCms ? cms.intro : FALLBACK_INTRO}
      heroImage={useCms ? (cms.heroImageUrl as string) : heroImage}
      heroImageAlt={FALLBACK_HERO_ALT}
      features={useCms ? cms.features : FALLBACK_FEATURES}
      steps={useCms ? cms.steps : FALLBACK_STEPS}
    />
  );
}
