import type { Metadata } from "next";
import ChannelPage from "../components/channel/ChannelPage";
import heroImage from "@/public/BalloAds Assets 2/23.png";

export const metadata: Metadata = {
  title: "Email Marketing | BalloAds",
  description:
    "Design, send and track email campaigns with BalloAds — a visual builder, audience segments and performance analytics in one place.",
};

export default function EmailMarketingPage() {
  return (
    <ChannelPage
      name="Email Marketing"
      headline="Email marketing at your fingertips"
      intro="Design campaigns that convert and send them with confidence. Build, segment and track email from a single, simple workspace."
      heroImage={heroImage}
      heroImageAlt="BalloAds email marketing preview"
      features={[
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
      ]}
      steps={[
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
      ]}
    />
  );
}
