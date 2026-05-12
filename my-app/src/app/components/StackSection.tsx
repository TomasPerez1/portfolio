"use client";
import { motion, useReducedMotion } from "framer-motion";
import { noMotion, sectionReveal } from "./_animations";
import { SectionHeader } from "./FeaturedWork";
import type { StackCategories } from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";

export default function StackSection({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <StackSectionInner stack={data.stack} />;
}

interface StackSectionInnerProps {
  stack: StackCategories;
}

function StackSectionInner({ stack }: StackSectionInnerProps) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id="stack"
      data-screen-label="04 Stack"
      className="bg-card border-y border-line px-[clamp(20px,5vw,96px)] py-[clamp(72px,10vw,140px)]"
      variants={reduce ? noMotion : sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <SectionHeader
        index="§ 03"
        kicker="Stack"
        title="The toolkit, day to day."
        hint="What I reach for first when shipping. Each entry has the depth so you can read it at a glance."
      />
      <div className="grid gap-[clamp(16px,1.4vw,24px)]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {Object.entries(stack).map(([cat, items]) => (
          <div key={cat} className="p-6 border border-line rounded-[18px] bg-bg">
            <div className="flex items-center gap-2.5 mb-[18px]">
              <span className="w-2 h-2 rounded-full bg-spark" />
              <span className="eyebrow">{cat}</span>
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {items.map(([name, depth]) => (
                <li key={name} className="flex justify-between items-baseline gap-3 pb-2.5 border-b border-dashed border-line">
                  <span className="text-[15px] font-medium">{name}</span>
                  <span className="font-mono text-[11px] text-fg-faint">{depth}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
