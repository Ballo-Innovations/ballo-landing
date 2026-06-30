"use client";

import { useEffect, useRef, useState } from "react";

/**
 * WaitlistModal — the single, reusable "Join the Waitlist" form modal.
 *
 * Extracted from the original (orphaned) `coming soon/BalloAdsDemo` component so
 * every waitlist CTA across the site shares one implementation. The visual form
 * markup/styles are kept identical to the original; focus management, Esc-to-close,
 * aria-modal semantics and inline status (replacing the previous `alert()`) were
 * added for accessibility.
 *
 * ── Backend integration boundary ──────────────────────────────────────────────
 *  Endpoint : POST /api/waitlist  (already implemented — proxies to backend /v1/waitlist)
 *  Inputs   : { name: string; email: string; phone: string }
 *  Outputs  : 201 { message, data:{ id, name, email } } | 4xx/5xx { error }
 *  Depends  : backend waitlist service (lands Week 3). UI degrades gracefully on error.
 * ──────────────────────────────────────────────────────────────────────────────
 */

type Status =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

const ANIM_MS = 300;

export default function WaitlistModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // Mount + enter/exit animation, scroll-lock, and focus capture/restore.
  useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      document.body.style.overflow = "hidden";
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimateIn(true);
          firstFieldRef.current?.focus();
        })
      );
      return () => cancelAnimationFrame(raf);
    }
    if (mounted) {
      setAnimateIn(false);
      const t = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = "";
        // Reset transient state for next open.
        setStatus({ type: "idle" });
        setFormData({ name: "", email: "", phone: "" });
        lastActiveRef.current?.focus?.();
      }, ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Esc to close + simple focus trap within the dialog.
  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [mounted, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }
      setFormData({ name: "", email: "", phone: "" });
      setStatus({
        type: "success",
        message: "Thank you for joining the waitlist! We'll be in touch soon.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to join waitlist. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none transition-all duration-[400ms] ${
          animateIn
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-12 scale-95"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-title"
          aria-describedby="waitlist-desc"
          className="bg-white text-black rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto pointer-events-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl font-bold w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10"
            aria-label="Close waitlist form"
          >
            ×
          </button>
          <h2
            id="waitlist-title"
            className="text-2xl sm:text-3xl font-bold text-[var(--brand-color-1)] mb-2 pr-8"
          >
            Join the Waitlist
          </h2>
          <p id="waitlist-desc" className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Be the first to know when we launch!
          </p>

          {status.type === "success" ? (
            <div
              role="status"
              className="rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-6 text-center text-sm sm:text-base"
            >
              {status.message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label
                  htmlFor="waitlist-name"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Name
                </label>
                <input
                  ref={firstFieldRef}
                  type="text"
                  id="waitlist-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color-4)] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label
                  htmlFor="waitlist-email"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="waitlist-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color-4)] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label
                  htmlFor="waitlist-phone"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="waitlist-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color-4)] focus:border-transparent outline-none transition-all text-black placeholder:text-gray-500"
                  placeholder="Enter your phone number"
                />
              </div>

              {status.type === "error" && (
                <p role="alert" className="text-sm text-red-600">
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--brand-color-4)] text-[var(--brand-color-1)] font-semibold text-base sm:text-lg hover:bg-[var(--brand-color-3)] hover:text-white transition-colors duration-200 mt-4 sm:mt-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
