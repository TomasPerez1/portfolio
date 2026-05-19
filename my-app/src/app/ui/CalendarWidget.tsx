"use client";

import { useEffect, useMemo, useState } from "react";
import type { Slot } from "../api/calendar/_lib/types";

export interface CalendarWidgetProps {
  onDayClick: (slots: Slot[]) => void;
  refreshKey?: number;
}

interface DayCell {
  date: Date;
  inMonth: boolean;
  slots: Slot[];
  isPast: boolean;
}

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const MONTH_LABELS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarWidget({ onDayClick, refreshKey = 0 }: CalendarWidgetProps) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [timezone, setTimezone] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()));

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setError(null);
    fetch("/api/calendar/slots")
      .then((r) => r.json())
      .then((data: { slots?: Slot[]; timezone?: string; error?: string }) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setSlots([]);
        } else {
          setSlots(data.slots ?? []);
          setTimezone(data.timezone ?? "");
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
        setSlots([]);
      });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const cells: DayCell[] = useMemo(() => buildMonthCells(cursor, slots ?? []), [cursor, slots]);
  const monthLabel = `${MONTH_LABELS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  const totalAvailable = (slots ?? []).length;

  const loading = slots === null;

  if (loading) {
    return (
      <div className="rounded-[18px] border border-line bg-bg p-5 min-h-[330px] flex items-center justify-center text-fg-soft font-mono text-xs">
        Loading availability…
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-line bg-bg p-5">
      <div className="flex justify-between items-center mb-3.5">
        <span className="display text-lg font-semibold">{monthLabel}</span>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor(addMonths(cursor, -1))}
            disabled={isSameMonth(cursor, new Date())}
            className="w-7 h-7 rounded-lg border border-line-2 inline-grid place-items-center text-fg-soft hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="w-7 h-7 rounded-lg border border-line-2 inline-grid place-items-center text-fg-soft hover:text-spark transition-colors"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center font-mono text-[10px] text-fg-faint tracking-[.1em]">{d}</div>
        ))}
        {cells.map((cell, i) => {
          const hasSlots = cell.slots.length > 0;
          const disabled = !cell.inMonth || cell.isPast || !hasSlots;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => hasSlots && onDayClick(cell.slots)}
              className={`aspect-square rounded-lg grid place-items-center font-mono text-xs border transition-colors
                ${!cell.inMonth ? "bg-transparent text-transparent border-transparent" : ""}
                ${cell.inMonth && cell.isPast ? "bg-transparent text-fg-faint border-transparent" : ""}
                ${cell.inMonth && !cell.isPast && hasSlots ? "bg-card-2 text-fg border-line-2 hover:bg-spark hover:text-white hover:border-transparent cursor-pointer" : ""}
                ${cell.inMonth && !cell.isPast && !hasSlots ? "bg-transparent text-fg-faint border-transparent" : ""}
              `}
              aria-label={cell.inMonth ? `${cell.date.getDate()} — ${cell.slots.length} slot${cell.slots.length === 1 ? "" : "s"}` : "Empty"}
            >
              {cell.inMonth ? cell.date.getDate() : ""}
            </button>
          );
        })}
      </div>
      <div className="mt-3.5 font-mono text-[11px] text-fg-soft">
        {error
          ? <span className="text-rose-400">Error: {error}</span>
          : `${totalAvailable} slots available · ${timezone || "—"}`}
      </div>
    </div>
  );
}

function buildMonthCells(cursor: Date, slots: readonly Slot[]): DayCell[] {
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
    cells.push({ date: new Date(0), inMonth: false, slots: [], isPast: false });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    const isPast = date.getTime() < today.getTime();
    const daySlots = slotsByDay.get(date.toDateString()) ?? [];
    cells.push({ date, inMonth: true, slots: daySlots, isPast });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(0), inMonth: false, slots: [], isPast: false });
  }
  return cells;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

