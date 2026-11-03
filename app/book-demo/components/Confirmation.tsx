"use client";

import Link from "next/link";
import { CalendarPlus, Check, Download, Phone, Video } from "lucide-react";
import type { BookedBooking } from "@/lib/demoBooking/shared";
import { googleCalendarUrl, icsUrl, manageUrl, outlookCalendarUrl } from "@/lib/demoBooking/calendarLinks";
import { formatRange, zoneLabel } from "@/lib/demoBooking/time";

type Props = {
  booking: BookedBooking;
  timeZone: string;
  phone: string | null;
  email?: string;
  heading?: string;
  showManageLink?: boolean;
};

export function Confirmation({ booking, timeZone, phone, email, heading = "Your demo is booked", showManageLink = true }: Props) {
  const absoluteManage =
    typeof window !== "undefined" ? `${window.location.origin}${manageUrl(booking.manageToken)}` : null;
  const event = {
    start: booking.start,
    end: booking.end,
    reference: booking.reference,
    meetingUrl: booking.meetingUrl,
    phone,
    manageUrl: absoluteManage,
  };

  return (
    <div className="bd-confirm">
      <span className="wl-success__check bd-confirm__check" aria-hidden="true">
        <Check size={22} strokeWidth={3} />
      </span>
      <h2 className="bd-card__title bd-confirm__title" tabIndex={-1} data-autofocus>
        {heading}
      </h2>
      <p className="bd-confirm__sub">
        {email ? <>We&apos;ve sent the details to <strong>{email}</strong>.</> : <>We&apos;ve emailed you the new details.</>}
      </p>

      <dl className="wl-recap bd-recap">
        <div>
          <dt>When</dt>
          <dd>
            {formatRange(booking.start, booking.end, timeZone)}
            <span className="bd-recap__tz">{zoneLabel(timeZone)}</span>
          </dd>
        </div>
        <div>
          <dt>How</dt>
          <dd>
            {booking.meetingUrl ? (
              <a className="bd-inline-link" href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">
                <Video size={15} aria-hidden="true" /> Join the video call
              </a>
            ) : phone ? (
              <span className="bd-inline"><Phone size={15} aria-hidden="true" /> We&apos;ll call you on {phone}</span>
            ) : (
              <span className="bd-inline"><Phone size={15} aria-hidden="true" /> We&apos;ll email you how to join</span>
            )}
          </dd>
        </div>
        {booking.hostName && (
          <div>
            <dt>With</dt>
            <dd>{booking.hostName}</dd>
          </div>
        )}
        <div>
          <dt>Reference</dt>
          <dd className="bd-ref">{booking.reference}</dd>
        </div>
      </dl>

      <div className="bd-cal">
        <p className="bd-picker__label">Add it to your calendar</p>
        <div className="bd-cal__row">
          <a className="bd-cal__btn" href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
            <CalendarPlus size={16} aria-hidden="true" /> Google
          </a>
          <a className="bd-cal__btn" href={outlookCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
            <CalendarPlus size={16} aria-hidden="true" /> Outlook
          </a>
          <a className="bd-cal__btn" href={icsUrl(booking.manageToken)} download="balloads-demo.ics">
            <Download size={16} aria-hidden="true" /> .ics file
          </a>
        </div>
      </div>

      {showManageLink && (
        <p className="bd-confirm__manage">
          Plans changed? <Link className="bd-inline-link" href={manageUrl(booking.manageToken)}>Reschedule or cancel</Link>
        </p>
      )}
    </div>
  );
}
