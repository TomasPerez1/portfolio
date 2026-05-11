"use client";
import { useState } from "react";
import { SectionHeader } from "./FeaturedWork";
import type { ExperienceEntry } from "../../i18n/portfolio.types";

function ExpRow({ e, last }: { e: ExperienceEntry; last: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      className={`grid items-start gap-6 py-7 border-t border-line ${last ? "border-b" : ""}`}
      style={{ gridTemplateColumns: "180px 24px 1fr" }}
    >
      <div className="font-mono text-[13px] text-fg-soft pt-1">
        {e.from} <span className="text-fg-faint">—</span> {e.to}
      </div>
      <div className="pt-2 relative flex justify-center">
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
            {e.bullets.map((b, i) => (
              <li key={i} className="flex gap-2.5 text-fg-soft text-sm">
                <span className="text-spark mt-0.5">→</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-2 font-mono text-[11px] text-fg-faint tracking-[.08em] uppercase">
          {open ? "" : `Hover to expand · ${e.bullets.length} highlight${e.bullets.length > 1 ? "s" : ""}`}
        </div>
      </div>
    </div>
  );
}

export interface ExperienceProps {
  items: readonly ExperienceEntry[];
}

export default function Experience({ items }: ExperienceProps) {
  return (
    <section id="experience" data-screen-label="05 Experience" className="px-[clamp(20px,5vw,96px)] py-[clamp(72px,10vw,140px)]">
      <SectionHeader
        index="§ 04"
        kicker="Experience"
        title="3+ years of shipping."
        hint="A condensed timeline. Roles, companies and what I actually delivered."
      />
      <div className="flex flex-col">
        {items.map((e, i) => <ExpRow key={i} e={e} last={i === items.length - 1} />)}
      </div>
    </section>
  );
}
