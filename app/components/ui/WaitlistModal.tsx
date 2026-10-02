"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

type Status =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

const ANIM_MS = 300;
const TOTAL_STEPS = 5;

const STEP_LABELS = [
  "About your business",
  "What you do",
  "Your biggest headache",
  "Your audience",
  "Get your playbook",
];

const INDUSTRIES = [
  "Retail or e-commerce",
  "Health or clinic",
  "School or training",
  "Church or NGO",
  "Finance or lending",
  "Events or hospitality",
  "Logistics or delivery",
  "Something else",
];

const PAINS = [
  { v: "customers going quiet after they enquire", label: "Customers go quiet after they enquire" },
  { v: "no-shows and missed appointments", label: "No-shows and missed appointments" },
  { v: "sending every message by hand", label: "Sending every message by hand" },
  { v: "chasing late payments", label: "Chasing late payments" },
  { v: "launching to an audience that never hears about it", label: "Launches nobody hears about" },
];

const SIZES = [
  { v: "under 500", label: "Under 500" },
  { v: "500 to 5,000", label: "500 – 5k" },
  { v: "5,000 to 50,000", label: "5k – 50k" },
  { v: "over 50,000", label: "50k+" },
];

export function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [step, setStep] = useState(1);
  const [hint, setHint] = useState("");

  const [biz, setBiz] = useState("");
  const [loc, setLoc] = useState("");
  const [ind, setInd] = useState(INDUSTRIES[0]);
  const [dow, setDow] = useState("");
  const [pain, setPain] = useState("");
  const [size, setSize] = useState("");
  const [more, setMore] = useState("");
  const [mail, setMail] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    window.addEventListener("open-waitlist", openModal);
    return () => window.removeEventListener("open-waitlist", openModal);
  }, [openModal]);

  useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      document.body.style.overflow = "hidden";
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimateIn(true))
      );
      return () => cancelAnimationFrame(raf);
    }
    if (mounted) {
      setAnimateIn(false);
      const t = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = "";
        setStatus({ type: "idle" });
        setStep(1);
        setHint("");
        setBiz(""); setLoc(""); setInd(INDUSTRIES[0]); setDow("");
        setPain(""); setSize(""); setMore(""); setMail("");
        lastActiveRef.current?.focus?.();
      }, ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeModal();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [mounted, closeModal]);

  const validate = (): boolean => {
    if (step === 1 && (!biz.trim() || !loc.trim())) {
      setHint("Add your business name and location to continue.");
      return false;
    }
    if (step === 2 && !dow.trim()) {
      setHint("Tell us in a few words what you do.");
      return false;
    }
    if (step === 3 && !pain) {
      setHint("Pick the one that costs you most.");
      return false;
    }
    if (step === 4 && !size) {
      setHint("Choose an audience size.");
      return false;
    }
    if (step === 5 && !/.+@.+\..+/.test(mail.trim())) {
      setHint("Enter an email we can send it to.");
      return false;
    }
    return true;
  };

  const next = async () => {
    if (!validate()) return;
    setHint("");
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: "idle" });
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: biz.trim(),
          email: mail.trim(),
          location: loc.trim(),
          industry: ind,
          activity: dow.trim(),
          biggestProblem: pain,
          audienceSize: size,
          extraContext: more.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }
      setStatus({
        type: "success",
        message: `Your playbook is on its way to ${mail.trim()}. You're also first in line for launch.`,
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

  const back = () => {
    if (step > 1) {
      setStep(step - 1);
      setHint("");
    }
  };

  if (!mounted) return null;

  const pct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        onClick={closeModal}
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
          className="wl-card pointer-events-auto"
        >
          <div className="wl-card__aurora" aria-hidden="true" />
          <button onClick={closeModal} className="wl-close" aria-label="Close waitlist form">
            ×
          </button>

          <div className="wl-card__inner">
            {status.type === "success" ? (
              <>
                <h2 id="waitlist-title" className="wl-title">You&apos;re in</h2>
                <div role="status" className="wl-success">
                  <span className="wl-success__check" aria-hidden="true">
                    <Check size={22} strokeWidth={3} />
                  </span>
                  {status.message}
                </div>
              </>
            ) : (
              <>
                <div className="wl-steps__meta">
                  <span>Step {step} of {TOTAL_STEPS}</span>
                  <span>{STEP_LABELS[step - 1]}</span>
                </div>
                <div className="wl-steps__track" aria-hidden="true">
                  <div className="wl-steps__bar" style={{ width: `${pct}%` }} />
                </div>

                {step === 1 && (
                  <div>
                    <h2 id="waitlist-title" className="wl-step__q">First, who are we writing this for?</h2>
                    <p className="wl-step__sub">Your name and city go on the cover, and shape the examples inside.</p>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-biz" className="wl-field__label">Business name</label>
                        <input id="wl-biz" type="text" className="wl-field__input" placeholder="Kabwata Fresh Foods"
                          value={biz} onChange={(e) => setBiz(e.target.value)} autoFocus />
                      </div>
                    </div>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-loc" className="wl-field__label">Where you operate</label>
                        <input id="wl-loc" type="text" className="wl-field__input" placeholder="Lusaka, Zambia"
                          value={loc} onChange={(e) => setLoc(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 id="waitlist-title" className="wl-step__q">What line of work are you in?</h2>
                    <p className="wl-step__sub">Be specific — this is what makes the playbook yours and not a template.</p>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-ind" className="wl-field__label">Industry</label>
                        <select id="wl-ind" className="wl-field__input wl-field__select" value={ind}
                          onChange={(e) => setInd(e.target.value)}>
                          {INDUSTRIES.map((x) => <option key={x} value={x}>{x}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-dow" className="wl-field__label">What you actually do</label>
                        <input id="wl-dow" type="text" className="wl-field__input"
                          placeholder="deliver farm produce to homes every Saturday"
                          value={dow} onChange={(e) => setDow(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 id="waitlist-title" className="wl-step__q">What is costing you the most right now?</h2>
                    <p className="wl-step__sub">Pick the one that stings. Your playbook opens with a fix for it.</p>
                    <div className="wl-choice-list">
                      {PAINS.map((p) => (
                        <button key={p.v} type="button"
                          className={`wl-choice ${pain === p.v ? "wl-choice--active" : ""}`}
                          onClick={() => { setPain(p.v); setHint(""); }}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 id="waitlist-title" className="wl-step__q">How many people are you trying to reach?</h2>
                    <p className="wl-step__sub">Rough is fine. It sets the send volumes and pacing we recommend.</p>
                    <div className="wl-choice-row">
                      {SIZES.map((s) => (
                        <button key={s.v} type="button"
                          className={`wl-choice wl-choice--chip ${size === s.v ? "wl-choice--active" : ""}`}
                          onClick={() => { setSize(s.v); setHint(""); }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-more" className="wl-field__label">Anything else we should know? (optional)</label>
                        <textarea id="wl-more" rows={3} className="wl-field__input wl-field__textarea"
                          placeholder="Three years old, mostly word of mouth, everything sent from one phone."
                          value={more} onChange={(e) => setMore(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h2 id="waitlist-title" className="wl-step__q">Where should we send it?</h2>
                    <p className="wl-step__sub">Early adopters get the playbook free, plus first access at launch.</p>
                    <div className="wl-recap">
                      {biz || "Your business"} in {loc || "your city"} — {dow || "what you do"}.
                      Fixing: {pain || "your biggest headache"}. Reaching {size || "your"} people.
                    </div>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-mail" className="wl-field__label">Email</label>
                        <input id="wl-mail" type="email" className="wl-field__input" placeholder="name@company.com"
                          value={mail} onChange={(e) => setMail(e.target.value)} autoComplete="email" />
                      </div>
                    </div>
                  </div>
                )}

                {status.type === "error" && (
                  <p role="alert" className="wl-error">{status.message}</p>
                )}

                <div className="wl-steps__nav">
                  <button type="button" onClick={back} className="wl-step-btn"
                    style={{ visibility: step === 1 ? "hidden" : "visible" }}>
                    <ArrowLeft size={16} aria-hidden="true" /> Back
                  </button>
                  <button type="button" onClick={next} disabled={isSubmitting} className="wl-submit wl-submit--step">
                    {isSubmitting ? "Sending…" : step === TOTAL_STEPS ? "Send my playbook" : "Continue"}
                    {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
                  </button>
                </div>
                {hint && <p className="wl-hint">{hint}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
