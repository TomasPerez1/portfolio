"use client";

import { usePortfolioData } from "../../../i18n/usePortfolioData";
import { useTranslation } from "../../../i18n/client";
import Hero from "../Hero";

export interface HeroWrapperProps {
  lang: string;
}

export default function HeroWrapper({ lang }: HeroWrapperProps) {
  const { data, ready } = usePortfolioData(lang);
  const { t } = useTranslation(lang, "common");
  if (!ready || !data) return null;
  const { statusLine, location, timezone, tagline } = data.identity;
  return (
    <Hero
      data={{ statusLine, location, timezone, tagline }}
      hero={data.hero}
      cvLink={t("CV")}
    />
  );
}
