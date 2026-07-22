"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import "@/app/styles/components/waitlist.css";

/** Multicolour Google "G". */
const GoogleIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M23.06 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.38z" />
    <path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.78l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.76v2.98A11.5 11.5 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.6 14.71a6.9 6.9 0 0 1 0-4.42V7.31H1.76a11.5 11.5 0 0 0 0 9.38l3.84-2.98z" />
    <path fill="#EA4335" d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.2 15.1 0 12 0 7.42 0 3.46 2.62 1.76 6.62l3.84 2.98C6.5 6.76 9.02 4.75 12 4.75z" />
  </svg>
);

/** X (Twitter) logo. */
const XIcon = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
    <path d="M18.9 1.5h3.5l-7.63 8.72L23.75 22.5h-7.03l-5.5-7.2-6.3 7.2H1.4l8.16-9.33L.75 1.5h7.2l4.98 6.58L18.9 1.5zm-1.23 18.9h1.94L6.4 3.5H4.32l13.35 16.9z" />
  </svg>
);

/**
 * WaitlistModal — the single, reusable "Join the Waitlist" modal.
 *
 * Liquid-glass card (see styles/components/waitlist.css) re-themed to the brand
 * blues/cyan. Email, Name and Phone are all collected because the waitlist
 * backend requires all three, then submitted by the "Join the Waitlist" button. The
 * "Continue with Google/X" buttons are disabled scaffolds (no auth backend yet).
 * Focus management, Esc-to-close, aria-modal semantics and inline status are
 * preserved from the previous implementation.
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
        className={`wl-backdrop transition-opacity duration-300 ease-out ${
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
          className="wl-card pointer-events-auto"
        >
          <div className="wl-card__aurora" aria-hidden="true" />
          <button onClick={onClose} className="wl-close" aria-label="Close waitlist form">
            ×
          </button>

          <div className="wl-card__inner">
            <h2 id="waitlist-title" className="wl-title">
              Join the Waitlist
            </h2>
            <p id="waitlist-desc" className="wl-subtitle">
              Be the first to know when we launch.
            </p>

            {status.type === "success" ? (
              <div role="status" className="wl-success">
                <span className="wl-success__check" aria-hidden="true">
                  <Check size={22} strokeWidth={3} />
                </span>
                {status.message}
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="wl-form">
                  <div className="wl-field">
                    <div className="wl-field__body">
                      <label htmlFor="waitlist-email" className="wl-field__label">
                        Email
                      </label>
                      <input
                        ref={firstFieldRef}
                        type="email"
                        id="waitlist-email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                        className="wl-field__input"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div className="wl-field">
                    <div className="wl-field__body">
                      <label htmlFor="waitlist-name" className="wl-field__label">
                        Name
                      </label>
                      <input
                        type="text"
                        id="waitlist-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        autoComplete="name"
                        className="wl-field__input"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div className="wl-field">
                    <div className="wl-field__body">
                      <label htmlFor="waitlist-phone" className="wl-field__label">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="waitlist-phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        autoComplete="tel"
                        className="wl-field__input"
                        placeholder="+260 …"
                      />
                    </div>
                  </div>

                  {status.type === "error" && (
                    <p role="alert" className="wl-error">
                      {status.message}
                    </p>
                  )}

                  <button type="submit" className="wl-submit" disabled={isSubmitting}>
                    {isSubmitting ? "Joining…" : "Join the Waitlist"}
                    {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
                  </button>
                </form>

                <div className="wl-or">OR</div>

                <div className="wl-socials">
                  <button
                    type="button"
                    className="wl-social"
                    disabled
                    aria-disabled="true"
                    title="Social sign-in is coming soon"
                  >
                    <span className="wl-social__icon">{GoogleIcon}</span>
                    Continue with Google
                    <span className="wl-social__soon">Soon</span>
                  </button>
                  <button
                    type="button"
                    className="wl-social"
                    disabled
                    aria-disabled="true"
                    title="Social sign-in is coming soon"
                  >
                    <span className="wl-social__icon">{XIcon}</span>
                    Continue with X
                    <span className="wl-social__soon">Soon</span>
                  </button>
                </div>

                <p className="wl-footer">
                  Have questions?{" "}
                  <Link href="/live-chat" onClick={onClose}>
                    Talk to us
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
