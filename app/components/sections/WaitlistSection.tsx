"use client";

import { useState } from "react";
import { FadeUpReveal } from "../ui/FadeUpReveal";
import ConcentricRings from "../ui/ConcentricRings";

type FormState = "idle" | "loading" | "success" | "error";

export function WaitlistSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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

  function handleRetry() {
    setFormState("idle");
    setErrorMsg("");
  }

  return (
    <section
      id="waitlist"
      className="relative overflow-hidden px-4 py-20 md:py-28 md:px-8"
    >
      {/* Background rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15">
        <div className="w-full max-w-3xl">
          <ConcentricRings />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-xl">
        {formState === "success" ? (
          <SuccessState name={name} />
        ) : (
          <>
            <FadeUpReveal yOffset={30} duration={0.6}>
              <div className="mb-10 text-center">
                <span className="inline-block rounded-full border border-[var(--cyan)]/40 bg-[var(--cyan)]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--cyan)] mb-4">
                  Early Access
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  Be first in line
                </h2>
                <p className="mt-3 text-white/60 text-sm md:text-base leading-relaxed">
                  Join the BalloAds waitlist and get early access to the
                  platform that&apos;s redefining digital marketing in Africa.
                </p>
              </div>
            </FadeUpReveal>

            <FadeUpReveal yOffset={30} duration={0.6} delay={0.1}>
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8 space-y-4"
              >
                <div className="space-y-4">
                  <FormField
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="Jane Mwale"
                    disabled={formState === "loading"}
                    required
                  />
                  <FormField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="jane@company.com"
                    disabled={formState === "loading"}
                    required
                  />
                  <FormField
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+260 97 123 4567"
                    disabled={formState === "loading"}
                    required
                  />
                </div>

                {formState === "error" && (
                  <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full rounded-full bg-[var(--brand-color-1)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-color-2)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formState === "loading" ? (
                    <>
                      <Spinner />
                      Joining…
                    </>
                  ) : formState === "error" ? (
                    <span onClick={handleRetry} className="cursor-pointer">Try Again</span>
                  ) : (
                    "Join the Waitlist"
                  )}
                </button>

                <p className="text-center text-xs text-white/40">
                  No spam. We&apos;ll only contact you about your access.
                </p>
              </form>
            </FadeUpReveal>
          </>
        )}
      </div>
    </section>
  );
}

function FormField({
  label,
  type,
  value,
  onChange,
  placeholder,
  disabled,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[var(--cyan)]/50 focus:ring-1 focus:ring-[var(--cyan)]/30 disabled:opacity-50 transition"
      />
    </div>
  );
}

function SuccessState({ name }: { name: string }) {
  return (
    <FadeUpReveal yOffset={20} duration={0.5}>
      <div className="text-center py-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--cyan)]/30 bg-[var(--cyan)]/10">
          <svg
            className="h-8 w-8 text-[var(--cyan)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
          You&apos;re on the list{name ? `, ${name.split(" ")[0]}` : ""}!
        </h3>
        <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
          We&apos;ll reach out as soon as your early access is ready. Keep an eye
          on your inbox.
        </p>
      </div>
    </FadeUpReveal>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
