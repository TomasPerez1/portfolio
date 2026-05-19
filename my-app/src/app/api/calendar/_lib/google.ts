import { google, type calendar_v3 } from "googleapis";
import type { ScheduleConfig } from "./types";

let cachedClient: calendar_v3.Calendar | null = null;

export function getCalendarClient(): calendar_v3.Calendar {
  if (cachedClient) return cachedClient;

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing OAuth env vars: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN",
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  cachedClient = google.calendar({ version: "v3", auth: oauth2Client });
  return cachedClient;
}

export function getCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID ?? "primary";
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
