"use client";

import { m, useReducedMotion } from "framer-motion";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { noMotion, sectionReveal } from "./_animations";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const GITHUB_URL = "https://github.com/Pelucheado";

export default function Footer({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  const reduce = useReducedMotion();
  if (!ready || !data) return null;
  const links: readonly FooterLink[] = [
    { label: "GitHub", href: GITHUB_URL, external: true },
    { label: "LinkedIn", href: `https://${data.identity.linkedin}`, external: true },
    { label: "Email", href: `mailto:${data.identity.email}` },
    { label: "CV", href: data.cv, external: true },
  ];
  return (
    <m.footer
      className="px-[clamp(20px,5vw,96px)] py-14 border-t border-line flex flex-col gap-8"
      variants={reduce ? noMotion : sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex flex-wrap justify-between items-end gap-6">
        <div className="display text-[clamp(48px,9vw,140px)] tracking-tightest leading-[.9]">
          tperez<span className="text-spark">.</span>dev
        </div>
        <div className="flex flex-wrap gap-2.5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="btn h-[38px] px-3.5 text-[13px] bg-transparent"
            >
              {link.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" /></svg>
            </a>
          ))}
        </div>
      </div>
      <div className="h-px w-full bg-line" />
      <div className="flex flex-wrap justify-between gap-3 font-mono text-xs text-fg-soft">
        <span>© 2026 Tomás Pérez · Built with Next.js, Tailwind, Framer Motion & 🧉☕</span>
      </div>
    </m.footer>
  );
}
