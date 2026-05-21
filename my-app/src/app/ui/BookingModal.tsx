"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Slot } from "../api/calendar/_lib/types";
import type { BookingModalCopy } from "../i18n/portfolio.types";

export interface BookingModalProps {
  daySlots: Slot[];
  copy: BookingModalCopy;
  lang: string;
  onClose: () => void;
  onBooked: () => void;
}

export default function BookingModal({ daySlots, copy, lang, onClose, onBooked }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<Slot>(daySlots[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const localeTag = lang === "es" ? "es-AR" : "en-US";
  const dateLabel = formatDate(selectedSlot.start, localeTag);
  const timeLabel = formatTime(selectedSlot.start, localeTag);
  const localTzHint = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hasMultipleSlots = daySlots.length > 1;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedEmail) {
      toast.error(copy.validationError);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage || undefined,
        }),
      });
      if (res.status === 409) {
        toast.error(copy.slotTakenError);
        onBooked();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: copy.fallbackError }));
        if (data.error === "RATE_LIMIT") {
          const minutes = Math.max(1, Math.ceil((data.retryAfterSec ?? 60) / 60));
          toast.error(copy.rateLimitError.replace("{minutes}", `${minutes} min`));
          return;
        }
        const errorMap: Record<string, string> = {
          INVALID_EMAIL_FORMAT: copy.invalidEmailError,
          INVALID_EMAIL_DOMAIN: copy.invalidEmailError,
          DISPOSABLE_EMAIL: copy.disposableEmailError,
        };
        toast.error(errorMap[data.error] ?? data.error ?? copy.fallbackError);
        return;
      }
      toast.success(copy.successMsg);
      onBooked();
    } catch {
      toast.error(copy.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.eyebrow}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[20px] bg-card border border-line p-6 sm:p-7 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow">{copy.eyebrow}</div>
            <div className="mt-1 display text-[22px] leading-tight tracking-tightish2">
              {dateLabel} · {timeLabel}
            </div>
            <div className="font-mono text-[11px] text-fg-faint mt-1">
              {copy.localTimePrefix} · {localTzHint}
            </div>
          </div>
          <button
            type="button"
            aria-label={copy.closeLabel}
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-line-2 text-fg-soft hover:text-fg transition-colors grid place-items-center text-lg leading-none shrink-0"
          >
            ×
          </button>
        </div>

        {hasMultipleSlots && (
          <div className="flex flex-col gap-2">
            <span className="eyebrow">{copy.timePickerLabel}</span>
            <div className="flex flex-wrap gap-1.5">
              {daySlots.map((slot) => {
                const isSelected = slot.start === selectedSlot.start;
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors
                      ${isSelected
                        ? "bg-spark text-white border-transparent"
                        : "bg-card-2 text-fg border-line-2 hover:border-spark"}`}
                  >
                    {formatTime(slot.start, localeTag)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">{copy.nameLabel}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 px-3.5 bg-bg text-fg border border-line rounded-[10px] text-sm outline-none focus:border-spark transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">{copy.emailLabel}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 px-3.5 bg-bg text-fg border border-line rounded-[10px] text-sm outline-none focus:border-spark transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">{copy.messageLabel}</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="p-3.5 bg-bg text-fg border border-line rounded-[10px] text-sm outline-none focus:border-spark transition-colors min-h-[80px] resize-y"
            />
          </label>
          <p className="font-mono text-[11px] text-fg-faint">{copy.privacyNote}</p>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary self-start disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? copy.confirmingLabel : copy.confirmLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
