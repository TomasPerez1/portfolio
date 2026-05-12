"use client";
import { motion, useReducedMotion } from "framer-motion";
import { noMotion, sectionReveal } from "./_animations";
import { useState } from "react";
import type { FeaturedProject, SectionHeaderCopy } from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";

export default function FeaturedWork({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <FeaturedWorkSection items={data.featured} header={data.sectionHeaders.featured} />;
}

const TICKER_ITEMS = [
  "React", "Next.js", "Node.js", "NestJS", "TypeScript", "Tailwind CSS", "Express",
  "PostgreSQL", "MySQL", "Prisma", "Sequelize", "Docker", "GitHub Actions", "AWS", "Prisma",
  "Auth0", "Redis", "Claude Code", "OpenShift", "Oracle SQL"
];

export function StackTicker() {
  return (
    <section aria-label="Tech stack" className="border-y border-line py-[22px] overflow-hidden bg-card">
      <div className="flex gap-14 whitespace-nowrap animate-ticker">
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3.5 font-display font-semibold
                                   text-[clamp(20px,2.6vw,36px)] tracking-tightish2 text-fg">
            {t}
            <span className="w-2.5 h-2.5 rounded-full bg-spark shrink-0" />
          </span>
        ))}
      </div>
    </section>
  );
}

export interface SectionHeaderProps {
  index: string;
  kicker: string;
  title: string;
  hint?: string;
}

export function SectionHeader({ index, kicker, title, hint }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start gap-6 mb-14">
      <div className="flex items-baseline gap-3.5 text-fg-soft font-mono text-xs tracking-[.12em]">
        <span className="text-fg-faint">{index}</span>
        <span className="w-6 h-px bg-line-2" />
        <span className="uppercase">{kicker}</span>
      </div>
      <div className="flex-1 min-w-[280px]">
        <h2 className="display display-l m-0 max-w-[14ch]">{title}</h2>
        {hint && <p className="mt-[18px] text-fg-soft max-w-[56ch]">{hint}</p>}
      </div>
    </div>
  );
}

export function FeaturedCard({ p }: { p: FeaturedProject }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={p.link}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className={`relative grid gap-[clamp(20px,3vw,56px)] p-[clamp(20px,2.4vw,32px)]
                  bg-card rounded-[28px] overflow-hidden transition-all
                  grid-cols-1 md:[grid-template-columns:minmax(0,1.05fr)_minmax(0,.95fr)]
                  ${hover ? "border-line-2 -translate-y-0.5" : "border-line"} border`}
    >
      <div className="relative aspect-[16/11] rounded-[18px] overflow-hidden bg-card-2 border border-line">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{
            backgroundImage: `url(${p.image})`,
            transform: hover ? "scale(1.04)" : "scale(1)",
            filter: "saturate(.9)",
          }}
        />
        <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur
                        font-mono text-[11px] tracking-[.08em] border border-white/20 text-white">
          {p.n} · {p.year}
        </div>
        <div
          className="absolute inset-0 pointer-events-none transition-[background] duration-300"
          style={{ background: hover ? "linear-gradient(135deg, rgba(181,33,255,.2), transparent 60%)" : "transparent" }}
        />
      </div>

      <div className="flex flex-col gap-[18px] p-2 pl-1">
        <span className="eyebrow text-spark">{p.kicker}</span>
        <h3 className="display m-0 text-[clamp(32px,4vw,56px)] leading-none tracking-tightish">{p.title}</h3>
        <p className="m-0 text-fg-soft max-w-[52ch]">{p.blurb}</p>

        <div className="flex flex-wrap gap-2">
          {p.stack.map((s) => <span key={s} className="chip">{s}</span>)}
        </div>

        <div className="mt-auto pt-[18px] border-t border-line grid grid-cols-3 gap-4">
          {p.metrics.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1">
              <span className="eyebrow">{k}</span>
              <span className="display tabular-nums text-[clamp(20px,2vw,28px)] leading-tight">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono text-xs text-fg-soft">{p.role}</span>
          <span className={`inline-flex items-center gap-2 font-mono text-xs transition-colors ${hover ? "text-spark" : "text-fg"}`}>
            View case study
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 className={`transition-transform duration-200 ${hover ? "translate-x-[3px] -translate-y-[3px]" : ""}`}>
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}

interface FeaturedWorkSectionProps {
  items: readonly FeaturedProject[];
  header: SectionHeaderCopy;
}

function FeaturedWorkSection({ items, header }: FeaturedWorkSectionProps) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id="work"
      data-screen-label="02 Selected Work"
      className="px-[clamp(20px,5vw,96px)] py-[clamp(72px,10vw,140px)]"
      variants={reduce ? noMotion : sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <SectionHeader
        index={header.index}
        kicker={header.kicker}
        title={header.title}
        hint={header.hint}
      />
      <div className="flex flex-col gap-[clamp(18px,2.5vw,28px)]">
        {items.map((p) => <FeaturedCard key={p.id} p={p} />)}
      </div>
    </motion.section>
  );
}
