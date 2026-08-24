import { getFeaturedBusinessChannels } from "@/lib/featuredChannelsApi";
import SubscriptionPageClient, { type SubscriptionChannelItem } from "./SubscriptionPageClient";

// No `force-dynamic`: this route already renders per-request because its CMS
// helpers read headers() to pick the environment's API base. All force-dynamic
// added was forcing `no-store` onto every fetch in the route, which overrode the
// revalidate window in lib/cmsFetch.ts and put an uncached upstream round-trip
// in front of every visitor.

// Fallback content — shown until the CMS has featured-business-channel rows
// published. Keep this array (never delete it): getFeaturedBusinessChannels()
// returns [] both on fetch failure and on a genuinely empty (unseeded) CMS
// table, so this is what keeps the page from regressing to an empty grid.
const FALLBACK_SUBSCRIPTION_CHANNELS: SubscriptionChannelItem[] = [
  {
    id: 1,
    channelName: "BalloAds Official",
    profileImage: null,
    subscriberCount: "12.5K",
  },
  {
    id: 2,
    channelName: "Digital Marketing Tips",
    profileImage: null,
    subscriberCount: "8.3K",
  },
  {
    id: 3,
    channelName: "AI Technology Hub",
    profileImage: null,
    subscriberCount: "15.2K",
  },
  {
    id: 4,
    channelName: "Business Growth",
    profileImage: null,
    subscriberCount: "9.7K",
  },
  {
    id: 5,
    channelName: "Tech Innovations",
    profileImage: null,
    subscriberCount: "6.1K",
  },
  {
    id: 6,
    channelName: "Marketing Mastery",
    profileImage: null,
    subscriberCount: "11.4K",
  },
];

export default async function SubscriptionPage() {
  const cmsChannels = await getFeaturedBusinessChannels();
  const channels: SubscriptionChannelItem[] =
    cmsChannels.length > 0
      ? cmsChannels.map((channel) => ({
          id: channel.id,
          channelName: channel.channelName,
          profileImage: channel.profileImageUrl,
          subscriberCount: channel.displaySubscriberCount,
        }))
      : FALLBACK_SUBSCRIPTION_CHANNELS;

  return <SubscriptionPageClient channels={channels} />;
}
