import type { Metadata } from "next";
import ChannelPage from "../components/channel/ChannelPage";
import { getMarketingChannel } from "@/lib/marketingChannelsApi";
import heroImage from "@/public/BalloAds Assets 2/22.png";

export const metadata: Metadata = {
  title: "WhatsApp Marketing | BalloAds",
  description:
    "Reach customers on WhatsApp with BalloAds — broadcast campaigns, rich messaging and delivery insights from one platform.",
};

const FALLBACK_HEADLINE = "WhatsApp marketing with precision";
const FALLBACK_INTRO =
  "Start conversations where your customers already are. Plan, send and measure WhatsApp campaigns that feel personal and arrive reliably.";
const FALLBACK_HERO_ALT = "BalloAds WhatsApp marketing preview";
const FALLBACK_FEATURES = [
  {
    title: "Broadcast campaigns",
    description:
      "Send updates, offers and reminders to segmented audiences without losing the one-to-one feel.",
  },
  {
    title: "Rich message support",
    description:
      "Pair text with images, buttons and media so every message drives a clear next step.",
  },
  {
    title: "Delivery insights",
    description:
      "Track delivered and read status across each campaign to understand what lands.",
  },
];
const FALLBACK_STEPS = [
  {
    label: "Build your audience",
    description: "Import or segment contacts that have opted in to hear from you.",
  },
  {
    label: "Compose your message",
    description: "Craft a rich WhatsApp message with media and a clear call to action.",
  },
  {
    label: "Send and measure",
    description: "Launch the campaign and follow delivery and engagement in real time.",
  },
];

export default async function WhatsappMarketingPage() {
  const cms = await getMarketingChannel("whatsapp");
  // Only trust the CMS response once it has an uploaded hero image — otherwise
  // fall back to the full hardcoded set so the page never mixes real copy
  // with the placeholder image (or renders broken/empty before the CMS row exists).
  const useCms = cms !== null && cms.heroImageUrl !== null;

  return (
    <ChannelPage
      name="WhatsApp Marketing"
      headline={useCms ? cms.headline : FALLBACK_HEADLINE}
      intro={useCms ? cms.intro : FALLBACK_INTRO}
      heroImage={useCms ? (cms.heroImageUrl as string) : heroImage}
      heroImageAlt={FALLBACK_HERO_ALT}
      features={useCms ? cms.features : FALLBACK_FEATURES}
      steps={useCms ? cms.steps : FALLBACK_STEPS}
    />
  );
}
