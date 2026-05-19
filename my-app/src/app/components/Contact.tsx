"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";

const COOLDOWN_MS = 90_000;
const COOLDOWN_STORAGE_KEY = "contact_last_send_at";

function formatErrorToast(code: string | number, errorMsg: string): string {
  return `Err (${code}): ${errorMsg}`;
}
import { SectionHeader } from "./FeaturedWork";
import { noMotion, sectionReveal } from "./_animations";
import CalendarWidget from "../ui/CalendarWidget";
import BookingModal from "../ui/BookingModal";
import type { ContactCopy, Identity, StackHeaderCopy } from "../i18n/portfolio.types";
import type { Slot } from "../api/calendar/_lib/types";
import { usePortfolioData } from "../i18n/usePortfolioData";

export default function Contact({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return (
    <ContactSection
      identity={data.identity}
      copy={data.contact}
      header={data.sectionHeaders.contact}
      lang={lang}
    />
  );
}

interface FieldProps {
  label: string;
  v: string;
  setV: (next: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  required?: boolean;
  disabled?: boolean;
}

function Field({ label, v, setV, placeholder, type = "text", multiline, required, disabled }: FieldProps) {
  const sharedProps = {
    value: v,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV(e.target.value),
    placeholder,
    required,
    disabled,
    className: `w-full bg-bg text-fg border border-line rounded-[10px] font-body text-sm
                outline-none transition-colors focus:border-spark
                disabled:opacity-60 disabled:cursor-not-allowed
                ${multiline ? "p-3.5 min-h-[110px] resize-y" : "h-11 px-3.5"}`,
  };
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}{required && <span className="text-spark"> *</span>}</span>
      {multiline
        ? <textarea {...sharedProps} rows={4} />
        : <input type={type} {...sharedProps} />}
    </label>
  );
}

type IconName = "mail" | "phone" | "pin";

function Icon({ name }: { name: IconName }) {
  const sw = 1.8;
  if (name === "mail") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
  if (name === "phone") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1.05.37 2.07.7 3.04a2 2 0 01-.45 2.11L8.09 10.18a16 16 0 006 6l1.31-1.31a2 2 0 012.11-.45c.97.33 1.99.57 3.04.7A2 2 0 0122 16.92z" /></svg>;
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}

interface ContactRowProps {
  icon: IconName;
  label: string;
  href?: string;
  external?: boolean;
  ariaLabel?: string;
  action?: string;
  onAction?: () => void;
}

function ContactRow({ icon, label, href, external, ariaLabel, action, onAction }: ContactRowProps) {
  const content = (
    <>
      <span className="w-7 h-7 rounded-lg border border-line-2 inline-grid place-items-center text-fg-soft shrink-0 group-hover:text-spark group-hover:border-spark transition-colors">
        <Icon name={icon} />
      </span>
      <span className="font-mono text-[13px] truncate group-hover:text-fg transition-colors">{label}</span>
    </>
  );

  return (
    <div className="flex items-center gap-3 justify-between">
      {href ? (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          aria-label={ariaLabel}
          className="group flex items-center gap-3 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-spark rounded-md"
        >
          {content}
        </a>
      ) : (
        <div className="group flex items-center gap-3 min-w-0">{content}</div>
      )}
      {action && (
        <button onClick={onAction} type="button"
                className="font-mono text-[11px] tracking-[.08em] uppercase px-2.5 py-1
                           rounded-md border border-line-2 bg-transparent text-fg-soft hover:text-fg transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}

interface ContactSectionProps {
  identity: Pick<Identity, "email" | "phone" | "location" | "timezone">;
  copy: ContactCopy;
  header: StackHeaderCopy;
  lang: string;
}

function ContactSection({ identity, copy, header, lang }: ContactSectionProps) {
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pickedDaySlots, setPickedDaySlots] = useState<Slot[] | null>(null);
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const tick = () => {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(COOLDOWN_STORAGE_KEY) : null;
      const last = raw ? Number(raw) : 0;
      const remaining = Math.max(0, COOLDOWN_MS - (Date.now() - last));
      setRemainingMs(remaining);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const cooldownActive = remainingMs > 0;
  const remainingSec = Math.ceil(remainingMs / 1000);
  const disabled = submitting || cooldownActive;

  const mailtoHref = `mailto:${identity.email}`;
  const whatsappHref = `https://wa.me/${identity.phone.replace(/[^0-9]/g, "")}`;
  const mapsHref = copy.mapsUrl;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cooldownActive) {
      toast.error(formatErrorToast("COOLDOWN", copy.toast.error));
      return;
    }
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      toast.error(formatErrorToast("VALIDATION", copy.toast.error));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
          website,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: null }));
        if (data.error === "RATE_LIMIT") {
          const minutes = Math.max(1, Math.ceil((data.retryAfterSec ?? 60) / 60));
          toast.error(copy.toast.rateLimit.replace("{minutes}", `${minutes} min`));
          return;
        }
        const errorMap: Record<string, string> = {
          INVALID_EMAIL_FORMAT: copy.toast.invalidEmail,
          INVALID_EMAIL_DOMAIN: copy.toast.invalidEmail,
          DISPOSABLE_EMAIL: copy.toast.disposableEmail,
        };
        const mapped = errorMap[data.error];
        toast.error(mapped ?? formatErrorToast(res.status, copy.toast.error));
        return;
      }
      toast.success(copy.toast.success);
      setName(""); setEmail(""); setSubject(""); setMessage(""); setWebsite("");
      window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(Date.now()));
      setRemainingMs(COOLDOWN_MS);
    } catch {
      toast.error(formatErrorToast("NETWORK", copy.toast.error));
    } finally {
      setSubmitting(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText(identity.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.section
      id="contact"
      data-screen-label={header.screenLabel}
      className="px-[clamp(20px,5vw,96px)] py-[clamp(72px,10vw,140px)]"
      variants={reduce ? noMotion : sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <SectionHeader index={header.index} kicker={header.kicker} title={header.title} />

      <div className="grid gap-[clamp(20px,2.5vw,32px)] grid-cols-1 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="p-8 rounded-[28px] bg-card border border-line flex flex-col gap-[18px]">
          <div className="flex flex-wrap justify-between items-center gap-2.5">
            <div className="eyebrow">{copy.formEyebrow}</div>
            <span className="badge"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {copy.repliesBadge}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field label={copy.formLabels.name} v={name} setV={setName} placeholder={copy.formPlaceholders.name} required disabled={disabled} />
            <Field label={copy.formLabels.email} v={email} setV={setEmail} placeholder={copy.formPlaceholders.email} type="email" required disabled={disabled} />
          </div>
          <Field label={copy.formLabels.subject} v={subject} setV={setSubject} placeholder={copy.formPlaceholders.subject} required disabled={disabled} />
          <Field label={copy.formLabels.message} v={message} setV={setMessage} placeholder={copy.formPlaceholders.message} multiline required disabled={disabled} />

          <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          <button type="submit" disabled={disabled} className="btn btn-primary self-start mt-1.5 disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting
              ? copy.submittingLabel
              : cooldownActive
                ? copy.cooldownLabel.replace("{seconds}", String(remainingSec))
                : copy.submitLabel}
          </button>

          <div className="mt-1.5 pt-[18px] border-t border-line flex flex-col gap-3">
            <ContactRow
              icon="mail"
              label={identity.email}
              href={mailtoHref}
              ariaLabel={`Email ${identity.email}`}
              action={copied ? copy.copiedLabel : copy.copyLabel}
              onAction={copyEmail}
            />
            <ContactRow
              icon="phone"
              label={identity.phone}
              href={whatsappHref}
              external
              ariaLabel={`WhatsApp ${identity.phone}`}
            />
            <ContactRow
              icon="pin"
              label={`${identity.location} · ${identity.timezone}`}
              href={mapsHref}
              external
              ariaLabel={`Google Maps · ${identity.location}`}
            />
          </div>
        </form>

        <div
          className="p-8 rounded-[28px] border border-line flex flex-col gap-6"
          style={{ background: "radial-gradient(circle at 80% 0%, rgba(181,33,255,.12), transparent 60%), var(--c-card)" }}
        >
          <div>
            <div className="eyebrow mb-[18px]">{copy.booking.eyebrow}</div>
            <h3 className="display m-0 text-[clamp(28px,3vw,40px)] tracking-tightish2 leading-tight">
              {copy.booking.title}
            </h3>
            <p className="mt-3.5 text-fg-soft max-w-[44ch]">
              {copy.booking.lead}
            </p>
          </div>
          <CalendarWidget
            refreshKey={calendarRefresh}
            onDayClick={(slots) => setPickedDaySlots(slots)}
          />
        </div>
      </div>

      {pickedDaySlots && (
        <BookingModal
          daySlots={pickedDaySlots}
          copy={copy.bookingModal}
          lang={lang}
          onClose={() => setPickedDaySlots(null)}
          onBooked={() => {
            setPickedDaySlots(null);
            setCalendarRefresh((k) => k + 1);
          }}
        />
      )}
    </motion.section>
  );
}
