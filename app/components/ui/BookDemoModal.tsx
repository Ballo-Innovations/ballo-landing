"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import BookDemoClient from "@/app/book-demo/BookDemoClient";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { OPEN_BOOK_DEMO_EVENT, type OpenBookDemoDetail } from "@/lib/demoBooking/open";

const ANIM_MS = 200;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * "Book a demo" as a two-step form in a modal (time, then details), opened from
 * the header and the Book a free demo buttons. /book-demo stays as the page version.
 */
export function BookDemoModal() {
  const enabled = isFeatureEnabled("bookDemo");
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [from, setFrom] = useState<string | undefined>();
  const [session, setSession] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActive = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!enabled) return;
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<OpenBookDemoDetail>).detail;
      lastActive.current = document.activeElement as HTMLElement | null;
      setFrom(detail?.from ? `/${detail.from.replace(/^\/+/, "")}` : window.location.pathname);
      setSession((n) => n + 1);
      setOpen(true);
    };
    window.addEventListener(OPEN_BOOK_DEMO_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_BOOK_DEMO_EVENT, onOpen);
  }, [enabled]);

  // Mount, then fade in; fade out, then unmount and give focus back.
  useEffect(() => {
    if (open && !visible) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || visible) return;
    const t = setTimeout(() => {
      setOpen(false);
      lastActive.current?.focus?.();
    }, ANIM_MS);
    return () => clearTimeout(t);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = requestAnimationFrame(() =>
      dialogRef.current?.querySelector<HTMLElement>("[data-step-title]")?.focus(),
    );
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(first);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  if (!enabled || !open) return null;

  return (
    <div className={`bd-modal ${visible ? "bd-modal--in" : ""}`}>
      <div className="bd-modal__backdrop" aria-hidden="true" onClick={close} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bd-modal-title"
        className="bd-modal__panel"
        data-lenis-prevent
        data-scroll-root
      >
        <div className="bd-modal__bar">
          <p className="bd-modal__name">Book a demo</p>
          <button type="button" className="bd-modal__close" onClick={close} aria-label="Close the demo booking form">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <BookDemoClient key={session} stepped sourcePage={from} titleId="bd-modal-title" />
      </div>
    </div>
  );
}
