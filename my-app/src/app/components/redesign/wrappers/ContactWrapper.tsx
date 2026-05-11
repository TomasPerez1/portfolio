"use client";

import { usePortfolioData } from "../../../i18n/usePortfolioData";
import Contact from "../Contact";

export interface ContactWrapperProps {
  lang: string;
}

// NOTE: Form submit is a stub from Phase 4 — no real email send. Phase 7 wires Nodemailer.
export default function ContactWrapper({ lang }: ContactWrapperProps) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <Contact identity={data.identity} />;
}
