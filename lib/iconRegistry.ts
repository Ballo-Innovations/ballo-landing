import {
  BarChart3,
  HelpCircle,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
  SlidersHorizontal,
  Smartphone,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * CMS content (`iconName` on PricingPlan / ProcessStep) stores an icon as a
 * free-form string rather than a component reference. This maps the handful
 * of icon names actually used by the current designs onto the lucide-react
 * components they already render — normalized so "UserPlus", "user-plus",
 * and "userplus" all resolve the same way, whatever casing the CMS ends up
 * using in practice.
 *
 * Deliberately NOT backed by lucide-react's full dynamic `icons` registry:
 * that map's keys don't reliably match named-export identifiers for icons
 * with numeric suffixes (e.g. "BarChart3" isn't a key in it), and pulling
 * in all ~1700 icons for a dynamic lookup is unnecessary bundle weight for
 * a fixed, small set of steps/plans.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  userplus: UserPlus,
  send: Send,
  slidershorizontal: SlidersHorizontal,
  sliders: SlidersHorizontal,
  barchart3: BarChart3,
  barchart: BarChart3,
  analytics: BarChart3,
  messagesquare: MessageSquare,
  sms: MessageSquare,
  mail: Mail,
  email: Mail,
  messagecircle: MessageCircle,
  whatsapp: MessageCircle,
  smartphone: Smartphone,
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Resolve a CMS-provided `iconName` to a lucide-react component, falling back gracefully. */
export function resolveIcon(iconName: string | null | undefined, fallback: LucideIcon = HelpCircle): LucideIcon {
  if (!iconName) return fallback;
  return ICON_MAP[normalize(iconName)] ?? fallback;
}
