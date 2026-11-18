import type { StaticImageData } from "next/image";

import pushNotifications from "@/public/Assets/10.png";
import heroPhoto from "@/public/Assets/12.png";
import uploadContacts from "@/public/Assets/14.png";
import circuit from "@/public/Assets/hiw-circuit.png";
import analyticsTile from "@/public/BalloAds Assets 2/1.png";
import whatsappTile from "@/public/BalloAds Assets 2/22.png";
import smsTile from "@/public/BalloAds Assets 2/24.png";

export type Guide = {
  id: string;
  /** Short label on the tile. */
  label: string;
  /** Longer line used when the guide is in the big card. */
  headline: string;
  image: StaticImageData;
  /**
   * How dark the artwork is where the label and button sit. Dark artwork takes
   * white text and a white button; light artwork takes navy text and a navy
   * button. See the tile styles in styles/pages/guides.css.
   *
   * This follows the picture each tile actually uses, not the design's: the
   * design's SMS and WhatsApp artwork is light, but the files on the site are
   * dark in the corner the label sits in, and navy on navy cannot be read.
   * Set these back to "light" if those two pictures are ever replaced.
   */
  tone: "dark" | "light";
  /** The guide this links through to. */
  href: string;
  /** Shows a play badge, for the one tile that is a film rather than a guide. */
  isFilm?: boolean;
};

/**
 * The seven guides the carousel rotates through: one in the big card on the
 * left, six in the tiles on the right.
 *
 * ── Content boundary ────────────────────────────────────────────────────────
 *  TODO: `headline` carries working copy for every guide except the email one,
 *  which comes from the design. Replace once the final lines are written.
 *  TODO: `href` points every card at /how-it-works until the demo films exist.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const guides: Guide[] = [
  {
    id: "email",
    label: "Email Marketing",
    headline: "Seamless email Marketing and at your fingertips",
    image: heroPhoto,
    // A cut-out with a see-through background, so in a tile it sits on the
    // tile's dark navy, not on the big card's light grey.
    tone: "dark",
    href: "/email-marketing",
  },
  {
    id: "push",
    label: "Push Notifications",
    headline: "Push notifications that bring customers back",
    image: pushNotifications,
    tone: "dark",
    href: "/how-it-works",
  },
  {
    id: "analytics",
    label: "Check your Analytics",
    headline: "Check your analytics as the campaign runs",
    image: analyticsTile,
    tone: "dark",
    href: "/how-it-works",
  },
  {
    id: "sms",
    label: "SMS Marketing just for you",
    headline: "SMS Marketing just for you",
    image: smsTile,
    tone: "dark",
    href: "/sms-marketing",
  },
  {
    id: "contacts",
    label: "Upload Contacts",
    headline: "Upload your contacts and start in minutes",
    image: uploadContacts,
    tone: "dark",
    href: "/how-it-works",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Marketing",
    headline: "WhatsApp Marketing your customers answer",
    image: whatsappTile,
    tone: "dark",
    href: "/whatsapp-marketing",
  },
  {
    id: "film",
    label: "See BalloAds at work",
    headline: "See BalloAds at work, start to finish",
    image: circuit,
    tone: "dark",
    href: "/how-it-works",
    isFilm: true,
  },
];

/** The ordered steps shown under the hero. */
export const guideSteps = [
  "Open BalloAds",
  "Menu",
  "Create Ad",
  "Type message",
  "Select platform",
  "Add contacts",
  "Select duration",
  "Select area",
  "Preview",
  "Done",
];
