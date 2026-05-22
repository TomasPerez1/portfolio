"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Identity, HeroCopy } from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { useTranslation } from "../i18n/client";
import { VOXEL_STATES } from "./voxel-states";


const SHUFFLE_DURATION_MS = 600;
const VOXEL_INFLUENCE_RADIUS = 520;

interface Tilt {
  x: number;
  y: number;
}

interface HeroSectionProps {
  data: Pick<Identity, "statusLine" | "statusLineShort" | "location" | "timezone" | "tagline" | "tagHighlight" | "tagTrailing">;
  hero: HeroCopy;
  cvLink?: string;
  showStatus?: boolean;
}

export default function Hero({ lang, showStatus = true }: { lang: string; showStatus?: boolean }) {
  const { data, ready } = usePortfolioData(lang);
  const { t } = useTranslation(lang, "common");
  if (!ready || !data) return null;
  const { statusLine, statusLineShort, location, timezone, tagline, tagHighlight, tagTrailing } = data.identity;
  return (
    <HeroSection
      data={{ statusLine, statusLineShort, location, timezone, tagline, tagHighlight, tagTrailing }}
      hero={data.hero}
      cvLink={t("CV")}
      showStatus={showStatus}
    />
  );
}

function HeroSection({ data, hero, cvLink, showStatus = true }: HeroSectionProps) {
  const [tilt, setTilt] = useState<Tilt>({ x: -22, y: 28 });
  const [voxelStateIndex, setVoxelStateIndex] = useState<number>(0);
  const [shuffling, setShuffling] = useState<boolean>(false);
  const [voxelMounted, setVoxelMounted] = useState<boolean>(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bcrRef = useRef<{ cx: number; cy: number } | null>(null);

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
    // Defer voxel mount until after first paint to keep FCP/LCP unblocked
    const id = requestAnimationFrame(() => setVoxelMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !voxelMounted) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (reduceMotion) return;
    let raf = 0;
    let rafTilt = 0;
    let t = 0;
    let frame = 0;
    let autoOn = true;
    let pendingTilt: Tilt | null = null;
    let idleTimer: number | undefined;
    const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
    const updateBCR = () => {
      const r = el.getBoundingClientRect();
      bcrRef.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };
    updateBCR();
    const flushTilt = () => {
      rafTilt = 0;
      if (pendingTilt) {
        setTilt(pendingTilt);
        pendingTilt = null;
      }
    };
    const onMove = (e: MouseEvent) => {
      autoOn = false;
      const bcr = bcrRef.current;
      if (!bcr) return;
      const dx = clamp((e.clientX - bcr.cx) / VOXEL_INFLUENCE_RADIUS, -1, 1);
      const dy = clamp((e.clientY - bcr.cy) / VOXEL_INFLUENCE_RADIUS, -1, 1);
      pendingTilt = { x: -22 - dy * 30, y: 28 + dx * 65 };
      if (!rafTilt) rafTilt = requestAnimationFrame(flushTilt);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => { autoOn = true; }, 1500);
    };
    const tick = () => {
      frame++;
      if (autoOn && frame % 2 === 0) {
        t += 0.008;
        setTilt({ x: -22 + Math.sin(t) * 9, y: 28 + Math.cos(t * 0.7) * 18 });
      }
      raf = requestAnimationFrame(tick);
    };
    if (!isTouch) window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", updateBCR, { passive: true });
    window.addEventListener("resize", updateBCR);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rafTilt);
      window.clearTimeout(idleTimer);
      if (!isTouch) window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", updateBCR);
      window.removeEventListener("resize", updateBCR);
    };
  }, [voxelMounted]);

  return (
    <section
      id="top"
      data-screen-label="01 Hero"
      className="relative min-h-screen overflow-hidden flex flex-col justify-center
                 px-[clamp(20px,5vw,96px)] pt-[clamp(72px,10vw,140px)]"
    >
      <GridBackdrop />

      <div className="relative z-[2]">
        {showStatus && (
          <div className="flex flex-wrap items-stretch justify-end md:justify-start gap-3 mt-[30px] md:mt-0 mb-10 max-w-[760px]">
            <span className="badge flex-none md:flex-1 md:min-w-[260px] max-w-fit !normal-case text-[12px] tracking-normal py-2 leading-snug text-left">
              <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(25,195,125,.18)] shrink-0" />
              <span className="flex-1 hidden md:inline">{data.statusLine}</span>
              <span className="flex-1 md:hidden">{data.statusLineShort || data.statusLine}</span>
            </span>
          </div>
        )}

        <div className="grid items-center gap-[clamp(24px,4vw,64px)] grid-cols-1 lg:[grid-template-columns:minmax(0,1fr)_minmax(0,360px)]">
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
              <span className="text-fg">{data.tagHighlight}</span>{" "}
              {data.tagTrailing}
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
            className={`relative aspect-square max-w-[360px] mx-auto lg:mx-0 w-full cursor-pointer select-none transition-transform duration-100
                       ${shuffling ? "scale-[.97]" : ""}`}
            style={{ perspective: "1100px" }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-[-60%] rounded-full blur-[40px] pointer-events-none z-0"
              style={{ background: "radial-gradient(circle, var(--c-hero-aura) 0%, transparent 60%)" }}
            />
            {voxelMounted && <VoxelArt tilt={tilt} stateIndex={voxelStateIndex} />}
            <div
              className="voxel-pill absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2
                         px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-line-2
                         font-mono text-[13px] text-fg-soft pointer-events-none whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-spark" /> Voxel · click to shuffle
            </div>
          </div>
        </div>

        <div className="mt-[clamp(56px,8vw,110px)] flex flex-wrap gap-8 items-end justify-between
                        pb-7 border-b border-line">
          <div className="flex flex-wrap gap-7">
            <KV k={hero.facts.role.label} v={hero.facts.role.value} />
            <KV k={hero.facts.based.label} v={hero.facts.based.value} />
            <a
              href={hero.facts.english.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${hero.facts.english.label} — ${hero.facts.english.certificateLabel}`}
              className="group inline-flex flex-col gap-1 rounded-md px-2 -mx-2 py-1 -my-1
                         transition-colors hover:bg-card-2 focus-visible:bg-card-2 outline-none"
            >
              <span className="eyebrow flex items-center gap-1.5 transition-colors group-hover:text-spark">
                {hero.facts.english.label}
                <ExternalIcon />
              </span>
              <span className="text-sm transition-colors group-hover:text-spark">
                {hero.facts.english.value}
                <span className="ml-1.5 text-[10px] font-mono uppercase tracking-[.1em] text-fg-faint group-hover:text-spark">
                  · {hero.facts.english.certificateLabel}
                </span>
              </span>
            </a>
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
    <m.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={transition}
      className="absolute"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
        x: tx,
        y: ty,
        z: tz,
        left: -size / 2,
        top: -size / 2,
      }}
    >
      {faces.map(([t, b]) => (
        <div
          key={t}
          className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,.25)]"
          style={{ background: base, transform: t, filter: b }}
        />
      ))}
    </m.div>
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

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
    >
      <path d="M7 17L17 7M9 7h8v8" />
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
