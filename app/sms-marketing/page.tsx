import type { Metadata } from "next";
import ChannelPage from "../components/channel/ChannelPage";
import heroImage from "@/public/BalloAds Assets 2/24.png";

export const metadata: Metadata = {
  title: "SMS Marketing | BalloAds",
  description:
    "Reach customers instantly with BalloAds bulk SMS — audience targeting, reliable delivery and campaign analytics in one place.",
};

export default function SmsMarketingPage() {
  return (
    <ChannelPage
      name="SMS Marketing"
      headline="Targeted bulk messaging solutions"
      intro="Reach every customer directly in their inbox. Build targeted lists and send bulk SMS campaigns that get read in seconds."
      heroImage={heroImage}
      heroImageAlt="BalloAds bulk SMS marketing preview"
      features={[
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
      ]}
      steps={[
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
      ]}
    />
  );
}
