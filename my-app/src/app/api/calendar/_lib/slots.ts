import type { BusyRange, ScheduleConfig, Slot } from "./types";

/**
 * Generates all candidate slots within the next `days` days, restricted to the
 * configured working hours (Mon-Fri). Slot times are produced in the owner's
 * timezone and emitted as UTC ISO strings.
 */
export function generateSlots(from: Date, days: number, config: ScheduleConfig): Slot[] {
  const { workHoursStart, workHoursEnd, slotDurationMin, timezone } = config;
  const slots: Slot[] = [];

  for (let d = 0; d < days; d++) {
    const dayInTz = shiftDateByDaysInTz(from, d, timezone);
    const weekday = dayInTz.weekday;
    if (weekday === 0 || weekday === 6) continue;

    for (let minutesIntoDay = workHoursStart * 60; minutesIntoDay + slotDurationMin <= workHoursEnd * 60; minutesIntoDay += slotDurationMin) {
      const hour = Math.floor(minutesIntoDay / 60);
      const minute = minutesIntoDay % 60;
      const startUtc = zonedTimeToUtc(dayInTz.year, dayInTz.month, dayInTz.day, hour, minute, timezone);
      if (startUtc.getTime() <= from.getTime()) continue;
      const endUtc = new Date(startUtc.getTime() + slotDurationMin * 60_000);
      slots.push({ start: startUtc.toISOString(), end: endUtc.toISOString() });
    }
  }

  return slots;
}

/**
 * Removes slots that overlap with busy ranges, accounting for the buffer
 * between meetings.
 */
export function filterAvailable(slots: Slot[], busy: readonly BusyRange[], bufferMin: number): Slot[] {
  const bufferMs = bufferMin * 60_000;
  return slots.filter((slot) => {
    const slotStart = Date.parse(slot.start);
    const slotEnd = Date.parse(slot.end);
    return !busy.some((range) => {
      const busyStart = Date.parse(range.start) - bufferMs;
      const busyEnd = Date.parse(range.end) + bufferMs;
      return slotStart < busyEnd && slotEnd > busyStart;
    });
  });
}

/**
 * Returns true if the given slot is still bookable (not overlapping any busy
 * range plus buffer).
 */
export function isSlotAvailable(slot: Slot, busy: readonly BusyRange[], bufferMin: number): boolean {
  return filterAvailable([slot], busy, bufferMin).length === 1;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
}

function shiftDateByDaysInTz(base: Date, days: number, timezone: string): DateParts {
  const shifted = new Date(base.getTime() + days * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(shifted);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
}

/**
 * Converts a "wall clock" time in the given timezone into a UTC Date.
 * Uses Intl.DateTimeFormat to determine the offset for that specific instant.
 */
function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timezone: string): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const offsetMs = getTimezoneOffsetMs(new Date(utcGuess), timezone);
  return new Date(utcGuess - offsetMs);
}

function getTimezoneOffsetMs(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asIfUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asIfUtc - date.getTime();
}
