import type { StaticImageData } from "next/image";

import pushWoman from "@/public/Assets/10.png";
import laptopWoman from "@/public/Assets/11.png";
import heroPhoto from "@/public/Assets/12.png";
import phoneMan from "@/public/Assets/15.png";
import envelope from "@/public/Assets/glass-icon-email.png";
import circuit from "@/public/Assets/hiw-circuit.png";
import analyticsPhoto from "@/public/BalloAds Assets 2/1.png";

export type Guide = {
  id: string;
  /** Short label on the tile. */
  label: string;
  /** Longer line used when the guide is in the big card. */
  headline: string;
  image: StaticImageData;
  /**
   * How the picture sits in a card. A "portrait" or "object" is a cut-out
   * (see-through background) standing on the card's own colour, the way the
   * design's studio pictures do. A "photo" fills the tile, and in the big card
   * fills the left half and fades out under the headline.
   */
  kind: "portrait" | "object" | "photo";
  /** The tile's colour behind a cut-out. Solid, so it can animate in flight. */
  bg: string;
  /** Label colour on the tile: white on dark artwork, navy on light. */
  labelTone: "white" | "navy";
  /** Watch Demo button on the tile. The design pairs these by hand per tile. */
  buttonTone: "white" | "navy";
  /** Where the tile crops the picture (CSS object-position). */
  focus?: string;
  /** The guide this links through to. */
  href: string;
  /** Shows a play mark, for the one tile that is a film rather than a guide. */
  isFilm?: boolean;
};

/**
 * The seven guides the carousel rotates through: one in the big card on the
 * left, six in the tiles on the right.
 *
 * ── Content boundary ────────────────────────────────────────────────────────
 *  TODO: four of the design's pictures are not in the repo yet (the email
 *  portrait in the white top, the hand drawing the analytics chart, the two
 *  women for SMS, the 3D envelope for contacts). Each of those guides uses the
 *  closest picture we do have, on the design's background colour. Swap the
 *  imports above when the real files arrive; nothing else needs to change.
 *  TODO: `headline` carries working copy for every guide except the email one,
 *  which comes from the design. Replace once the final lines are written.
 *  TODO: `href` points at a subject page until the demo films exist.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const guides: Guide[] = [
  {
    id: "email",
    label: "Email Marketing",
    headline: "Seamless email Marketing and at your fingertips",
    image: heroPhoto,
    kind: "portrait",
    bg: "#b9bcc2",
    labelTone: "navy",
    buttonTone: "white",
    focus: "50% 12%",
    href: "/email-marketing",
  },
  {
    id: "push",
    label: "Push Notifications",
    headline: "Push notifications that bring customers back",
    image: pushWoman,
    kind: "portrait",
    bg: "#14568f",
    labelTone: "white",
    buttonTone: "white",
    focus: "50% 8%",
    href: "/how-it-works",
  },
  {
    id: "analytics",
    label: "Check your Analytics",
    headline: "Check your analytics as the campaign runs",
    image: analyticsPhoto,
    kind: "photo",
    bg: "#0b2a5c",
    labelTone: "white",
    buttonTone: "white",
    focus: "50% 50%",
    href: "/how-it-works",
  },
  {
    id: "sms",
    label: "SMS Marketing just for you",
    headline: "SMS Marketing just for you",
    image: phoneMan,
    kind: "portrait",
    bg: "#e2d6d1",
    labelTone: "navy",
    buttonTone: "navy",
    focus: "50% 20%",
    href: "/sms-marketing",
  },
  {
    id: "contacts",
    label: "Upload Contacts",
    headline: "Upload your contacts and start in minutes",
    image: envelope,
    kind: "object",
    bg: "#55bdea",
    labelTone: "white",
    buttonTone: "navy",
    focus: "50% 50%",
    href: "/how-it-works",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Marketing",
    headline: "WhatsApp Marketing your customers answer",
    image: laptopWoman,
    kind: "portrait",
    bg: "#bcbcbc",
    labelTone: "navy",
    buttonTone: "white",
    focus: "50% 10%",
    href: "/whatsapp-marketing",
  },
  {
    id: "film",
    label: "See BalloAds at work",
    headline: "See BalloAds at work, start to finish",
    image: circuit,
    kind: "photo",
    bg: "#120a2a",
    labelTone: "white",
    buttonTone: "white",
    focus: "50% 50%",
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
