import { getCalendarClient, getCalendarId, getScheduleConfig } from "../_lib/google";
import { filterAvailable, generateSlots } from "../_lib/slots";
import type { BusyRange, SlotsResponse } from "../_lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HORIZON_DAYS = 30;

export async function GET() {
  try {
    const config = getScheduleConfig();
    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    const now = new Date();
    const horizon = new Date(now.getTime() + HORIZON_DAYS * 86_400_000);

    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: horizon.toISOString(),
        timeZone: config.timezone,
        items: [{ id: calendarId }],
      },
    });

    const busyRanges: BusyRange[] = (freebusy.data.calendars?.[calendarId]?.busy ?? [])
      .map((r) => ({ start: r.start ?? "", end: r.end ?? "" }))
      .filter((r) => r.start && r.end);

    const candidates = generateSlots(now, HORIZON_DAYS, config);
    const available = filterAvailable(candidates, busyRanges, config.slotBufferMin);

    const body: SlotsResponse = { slots: available, timezone: config.timezone };
    return Response.json(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
