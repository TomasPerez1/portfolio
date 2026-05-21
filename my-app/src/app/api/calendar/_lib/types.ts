/**
 * A bookable time slot, expressed as ISO-8601 datetimes (UTC).
 * The frontend converts to/from the owner's timezone for display.
 */
export interface Slot {
  start: string;
  end: string;
}

/**
 * A busy time range returned by Google Calendar's freebusy API.
 */
export interface BusyRange {
  start: string;
  end: string;
}

/**
 * Request body for POST /api/calendar/book.
 */
export interface BookingRequest {
  slotStart: string;
  slotEnd: string;
  name: string;
  email: string;
  message?: string;
}

/**
 * Response body for GET /api/calendar/slots.
 */
export interface SlotsResponse {
  slots: Slot[];
  timezone: string;
}

/**
 * Schedule configuration sourced from env vars.
 */
export interface ScheduleConfig {
  timezone: string;
  workHoursStart: number;
  workHoursEnd: number;
  slotDurationMin: number;
  slotBufferMin: number;
}
