"use client";

import { usePortfolioData } from "../../../i18n/usePortfolioData";
import Experience from "../Experience";

export interface ExperienceWrapperProps {
  lang: string;
}

export default function ExperienceWrapper({ lang }: ExperienceWrapperProps) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <Experience items={data.experience} />;
}
