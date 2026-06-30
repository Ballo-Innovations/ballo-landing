import type { Metadata } from "next";
import ChannelPage from "../components/channel/ChannelPage";
import heroImage from "@/public/BalloAds Assets 2/22.png";

export const metadata: Metadata = {
  title: "WhatsApp Marketing | BalloAds",
  description:
    "Reach customers on WhatsApp with BalloAds — broadcast campaigns, rich messaging and delivery insights from one platform.",
};

export default function WhatsappMarketingPage() {
  return (
    <ChannelPage
      name="WhatsApp Marketing"
      headline="WhatsApp marketing with precision"
      intro="Start conversations where your customers already are. Plan, send and measure WhatsApp campaigns that feel personal and arrive reliably."
      heroImage={heroImage}
      heroImageAlt="BalloAds WhatsApp marketing preview"
      features={[
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
      ]}
      steps={[
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
      ]}
    />
  );
}
