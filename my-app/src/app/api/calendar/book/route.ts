import { getCalendarClient, getCalendarId, getScheduleConfig } from "../_lib/google";
import { isSlotAvailable } from "../_lib/slots";
import type { BookingRequest, BusyRange } from "../_lib/types";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<BookingRequest>;
    const { slotStart, slotEnd, name, email, message } = body;

    if (!slotStart || !slotEnd || !name || !email) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    if (Date.parse(slotStart) <= Date.now()) {
      return Response.json({ error: "Slot is in the past" }, { status: 400 });
    }

    const config = getScheduleConfig();
    const calendar = getCalendarClient();
    const calendarId = getCalendarId();
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) {
      return Response.json({ error: "Server misconfigured: missing OWNER_EMAIL" }, { status: 500 });
    }

    // Re-check availability to handle the race between /slots and /book.
    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: slotStart,
        timeMax: slotEnd,
        timeZone: config.timezone,
        items: [{ id: calendarId }],
      },
    });
    const busyRanges: BusyRange[] = (freebusy.data.calendars?.[calendarId]?.busy ?? [])
      .map((r) => ({ start: r.start ?? "", end: r.end ?? "" }))
      .filter((r) => r.start && r.end);

    if (!isSlotAvailable({ start: slotStart, end: slotEnd }, busyRanges, config.slotBufferMin)) {
      return Response.json({ error: "Slot just got booked" }, { status: 409 });
    }

    const event = await calendar.events.insert({
      calendarId,
      sendUpdates: "all",
      requestBody: {
        summary: `Portfolio meeting · ${name}`,
        description: message ? `Message from visitor:\n\n${message}` : "Booked via portfolio site",
        start: { dateTime: slotStart, timeZone: config.timezone },
        end: { dateTime: slotEnd, timeZone: config.timezone },
        attendees: [{ email: ownerEmail }, { email }],
        reminders: { useDefault: true },
      },
    });

    return Response.json({ ok: true, eventId: event.data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
