import { NextRequest, NextResponse } from "next/server";
import { callBackend, flagOffResponse, str, unwrapData } from "@/lib/demoBooking/proxy";
import { isIsoInstant, ZAMBIA_TZ } from "@/lib/demoBooking/shared";

export const dynamic = "force-dynamic";

/** GET /api/demo/slots?days=14 -> GET /v1/demo-bookings/slots */
export async function GET(request: NextRequest) {
  const off = flagOffResponse();
  if (off) return off;

  const requested = Number(request.nextUrl.searchParams.get("days") ?? "14");
  const days = Number.isFinite(requested) ? Math.min(30, Math.max(1, Math.floor(requested))) : 14;

  const result = await callBackend(request, `/v1/demo-bookings/slots?days=${days}`, { method: "GET" });
  if (!result.ok) return result.response;

  const data = unwrapData(result.data);
  const rawSlots = Array.isArray(data?.slots) ? data.slots : [];
  const slots = rawSlots
    .map((s) => (s && typeof s === "object" ? (s as Record<string, unknown>) : null))
    .filter((s): s is Record<string, unknown> => !!s && isIsoInstant(s.start) && isIsoInstant(s.end))
    .map((s) => ({ start: s.start as string, end: s.end as string }));

  return NextResponse.json(
    {
      data: {
        timeZone: str(data?.timeZone) ?? ZAMBIA_TZ,
        slotMinutes: typeof data?.slotMinutes === "number" ? data.slotMinutes : 30,
        captchaRequired: data?.captchaRequired === true,
        slots,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
