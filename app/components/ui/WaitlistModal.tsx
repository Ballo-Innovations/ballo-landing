"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

type Status =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

const ANIM_MS = 300;
const TOTAL_STEPS = 6;

const STEP_LABELS = [
  "Join the waitlist",
  "About your business",
  "What you do",
  "Your biggest headaches",
  "Your audience",
  "Your playbook",
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

/** Example "what you actually do" line per industry, shown as the placeholder. */
const ACTIVITY_EXAMPLES: Record<string, string> = {
  "Retail or e-commerce": "sell phone accessories online and deliver across Lusaka",
  "Health or clinic": "run a dental clinic with walk-ins and booked appointments",
  "School or training": "run weekend coding classes for teenagers",
  "Church or NGO": "coordinate weekly services and community outreach",
  "Finance or lending": "offer short-term loans to salaried workers",
  "Events or hospitality": "host weddings and corporate events at our venue",
  "Logistics or delivery": "deliver farm produce to homes every Saturday",
  "Something else": "describe what you do in one line",
};

const PAIN_OTHER = "other";

const PAINS = [
  { v: "customers going quiet after they enquire", label: "Customers go quiet after they enquire" },
  { v: "no-shows and missed appointments", label: "No-shows and missed appointments" },
  { v: "sending every message by hand", label: "Sending every message by hand" },
  { v: "chasing late payments", label: "Chasing late payments" },
  { v: "launching to an audience that never hears about it", label: "Launches nobody hears about" },
  { v: PAIN_OTHER, label: "Something else" },
];

const SIZES = [
  { v: "under 500", label: "Under 500" },
  { v: "500 to 5,000", label: "500 – 5k" },
  { v: "5,000 to 50,000", label: "5k – 50k" },
  { v: "over 50,000", label: "50k+" },
];

/** "a", "a and b", "a, b and c" */
function joinNatural(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function isValidEmail(value: string): boolean {
  return /.+@.+\..+/.test(value.trim());
}

function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, "").length >= 9;
}

export function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [step, setStep] = useState(1);
  const [hint, setHint] = useState("");
  const [invalidField, setInvalidField] = useState<string | null>(null);

  // Stage 1 — contact details, submitted on their own.
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [joined, setJoined] = useState(false);

  // Stage 2 — the playbook questions.
  const [biz, setBiz] = useState("");
  const [loc, setLoc] = useState("");
  const [ind, setInd] = useState(INDUSTRIES[0]);
  const [dow, setDow] = useState("");
  const [pains, setPains] = useState<string[]>([]);
  const [painOther, setPainOther] = useState("");
  const [size, setSize] = useState("");
  const [more, setMore] = useState("");

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
        setInvalidField(null);
        setName(""); setMail(""); setPhone(""); setJoined(false);
        setBiz(""); setLoc(""); setInd(INDUSTRIES[0]); setDow("");
        setPains([]); setPainOther(""); setSize(""); setMore("");
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

  const painSummary = (): string =>
    joinNatural(
      pains.map((p) => (p === PAIN_OTHER ? painOther.trim() : p)).filter(Boolean)
    );

  const togglePain = (v: string) => {
    setPains((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
    clearHint();
  };

  /** Show the hint, and if it is about one field, highlight and focus that field. */
  const fail = (message: string, fieldId?: string): false => {
    setHint(message);
    setInvalidField(fieldId ?? null);
    if (fieldId) document.getElementById(fieldId)?.focus();
    return false;
  };

  const clearHint = () => {
    setHint("");
    setInvalidField(null);
  };

  const validate = (): boolean => {
    if (step === 1) {
      if (!name.trim()) return fail("Tell us your name.", "wl-name");
      if (!isValidEmail(mail)) return fail("Enter an email we can reach you on.", "wl-mail");
      if (!isValidPhone(phone)) return fail("Enter a phone number we can reach you on.", "wl-phone");
      return true;
    }
    if (step === 2) {
      if (!biz.trim()) return fail("Add your business name to continue.", "wl-biz");
      if (!loc.trim()) return fail("Add where you operate to continue.", "wl-loc");
    }
    if (step === 3 && !dow.trim()) {
      return fail("Tell us in a few words what you do.", "wl-dow");
    }
    if (step === 4) {
      if (pains.length === 0) return fail("Pick at least one.");
      if (pains.includes(PAIN_OTHER) && !painOther.trim()) {
        return fail("Tell us what else is costing you.", "wl-pain-other");
      }
    }
    if (step === 5 && !size) {
      return fail("Choose an audience size.");
    }
    return true;
  };

  const postWaitlist = async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Failed to join waitlist");
    }
    return data;
  };

  const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong. Please try again.";

  /** Stage 1: register the contact straight away. */
  const join = async () => {
    if (!validate()) return;
    clearHint();
    if (joined) {
      setStep(2);
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: "idle" });
    try {
      await postWaitlist({ name: name.trim(), email: mail.trim(), phone: phone.trim() });
      setJoined(true);
      setStep(2);
    } catch (error) {
      setStatus({ type: "error", message: errorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Stage 2: send the playbook answers. */
  const sendPlaybook = async () => {
    setIsSubmitting(true);
    setStatus({ type: "idle" });
    try {
      await postWaitlist({
        name: name.trim(),
        email: mail.trim(),
        phone: phone.trim(),
        businessName: biz.trim(),
        location: loc.trim(),
        industry: ind,
        activity: dow.trim(),
        biggestProblem: painSummary(),
        audienceSize: size,
        extraContext: more.trim() || undefined,
      });
      setStatus({
        type: "success",
        message: `Your playbook is on its way to ${mail.trim()}. You're also first in line for launch.`,
      });
    } catch (error) {
      setStatus({ type: "error", message: errorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = async () => {
    if (step === 1) {
      await join();
      return;
    }
    if (!validate()) return;
    clearHint();
    setStatus({ type: "idle" });
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    await sendPlaybook();
  };

  const back = () => {
    // Step 2 cannot go back to the contact step once it has been submitted.
    if (step > 2 || (step === 2 && !joined)) {
      setStep(step - 1);
      clearHint();
      setStatus({ type: "idle" });
    }
  };

  if (!mounted) return null;

  const pct = Math.round((step / TOTAL_STEPS) * 100);
  const canGoBack = step > 2;
  const primaryLabel = isSubmitting
    ? "Sending…"
    : step === 1
      ? "Join the waitlist"
      : step === TOTAL_STEPS
        ? "Send my playbook"
        : "Continue";

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
          data-lenis-prevent
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
                <button type="button" onClick={closeModal} className="wl-submit wl-submit--done">
                  Done
                </button>
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

                <form
                  noValidate
                  onSubmit={(e) => { e.preventDefault(); if (!isSubmitting) next(); }}
                  onChange={() => { if (hint) clearHint(); }}
                >

                {step === 1 && (
                  <div>
                    <h2 id="waitlist-title" className="wl-step__q">Join the BalloAds waitlist</h2>
                    <p className="wl-step__sub">Get first access at launch. Then, if you like, answer five quick questions and we&apos;ll email you a playbook written for your business.</p>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-name" className="wl-field__label">Your name</label>
                        <input id="wl-name" aria-invalid={invalidField === "wl-name"} type="text" className="wl-field__input" placeholder="Mutale Banda"
                          value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus />
                      </div>
                    </div>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-mail" className="wl-field__label">Email</label>
                        <input id="wl-mail" aria-invalid={invalidField === "wl-mail"} type="email" className="wl-field__input" placeholder="name@company.com"
                          value={mail} onChange={(e) => setMail(e.target.value)} autoComplete="email" />
                      </div>
                    </div>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-phone" className="wl-field__label">Phone</label>
                        <input id="wl-phone" aria-invalid={invalidField === "wl-phone"} type="tel" className="wl-field__input" placeholder="+260 97 000 0000"
                          value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    {joined && (
                      <div className="wl-banner" role="status">
                        <span className="wl-banner__check" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                        You&apos;re on the list, {name.trim().split(" ")[0] || "friend"}. Five quick questions and your playbook is on its way.
                      </div>
                    )}
                    <h2 id="waitlist-title" className="wl-step__q">Who are we writing this for?</h2>
                    <p className="wl-step__sub">Your business name and city go on the cover, and shape the examples inside.</p>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-biz" className="wl-field__label">Business name</label>
                        <input id="wl-biz" aria-invalid={invalidField === "wl-biz"} type="text" className="wl-field__input" placeholder="Kabwata Fresh Foods"
                          value={biz} onChange={(e) => setBiz(e.target.value)} autoComplete="organization" autoFocus />
                      </div>
                    </div>
                    <div className="wl-field">
                      <div className="wl-field__body">
                        <label htmlFor="wl-loc" className="wl-field__label">Where you operate</label>
                        <input id="wl-loc" aria-invalid={invalidField === "wl-loc"} type="text" className="wl-field__input" placeholder="Lusaka, Zambia"
                          value={loc} onChange={(e) => setLoc(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
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
                        <textarea id="wl-dow" rows={2} aria-invalid={invalidField === "wl-dow"}
                          className="wl-field__input wl-field__textarea wl-field__textarea--fixed"
                          placeholder={ACTIVITY_EXAMPLES[ind] ?? ACTIVITY_EXAMPLES["Something else"]}
                          value={dow} onChange={(e) => setDow(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              e.currentTarget.form?.requestSubmit();
                            }
                          }} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 id="waitlist-title" className="wl-step__q">What is costing you the most right now?</h2>
                    <p className="wl-step__sub">Pick everything that stings. Your playbook opens with a fix for the first one you choose.</p>
                    <div className="wl-choice-list" role="group" aria-label="Your biggest headaches">
                      {PAINS.map((p) => {
                        const active = pains.includes(p.v);
                        return (
                          <button key={p.v} type="button" role="checkbox" aria-checked={active}
                            className={`wl-choice wl-choice--multi ${active ? "wl-choice--active" : ""}`}
                            onClick={() => togglePain(p.v)}>
                            <span>{p.label}</span>
                            <span className="wl-choice__box" aria-hidden="true">
                              {active && <Check size={13} strokeWidth={3} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {pains.includes(PAIN_OTHER) && (
                      <div className="wl-field">
                        <div className="wl-field__body">
                          <label htmlFor="wl-pain-other" className="wl-field__label">What else is costing you?</label>
                          <input id="wl-pain-other" aria-invalid={invalidField === "wl-pain-other"} type="text" className="wl-field__input"
                            placeholder="stock sitting unsold after promotions"
                            value={painOther} onChange={(e) => setPainOther(e.target.value)} autoFocus />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <h2 id="waitlist-title" className="wl-step__q">How many people are you trying to reach?</h2>
                    <p className="wl-step__sub">Rough is fine. It sets the send volumes and pacing we recommend.</p>
                    <div className="wl-choice-row" role="radiogroup" aria-label="Audience size">
                      {SIZES.map((s) => (
                        <button key={s.v} type="button" role="radio" aria-checked={size === s.v}
                          className={`wl-choice wl-choice--chip ${size === s.v ? "wl-choice--active" : ""}`}
                          onClick={() => { setSize(s.v); clearHint(); }}>
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

                {step === 6 && (
                  <div>
                    <h2 id="waitlist-title" className="wl-step__q">Ready to send your playbook?</h2>
                    <p className="wl-step__sub">Here&apos;s what we&apos;ll write it around. Go back to change anything.</p>
                    <dl className="wl-recap">
                      <div><dt>Business</dt><dd>{biz} in {loc}</dd></div>
                      <div><dt>What you do</dt><dd>{dow}</dd></div>
                      <div><dt>Fixing first</dt><dd>{painSummary()}</dd></div>
                      <div><dt>Reaching</dt><dd>{size} people</dd></div>
                      <div><dt>Sending to</dt><dd>{mail.trim()}</dd></div>
                    </dl>
                  </div>
                )}

                {status.type === "error" && (
                  <p role="alert" className="wl-error">{status.message}</p>
                )}
                {hint && <p role="alert" className="wl-hint">{hint}</p>}

                <div className="wl-steps__nav">
                  {canGoBack ? (
                    <button type="button" onClick={back} className="wl-step-btn">
                      <ArrowLeft size={16} aria-hidden="true" /> Back
                    </button>
                  ) : step === 2 && joined ? (
                    <button type="button" onClick={closeModal} className="wl-step-btn wl-step-btn--quiet">
                      Maybe later
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="submit" disabled={isSubmitting} className="wl-submit wl-submit--step">
                    {primaryLabel}
                    {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
                  </button>
                </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
