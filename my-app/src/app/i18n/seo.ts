import { i18n } from "../i18n-config";

/**
 * Production origin. Used for metadataBase, canonical/hreflang and JSON-LD URLs.
 * No localhost must leak into emitted metadata (META-03).
 */
export const SITE_URL = "https://tomasperezdev.space";

/** OpenGraph locale codes per route locale. */
const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  es: "es_AR",
};

/**
 * Finalized title + meta-description per locale (Phase 12 KW-03).
 * Every claimed term is traceable to visible common.json content.
 */
export const SEO_COPY: Record<string, { title: string; description: string }> = {
  en: {
    title: "Tomás Pérez — Full-Stack Developer | Agentic AI-Driven Development",
    description:
      "Full-stack developer working agentic-first: AI-driven development, harness engineering, LLM orchestration. 3+ yrs with Node.js, React, NestJS, TypeScript.",
  },
  es: {
    title: "Tomás Pérez — Desarrollador Full-Stack | Desarrollo AI-Driven y Agentic",
    description:
      "Desarrollador full-stack trabajando agentic-first: desarrollo AI-driven, harness engineering, orquestación de LLMs. 3+ años con Node.js, React, NestJS.",
  },
};

/**
 * Ordered knowsAbout (Phase 12 KW-03): AI-trend terms first, then core stack.
 * Every term is present in common.json `stack`.
 */
export const KNOWS_ABOUT: readonly string[] = [
  "Agentic Workflows",
  "AI-Driven Development",
  "Harness Engineering",
  "Context Engineering",
  "LLM Orchestration",
  "Node.js",
  "NestJS",
  "React",
  "Next.js",
  "TypeScript",
  "REST APIs",
  "PostgreSQL",
  "Hexagonal Architecture",
  "Clean Architecture",
  "SOLID Principles",
];

/** Resolve a route locale to its OG locale code, falling back to the default. */
export function ogLocale(lang: string): string {
  return OG_LOCALE[lang] ?? OG_LOCALE[i18n.defaultLocale];
}

/**
 * Symmetric canonical + hreflang alternates.
 * `/es` self-canonicalizes to `/es`, `/en` to `/en`; languages map every locale
 * plus `x-default` → the default locale route. Paths are root-relative; Next resolves
 * them against `metadataBase`.
 */
export function getAlternates(lang: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const languages: Record<string, string> = {};
  for (const locale of i18n.locales) {
    languages[locale] = `/${locale}`;
  }
  languages["x-default"] = `/${i18n.defaultLocale}`;

  return {
    canonical: `/${lang}`,
    languages,
  };
}
