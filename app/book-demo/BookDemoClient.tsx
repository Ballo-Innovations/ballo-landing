"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, Check, PhoneCall } from "lucide-react";
import { SlotPicker } from "./components/SlotPicker";
import { Confirmation } from "./components/Confirmation";
import { Turnstile, TURNSTILE_SITE_KEY } from "./components/Turnstile";
import { demoApi, detectSourcePage, detectUtm } from "@/lib/demoBooking/client";
import {
  COMPANY_SIZES,
  INTERESTS,
  isValidEmail,
  LIMITS,
  normalizePhone,
  type BookResponse,
  type Slot,
  type SlotsResponse,
} from "@/lib/demoBooking/shared";
import { browserTimeZone, formatDayParts, formatTime, dayKey, zoneLabel } from "@/lib/demoBooking/time";
import { ZAMBIA_TZ } from "@/lib/demoBooking/shared";

type SlotsState =
  | { kind: "loading" }
  | { kind: "ready"; slots: Slot[]; captchaRequired: boolean }
  | { kind: "full"; captchaRequired: boolean };

type Step = "time" | "details" | "done";

type Done = { response: BookResponse; phone: string | null; email: string; firstName: string; timeZone: string };

const FULL_CALENDAR = "Our calendar is full right now. Leave your details and we'll call you to set a time.";

export default function BookDemoClient() {
  const [slotsState, setSlotsState] = useState<SlotsState>({ kind: "loading" });
  const [step, setStep] = useState<Step>("time");
  const [visitorTz, setVisitorTz] = useState(ZAMBIA_TZ);
  const [displayTz, setDisplayTz] = useState(ZAMBIA_TZ);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [notice, setNotice] = useState("");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);

  const [invalidField, setInvalidField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  // Focus follows step changes the visitor made, not the automatic switch to the
  // callback form when the calendar loads empty.
  const skipFocus = useRef(true);

  useEffect(() => {
    const tz = browserTimeZone();
    setVisitorTz(tz);
    setDisplayTz(tz);
  }, []);

  const loadSlots = useCallback(async () => {
    setSlotsState({ kind: "loading" });
    const res = await demoApi<SlotsResponse>("slots?days=14");
    if (!res.ok || !res.data) {
      skipFocus.current = true;
      setSlotsState({ kind: "full", captchaRequired: false });
      setStep("details");
      return;
    }
    const future = res.data.slots.filter((s) => Date.parse(s.start) > Date.now());
    if (future.length === 0) {
      skipFocus.current = true;
      setSlotsState({ kind: "full", captchaRequired: res.data.captchaRequired });
      setStep("details");
      return;
    }
    setSlotsState({ kind: "ready", slots: future, captchaRequired: res.data.captchaRequired });
  }, []);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  // Move focus to the new step's heading so keyboard and screen reader users follow along.
  useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    const el = cardRef.current?.querySelector<HTMLElement>("[data-autofocus]");
    el?.focus();
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const captchaRequired = slotsState.kind !== "loading" && slotsState.captchaRequired;
  const showTurnstile = captchaRequired && !!TURNSTILE_SITE_KEY;
  const fullCalendar = slotsState.kind === "full";

  const fail = (msg: string, field?: string) => {
    setError(msg);
    setInvalidField(field ?? null);
    if (field) document.getElementById(field)?.focus();
  };

  const clearError = () => {
    if (error) setError("");
    if (invalidField) setInvalidField(null);
  };

  const toggleInterest = (value: string) =>
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim()) return fail("Please tell us your name.", "bd-name");
    if (!company.trim()) return fail("Please tell us your company name.", "bd-company");
    if (!isValidEmail(email)) return fail("Please enter an email address we can reach you on.", "bd-email");
    let normalizedPhone: string | null = null;
    if (phone.trim()) {
      normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        return fail("Please check the phone number. Zambian numbers like 0971 234 567 work, or add the country code (+44...).", "bd-phone");
      }
    }
    if (fullCalendar && !normalizedPhone) {
      return fail("Please add a phone number so we can call you to set a time.", "bd-phone");
    }
    if (showTurnstile && !turnstileToken) return fail("Please complete the quick check above the button.");

    setSubmitting(true);
    setError("");
    const res = await demoApi<BookResponse>("book", {
      method: "POST",
      body: {
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        phone: normalizedPhone ?? undefined,
        companySize: companySize || undefined,
        interests,
        message: message.trim() || undefined,
        start: !fullCalendar && selected ? selected.start : undefined,
        timeZone: visitorTz,
        sourcePage: detectSourcePage(),
        utm: detectUtm(),
        turnstileToken: turnstileToken || undefined,
        website,
      },
    });
    setSubmitting(false);

    if (res.ok) {
      setDone({
        response: res.data,
        phone: normalizedPhone ? phone.trim() : null,
        email: email.trim(),
        firstName: name.trim().split(/\s+/)[0],
        timeZone: displayTz,
      });
      setStep("done");
      return;
    }

    if (showTurnstile) setTurnstileReset((n) => n + 1);

    if (res.status === 409 && selected) {
      const taken = selected.start;
      setSlotsState((prev) =>
        prev.kind === "ready" ? { ...prev, slots: prev.slots.filter((s) => s.start !== taken) } : prev,
      );
      setSelected(null);
      setNotice(`${res.error} Your details are saved, so you only need to choose a new time.`);
      setStep("time");
      return;
    }
    fail(res.error);
  };

  // A 409 can empty the last free slot: fall back to the callback form.
  useEffect(() => {
    if (slotsState.kind === "ready" && slotsState.slots.length === 0) {
      setSlotsState({ kind: "full", captchaRequired: slotsState.captchaRequired });
      setNotice("");
      setStep("details");
    }
  }, [slotsState]);

  return (
    <div ref={cardRef} className="bd-card" data-lenis-prevent>
      <div className="wl-card__aurora" aria-hidden="true" />
      <div className="bd-card__inner">
        {step !== "done" && slotsState.kind !== "full" && (
          <ol className="bd-steps" aria-label="Booking steps">
            <li className={step === "time" ? "bd-steps__item bd-steps__item--current" : "bd-steps__item bd-steps__item--done"} aria-current={step === "time" ? "step" : undefined}>
              <span className="bd-steps__dot" aria-hidden="true">{step === "time" ? "1" : <Check size={12} strokeWidth={3} />}</span>
              Choose a time
            </li>
            <li className={step === "details" ? "bd-steps__item bd-steps__item--current" : "bd-steps__item"} aria-current={step === "details" ? "step" : undefined}>
              <span className="bd-steps__dot" aria-hidden="true">2</span>
              Your details
            </li>
          </ol>
        )}

        {step === "time" && (
          <section aria-labelledby="bd-time-title">
            <h2 id="bd-time-title" className="bd-card__title" tabIndex={-1} data-autofocus>
              When suits you?
            </h2>
            <p className="bd-card__sub">Pick a 30-minute slot. We&apos;ll send a calendar invite straight away.</p>

            <div aria-live="polite" aria-atomic="true">
              {notice && (
                <p className="bd-notice bd-notice--warn" role="alert">
                  <CalendarClock size={16} aria-hidden="true" /> {notice}
                </p>
              )}
            </div>

            {slotsState.kind === "loading" ? (
              <div className="bd-skeleton" aria-busy="true" aria-label="Loading free times">
                <div className="bd-skeleton__row">
                  {Array.from({ length: 5 }, (_, i) => <span key={i} className="bd-skeleton__day" />)}
                </div>
                <div className="bd-skeleton__grid">
                  {Array.from({ length: 8 }, (_, i) => <span key={i} className="bd-skeleton__time" />)}
                </div>
              </div>
            ) : slotsState.kind === "ready" ? (
              <>
                <SlotPicker
                  idPrefix="bd-book"
                  slots={slotsState.slots}
                  visitorTimeZone={visitorTz}
                  displayTimeZone={displayTz}
                  onDisplayTimeZoneChange={setDisplayTz}
                  selectedStart={selected?.start ?? null}
                  onSelect={(slot) => { setSelected(slot); setNotice(""); }}
                />
                <button
                  type="button"
                  className="wl-submit bd-primary"
                  disabled={!selected}
                  onClick={() => { setError(""); setStep("details"); }}
                >
                  {selected
                    ? <>Continue with {formatDayParts(dayKey(selected.start, displayTz)).weekday} {formatTime(selected.start, displayTz)} <ArrowRight size={18} aria-hidden="true" /></>
                    : "Pick a time to continue"}
                </button>
              </>
            ) : null}
          </section>
        )}

        {step === "details" && (
          <section aria-labelledby="bd-details-title">
            {fullCalendar ? (
              <>
                <h2 id="bd-details-title" className="bd-card__title" tabIndex={-1} data-autofocus>
                  Ask for a call back
                </h2>
                <p className="bd-notice bd-notice--info">
                  <PhoneCall size={16} aria-hidden="true" /> {FULL_CALENDAR}
                </p>
              </>
            ) : (
              <>
                <h2 id="bd-details-title" className="bd-card__title" tabIndex={-1} data-autofocus>
                  A few details
                </h2>
                {selected && (
                  <div className="bd-chosen">
                    <CalendarClock size={18} aria-hidden="true" />
                    <span>
                      <strong>{formatDayParts(dayKey(selected.start, displayTz)).long}</strong>, {formatTime(selected.start, displayTz)} to {formatTime(selected.end, displayTz)}
                      <span className="bd-chosen__tz"> {zoneLabel(displayTz)}</span>
                    </span>
                    <button type="button" className="bd-link-btn" onClick={() => setStep("time")}>
                      Change
                    </button>
                  </div>
                )}
              </>
            )}

            <form noValidate onSubmit={submit} onChange={clearError} className="bd-form">
              <div className="bd-form__grid">
                <Field id="bd-name" label="Your name" invalid={invalidField === "bd-name"}>
                  <input id="bd-name" className="wl-field__input" type="text" autoComplete="name" required
                    maxLength={LIMITS.name} placeholder="Mutale Banda" value={name}
                    aria-invalid={invalidField === "bd-name"} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field id="bd-company" label="Company" invalid={invalidField === "bd-company"}>
                  <input id="bd-company" className="wl-field__input" type="text" autoComplete="organization" required
                    maxLength={LIMITS.company} placeholder="Kabwata Fresh Foods" value={company}
                    aria-invalid={invalidField === "bd-company"} onChange={(e) => setCompany(e.target.value)} />
                </Field>
                <Field id="bd-email" label="Work email" invalid={invalidField === "bd-email"}>
                  <input id="bd-email" className="wl-field__input" type="email" autoComplete="email" required inputMode="email"
                    maxLength={LIMITS.email} placeholder="name@company.co.zm" value={email}
                    aria-invalid={invalidField === "bd-email"} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field id="bd-phone" label={fullCalendar ? "Phone" : "Phone (optional)"} invalid={invalidField === "bd-phone"}>
                  <input id="bd-phone" className="wl-field__input" type="tel" autoComplete="tel" inputMode="tel"
                    maxLength={LIMITS.phone} placeholder="0971 234 567" value={phone}
                    aria-invalid={invalidField === "bd-phone"} aria-describedby="bd-phone-hint"
                    onChange={(e) => setPhone(e.target.value)} />
                  <span id="bd-phone-hint" className="sr-only">Zambian numbers can start with 09, 07, 05 or +260. Other countries need their country code.</span>
                </Field>
              </div>

              <Field id="bd-size" label="Company size">
                <select id="bd-size" className="wl-field__input wl-field__select" value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}>
                  <option value="">Choose one (optional)</option>
                  {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>

              <fieldset className="bd-chips">
                <legend className="bd-picker__label">What do you want to see? <span className="bd-muted">(pick any)</span></legend>
                <div className="bd-chips__row">
                  {INTERESTS.map((i) => {
                    const on = interests.includes(i.value);
                    return (
                      <button key={i.value} type="button" role="checkbox" aria-checked={on}
                        className={`wl-choice wl-choice--chip bd-chip ${on ? "wl-choice--active" : ""}`}
                        onClick={() => toggleInterest(i.value)}>
                        {on && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                        {i.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <Field id="bd-message" label="Anything we should know? (optional)">
                <textarea id="bd-message" className="wl-field__input wl-field__textarea" rows={3}
                  maxLength={LIMITS.message} value={message}
                  placeholder="We send about 2,000 SMS a month and want to try WhatsApp."
                  onChange={(e) => setMessage(e.target.value)} />
              </Field>

              {/* Honeypot: people never see or fill this; bots that fill every field do. */}
              <div className="bd-hp" aria-hidden="true">
                <label htmlFor="bd-website">Website</label>
                <input id="bd-website" name="website" type="text" tabIndex={-1} autoComplete="off"
                  value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              {showTurnstile && <Turnstile onToken={setTurnstileToken} resetKey={turnstileReset} />}

              <div aria-live="assertive" aria-atomic="true">
                {error && <p className="wl-error bd-error" role="alert">{error}</p>}
              </div>

              <div className="bd-actions">
                {!fullCalendar && (
                  <button type="button" className="wl-step-btn bd-back" onClick={() => { setError(""); setStep("time"); }}>
                    <ArrowLeft size={16} aria-hidden="true" /> Back
                  </button>
                )}
                <button type="submit" className="wl-submit bd-primary" disabled={submitting}>
                  {submitting ? "Sending..." : fullCalendar ? "Ask for a call" : "Book my demo"}
                  {!submitting && <ArrowRight size={18} aria-hidden="true" />}
                </button>
              </div>
              <p className="bd-fineprint">
                We&apos;ll only use your details to arrange the demo and follow up. No spam.
              </p>
            </form>
          </section>
        )}

        {step === "done" && done && (
          <section aria-live="polite">
            {done.response.status === "booked" && done.response.booking ? (
              <Confirmation booking={done.response.booking} timeZone={done.timeZone} phone={done.phone} email={done.email} />
            ) : (
              <div className="bd-confirm">
                <span className="wl-success__check bd-confirm__check" aria-hidden="true">
                  <Check size={22} strokeWidth={3} />
                </span>
                <h2 className="bd-card__title bd-confirm__title" tabIndex={-1} data-autofocus>
                  Thanks, {done.firstName}
                </h2>
                <p className="bd-confirm__sub">
                  {done.phone
                    ? <>We&apos;ll call you on <strong>{done.phone}</strong> within one working day to set a time that suits you.</>
                    : <>We&apos;ll email you at <strong>{done.email}</strong> within one working day to set a time that suits you.</>}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Field({ id, label, invalid, children }: { id: string; label: string; invalid?: boolean; children: React.ReactNode }) {
  return (
    <div className={`wl-field bd-field ${invalid ? "bd-field--invalid" : ""}`}>
      <div className="wl-field__body">
        <label htmlFor={id} className="wl-field__label">{label}</label>
        {children}
      </div>
    </div>
  );
}
