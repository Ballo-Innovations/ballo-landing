import { UserPlus, Send, SlidersHorizontal, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StaticImageData } from "next/image";

import screenSignUp from "@/public/Assets/37.png";
import screenChannels from "@/public/Assets/40.png";
import screenPackages from "@/public/Assets/39.png";
import screenAnalytics from "@/public/Assets/38.png";

export type HowItWorksStep = {
  slug: string;
  number: string;
  title: string;
  /** One-liner used on the stage caption + the timeline. */
  description: string;
  /** Short preview note shown on the bottom cards. */
  note: string;
  Icon: LucideIcon;
  /** Real in-app screen shown on the phone for this step. */
  screen: StaticImageData;
  screenAlt: string;
  detail: {
    intro: string;
    sections: { heading: string; body: string }[];
  };
};

/**
 * The four onboarding steps. Single source of truth for the interactive stage,
 * the preview cards, and the /how-it-works/[step] sub-pages.
 *
 * ── Content boundary ─────────────────────────────────────────────────────────
 *  TODO: `note` and `detail` carry scaffold copy — replace with the final
 *  preview notes / long-form text once provided. Structure is final.
 *  TODO: `screen` points at the current in-app mockups (Assets 37/40/39/38).
 *  Swap these for the updated screens when they're shared; sizes match
 *  (2160×2700 RGBA), so no layout change is needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const howItWorksSteps: HowItWorksStep[] = [
  {
    slug: "sign-up",
    number: "1",
    title: "Sign Up & Get Verified",
    description: "Create an account and complete the quick KYC process.",
    note: "Getting started takes minutes — create your account, verify your business, and you're ready to launch your first campaign.",
    Icon: UserPlus,
    screen: screenSignUp,
    screenAlt: "BalloAds app welcome screen with sign up and login options",
    detail: {
      intro:
        "Your BalloAds account is the front door to every channel we support. Signing up takes a couple of minutes, and verification keeps the network trusted for everyone who sends on it.",
      sections: [
        {
          heading: "Create your account",
          body: "Sign up with your email, or continue with Google or Apple. You'll pick a password, confirm your contact details, and land straight in the dashboard.",
        },
        {
          heading: "Verify your business",
          body: "Our quick KYC step confirms who you are and which business you're sending on behalf of. It protects your sender reputation and unlocks higher sending limits.",
        },
        {
          heading: "Invite your team",
          body: "Add colleagues and assign roles so the right people can build, approve, and launch campaigns without sharing one login.",
        },
      ],
    },
  },
  {
    slug: "select-audience",
    number: "2",
    title: "Select Your Audience",
    description: "Choose from bulk messaging to precisely targeted ads.",
    note: "Pick the channels your customers actually use — SMS, WhatsApp, or email — then narrow down to exactly who should hear from you.",
    Icon: Send,
    screen: screenChannels,
    screenAlt: "BalloAds app channel picker showing SMS, WhatsApp and email",
    detail: {
      intro:
        "Reach is only useful when it lands on the right people. BalloAds lets you choose the channel and the audience in the same flow, so every message has a reason to be there.",
      sections: [
        {
          heading: "Choose your channels",
          body: "Send over SMS/MMS, WhatsApp, email, web push, or pop-ups — on their own or combined. SMS reaches customers even without an internet connection.",
        },
        {
          heading: "Target the right people",
          body: "Segment by behaviour, interest, location, or your own custom fields, so your offer reaches the customers most likely to act on it.",
        },
        {
          heading: "Upload your contacts",
          body: "Import a CSV or add contacts manually. Your lists stay encrypted and are never shared outside your account.",
        },
      ],
    },
  },
  {
    slug: "customise-campaign",
    number: "3",
    title: "Customise Your Campaign",
    description: "Craft engaging messages, set preferences, and launch.",
    note: "Choose a package, write your message, set your schedule and budget — then preview exactly what your customer will receive before it goes out.",
    Icon: SlidersHorizontal,
    screen: screenPackages,
    screenAlt: "BalloAds app packages screen showing SMS and WhatsApp bundles",
    detail: {
      intro:
        "This is where a campaign takes shape. Pick the package that fits your volume, craft the message, and set it live — or schedule it for the moment your audience is most likely to respond.",
      sections: [
        {
          heading: "Pick your package",
          body: "Choose a multi-platform or single-platform bundle and set your message volume with a slider. Pricing updates live, so there are no surprises.",
        },
        {
          heading: "Craft your message",
          body: "Write your copy, add your artwork, and preview the message exactly as your customer will see it on each channel.",
        },
        {
          heading: "Schedule and launch",
          body: "Send immediately or pick a date and time, set the duration and area, and BalloAds delivers it automatically.",
        },
      ],
    },
  },
  {
    slug: "monitor-optimise",
    number: "4",
    title: "Monitor & Optimise",
    description: "Use analytics to improve engagement and maximise conversions.",
    note: "BalloDash shows reach, spend, engagement, and clicks in real time — so you can see what's working and put your budget behind it.",
    Icon: BarChart3,
    screen: screenAnalytics,
    screenAlt: "BalloAds app analytics screen showing campaign reach and spend",
    detail: {
      intro:
        "Every campaign reports back. BalloDash turns delivery into numbers you can act on, so the next campaign is sharper than the last.",
      sections: [
        {
          heading: "Track performance live",
          body: "Watch reach, spend, engagement, and link clicks update in real time while your campaign is still running.",
        },
        {
          heading: "Understand your audience",
          body: "See which segments, channels, and messages drove the response — and which ones didn't earn their budget.",
        },
        {
          heading: "Optimise and repeat",
          body: "Use what you learn to refine targeting and timing, so each campaign costs less and converts more.",
        },
      ],
    },
  },
];

export function getStep(slug: string) {
  return howItWorksSteps.find((step) => step.slug === slug);
}
