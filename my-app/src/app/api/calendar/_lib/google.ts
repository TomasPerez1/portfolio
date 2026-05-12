import { google, type calendar_v3 } from "googleapis";
import type { ScheduleConfig } from "./types";

let cachedClient: calendar_v3.Calendar | null = null;

export function getCalendarClient(): calendar_v3.Calendar {
  if (cachedClient) return cachedClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const keyB64 = process.env.GOOGLE_PRIVATE_KEY_B64;
  if (!email || !keyB64) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY_B64 env vars");
  }

  const privateKey = Buffer.from(keyB64, "base64").toString("utf-8");
  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  cachedClient = google.calendar({ version: "v3", auth });
  return cachedClient;
}

export function getCalendarId(): string {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new Error("Missing GOOGLE_CALENDAR_ID env var");
  return id;
}

export function getScheduleConfig(): ScheduleConfig {
  return {
    timezone: process.env.OWNER_TIMEZONE ?? "America/Argentina/Buenos_Aires",
    workHoursStart: Number(process.env.WORK_HOURS_START ?? 10),
    workHoursEnd: Number(process.env.WORK_HOURS_END ?? 18),
    slotDurationMin: Number(process.env.SLOT_DURATION_MIN ?? 30),
    slotBufferMin: Number(process.env.SLOT_BUFFER_MIN ?? 15),
  };
}
