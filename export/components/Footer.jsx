"use client";

export default function Footer() {
  const links = ["GitHub", "LinkedIn", "Email", "CV"];
  return (
    <footer className="px-[clamp(20px,5vw,96px)] py-14 border-t border-line flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-end gap-6">
        <div className="display text-[clamp(48px,9vw,140px)] tracking-tightest leading-[.9]">
          tomas<span className="text-spark">.</span>dev
        </div>
        <div className="flex flex-wrap gap-2.5">
          {links.map((label) => (
            <a key={label} href="#" className="btn h-[38px] px-3.5 text-[13px] bg-transparent">
              {label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </a>
          ))}
        </div>
      </div>
      <div className="h-px w-full bg-line" />
      <div className="flex flex-wrap justify-between gap-3 font-mono text-xs text-fg-soft">
        <span>© 2026 Tomás Pérez · Built with React, Next.js & ☕</span>
        <span>v2 · Last updated May 2026</span>
      </div>
    </footer>
  );
}
