"use client";

import { usePortfolioData } from "../../../i18n/usePortfolioData";
import StackSection from "../StackSection";

export interface StackSectionWrapperProps {
  lang: string;
}

export default function StackSectionWrapper({ lang }: StackSectionWrapperProps) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <StackSection stack={data.stack} />;
}
