import type { Metadata } from "next";
import ChannelPage from "../components/channel/ChannelPage";
import { getMarketingChannel } from "@/lib/marketingChannelsApi";
import heroImage from "@/public/BalloAds Assets 2/24.png";

export const metadata: Metadata = {
  title: "SMS Marketing | BalloAds",
  description:
    "Reach customers instantly with BalloAds bulk SMS — audience targeting, reliable delivery and campaign analytics in one place.",
};

const FALLBACK_HEADLINE = "Targeted bulk messaging solutions";
const FALLBACK_INTRO =
  "Reach every customer directly in their inbox. Build targeted lists and send bulk SMS campaigns that get read in seconds.";
const FALLBACK_HERO_ALT = "BalloAds bulk SMS marketing preview";
const FALLBACK_FEATURES = [
  {
    title: "Audience targeting",
    description:
      "Group contacts by attributes and behaviour so the right message reaches the right people.",
  },
  {
    title: "Bulk message delivery",
    description:
      "Send to thousands of recipients at once with dependable, high-throughput delivery.",
  },
  {
    title: "Campaign analytics",
    description:
      "Measure delivery and response across each send to refine your next campaign.",
  },
];
const FALLBACK_STEPS = [
  {
    label: "Upload your list",
    description: "Bring in your contacts and segment them into targeted audiences.",
  },
  {
    label: "Write your SMS",
    description: "Compose a concise message with a clear, trackable call to action.",
  },
  {
    label: "Send in bulk",
    description: "Schedule or send instantly, then watch delivery results roll in.",
  },
];

export default async function SmsMarketingPage() {
  const cms = await getMarketingChannel("sms");
  // Only trust the CMS response once it has an uploaded hero image — otherwise
  // fall back to the full hardcoded set so the page never mixes real copy
  // with the placeholder image (or renders broken/empty before the CMS row exists).
  const useCms = cms !== null && cms.heroImageUrl !== null;

  return (
    <ChannelPage
      name="SMS Marketing"
      headline={useCms ? cms.headline : FALLBACK_HEADLINE}
      intro={useCms ? cms.intro : FALLBACK_INTRO}
      heroImage={useCms ? (cms.heroImageUrl as string) : heroImage}
      heroImageAlt={FALLBACK_HERO_ALT}
      features={useCms ? cms.features : FALLBACK_FEATURES}
      steps={useCms ? cms.steps : FALLBACK_STEPS}
    />
  );
}
