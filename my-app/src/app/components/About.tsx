"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./FeaturedWork";
import { noMotion, sectionReveal } from "./_animations";
import type {
  AboutCopy,
  AboutCurrentlyCopy,
  HeroEnglishFact,
  Identity,
  SectionHeaderCopy,
} from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";

const CURRENTLY_INTERVAL_MS = 10000;

const CURRENTLY_THEMES = {
  purple: {
    background: "linear-gradient(135deg, rgba(181,33,255,.13), transparent 70%), var(--c-bg)",
    border: "border-line",
  },
  aqua: {
    background: "linear-gradient(135deg, rgba(20,184,166,.18), transparent 70%), #0a0a0a",
    border: "border-[rgba(20,184,166,.35)]",
  },
} as const;

export default function About({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return (
    <AboutSection
      identity={data.identity}
      about={data.about}
      header={data.sectionHeaders.about}
      englishFact={data.hero.facts.english}
    />
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="display tabular-nums text-spark leading-none text-[clamp(28px,3vw,40px)]">{n}</div>
      <div className="text-[11px] font-mono text-fg-soft tracking-[.1em] uppercase mt-1">{l}</div>
    </div>
  );
}

interface AboutSectionProps {
  identity: Identity;
  about: AboutCopy;
  header: SectionHeaderCopy;
  englishFact: HeroEnglishFact;
}

function AboutSection({ identity, about, header, englishFact }: AboutSectionProps) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id="about"
      data-screen-label="06 About"
      className="bg-card border-t border-line px-[clamp(20px,5vw,96px)] py-[clamp(72px,10vw,140px)]"
      variants={reduce ? noMotion : sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <SectionHeader index={header.index} kicker={header.kicker} title={header.title} />

      <div className="grid gap-[clamp(16px,1.4vw,24px)] grid-cols-1 md:grid-cols-12 md:[grid-auto-rows:minmax(140px,auto)]">
        <div className="md:col-span-7 md:row-span-2 p-8 rounded-[18px] bg-bg border border-line flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3.5 text-[clamp(18px,1.05vw,16px)] leading-relaxed text-fg-soft">
            {about.paragraphs.map((p, i) => (
              <p key={i} className="m-0">
                {p}
              </p>
            ))}
          </div>
          <div className="flex items-center gap-3.5">
            <div className="relative w-[6rem] h-[6rem] rounded-full bg-card overflow-hidden border border-line-2">
              <Image
                src="/profile/porfile_box.jpg"
                alt="Tomás Pérez"
                fill
                sizes="80px"
                className="object-cover"
                style={{ objectPosition: "center 45%" }}
              />
            </div>
            <div>
              <div className="font-medium">{identity.name}</div>
              <div className="font-mono text-xs text-fg-soft">Full-stack · CABA, Argentina</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 p-7 rounded-[18px] bg-bg border border-line flex flex-col gap-3.5">
          <div className="eyebrow">Quick facts</div>
          {identity.quickFacts.map(([k, v]) => {
            const isEnglish = v === englishFact.value;
            return (
              <div key={k} className="flex justify-between items-baseline gap-2 pb-2.5 border-b border-dashed border-line">
                <span className="text-fg-soft text-[13px]">{k}</span>
                <span className="font-medium text-sm text-right">
                  {v}
                  {isEnglish && (
                    <>
                      {" "}
                      <a
                        href={englishFact.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-spark underline-offset-2 hover:underline"
                      >
                        ({englishFact.certificateLabel})
                      </a>
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <CurrentlyCarousel items={about.currently} reduce={!!reduce} />
      </div>
    </motion.section>
  );
}

interface CurrentlyCarouselProps {
  items: readonly AboutCurrentlyCopy[];
  reduce: boolean;
}

function CurrentlyCarousel({ items, reduce }: CurrentlyCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, CURRENTLY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index] ?? items[0];
  const theme = CURRENTLY_THEMES[current.theme] ?? CURRENTLY_THEMES.purple;
  const isDark = current.theme === "aqua";

  return (
    <div
      className={`md:col-span-5 p-6 rounded-[18px] border ${theme.border} min-h-[180px] relative overflow-hidden`}
      style={{ background: theme.background }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-between gap-4 h-full"
        >
          <div className={`eyebrow ${isDark ? "text-[rgba(20,184,166,.85)]" : ""}`}>{current.eyebrow}</div>
          <div>
            <div
              className={`font-display text-[22px] font-semibold leading-tight tracking-tightish2 ${
                isDark ? "text-white" : ""
              }`}
            >
              {current.title}
            </div>
            <div className={`mt-1.5 text-[13px] ${isDark ? "text-[rgba(255,255,255,.7)]" : "text-fg-soft"}`}>
              {current.description}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {current.chips.map((c) => (
              <span
                key={c}
                className={
                  isDark
                    ? "chip bg-[rgba(20,184,166,.15)] text-[rgba(20,184,166,.95)] border-[rgba(20,184,166,.4)]"
                    : "chip"
                }
              >
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? (isDark ? "bg-[rgba(20,184,166,.9)]" : "bg-spark") : "bg-line"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
