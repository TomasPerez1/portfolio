"use client";
import { SectionHeader } from "./FeaturedWork";

function Stat({ n, l }) {
  return (
    <div>
      <div className="display tabular-nums text-spark leading-none text-[clamp(28px,3vw,40px)]">{n}</div>
      <div className="text-[11px] font-mono text-fg-soft tracking-[.1em] uppercase mt-1">{l}</div>
    </div>
  );
}

export default function About({ identity }) {
  return (
    <section
      id="about"
      data-screen-label="06 About"
      className="bg-card border-t border-line px-[clamp(20px,5vw,96px)] py-[clamp(72px,10vw,140px)]"
    >
      <SectionHeader index="§ 05" kicker="About" title="The person behind the code." />

      <div
        className="grid gap-[clamp(16px,1.4vw,24px)]"
        style={{ gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(140px, auto)" }}
      >
        <div className="col-span-7 row-span-2 p-8 rounded-[18px] bg-bg border border-line flex flex-col justify-between gap-6">
          <p className="display m-0 text-[clamp(22px,2.6vw,32px)] tracking-tightish2 leading-snug font-medium">
            "Creating software that solves <span className="text-spark">real problems</span> — not just the technical ones."
          </p>
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-card overflow-hidden border border-line-2">
              <img src="/assets/about-current.jpg" alt="Tomás Pérez" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
            </div>
            <div>
              <div className="font-medium">Tomás Pérez</div>
              <div className="font-mono text-xs text-fg-soft">Full-stack · CABA, AR</div>
            </div>
          </div>
        </div>

        <div className="col-span-5 p-7 rounded-[18px] bg-bg border border-line flex flex-col gap-3.5">
          <div className="eyebrow">Quick facts</div>
          {identity.quickFacts.map(([k, v]) => (
            <div key={k} className="flex justify-between items-baseline gap-2 pb-2.5 border-b border-dashed border-line">
              <span className="text-fg-soft text-[13px]">{k}</span>
              <span className="font-medium text-sm text-right">{v}</span>
            </div>
          ))}
        </div>

        <div
          className="col-span-5 p-6 rounded-[18px] border border-line flex flex-col justify-between gap-4 min-h-[180px]"
          style={{ background: "linear-gradient(135deg, rgba(181,33,255,.13), transparent 70%), var(--c-bg)" }}
        >
          <div className="eyebrow">Currently</div>
          <div>
            <div className="font-display text-[22px] font-semibold leading-tight tracking-tightish2">
              Backend on a hexagonal NestJS codebase
            </div>
            <div className="mt-1.5 text-[13px] text-fg-soft">
              Tienda Lo Quiero Acá · NestJS · Redis · SOLID. Plus DJ Presskit & Zurich/Santander.
            </div>
          </div>
          <div className="flex gap-1.5">
            <span className="chip">NestJS</span>
            <span className="chip">Hexagonal</span>
            <span className="chip">Redis</span>
          </div>
        </div>

        <div className="col-span-4 p-6 rounded-[18px] bg-bg border border-line">
          <div className="eyebrow mb-3.5">By the numbers</div>
          <div className="grid grid-cols-2 gap-4">
            <Stat n="3+" l="years dev" />
            <Stat n="9" l="projects" />
            <Stat n="5+" l="clients" />
            <Stat n="B2" l="english" />
          </div>
        </div>

        <div className="col-span-3 p-6 rounded-[18px] flex flex-col justify-between gap-4 min-h-[180px] bg-fg text-bg">
          <div className="font-mono text-[11px] tracking-[.12em] uppercase opacity-60">CV</div>
          <div className="font-display text-[20px] font-semibold leading-tight tracking-tightish2">
            Download the full résumé →
          </div>
          <div className="text-xs opacity-65">PDF · 2 pages · updated May 2026</div>
        </div>
      </div>
    </section>
  );
}
