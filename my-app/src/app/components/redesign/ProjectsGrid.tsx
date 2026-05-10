"use client";
import { useState } from "react";
import type { GridProject } from "../../i18n/portfolio.types";

function SmallCard({ p }: { p: GridProject }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className={`relative flex flex-col gap-3.5 p-5 pb-[22px] border rounded-[18px]
                  transition-colors duration-200
                  ${hover ? "bg-card border-line-2" : "bg-transparent border-line"}`}
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">{p.n}</span>
        <span className="eyebrow">{p.year}</span>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="display m-0 text-2xl leading-tight tracking-tightish2">{p.title}</h4>
          <div className="mt-1 text-[13px] text-fg-soft">{p.kicker}</div>
        </div>
        <span className={`w-8 h-8 rounded-full border border-line-2 inline-grid place-items-center shrink-0 transition-colors
                          ${hover ? "text-spark" : "text-fg-soft"}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               className={`transition-transform ${hover ? "translate-x-0.5 -translate-y-0.5" : ""}`}>
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {p.stack.map((s) => <span key={s} className="chip">{s}</span>)}
      </div>
    </a>
  );
}

export interface ProjectsGridProps {
  items: readonly GridProject[];
}

export default function ProjectsGrid({ items }: ProjectsGridProps) {
  return (
    <section data-screen-label="03 More projects" className="px-[clamp(20px,5vw,96px)] pb-[clamp(72px,10vw,140px)]">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-9">
        <h3 className="display display-m m-0">+ More projects</h3>
        <span className="eyebrow">{items.length} more · 2022 → 2026</span>
      </div>
      <div className="grid gap-[clamp(16px,1.4vw,24px)]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {items.map((p) => <SmallCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
