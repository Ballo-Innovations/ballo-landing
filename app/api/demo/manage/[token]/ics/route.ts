import { NextRequest, NextResponse } from "next/server";
import { getDemoBookingBackendBaseUrl } from "@/lib/serverBackendApi";
import { clientIp, flagOffResponse } from "@/lib/demoBooking/proxy";
import { isPlausibleToken } from "@/lib/demoBooking/shared";

export const dynamic = "force-dynamic";

const NOT_FOUND_TEXT = "We couldn't find that booking.";

/** GET /api/demo/manage/{token}/ics: streams the calendar file from the backend. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const off = flagOffResponse();
  if (off) return off;

  const { token } = await params;
  if (!isPlausibleToken(token)) return new NextResponse(NOT_FOUND_TEXT, { status: 404 });

  const headers: Record<string, string> = { Accept: "text/calendar" };
  const ip = clientIp(request);
  if (ip) headers["X-Forwarded-For"] = ip;

  let res: Response;
  try {
    res = await fetch(
      `${getDemoBookingBackendBaseUrl(request)}/v1/demo-bookings/manage/${encodeURIComponent(token)}/ics`,
      { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) },
    );
  } catch (error) {
    console.error("Demo booking ics upstream unreachable", error);
    return new NextResponse("We couldn't get the calendar file. Please try again.", { status: 502 });
  }

  if (!res.ok || !res.body) {
    console.error("Demo booking ics upstream error", res.status);
    if (res.status === 404) return new NextResponse(NOT_FOUND_TEXT, { status: 404 });
    if (res.status === 429) return new NextResponse("Too many tries. Please wait a minute.", { status: 429 });
    return new NextResponse("We couldn't get the calendar file. Please try again.", { status: 502 });
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="balloads-demo.ics"',
      "Cache-Control": "no-store",
    },
  });
}
