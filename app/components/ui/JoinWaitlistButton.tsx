"use client";

import { ArrowRight } from "lucide-react";

/** Opens the waitlist modal. The only client-side code the home page needs. */
export function JoinWaitlistButton({
  label = "Join the waitlist",
  variant = "light",
}: {
  label?: string;
  variant?: "light" | "outline";
}) {
  const styles =
    variant === "light"
      ? "bg-white text-[#020055] hover:bg-white/90"
      : "border border-white/30 text-white hover:border-white/60 hover:bg-white/5";
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-waitlist"))}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-bold transition-colors cursor-pointer ${styles}`}
    >
      {label}
      <ArrowRight size={18} aria-hidden="true" />
    </button>
  );
}
