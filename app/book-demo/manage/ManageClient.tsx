"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarClock, CalendarX, Check, CircleAlert, Phone, Video } from "lucide-react";
import { SlotPicker } from "../components/SlotPicker";
import { Confirmation } from "../components/Confirmation";
import { demoApi } from "@/lib/demoBooking/client";
import {
  isPlausibleToken,
  LIMITS,
  ZAMBIA_TZ,
  type ManagedBooking,
  type Slot,
  type SlotsResponse,
} from "@/lib/demoBooking/shared";
import { browserTimeZone, dayKey, formatDayParts, formatRange, formatTime, zoneLabel } from "@/lib/demoBooking/time";

type Load =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; booking: ManagedBooking };

type Mode = "view" | "reschedule" | "cancel" | "rescheduled" | "cancelled";

type SlotsLoad = { kind: "loading" } | { kind: "ready"; slots: Slot[] } | { kind: "none" } | { kind: "error" };

export default function ManageClient() {
  const token = useSearchParams().get("token") ?? "";
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [mode, setMode] = useState<Mode>("view");
  const [visitorTz, setVisitorTz] = useState(ZAMBIA_TZ);
  const [displayTz, setDisplayTz] = useState(ZAMBIA_TZ);

  const [slots, setSlots] = useState<SlotsLoad>({ kind: "loading" });
  const [selected, setSelected] = useState<Slot | null>(null);
  const [notice, setNotice] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const tz = browserTimeZone();
    setVisitorTz(tz);
    setDisplayTz(tz);
  }, []);

  const fetchBooking = useCallback(async () => {
    if (!isPlausibleToken(token)) {
      setLoad({ kind: "missing" });
      return;
    }
    setLoad({ kind: "loading" });
    const res = await demoApi<ManagedBooking>(`manage/${encodeURIComponent(token)}`);
    if (res.ok && res.data) setLoad({ kind: "ready", booking: res.data });
    else if (!res.ok && res.status === 404) setLoad({ kind: "missing" });
    else setLoad({ kind: "error", message: res.ok ? "Something went wrong. Please try again." : res.error });
  }, [token]);

  useEffect(() => {
    void fetchBooking();
  }, [fetchBooking]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    cardRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [mode, load.kind]);

  const startReschedule = async () => {
    setMode("reschedule");
    setSelected(null);
    setNotice("");
    setError("");
    setSlots({ kind: "loading" });
    const res = await demoApi<SlotsResponse>("slots?days=14");
    if (!res.ok || !res.data) {
      setSlots({ kind: "error" });
      return;
    }
    const current = load.kind === "ready" ? load.booking.start : "";
    const free = res.data.slots.filter((s) => Date.parse(s.start) > Date.now() && s.start !== current);
    setSlots(free.length > 0 ? { kind: "ready", slots: free } : { kind: "none" });
  };

  const confirmReschedule = async () => {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    const res = await demoApi<ManagedBooking>(`manage/${encodeURIComponent(token)}/reschedule`, {
      method: "POST",
      body: { start: selected.start },
    });
    setBusy(false);
    if (res.ok && res.data) {
      setLoad({ kind: "ready", booking: res.data });
      setMode("rescheduled");
      return;
    }
    if (!res.ok && res.status === 409) {
      const taken = selected.start;
      setSlots((prev) => {
        if (prev.kind !== "ready") return prev;
        const rest = prev.slots.filter((s) => s.start !== taken);
        return rest.length > 0 ? { kind: "ready", slots: rest } : { kind: "none" };
      });
      setSelected(null);
      setNotice(res.error);
      return;
    }
    setError(res.ok ? "Something went wrong. Please try again." : res.error);
  };

  const confirmCancel = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await demoApi<ManagedBooking>(`manage/${encodeURIComponent(token)}/cancel`, {
      method: "POST",
      body: reason.trim() ? { reason: reason.trim() } : {},
    });
    setBusy(false);
    if (res.ok && res.data) {
      setLoad({ kind: "ready", booking: res.data });
      setMode("cancelled");
      return;
    }
    setError(res.ok ? "Something went wrong. Please try again." : res.error);
  };

  return (
    <div ref={cardRef} className="bd-card bd-card--manage" data-lenis-prevent>
      <div className="wl-card__aurora" aria-hidden="true" />
      <div className="bd-card__inner">
        {load.kind === "loading" && (
          <div aria-busy="true">
            <p className="bd-eyebrow">Your demo</p>
            <p className="bd-card__sub">Loading your booking...</p>
          </div>
        )}

        {load.kind === "missing" && (
          <StateBlock icon={<CircleAlert size={22} />} title="We couldn't find that booking">
            <p className="bd-card__sub">
              The link may be incomplete or out of date. Open the link from your confirmation email again,
              or book a new time below.
            </p>
            <Link href="/book-demo" className="wl-submit bd-primary bd-link-primary">Book a demo</Link>
          </StateBlock>
        )}

        {load.kind === "error" && (
          <StateBlock icon={<CircleAlert size={22} />} title="We couldn't load your booking">
            <p className="bd-card__sub" role="alert">{load.message}</p>
            <button type="button" className="wl-submit bd-primary" onClick={() => void fetchBooking()}>
              Try again
            </button>
          </StateBlock>
        )}

        {load.kind === "ready" && (
          <ManageBody
            booking={load.booking}
            token={token}
            mode={mode}
            setMode={(m) => { setMode(m); setError(""); }}
            displayTz={displayTz}
            visitorTz={visitorTz}
            setDisplayTz={setDisplayTz}
            slots={slots}
            selected={selected}
            setSelected={(s) => { setSelected(s); setNotice(""); }}
            notice={notice}
            reason={reason}
            setReason={setReason}
            error={error}
            busy={busy}
            startReschedule={startReschedule}
            confirmReschedule={confirmReschedule}
            confirmCancel={confirmCancel}
          />
        )}
      </div>
    </div>
  );
}

function StateBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bd-state">
      <span className="bd-state__icon" aria-hidden="true">{icon}</span>
      <h1 className="bd-card__title" tabIndex={-1} data-autofocus>{title}</h1>
      {children}
    </div>
  );
}

type BodyProps = {
  booking: ManagedBooking;
  token: string;
  mode: Mode;
  setMode: (m: Mode) => void;
  displayTz: string;
  visitorTz: string;
  setDisplayTz: (tz: string) => void;
  slots: SlotsLoad;
  selected: Slot | null;
  setSelected: (s: Slot) => void;
  notice: string;
  reason: string;
  setReason: (r: string) => void;
  error: string;
  busy: boolean;
  startReschedule: () => void;
  confirmReschedule: () => void;
  confirmCancel: () => void;
};

function ManageBody(p: BodyProps) {
  const { booking } = p;
  const past = Date.parse(booking.end || booking.start) < Date.now();

  const errorRegion = (
    <div aria-live="assertive" aria-atomic="true">
      {p.error && <p className="wl-error bd-error" role="alert">{p.error}</p>}
    </div>
  );

  if (p.mode === "rescheduled") {
    return (
      <Confirmation
        heading="Your demo has moved"
        booking={{ ...booking, manageToken: p.token }}
        timeZone={p.displayTz}
        phone={null}
        showManageLink={false}
      />
    );
  }

  if (booking.status === "cancelled") {
    return (
      <StateBlock icon={<CalendarX size={22} />} title={p.mode === "cancelled" ? "Your demo is cancelled" : "This demo was cancelled"}>
        <p className="bd-card__sub">
          {p.mode === "cancelled"
            ? <>Thanks for letting us know{booking.name ? `, ${booking.name.split(/\s+/)[0]}` : ""}. Your time slot has been freed up for someone else.</>
            : <>The demo for {booking.company || "your company"} on {formatRange(booking.start, booking.end, p.displayTz)} is no longer happening.</>}
        </p>
        <p className="bd-card__sub">Whenever you&apos;re ready, you can pick a new time.</p>
        <Link href="/book-demo?from=book-demo/manage" className="wl-submit bd-primary bd-link-primary">Book a new time</Link>
      </StateBlock>
    );
  }

  const summary = (
    <dl className="wl-recap bd-recap">
      <div>
        <dt>When</dt>
        <dd>
          {formatRange(booking.start, booking.end, p.displayTz)}
          <span className="bd-recap__tz">{zoneLabel(p.displayTz)}</span>
        </dd>
      </div>
      <div>
        <dt>How</dt>
        <dd>
          {booking.meetingUrl ? (
            <a className="bd-inline-link" href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">
              <Video size={15} aria-hidden="true" /> Join the video call
            </a>
          ) : (
            <span className="bd-inline"><Phone size={15} aria-hidden="true" /> We&apos;ll call you</span>
          )}
        </dd>
      </div>
      {booking.hostName && <div><dt>With</dt><dd>{booking.hostName}</dd></div>}
      <div><dt>For</dt><dd>{booking.name}{booking.company ? `, ${booking.company}` : ""}</dd></div>
      <div><dt>Reference</dt><dd className="bd-ref">{booking.reference}</dd></div>
    </dl>
  );

  if (!booking.canChange || booking.status !== "booked" || past) {
    const happened = booking.status === "completed" || booking.status === "no_show" || past;
    return (
      <StateBlock icon={<CalendarClock size={22} />} title={happened ? "This demo has already taken place" : "This demo can't be changed online"}>
        {summary}
        <p className="bd-card__sub">
          Want another look, or have more questions? Book a new demo and we&apos;ll pick up where we left off.
        </p>
        <Link href="/book-demo?from=book-demo/manage" className="wl-submit bd-primary bd-link-primary">Book another demo</Link>
      </StateBlock>
    );
  }

  if (p.mode === "reschedule") {
    return (
      <section aria-labelledby="bd-resched-title">
        <button type="button" className="bd-link-btn bd-backlink" onClick={() => p.setMode("view")}>
          <ArrowLeft size={15} aria-hidden="true" /> Back to your booking
        </button>
        <h1 id="bd-resched-title" className="bd-card__title" tabIndex={-1} data-autofocus>Pick a new time</h1>
        <p className="bd-card__sub">
          Currently {formatRange(booking.start, booking.end, p.displayTz)}.
        </p>
        <div aria-live="polite" aria-atomic="true">
          {p.notice && (
            <p className="bd-notice bd-notice--warn" role="alert">
              <CalendarClock size={16} aria-hidden="true" /> {p.notice}
            </p>
          )}
        </div>
        {p.slots.kind === "loading" && (
          <div className="bd-skeleton" aria-busy="true" aria-label="Loading free times">
            <div className="bd-skeleton__row">{Array.from({ length: 5 }, (_, i) => <span key={i} className="bd-skeleton__day" />)}</div>
            <div className="bd-skeleton__grid">{Array.from({ length: 8 }, (_, i) => <span key={i} className="bd-skeleton__time" />)}</div>
          </div>
        )}
        {(p.slots.kind === "none" || p.slots.kind === "error") && (
          <p className="bd-notice bd-notice--info">
            <CalendarClock size={16} aria-hidden="true" />
            {p.slots.kind === "none"
              ? "There are no other free times in the next two weeks. Reply to your confirmation email and we'll find a time that works."
              : "We couldn't load free times just now. Please try again in a minute."}
          </p>
        )}
        {p.slots.kind === "ready" && (
          <>
            <SlotPicker
              idPrefix="bd-resched"
              slots={p.slots.slots}
              visitorTimeZone={p.visitorTz}
              displayTimeZone={p.displayTz}
              onDisplayTimeZoneChange={p.setDisplayTz}
              selectedStart={p.selected?.start ?? null}
              onSelect={p.setSelected}
            />
            {errorRegion}
            <button type="button" className="wl-submit bd-primary" disabled={!p.selected || p.busy} onClick={p.confirmReschedule}>
              {p.busy
                ? "Moving your demo..."
                : p.selected
                  ? `Move my demo to ${formatDayParts(dayKey(p.selected.start, p.displayTz)).weekday} ${formatTime(p.selected.start, p.displayTz)}`
                  : "Pick a new time"}
            </button>
          </>
        )}
      </section>
    );
  }

  if (p.mode === "cancel") {
    return (
      <section aria-labelledby="bd-cancel-title">
        <button type="button" className="bd-link-btn bd-backlink" onClick={() => p.setMode("view")}>
          <ArrowLeft size={15} aria-hidden="true" /> Back to your booking
        </button>
        <h1 id="bd-cancel-title" className="bd-card__title" tabIndex={-1} data-autofocus>Cancel your demo?</h1>
        <p className="bd-card__sub">
          {formatRange(booking.start, booking.end, p.displayTz)}. If another time would suit you better, you
          can <button type="button" className="bd-link-btn bd-link-btn--inline" onClick={p.startReschedule}>move it instead</button>.
        </p>
        <div className="wl-field bd-field">
          <div className="wl-field__body">
            <label htmlFor="bd-reason" className="wl-field__label">Want to tell us why? (optional)</label>
            <textarea id="bd-reason" className="wl-field__input wl-field__textarea" rows={3} maxLength={LIMITS.reason}
              value={p.reason} onChange={(e) => p.setReason(e.target.value)}
              placeholder="Something came up, we'll book again next month." />
          </div>
        </div>
        {errorRegion}
        <div className="bd-actions bd-actions--stack">
          <button type="button" className="wl-step-btn bd-back" onClick={() => p.setMode("view")}>Keep my demo</button>
          <button type="button" className="wl-submit bd-primary bd-danger" disabled={p.busy} onClick={p.confirmCancel}>
            {p.busy ? "Cancelling..." : "Yes, cancel my demo"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="bd-manage-title">
      <p className="bd-eyebrow"><Check size={14} strokeWidth={3} aria-hidden="true" /> Booked</p>
      <h1 id="bd-manage-title" className="bd-card__title" tabIndex={-1} data-autofocus>
        Your BalloAds demo
      </h1>
      {summary}
      <div className="bd-actions bd-actions--stack">
        <button type="button" className="wl-step-btn bd-back" onClick={() => p.setMode("cancel")}>Cancel demo</button>
        <button type="button" className="wl-submit bd-primary" onClick={p.startReschedule}>
          <CalendarClock size={18} aria-hidden="true" /> Reschedule
        </button>
      </div>
    </section>
  );
}
