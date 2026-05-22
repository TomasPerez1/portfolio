"use client";

import en from "../../../public/locales/en/common.json";
import es from "../../../public/locales/es/common.json";
import type { PortfolioData } from "./portfolio.types";

const LOCALES: Record<string, PortfolioData> = {
  en: en as unknown as PortfolioData,
  es: es as unknown as PortfolioData,
};

export function usePortfolioData(lng: string) {
  const data = LOCALES[lng] ?? LOCALES.en;
  return { data, ready: true };
}
