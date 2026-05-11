"use client";

import { usePortfolioData } from "../../../i18n/usePortfolioData";
import FeaturedWork from "../FeaturedWork";

export interface FeaturedWorkWrapperProps {
  lang: string;
}

export default function FeaturedWorkWrapper({ lang }: FeaturedWorkWrapperProps) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <FeaturedWork items={data.featured} />;
}
