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
import { isPlausibleToken, LIMITS } from "@/lib/demoBooking/shared";

export const dynamic = "force-dynamic";

/** POST /api/demo/manage/{token}/cancel { reason? } */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const off = flagOffResponse();
  if (off) return off;

  const { token } = await params;
  if (!isPlausibleToken(token)) return jsonError(BOOKING_NOT_FOUND, 404);

  const body = (await readJsonBody(request)) ?? {};
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length > LIMITS.reason) {
    return jsonError(`Please keep the reason under ${LIMITS.reason} characters.`, 400);
  }

  const result = await callBackend(
    request,
    `/v1/demo-bookings/manage/${encodeURIComponent(token)}/cancel`,
    { method: "POST", body: reason ? { reason } : {} },
    { notFound: BOOKING_NOT_FOUND },
  );
  if (!result.ok) return result.response;

  return NextResponse.json({ data: pickManagedBooking(unwrapData(result.data)) });
}
