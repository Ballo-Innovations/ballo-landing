"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
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
import { browserTimeZone, formatDayParts, formatTime, dayKey } from "@/lib/demoBooking/time";
import { ZAMBIA_TZ } from "@/lib/demoBooking/shared";

type SlotsState =
  | { kind: "loading" }
  | { kind: "ready"; slots: Slot[]; captchaRequired: boolean }
  | { kind: "full"; captchaRequired: boolean };

type Done = { response: BookResponse; phone: string | null; email: string; firstName: string; timeZone: string };

export default function BookDemoClient() {
  const [slotsState, setSlotsState] = useState<SlotsState>({ kind: "loading" });
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
  const timeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const tz = browserTimeZone();
    setVisitorTz(tz);
    setDisplayTz(tz);
  }, []);

  const loadSlots = useCallback(async () => {
    setSlotsState({ kind: "loading" });
    const res = await demoApi<SlotsResponse>("slots?days=14");
    if (!res.ok || !res.data) {
      setSlotsState({ kind: "full", captchaRequired: false });
      return;
    }
    const future = res.data.slots.filter((s) => Date.parse(s.start) > Date.now());
    setSlotsState(
      future.length === 0
        ? { kind: "full", captchaRequired: res.data.captchaRequired }
        : { kind: "ready", slots: future, captchaRequired: res.data.captchaRequired },
    );
  }, []);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  // A 409 can take the last free slot: switch to the call-back form.
  useEffect(() => {
    if (slotsState.kind === "ready" && slotsState.slots.length === 0) {
      setSlotsState({ kind: "full", captchaRequired: slotsState.captchaRequired });
      setNotice("");
    }
  }, [slotsState]);

  // After booking, move focus to the confirmation heading.
  useEffect(() => {
    if (!done) return;
    cardRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [done]);

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

  const focusTimes = () => {
    timeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    timeRef.current?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus({ preventScroll: true });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (slotsState.kind === "loading") return;
    if (!fullCalendar && !selected) {
      setError("");
      setNotice("Please pick a time for your demo first.");
      focusTimes();
      return;
    }
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
      return;
    }

    if (showTurnstile) setTurnstileReset((n) => n + 1);

    if (res.status === 409 && selected) {
      const taken = selected.start;
      setSlotsState((prev) =>
        prev.kind === "ready" ? { ...prev, slots: prev.slots.filter((s) => s.start !== taken) } : prev,
      );
      setSelected(null);
      setNotice(`${res.error} Your details are still filled in, so just choose another time.`);
      focusTimes();
      return;
    }
    fail(res.error);
  };

  const submitLabel = submitting
    ? "Sending..."
    : fullCalendar
      ? "Ask for a call"
      : selected
        ? `Book ${formatDayParts(dayKey(selected.start, displayTz)).long}, ${formatTime(selected.start, displayTz)}`
        : "Book my demo";

  if (done) {
    return (
      <div ref={cardRef} className="bd-card" data-lenis-prevent>
        {done.response.status === "booked" && done.response.booking ? (
          <Confirmation booking={done.response.booking} timeZone={done.timeZone} phone={done.phone} email={done.email} />
        ) : (
          <div className="bd-confirm" aria-live="polite">
            <h2 className="bd-card__title" tabIndex={-1} data-autofocus>Thanks, {done.firstName}</h2>
            <p className="bd-card__sub">
              {done.phone
                ? <>We&apos;ll call you on <strong>{done.phone}</strong> within one working day to set a time that suits you.</>
                : <>We&apos;ll email you at <strong>{done.email}</strong> within one working day to set a time that suits you.</>}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={cardRef} className="bd-card" data-lenis-prevent>
      <form noValidate onSubmit={submit} onChange={clearError}>
        <section ref={timeRef} className="bd-section" aria-labelledby="bd-time-title">
          {fullCalendar ? (
            <>
              <h2 id="bd-time-title" className="bd-card__title">Ask for a call back</h2>
              <p className="bd-card__sub">
                Our calendar is full right now. Leave your details and we&apos;ll call you to set a time.
              </p>
            </>
          ) : (
            <>
              <h2 id="bd-time-title" className="bd-card__title">Pick a time</h2>
              <div aria-live="polite" aria-atomic="true">
                {notice && <p className="bd-notice" role="alert">{notice}</p>}
              </div>
              {slotsState.kind === "loading" ? (
                <div className="bd-skeleton" aria-busy="true" aria-label="Loading free times">
                  <div className="bd-skeleton__row">
                    {Array.from({ length: 6 }, (_, i) => <span key={i} className="bd-skeleton__day" />)}
                  </div>
                  <div className="bd-skeleton__grid">
                    {Array.from({ length: 8 }, (_, i) => <span key={i} className="bd-skeleton__time" />)}
                  </div>
                </div>
              ) : slotsState.kind === "ready" ? (
                <SlotPicker
                  idPrefix="bd-book"
                  slots={slotsState.slots}
                  visitorTimeZone={visitorTz}
                  displayTimeZone={displayTz}
                  onDisplayTimeZoneChange={setDisplayTz}
                  selectedStart={selected?.start ?? null}
                  onSelect={(slot) => { setSelected(slot); setNotice(""); }}
                />
              ) : null}
            </>
          )}
        </section>

        <hr className="bd-rule" />

        <section className="bd-section" aria-labelledby="bd-details-title">
          <h2 id="bd-details-title" className="bd-card__title">Your details</h2>

          <div className="bd-grid">
            <Field id="bd-name" label="Your name" invalid={invalidField === "bd-name"}>
              <input id="bd-name" className="bd-input" type="text" autoComplete="name" required
                maxLength={LIMITS.name} placeholder="Mutale Banda" value={name}
                aria-invalid={invalidField === "bd-name"} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id="bd-company" label="Company" invalid={invalidField === "bd-company"}>
              <input id="bd-company" className="bd-input" type="text" autoComplete="organization" required
                maxLength={LIMITS.company} placeholder="Kabwata Fresh Foods" value={company}
                aria-invalid={invalidField === "bd-company"} onChange={(e) => setCompany(e.target.value)} />
            </Field>
            <Field id="bd-email" label="Work email" invalid={invalidField === "bd-email"}>
              <input id="bd-email" className="bd-input" type="email" autoComplete="email" required inputMode="email"
                maxLength={LIMITS.email} placeholder="name@company.co.zm" value={email}
                aria-invalid={invalidField === "bd-email"} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field id="bd-phone" label={fullCalendar ? "Phone" : "Phone (optional)"} invalid={invalidField === "bd-phone"}>
              <input id="bd-phone" className="bd-input" type="tel" autoComplete="tel" inputMode="tel"
                maxLength={LIMITS.phone} placeholder="0971 234 567" value={phone}
                aria-invalid={invalidField === "bd-phone"} aria-describedby="bd-phone-hint"
                onChange={(e) => setPhone(e.target.value)} />
              <span id="bd-phone-hint" className="sr-only">Zambian numbers can start with 09, 07, 05 or +260. Other countries need their country code.</span>
            </Field>
          </div>

          <Field id="bd-size" label="Team size">
            <select id="bd-size" className="bd-input bd-select" value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}>
              <option value="">Choose one (optional)</option>
              {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          <fieldset className="bd-checks">
            <legend className="bd-label">What would you like to see?</legend>
            <div className="bd-checks__grid">
              {INTERESTS.map((i) => (
                <label key={i.value} className="bd-check">
                  <input type="checkbox" checked={interests.includes(i.value)} onChange={() => toggleInterest(i.value)} />
                  <span>{i.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field id="bd-message" label="Anything else? (optional)">
            <textarea id="bd-message" className="bd-input bd-textarea" rows={3}
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
            {error && <p className="bd-error" role="alert">{error}</p>}
          </div>

          <button type="submit" className="bd-btn bd-btn--block" disabled={submitting || slotsState.kind === "loading"}>
            {submitLabel}
          </button>
          <p className="bd-fineprint">
            {fullCalendar
              ? "We'll only use your details to arrange the demo."
              : "You'll get a calendar invite by email, with a link to reschedule or cancel."}
          </p>
        </section>
      </form>
    </div>
  );
}

function Field({ id, label, invalid, children }: { id: string; label: string; invalid?: boolean; children: React.ReactNode }) {
  return (
    <div className={`bd-field ${invalid ? "bd-field--invalid" : ""}`}>
      <label htmlFor={id} className="bd-label">{label}</label>
      {children}
    </div>
  );
}
