"use client";
import { useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "./FeaturedWork";
import CalendarWidget from "../ui/CalendarWidget";
import BookingModal from "../ui/BookingModal";
import type { Identity } from "../i18n/portfolio.types";
import type { Slot } from "../api/calendar/_lib/types";
import { usePortfolioData } from "../i18n/usePortfolioData";

export default function Contact({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <ContactSection identity={data.identity} />;
}

interface FieldProps {
  label: string;
  v: string;
  setV: (next: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  required?: boolean;
}

function Field({ label, v, setV, placeholder, type = "text", multiline, required }: FieldProps) {
  const sharedProps = {
    value: v,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV(e.target.value),
    placeholder,
    required,
    className: `w-full bg-bg text-fg border border-line rounded-[10px] font-body text-sm
                outline-none transition-colors focus:border-spark
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
  action?: string;
  onAction?: () => void;
}

function ContactRow({ icon, label, action, onAction }: ContactRowProps) {
  return (
    <div className="flex items-center gap-3 justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-7 h-7 rounded-lg border border-line-2 inline-grid place-items-center text-fg-soft shrink-0">
          <Icon name={icon} />
        </span>
        <span className="font-mono text-[13px] truncate">{label}</span>
      </div>
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
}

function ContactSection({ identity }: ContactSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<Slot | null>(null);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown" }));
        toast.error(data.error ?? "Send failed");
        return;
      }
      toast.success("Message sent — I'll get back to you soon.");
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
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
    <section id="contact" data-screen-label="07 Contact" className="px-[clamp(20px,5vw,96px)] py-[clamp(72px,10vw,140px)]">
      <SectionHeader index="§ 06" kicker="Contact" title="Let's build something." />

      <div className="grid gap-[clamp(20px,2.5vw,32px)] grid-cols-1 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="p-8 rounded-[28px] bg-card border border-line flex flex-col gap-[18px]">
          <div className="flex flex-wrap justify-between items-center gap-2.5">
            <div className="eyebrow">Send a message</div>
            <span className="badge"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Replies within 24h</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field label="Name" v={name} setV={setName} placeholder="Your name" required />
            <Field label="Email" v={email} setV={setEmail} placeholder="you@example.com" type="email" required />
          </div>
          <Field label="Subject" v={subject} setV={setSubject} placeholder="Quick line" required />
          <Field label="Message" v={message} setV={setMessage} placeholder="What's on your mind?" multiline required />

          <button type="submit" disabled={submitting} className="btn btn-primary self-start mt-1.5 disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? "Sending…" : "Send message"}
          </button>

          <div className="mt-1.5 pt-[18px] border-t border-line flex flex-col gap-3">
            <ContactRow icon="mail" label={identity.email} action={copied ? "Copied ✓" : "Copy"} onAction={copyEmail} />
            <ContactRow icon="phone" label={identity.phone} />
            <ContactRow icon="pin" label={`${identity.location} · ${identity.timezone}`} />
          </div>
        </form>

        <div
          className="p-8 rounded-[28px] border border-line flex flex-col gap-6"
          style={{ background: "radial-gradient(circle at 80% 0%, rgba(181,33,255,.12), transparent 60%), var(--c-card)" }}
        >
          <div>
            <div className="eyebrow mb-[18px]">Book a call</div>
            <h3 className="display m-0 text-[clamp(28px,3vw,40px)] tracking-tightish2 leading-tight">
              30 minutes — let&apos;s see if we click.
            </h3>
            <p className="mt-3.5 text-fg-soft max-w-[44ch]">
              For recruiters, founders or fellow devs. Pick a slot — calendar invite arrives instantly.
            </p>
          </div>
          <CalendarWidget
            refreshKey={calendarRefresh}
            onSlotClick={(slot) => setPickedSlot(slot)}
          />
        </div>
      </div>

      {pickedSlot && (
        <BookingModal
          slot={pickedSlot}
          timezone={identity.timezone}
          onClose={() => setPickedSlot(null)}
          onBooked={() => {
            setPickedSlot(null);
            setCalendarRefresh((k) => k + 1);
          }}
        />
      )}
    </section>
  );
}
