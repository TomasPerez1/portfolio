"use client";

import { usePortfolioData } from "../../../i18n/usePortfolioData";
import About from "../About";

export interface AboutWrapperProps {
  lang: string;
}

export default function AboutWrapper({ lang }: AboutWrapperProps) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <About identity={data.identity} />;
}
