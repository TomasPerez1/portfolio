"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Slot } from "../../api/calendar/_lib/types";

export interface BookingModalProps {
  slot: Slot;
  timezone?: string;
  onClose: () => void;
  onBooked: () => void;
}

export default function BookingModal({ slot, timezone, onClose, onBooked }: BookingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const slotLabel = formatSlot(slot, timezone);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Name and email required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotStart: slot.start,
          slotEnd: slot.end,
          name,
          email,
          message: message || undefined,
        }),
      });
      if (res.status === 409) {
        toast.error("Slot just got booked. Pick another.");
        onBooked();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        toast.error(data.error ?? "Booking failed");
        return;
      }
      toast.success("Meeting booked. Check your inbox for the calendar invite.");
      onBooked();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book a meeting"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[20px] bg-card border border-line p-6 sm:p-7 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow">Book a meeting</div>
            <div className="mt-1 display text-[22px] leading-tight tracking-tightish2">{slotLabel}</div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-line-2 text-fg-soft hover:text-fg transition-colors grid place-items-center text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 px-3.5 bg-bg text-fg border border-line rounded-[10px] text-sm outline-none focus:border-spark transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 px-3.5 bg-bg text-fg border border-line rounded-[10px] text-sm outline-none focus:border-spark transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Message (optional)</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="p-3.5 bg-bg text-fg border border-line rounded-[10px] text-sm outline-none focus:border-spark transition-colors min-h-[80px] resize-y"
            />
          </label>
          <p className="font-mono text-[11px] text-fg-faint">
            Your email is shared with Google Calendar to send the invite.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary self-start disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

function formatSlot(slot: Slot, timezone?: string): string {
  const start = new Date(slot.start);
  return start.toLocaleString("en-US", {
    timeZone: timezone || undefined,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
