"use client";

import { usePortfolioData } from "../../../i18n/usePortfolioData";
import { useTranslation } from "../../../i18n/client";
import Footer, { type FooterLink } from "../Footer";

export interface FooterWrapperProps {
  lang: string;
}

const GITHUB_URL = "https://github.com/Pelucheado";

export default function FooterWrapper({ lang }: FooterWrapperProps) {
  const { data, ready } = usePortfolioData(lang);
  const { t } = useTranslation(lang, "common");
  if (!ready || !data) return <Footer />;
  const { email, linkedin } = data.identity;
  const links: readonly FooterLink[] = [
    { label: "GitHub", href: GITHUB_URL, external: true },
    { label: "LinkedIn", href: `https://${linkedin}`, external: true },
    { label: "Email", href: `mailto:${email}` },
    { label: "CV", href: t("CV"), external: true },
  ];
  return <Footer links={links} />;
}
