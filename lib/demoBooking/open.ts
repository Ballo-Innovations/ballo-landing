import type { MouseEvent } from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";

export const OPEN_BOOK_DEMO_EVENT = "open-book-demo";

export type OpenBookDemoDetail = { from: string };

/**
 * Click handler for "Book a demo" links: opens the booking form in a modal on the
 * current page instead of navigating. Modified clicks (new tab, middle click) and
 * the /book-demo page itself keep the normal link, so the page stays the fallback.
 */
export function openBookDemo(e: MouseEvent<HTMLAnchorElement>, from: string) {
  if (!isFeatureEnabled("bookDemo")) return;
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (window.location.pathname.startsWith("/book-demo")) return;
  e.preventDefault();
  window.dispatchEvent(new CustomEvent<OpenBookDemoDetail>(OPEN_BOOK_DEMO_EVENT, { detail: { from } }));
}
