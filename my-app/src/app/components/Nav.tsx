"use client";
import { useEffect, useState } from "react";
import { useTheme } from "../theme/useTheme";
import LangSwitch from "../ui/LangSwitch";

export type NavTheme = "dark" | "light";

interface NavChromeProps {
  theme: NavTheme;
  onToggleTheme: () => void;
  links?: ReadonlyArray<readonly [string, string]>;
  langSwitch?: React.ReactNode;
}

const DEFAULT_LINKS: ReadonlyArray<readonly [string, string]> = [
  ["Work", "#work"],
  ["Stack", "#stack"],
  ["Experience", "#experience"],
  ["About", "#about"],
  ["Contact", "#contact"],
];

export default function Nav({ lang }: { lang: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <NavChrome
      theme={theme}
      onToggleTheme={toggleTheme}
      langSwitch={<LangSwitch lang={lang} />}
    />
  );
}

function NavChrome({ theme, onToggleTheme, links = DEFAULT_LINKS, langSwitch }: NavChromeProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className="fixed top-3.5 inset-x-3.5 z-50 flex justify-center pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center gap-1.5 py-2 pr-2 pl-[18px]
          rounded-full border border-white/15 backdrop-blur-xl backdrop-saturate-150
          transition-all duration-300 max-w-[calc(100vw-28px)] text-zinc-200
          ${scrolled ? "bg-black/85 shadow-[0_8px_24px_rgba(0,0,0,.35)]" : "bg-black/60"}`}
      >
        <a href="#top" className="flex items-center gap-2 pr-2.5 border-r border-white/15 text-white">
          <Logo />
          <span className="font-mono text-xs font-semibold">tperez.dev</span>
        </a>
        <div className="hidden md:flex gap-0.5">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="px-3 py-2 text-[13px] font-medium text-zinc-300 rounded-full
                         transition-colors hover:text-white hover:bg-white/[.08]"
            >
              {label}
            </a>
          ))}
        </div>
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="ml-1 w-9 h-9 rounded-full border border-white/15 grid place-items-center text-zinc-200 hover:text-white hover:bg-white/[.08] transition-colors"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        {langSwitch}
      </nav>
    </header>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="2" width="9" height="9" className="fill-spark" />
      <rect x="13" y="2" width="9" height="9" className="fill-fg" />
      <rect x="2" y="13" width="9" height="9" className="fill-fg" />
      <rect x="13" y="13" width="9" height="9" className="fill-spark" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
