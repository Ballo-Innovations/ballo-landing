"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

/**
 * PlaybookForm — the five-step prelaunch "playbook" capture.
 *
 * Ported from the supplied prototype (balloads_prelaunch_playbook_multistep_form.html)
 * into the site's design system. Collects business name + location, industry +
 * activity, biggest messaging problem, audience size, and email.
 *
 * ── Backend integration boundary ──────────────────────────────────────────────
 *  TODO: no endpoint yet — `handleSubmit` currently only advances to the local
 *  success state; nothing is persisted or emailed.
 *  Expected when the backend lands:
 *    POST /api/playbook
 *    Inputs : { business, location, industry, doing, pain, size, extra?, email }
 *    Outputs: 201 { message } | 4xx/5xx { error }
 *  Mirror app/api/waitlist/route.ts (proxies to ${BACKEND}/v1/…) when wiring it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

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
  { value: "customers going quiet after they enquire", label: "Customers go quiet after they enquire" },
  { value: "no-shows and missed appointments", label: "No-shows and missed appointments" },
  { value: "sending every message by hand", label: "Sending every message by hand" },
  { value: "chasing late payments", label: "Chasing late payments" },
  { value: "launching to an audience that never hears about it", label: "Launches nobody hears about" },
];

const SIZES = [
  { value: "under 500", label: "Under 500" },
  { value: "500 to 5,000", label: "500 – 5k" },
  { value: "5,000 to 50,000", label: "5k – 50k" },
  { value: "over 50,000", label: "50k+" },
];

const TOTAL = 5;

export default function PlaybookForm() {
  const [step, setStep] = useState(1);
  const [hint, setHint] = useState("");
  const [done, setDone] = useState(false);
  const [data, setData] = useState({
    business: "",
    location: "",
    industry: INDUSTRIES[0],
    doing: "",
    pain: "",
    size: "",
    extra: "",
    email: "",
  });

  const set = (key: keyof typeof data, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setHint("");
  };

  const validate = () => {
    if (step === 1 && (!data.business.trim() || !data.location.trim()))
      return "Add your business name and location to continue.";
    if (step === 2 && !data.doing.trim()) return "Tell us in a few words what you do.";
    if (step === 3 && !data.pain) return "Pick the one that costs you most.";
    if (step === 4 && !data.size) return "Choose an audience size.";
    if (step === 5 && !/.+@.+\..+/.test(data.email.trim()))
      return "Enter an email we can send it to.";
    return "";
  };

  const handleNext = () => {
    const problem = validate();
    if (problem) {
      setHint(problem);
      return;
    }
    if (step < TOTAL) {
      setStep(step + 1);
      setHint("");
      return;
    }
    // TODO: POST to /api/playbook once the endpoint exists (see note above).
    setDone(true);
  };

  if (done) {
    return (
      <div className="kb-form kb-form--done" role="status">
        <span className="kb-form__check" aria-hidden="true">
          <Check size={26} strokeWidth={3} />
        </span>
        <h3 className="kb-form__done-title">You&apos;re on the list</h3>
        <p className="kb-form__done-text">
          Thanks, we&apos;ve got what we need for {data.business.trim() || "your business"}. Your
          playbook is being put together and lands at <strong>{data.email.trim()}</strong> when we
          launch.
        </p>
      </div>
    );
  }

  return (
    <div className="kb-form">
      <div className="kb-form__meta">
        <span className="kb-form__step">
          Step {step} of {TOTAL}
        </span>
        <span className="kb-form__label">{STEP_LABELS[step - 1]}</span>
      </div>
      <div
        className="kb-form__bar"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL}
        aria-valuenow={step}
        aria-label="Playbook form progress"
      >
        <div className="kb-form__bar-fill" style={{ width: `${(step / TOTAL) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="kb-form__step-body">
          <p className="kb-form__q">First, who are we writing this for?</p>
          <p className="kb-form__sub">Your name and city go on the cover, and shape the examples inside.</p>
          <label className="kb-form__field-label" htmlFor="pb-biz">Business name</label>
          <input
            id="pb-biz"
            className="kb-form__input"
            type="text"
            value={data.business}
            onChange={(e) => set("business", e.target.value)}
            placeholder="Kabwata Fresh Foods"
          />
          <label className="kb-form__field-label" htmlFor="pb-loc">Where you operate</label>
          <input
            id="pb-loc"
            className="kb-form__input"
            type="text"
            value={data.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Lusaka, Zambia"
          />
        </div>
      )}

      {step === 2 && (
        <div className="kb-form__step-body">
          <p className="kb-form__q">What line of work are you in?</p>
          <p className="kb-form__sub">Be specific. This is what makes the playbook yours and not a template.</p>
          <label className="kb-form__field-label" htmlFor="pb-ind">Industry</label>
          <select
            id="pb-ind"
            className="kb-form__input kb-form__select"
            value={data.industry}
            onChange={(e) => set("industry", e.target.value)}
          >
            {INDUSTRIES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <label className="kb-form__field-label" htmlFor="pb-dow">What you actually do</label>
          <input
            id="pb-dow"
            className="kb-form__input"
            type="text"
            value={data.doing}
            onChange={(e) => set("doing", e.target.value)}
            placeholder="deliver farm produce to homes every Saturday"
          />
        </div>
      )}

      {step === 3 && (
        <div className="kb-form__step-body">
          <p className="kb-form__q">What is costing you the most right now?</p>
          <p className="kb-form__sub">Pick the one that stings. Your playbook opens with a fix for it.</p>
          <div className="kb-form__options">
            {PAINS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`kb-form__option${data.pain === option.value ? " is-selected" : ""}`}
                onClick={() => set("pain", option.value)}
                aria-pressed={data.pain === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="kb-form__step-body">
          <p className="kb-form__q">How many people are you trying to reach?</p>
          <p className="kb-form__sub">Rough is fine. It sets the send volumes and pacing we recommend.</p>
          <div className="kb-form__chips">
            {SIZES.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`kb-form__chip${data.size === option.value ? " is-selected" : ""}`}
                onClick={() => set("size", option.value)}
                aria-pressed={data.size === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="kb-form__field-label" htmlFor="pb-more">
            Anything else we should know? (optional)
          </label>
          <textarea
            id="pb-more"
            className="kb-form__input kb-form__textarea"
            rows={3}
            value={data.extra}
            onChange={(e) => set("extra", e.target.value)}
            placeholder="Three years old, mostly word of mouth, everything sent from one phone."
          />
        </div>
      )}

      {step === 5 && (
        <div className="kb-form__step-body">
          <p className="kb-form__q">Where should we send it?</p>
          <p className="kb-form__sub">Early adopters get the playbook free, plus first access at launch.</p>
          <div className="kb-form__recap">
            {data.business.trim() || "Your business"} in {data.location.trim() || "your city"}:{" "}
            {data.doing.trim() || "what you do"}. Fixing: {data.pain || "your biggest headache"}.
            Reaching {data.size || "your"} people.
          </div>
          <label className="kb-form__field-label" htmlFor="pb-mail">Email</label>
          <input
            id="pb-mail"
            className="kb-form__input"
            type="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="name@company.com"
          />
        </div>
      )}

      <div className="kb-form__nav">
        {step > 1 && (
          <button
            type="button"
            className="kb-form__back"
            onClick={() => {
              setStep(step - 1);
              setHint("");
            }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
        )}
        <button type="button" className="kb-form__next" onClick={handleNext}>
          {step === TOTAL ? "Send my playbook" : "Continue"}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>

      {hint && (
        <p className="kb-form__hint" role="alert">
          {hint}
        </p>
      )}
    </div>
  );
}
