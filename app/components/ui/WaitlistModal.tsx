"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

type FormState = "idle" | "loading" | "success" | "error";

export function WaitlistModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => {
    setOpen(false);
    // reset after close animation
    setTimeout(() => {
      setFormState("idle");
      setErrorMsg("");
      setName("");
      setEmail("");
      setPhone("");
    }, 300);
  }, []);

  useEffect(() => {
    window.addEventListener("open-waitlist", openModal);
    return () => window.removeEventListener("open-waitlist", openModal);
  }, [openModal]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, closeModal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Something went wrong. Please try again.");
        setFormState("error");
        return;
      }
      setFormState("success");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/75"
            onClick={closeModal}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
          >
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#070858] shadow-2xl p-6 md:p-8">
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition"
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <AnimatePresence mode="wait">
                {formState === "success" ? (
                  <SuccessState key="success" name={name} onClose={closeModal} />
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="mb-6">
                      <span className="inline-block rounded-full border border-[var(--cyan)]/40 bg-[var(--cyan)]/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-[var(--cyan)] mb-3">
                        Early Access
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                        Be first in line
                      </h2>
                      <p className="mt-2 text-white/55 text-sm leading-relaxed">
                        Join the waitlist and get early access to the platform
                        redefining digital marketing in Africa.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <FormField label="Full Name" type="text" value={name} onChange={setName}
                        placeholder="Jane Mwale" disabled={formState === "loading"} required />
                      <FormField label="Email Address" type="email" value={email} onChange={setEmail}
                        placeholder="jane@company.com" disabled={formState === "loading"} required />
                      <FormField label="Phone Number" type="tel" value={phone} onChange={setPhone}
                        placeholder="+260 97 123 4567" disabled={formState === "loading"} required />

                      {formState === "error" && (
                        <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                          {errorMsg}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={formState === "loading"}
                        className="w-full rounded-full bg-[var(--brand-color-1)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-color-2)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                      >
                        {formState === "loading" ? (
                          <><Spinner />Joining…</>
                        ) : (
                          "Join the Waitlist"
                        )}
                      </button>

                      <p className="text-center text-xs text-white/35">
                        No spam. We&apos;ll only contact you about your access.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FormField({ label, type, value, onChange, placeholder, disabled, required }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  disabled: boolean; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/55 uppercase tracking-wider">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled} required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[var(--cyan)]/50 focus:ring-1 focus:ring-[var(--cyan)]/30 disabled:opacity-50 transition"
      />
    </div>
  );
}

function SuccessState({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="py-6 text-center"
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--cyan)]/30 bg-[var(--cyan)]/10">
        <svg className="h-7 w-7 text-[var(--cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">
        You&apos;re on the list{name ? `, ${name.split(" ")[0]}` : ""}!
      </h3>
      <p className="text-white/55 text-sm leading-relaxed max-w-xs mx-auto mb-6">
        We&apos;ll reach out as soon as your early access is ready. Keep an eye on your inbox.
      </p>
      <button
        onClick={onClose}
        className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm text-white hover:bg-white/10 transition"
      >
        Close
      </button>
    </motion.div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
