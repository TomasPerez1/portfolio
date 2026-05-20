"use client";
import { m, useReducedMotion } from "framer-motion";
import { noMotion, sectionReveal } from "./_animations";
import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "./FeaturedWork";
import type { ExperienceEntry, ExperienceHeaderCopy } from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";

const HOVER_CLOSE_DELAY_MS = 80;

export default function Experience({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <ExperienceSection items={data.experience} header={data.sectionHeaders.experience} />;
}

function ExpRow({
  e,
  last,
  hoverPrefix,
  highlightSingular,
  highlightPlural,
}: {
  e: ExperienceEntry;
  last: boolean;
  hoverPrefix: string;
  highlightSingular: string;
  highlightPlural: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const handleEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };

  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`grid items-start gap-3 md:gap-6 py-7 border-t border-line grid-cols-1 md:[grid-template-columns:180px_24px_1fr] ${last ? "border-b" : ""}`}
    >
      <div className="font-mono text-[13px] text-fg-soft md:pt-1">
        {e.from} <span className="text-fg-faint">—</span> {e.to}
      </div>
      <div className="hidden md:flex pt-2 relative justify-center">
        <span className="w-2 h-2 rounded-full bg-spark mt-1" />
        {!last && <span className="absolute top-4 -bottom-7 w-px bg-line-2" />}
      </div>
      <div>
        <div className="flex flex-wrap items-baseline gap-3.5">
          <h4 className="display m-0 text-[clamp(22px,2.4vw,32px)] tracking-tightish2 leading-snug">{e.role}</h4>
          <span className="text-fg-soft text-sm">at <span className="text-fg">{e.company}</span></span>
        </div>
        <div className="mt-1.5 text-[13px] font-mono text-fg-faint">{e.where}</div>

        <div
          className="grid transition-[grid-template-rows,opacity,margin-top] duration-[400ms] ease-[cubic-bezier(.4,0,.2,1)]"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
            opacity: open ? 1 : 0,
            marginTop: open ? 16 : 0,
          }}
        >
          <ul className="m-0 p-0 list-none flex flex-col gap-2 overflow-hidden min-h-0">
            {e.bullets.map((b) => (
              <li key={b} className="flex gap-2.5 text-fg-soft text-sm">
                <span className="text-spark mt-0.5">→</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="mt-2 font-mono text-[11px] text-fg-faint tracking-[.08em] uppercase min-h-[14px] transition-opacity duration-200"
          style={{ opacity: open ? 0 : 1 }}
          aria-hidden={open}
        >
          {`${hoverPrefix} · ${e.bullets.length} ${e.bullets.length === 1 ? highlightSingular : highlightPlural}`}
        </div>
      </div>
    </div>
  );
}

interface ExperienceSectionProps {
  items: readonly ExperienceEntry[];
  header: ExperienceHeaderCopy;
}

function ExperienceSection({ items, header }: ExperienceSectionProps) {
  const reduce = useReducedMotion();
  return (
    <m.section
      id="experience"
      data-screen-label={header.screenLabel}
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
      <div className="flex flex-col">
        {items.map((e, i) => (
          <ExpRow
            key={`${e.company}-${e.role}-${e.from}`}
            e={e}
            last={i === items.length - 1}
            hoverPrefix={header.hoverPrefix}
            highlightSingular={header.highlightSingular}
            highlightPlural={header.highlightPlural}
          />
        ))}
      </div>
    </m.section>
  );
}
