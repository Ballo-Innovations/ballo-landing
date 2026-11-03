import { NextRequest, NextResponse } from "next/server";
import {
  BOOKING_NOT_FOUND,
  callBackend,
  flagOffResponse,
  jsonError,
  pickManagedBooking,
  readJsonBody,
  unwrapData,
} from "@/lib/demoBooking/proxy";
import { isIsoInstant, isPlausibleToken } from "@/lib/demoBooking/shared";

export const dynamic = "force-dynamic";

/** POST /api/demo/manage/{token}/reschedule { start } */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const off = flagOffResponse();
  if (off) return off;

  const { token } = await params;
  if (!isPlausibleToken(token)) return jsonError(BOOKING_NOT_FOUND, 404);

  const body = await readJsonBody(request);
  if (!body || !isIsoInstant(body.start)) return jsonError("Please pick a new time from the calendar.", 400);

  const result = await callBackend(
    request,
    `/v1/demo-bookings/manage/${encodeURIComponent(token)}/reschedule`,
    { method: "POST", body: { start: body.start } },
    { notFound: BOOKING_NOT_FOUND },
  );
  if (!result.ok) return result.response;

  return NextResponse.json({ data: pickManagedBooking(unwrapData(result.data)) });
}
