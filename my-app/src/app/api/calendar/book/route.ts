import { Resend } from "resend";
import { getCalendarClient, getCalendarId, getScheduleConfig } from "../_lib/google";
import { isSlotAvailable } from "../_lib/slots";
import type { BookingRequest, BusyRange } from "../_lib/types";
import { validateEmailDeliverable } from "../../_lib/email-validation";

export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const ipHits = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    const oldest = hits[0];
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return { ok: false, retryAfterSec };
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return { ok: true, retryAfterSec: 0 };
}

function formatHumanDate(iso: string, timezone: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<BookingRequest>;
    const slotStart = body.slotStart;
    const slotEnd = body.slotEnd;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const message = body.message?.trim();

    if (!slotStart || !slotEnd || !name || !email) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (Date.parse(slotStart) <= Date.now()) {
      return Response.json({ error: "Slot is in the past" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const limit = checkRateLimit(ip);
    if (!limit.ok) {
      return Response.json(
        { error: "RATE_LIMIT", retryAfterSec: limit.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }

    const emailCheck = await validateEmailDeliverable(email);
    if (!emailCheck.ok) {
      return Response.json({ error: emailCheck.code }, { status: 400 });
    }

    const config = getScheduleConfig();
    const calendar = getCalendarClient();
    const calendarId = getCalendarId();
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) {
      return Response.json({ error: "Server misconfigured: missing OWNER_EMAIL" }, { status: 500 });
    }

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
        description: [
          `Visitor: ${name} <${email}>`,
          message ? `\nMessage:\n${message}` : "",
        ].join(""),
        start: { dateTime: slotStart, timeZone: config.timezone },
        end: { dateTime: slotEnd, timeZone: config.timezone },
        attendees: [
          { email, displayName: name, responseStatus: "needsAction" },
          { email: ownerEmail, responseStatus: "accepted", organizer: true },
        ],
        reminders: { useDefault: true },
      },
    });

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const from = process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>";
        const startHuman = formatHumanDate(slotStart, config.timezone);
        const endHuman = formatHumanDate(slotEnd, config.timezone);

        await resend.emails.send({
          from,
          to: ownerEmail,
          replyTo: email,
          subject: `[Portfolio] New booking — ${name}`,
          text: `New booking confirmed.\n\nFrom: ${name} <${email}>\nWhen: ${startHuman} → ${endHuman} (${config.timezone})\n${message ? `\nMessage:\n${message}` : ""}`,
        });
      } catch (mailError) {
        console.error("Booking email notification failed:", mailError);
      }
    }

    return Response.json({ ok: true, eventId: event.data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
