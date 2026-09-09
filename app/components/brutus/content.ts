/**
 * Brutus, the AI assistant: the copy shared by the /brutus page and the
 * home page's Brutus section. One list, so the two never drift apart.
 */
export type BrutusCapability = {
  id: string;
  title: string;
  description: string;
  /** Short label for the compact chip/card treatments on the home page. */
  short: string;
};

export const BRUTUS_CAPABILITIES: BrutusCapability[] = [
  {
    id: "always-on",
    title: "24/7 Availability",
    short: "Always on",
    description:
      "Brutus never clocks off. Day or night, your customers get instant, on-brand answers without waiting for a human agent.",
  },
  {
    id: "natural",
    title: "Natural Conversations",
    short: "Sounds human",
    description:
      "Powered by advanced language understanding, Brutus replies in a warm, human tone that keeps every conversation flowing.",
  },
  {
    id: "fast",
    title: "Quick Response Time",
    short: "Replies in milliseconds",
    description:
      "Replies land in milliseconds, so no lead goes cold and no question sits unanswered while momentum slips away.",
  },
  {
    id: "integrations",
    title: "System Integration",
    short: "Every channel",
    description:
      "Brutus plugs straight into your WhatsApp, SMS, email, and web channels — one assistant across every touchpoint.",
  },
  {
    id: "automation",
    title: "Smart Automation",
    short: "Automates the busywork",
    description:
      "From qualifying leads to booking follow-ups, Brutus automates the repetitive work so your team focuses on closing.",
  },
  {
    id: "support",
    title: "Implementation & Support",
    short: "Set up for you",
    description:
      "We handle the full setup and stay with you afterwards, so Brutus is live, trained, and delivering value from day one.",
  },
];

/** The scripted exchange shown on the phone mock. */
export const BRUTUS_CHAT = [
  { from: "brutus", text: "Hi! I'm Brutus. How can I help your business today?" },
  { from: "you", text: "Send my new offer to all my WhatsApp contacts." },
  { from: "brutus", text: "On it — reaching 1,240 contacts now. ✅" },
] as const;
