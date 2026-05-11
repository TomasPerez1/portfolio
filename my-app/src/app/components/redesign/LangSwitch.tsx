"use client";
import Link from "next/link";

export interface LangSwitchProps {
  lang: string;
}

export default function LangSwitch({ lang }: LangSwitchProps) {
  const target = lang === "es" ? "/en" : "/es";
  const label = lang === "es" ? "EN" : "ES";
  return (
    <Link
      href={target}
      aria-label={`Switch language to ${label}`}
      className="ml-1 w-9 h-9 rounded-full border border-white/15 grid place-items-center
                 font-mono text-[11px] font-semibold text-zinc-200
                 transition-colors hover:text-white hover:bg-white/[.08]"
    >
      {label}
    </Link>
  );
}
