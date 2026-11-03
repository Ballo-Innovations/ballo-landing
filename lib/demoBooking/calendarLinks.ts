/** "Add to calendar" links built in the browser from the booking's start and end. */

type CalendarEvent = {
  start: string;
  end: string;
  reference: string;
  meetingUrl: string | null;
  phone?: string | null;
  manageUrl?: string | null;
};

const TITLE = "BalloAds demo";

function description(e: CalendarEvent): string {
  const lines = [`Your free 30-minute BalloAds demo (reference ${e.reference}).`];
  if (e.meetingUrl) lines.push(`Join here: ${e.meetingUrl}`);
  else if (e.phone) lines.push(`We'll call you on ${e.phone}.`);
  else lines.push("We'll call you at the time of the demo.");
  if (e.manageUrl) lines.push(`Reschedule or cancel: ${e.manageUrl}`);
  return lines.join("\n");
}

/** 20261105T070000Z */
function compactUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(e: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: TITLE,
    dates: `${compactUtc(e.start)}/${compactUtc(e.end)}`,
    details: description(e),
  });
  if (e.meetingUrl) params.set("location", e.meetingUrl);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(e: CalendarEvent): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: TITLE,
    startdt: new Date(e.start).toISOString(),
    enddt: new Date(e.end).toISOString(),
    body: description(e),
  });
  if (e.meetingUrl) params.set("location", e.meetingUrl);
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

export function icsUrl(manageToken: string): string {
  return `/api/demo/manage/${encodeURIComponent(manageToken)}/ics`;
}

export function manageUrl(manageToken: string): string {
  return `/book-demo/manage?token=${encodeURIComponent(manageToken)}`;
}
