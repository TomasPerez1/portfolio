"use client";
import { useState } from "react";
import { SectionHeader } from "./FeaturedWork";
import type { Identity } from "../../i18n/portfolio.types";

interface FieldProps {
  label: string;
  v: string;
  setV: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

function Field({ label, v, setV, placeholder, multiline }: FieldProps) {
  const sharedProps = {
    value: v,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV(e.target.value),
    placeholder,
    className: `w-full bg-bg text-fg border border-line rounded-[10px] font-body text-sm
                outline-none transition-colors focus:border-spark
                ${multiline ? "p-3.5 min-h-[110px] resize-y" : "h-11 px-3.5"}`,
  };
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      {multiline
        ? <textarea {...sharedProps} rows={4} />
        : <input {...sharedProps} />}
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
                           rounded-md border border-line-2 bg-transparent text-fg-soft">
          {action}
        </button>
      )}
    </div>
  );
}

interface CalendarCell {
  d: number;
  isAvailable: boolean;
  isHL: boolean;
}

function CalendarPreview() {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
  const cells: CalendarCell[] = Array.from({ length: 28 }, (_, i) => {
    const d = i + 1;
    return { d, isAvailable: [3, 4, 5, 8, 9, 10, 11, 16, 17, 22, 23, 24].includes(d), isHL: d === 9 };
  });
  return (
    <div className="rounded-[18px] border border-line bg-bg p-5">
      <div className="flex justify-between items-center mb-3.5">
        <span className="display text-lg font-semibold">May 2026</span>
        <div className="flex gap-2">
          <span className="w-7 h-7 rounded-lg border border-line-2 inline-grid place-items-center text-fg-soft">‹</span>
          <span className="w-7 h-7 rounded-lg border border-line-2 inline-grid place-items-center text-spark">›</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => <div key={d} className="text-center font-mono text-[10px] text-fg-faint tracking-[.1em]">{d}</div>)}
        {cells.map((c) => (
          <div
            key={c.d}
            className={`aspect-square rounded-lg grid place-items-center font-mono text-xs border
                        ${c.isHL ? "bg-spark text-white border-transparent font-semibold"
                                 : c.isAvailable ? "bg-card-2 text-fg border-line-2"
                                 : "bg-transparent text-fg-faint border-transparent"}`}
          >
            {c.d}
          </div>
        ))}
      </div>
      <div className="mt-3.5 font-mono text-[11px] text-fg-soft">12 slots available · 30 min each</div>
    </div>
  );
}

export interface ContactProps {
  identity: Pick<Identity, "email" | "phone" | "location" | "timezone">;
}

export default function Contact({ identity }: ContactProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); setName(""); setSubject(""); setMessage(""); }, 2400);
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
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Name" v={name} setV={setName} placeholder="Your name" />
            <Field label="Subject" v={subject} setV={setSubject} placeholder="Quick line" />
          </div>
          <Field label="Message" v={message} setV={setMessage} placeholder="What's on your mind?" multiline />

          <button type="submit" className="btn btn-primary self-start mt-1.5">
            {sent ? "Sent ✓" : "Send message"}
          </button>

          <div className="mt-1.5 pt-[18px] border-t border-line flex flex-col gap-3">
            <ContactRow icon="mail" label={identity.email} action={copied ? "Copied ✓" : "Copy"} onAction={copyEmail} />
            <ContactRow icon="phone" label={identity.phone} />
            <ContactRow icon="pin" label={`${identity.location} · ${identity.timezone}`} />
          </div>
        </form>

        <div
          className="p-8 rounded-[28px] border border-line flex flex-col justify-between gap-6"
          style={{ background: "radial-gradient(circle at 80% 0%, rgba(181,33,255,.12), transparent 60%), var(--c-card)" }}
        >
          <div>
            <div className="eyebrow mb-[18px]">Book a call</div>
            <h3 className="display m-0 text-[clamp(28px,3vw,40px)] tracking-tightish2 leading-tight">
              30 minutes — let&apos;s see if we click.
            </h3>
            <p className="mt-3.5 text-fg-soft max-w-[44ch]">
              For recruiters, founders or fellow devs. Pick a slot — meeting link arrives instantly.
            </p>
          </div>
          <CalendarPreview />
          {/* TODO(phase-7): wire to Calendly embed/URL */}
          <a className="btn btn-primary self-start" href="#">Open scheduler</a>
        </div>
      </div>
    </section>
  );
}
