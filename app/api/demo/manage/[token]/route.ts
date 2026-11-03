import { NextRequest, NextResponse } from "next/server";
import { BOOKING_NOT_FOUND, callBackend, flagOffResponse, jsonError, pickManagedBooking, unwrapData } from "@/lib/demoBooking/proxy";
import { isPlausibleToken } from "@/lib/demoBooking/shared";

export const dynamic = "force-dynamic";

/** GET /api/demo/manage/{token} -> GET /v1/demo-bookings/manage/{token} */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const off = flagOffResponse();
  if (off) return off;

  const { token } = await params;
  if (!isPlausibleToken(token)) return jsonError(BOOKING_NOT_FOUND, 404);

  const result = await callBackend(
    request,
    `/v1/demo-bookings/manage/${encodeURIComponent(token)}`,
    { method: "GET" },
    { notFound: BOOKING_NOT_FOUND },
  );
  if (!result.ok) return result.response;

  return NextResponse.json(
    { data: pickManagedBooking(unwrapData(result.data)) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
