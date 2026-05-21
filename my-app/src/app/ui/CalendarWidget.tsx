"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import type { Slot } from "../api/calendar/_lib/types";
import type { CalendarCopy } from "../i18n/portfolio.types";

export interface CalendarWidgetProps {
  onDayClick: (slots: Slot[]) => void;
  copy: CalendarCopy;
  refreshKey?: number;
}

interface DayCell {
  date: Date;
  inMonth: boolean;
  slots: Slot[];
  isPast: boolean;
}

const MAX_MONTHS_AHEAD = 6;

type AvailabilityState =
  | { status: "loading" }
  | { status: "ready"; slots: Slot[]; timezone: string }
  | { status: "error"; error: string };

type AvailabilityAction =
  | { type: "reset" }
  | { type: "success"; slots: Slot[]; timezone: string }
  | { type: "error"; error: string };

function availabilityReducer(_state: AvailabilityState, action: AvailabilityAction): AvailabilityState {
  switch (action.type) {
    case "reset":
      return { status: "loading" };
    case "success":
      return { status: "ready", slots: action.slots, timezone: action.timezone };
    case "error":
      return { status: "error", error: action.error };
  }
}

export default function CalendarWidget({ onDayClick, copy, refreshKey = 0 }: CalendarWidgetProps) {
  const [availability, dispatch] = useReducer(availabilityReducer, { status: "loading" } as AvailabilityState);
  const [today, setToday] = useState<Date | null>(null);
  const [cursor, setCursor] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(startOfDay(now));
    setCursor((prev) => prev ?? startOfMonth(now));
  }, []);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "reset" });
    fetch("/api/calendar/slots")
      .then((r) => r.json())
      .then((data: { slots?: Slot[]; timezone?: string; error?: string }) => {
        if (cancelled) return;
        if (data.error) {
          dispatch({ type: "error", error: data.error });
        } else {
          dispatch({ type: "success", slots: data.slots ?? [], timezone: data.timezone ?? "" });
        }
      })
      .catch((e) => {
        if (cancelled) return;
        dispatch({ type: "error", error: e instanceof Error ? e.message : "Failed to load" });
      });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const slots: Slot[] = availability.status === "ready" ? availability.slots : [];
  const cells: DayCell[] = useMemo(
    () => (cursor && today ? buildMonthCells(cursor, slots, today) : []),
    [cursor, slots, today],
  );

  if (!cursor || !today || availability.status === "loading") {
    return (
      <div className="rounded-[18px] border border-line bg-bg p-5 min-h-[330px] flex items-center justify-center text-fg-soft font-mono text-xs">
        {copy.loadingLabel}
      </div>
    );
  }

  const monthLabel = `${copy.months[cursor.getMonth()]} ${cursor.getFullYear()}`;
  const timezone = availability.status === "ready" ? availability.timezone : "";
  const errorMsg = availability.status === "error" ? availability.error : null;

  return (
    <div className="rounded-[18px] border border-line bg-bg p-5">
      <div className="flex justify-between items-center mb-3.5">
        <span className="display text-lg font-semibold">{monthLabel}</span>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={copy.prevMonthLabel}
            onClick={() => setCursor(addMonths(cursor, -1))}
            disabled={isSameMonth(cursor, today)}
            className="w-7 h-7 rounded-lg border border-line-2 inline-grid place-items-center text-fg-soft hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={copy.nextMonthLabel}
            onClick={() => setCursor(addMonths(cursor, 1))}
            disabled={monthsBetween(today, cursor) >= MAX_MONTHS_AHEAD}
            className="w-7 h-7 rounded-lg border border-line-2 inline-grid place-items-center text-fg-soft hover:text-spark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {copy.weekdays.map((d) => (
          <div key={d} className="text-center font-mono text-[10px] text-fg-faint tracking-[.1em]">{d}</div>
        ))}
        {cells.map((cell) => {
          const hasSlots = cell.slots.length > 0;
          const disabled = !cell.inMonth || cell.isPast || !hasSlots;
          const cellKey = cell.inMonth ? `m-${cell.date.toISOString()}` : `pad-${cell.date.getTime()}`;
          return (
            <button
              key={cellKey}
              type="button"
              disabled={disabled}
              onClick={() => hasSlots && onDayClick(cell.slots)}
              className={`aspect-square rounded-lg grid place-items-center font-mono text-xs border transition-colors
                ${!cell.inMonth ? "bg-transparent text-transparent border-transparent" : ""}
                ${cell.inMonth && cell.isPast ? "bg-transparent text-fg-faint border-transparent" : ""}
                ${cell.inMonth && !cell.isPast && hasSlots ? "bg-card-2 text-fg border-line-2 hover:bg-spark hover:text-white hover:border-transparent cursor-pointer" : ""}
                ${cell.inMonth && !cell.isPast && !hasSlots ? "bg-transparent text-fg-faint border-transparent" : ""}
              `}
              aria-label={cell.inMonth ? `${cell.date.getDate()} — ${cell.slots.length} ${cell.slots.length === 1 ? copy.slotSingular : copy.slotPlural}` : copy.emptyLabel}
            >
              {cell.inMonth ? cell.date.getDate() : ""}
            </button>
          );
        })}
      </div>
      <div className="mt-3.5 font-mono text-[11px] text-fg-soft">
        {errorMsg
          ? <span className="text-rose-400">{copy.errorPrefix}: {errorMsg}</span>
          : `· ${timezone.replaceAll('/', ', ').replaceAll('_', ' ') || "—"}`}
      </div>
    </div>
  );
}

function buildMonthCells(cursor: Date, slots: readonly Slot[], today: Date): DayCell[] {
  const first = startOfMonth(cursor);
  const startWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: DayCell[] = [];

  const slotsByDay = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = new Date(slot.start).toDateString();
    const list = slotsByDay.get(key) ?? [];
    list.push(slot);
    slotsByDay.set(key, list);
  }

  for (let i = 0; i < startWeekday; i++) {
    const padDate = new Date(cursor.getFullYear(), cursor.getMonth(), -(startWeekday - 1 - i));
    cells.push({ date: padDate, inMonth: false, slots: [], isPast: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    const isPast = date.getTime() < today.getTime();
    const daySlots = slotsByDay.get(date.toDateString()) ?? [];
    cells.push({ date, inMonth: true, slots: daySlots, isPast });
  }
  let trailing = 1;
  while (cells.length % 7 !== 0) {
    const padDate = new Date(cursor.getFullYear(), cursor.getMonth() + 1, trailing++);
    cells.push({ date: padDate, inMonth: false, slots: [], isPast: false });
  }
  return cells;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}
