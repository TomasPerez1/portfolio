"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Identity, HeroCopy } from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { useTranslation } from "../i18n/client";
import { VOXEL_STATES } from "./voxel-states";

const SHUFFLE_DURATION_MS = 600;

interface Tilt {
  x: number;
  y: number;
}

interface HeroSectionProps {
  data: Pick<Identity, "statusLine" | "location" | "timezone" | "tagline">;
  hero: HeroCopy;
  cvLink?: string;
  showStatus?: boolean;
}

export default function Hero({ lang, showStatus = true }: { lang: string; showStatus?: boolean }) {
  const { data, ready } = usePortfolioData(lang);
  const { t } = useTranslation(lang, "common");
  if (!ready || !data) return null;
  const { statusLine, location, timezone, tagline } = data.identity;
  return (
    <HeroSection
      data={{ statusLine, location, timezone, tagline }}
      hero={data.hero}
      cvLink={t("CV")}
      showStatus={showStatus}
    />
  );
}

function HeroSection({ data, hero, cvLink, showStatus = true }: HeroSectionProps) {
  const [tilt, setTilt] = useState<Tilt>({ x: -22, y: 28 });
  const [time, setTime] = useState<Date>(() => new Date());
  const [voxelStateIndex, setVoxelStateIndex] = useState<number>(0);
  const [shuffling, setShuffling] = useState<boolean>(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const onShuffle = () => {
    if (shuffling) return;
    setShuffling(true);
    setVoxelStateIndex((i) => (i + 1) % VOXEL_STATES.length);
    setTimeout(() => setShuffling(false), SHUFFLE_DURATION_MS);
  };
  const onShuffleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onShuffle();
    }
  };

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // RC-03: reduced-motion + 30fps throttle
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    let raf = 0;
    let t = 0;
    let frame = 0;
    let autoOn = true;
    const onMove = (e: MouseEvent) => {
      autoOn = false;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      setTilt({ x: -22 - dy * 14, y: 28 + dx * 30 });
    };
    const tick = () => {
      frame++;
      if (autoOn && frame % 2 === 0) {
        t += 0.005;
        setTilt({ x: -22 + Math.sin(t) * 4, y: 28 + Math.cos(t * 0.7) * 8 });
      }
      raf = requestAnimationFrame(tick);
    };
    const onLeave = () => { autoOn = true; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const ar = time.toLocaleTimeString("en-US", {
    timeZone: "America/Argentina/Buenos_Aires", hour: "2-digit", minute: "2-digit", hour12: false,
  });

  return (
    <section
      id="top"
      data-screen-label="01 Hero"
      className="relative min-h-screen overflow-hidden flex flex-col justify-center
                 px-[clamp(20px,5vw,96px)] pt-[clamp(72px,10vw,140px)]"
    >
      <GridBackdrop />
      <div
        className="absolute -right-[10vw] top-[10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px]
                   rounded-full blur-[40px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(181,33,255,.2) 0%, transparent 60%)" }}
      />

      <div className="relative z-[2]">
        {showStatus && (
          <div className="flex flex-wrap items-stretch gap-3 mb-10 max-w-[760px]">
            <span className="badge flex-1 min-w-[260px] max-w-[420px] !normal-case text-[12px] tracking-normal py-2 leading-snug text-left">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(25,195,125,.18)] shrink-0" />
              <span className="flex-1">{data.statusLine}</span>
            </span>
            <span className="badge font-mono flex-1 min-w-[260px] max-w-[420px] py-2 justify-center text-center">
              {data.location} · {ar} {data.timezone}
            </span>
          </div>
        )}

        <div className="grid items-center gap-[clamp(24px,4vw,64px)] grid-cols-1 md:[grid-template-columns:minmax(0,1fr)_minmax(0,360px)]">
          <div>
            <div className="eyebrow mb-[18px]">Portfolio · 2026</div>
            <h1 className="display display-xl m-0">
              <span className="block">Tomás</span>
              <span className="block" style={{ color: "transparent", WebkitTextStroke: "1.5px var(--c-spark)" }}>
                Pérez
                <span className="text-spark" style={{ WebkitTextStroke: 0 }}>.</span>
              </span>
            </h1>
            <p className="max-w-[540px] mt-7 mb-8 text-[clamp(16px,1.4vw,19px)] text-fg-soft">
              {data.tagline}{" "}
              <span className="text-fg">
                3+ years building with Node.js, React, Next.js, NestJS and TypeScript
              </span>{" "}
              — currently shipping enterprise platforms at Zurich/Santander and a SoundCloud-partnered SaaS.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="#work" className="btn btn-primary">
                {hero.ctaPrimary}
                <Arrow />
              </a>
              <a href="#contact" className="btn">{hero.ctaSecondary}</a>
              <a
                href={cvLink ?? "#"}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-transparent"
              >
                <DownloadIcon />
                {hero.ctaTertiary}
              </a>
            </div>
          </div>

          <div
            ref={wrapRef}
            role="button"
            tabIndex={0}
            aria-label="Shuffle voxel cube"
            onClick={onShuffle}
            onKeyDown={onShuffleKey}
            className={`relative aspect-square max-w-[360px] mx-auto md:mx-0 w-full cursor-pointer select-none transition-transform duration-100
                       ${shuffling ? "scale-[.97]" : ""}`}
            style={{ perspective: "1100px" }}
          >
            <VoxelArt tilt={tilt} stateIndex={voxelStateIndex} />
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-1.5
                         px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-line-2
                         font-mono text-[11px] text-fg-soft pointer-events-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-spark" /> Voxel · click to shuffle
            </div>
          </div>
        </div>

        <div className="mt-[clamp(56px,8vw,110px)] flex flex-wrap gap-8 items-end justify-between
                        pb-7 border-b border-line">
          <div className="flex flex-wrap gap-7">
            <KV k="Role" v="Full-stack Developer" />
            <KV k="Available" v="Apr 2026" />
            <KV k="Based" v="CABA, Buenos Aires" />
            <KV k="English" v="B2 — Upper Intermediate" />
          </div>
          <ScrollCue />
        </div>
      </div>
    </section>
  );
}

function GridBackdrop() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-50"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--c-grid) 1px, transparent 1px),linear-gradient(to bottom, var(--c-grid) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%)",
      }}
    />
  );
}

interface VoxelData {
  x: number;
  y: number;
  z: number;
  isYellow: boolean;
  key: string;
}

function VoxelArt({ tilt, stateIndex }: { tilt: Tilt; stateIndex: number }) {
  const SIZE = 4;
  const V = 36;
  const reduceMotion = useReducedMotion();
  const state = VOXEL_STATES[stateIndex] ?? VOXEL_STATES[0];
  const { yellow, removed } = state;
  const voxels: VoxelData[] = [];
  for (let x = 0; x < SIZE; x++)
    for (let y = 0; y < SIZE; y++)
      for (let z = 0; z < SIZE; z++) {
        const k = `${x},${y},${z}`;
        if (removed.has(k)) continue;
        const onShell = x === 0 || x === SIZE - 1 || y === 0 || y === SIZE - 1 || z === 0 || z === SIZE - 1 || yellow.has(k);
        if (!onShell) continue;
        voxels.push({ x, y, z, isYellow: yellow.has(k), key: k });
      }

  const shuffleTransition: { duration: number; ease?: [number, number, number, number] } = reduceMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="relative w-0 h-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <AnimatePresence mode="popLayout">
          {voxels.map((v) => (
            <Voxel
              key={v.key}
              x={v.x}
              y={v.y}
              z={v.z}
              isYellow={v.isYellow}
              size={V}
              transition={shuffleTransition}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface VoxelProps {
  x: number;
  y: number;
  z: number;
  size: number;
  isYellow: boolean;
  transition: { duration: number; ease?: [number, number, number, number] };
}

function Voxel({ x, y, z, size, isYellow, transition }: VoxelProps) {
  const base = isYellow ? "#fbbf24" : "var(--c-spark)";
  const tx = (x - 1.5) * size;
  const ty = -((y - 1.5) * size);
  const tz = (z - 1.5) * size;
  const faces: ReadonlyArray<readonly [string, string]> = [
    [`translateZ(${size / 2}px)`, "brightness(1.0)"],
    [`rotateY(180deg) translateZ(${size / 2}px)`, "brightness(.55)"],
    [`rotateY(90deg) translateZ(${size / 2}px)`, "brightness(.78)"],
    [`rotateY(-90deg) translateZ(${size / 2}px)`, "brightness(.65)"],
    [`rotateX(90deg) translateZ(${size / 2}px)`, "brightness(1.18)"],
    [`rotateX(-90deg) translateZ(${size / 2}px)`, "brightness(.42)"],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={transition}
      className="absolute"
      style={{
        width: size, height: size, transformStyle: "preserve-3d",
        transform: `translate3d(${tx}px, ${ty}px, ${tz}px)`,
        left: -size / 2, top: -size / 2,
      }}
    >
      {faces.map(([t, b], i) => (
        <div
          key={i}
          className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,.25)]"
          style={{ background: base, transform: t, filter: b }}
        />
      ))}
    </motion.div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="eyebrow">{k}</span>
      <span className="text-sm">{v}</span>
    </div>
  );
}

function ScrollCue() {
  return (
    <div className="flex items-center gap-3 text-fg-soft font-mono text-[11px] tracking-[.12em] uppercase">
      <span>Scroll</span>
      <span className="w-px h-9 bg-current opacity-35 animate-scroll-line" />
    </div>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
    </svg>
  );
}
