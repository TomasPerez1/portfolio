import en from "../../../public/locales/en/common.json";
import es from "../../../public/locales/es/common.json";
import type { PortfolioData } from "./portfolio.types";

const LOCALES: Record<string, PortfolioData> = {
  en: en as unknown as PortfolioData,
  es: es as unknown as PortfolioData,
};

export function getPortfolioData(lang: string): PortfolioData {
  return LOCALES[lang] ?? LOCALES.en;
}
