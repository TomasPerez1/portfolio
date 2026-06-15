import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPortfolioData } from "../i18n/getPortfolioData";
import { i18n } from "../i18n-config";

export const alt = "Tomás Pérez — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Statically generate one OG image per locale at build time.
export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

// Brand tokens (from the design system — kept inline; Satori has no CSS-var support).
const BG = "#0a0a0a";
const FG = "#ededed";
const MUTED = "#a0a0a0";
const SPARK = "#b521ff";

// Per-locale headline + support line (Option 1 — positioning-first, recruiter-scannable).
// This text is VISUAL/social only (not read by search engines); og:title/description carry SEO.
const OG_COPY: Record<string, { headline: string; support: string }> = {
  en: {
    headline: "Full-Stack Developer · Agentic AI-Driven",
    support: "3+ yrs · Node.js · NestJS · React · TypeScript · Buenos Aires",
  },
  es: {
    headline: "Desarrollador Full-Stack · Agentic AI-Driven",
    support: "3+ años · Node.js · NestJS · React · TypeScript · Buenos Aires",
  },
};

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = getPortfolioData(lang);
  const copy = OG_COPY[lang] ?? OG_COPY[i18n.defaultLocale];

  const [geistRegular, geistSemiBold] = await Promise.all([
    readFile(join(process.cwd(), "assets/og/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "assets/og/Geist-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: FG,
          padding: 80,
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
          }}
        >
          <span style={{ color: SPARK, fontWeight: 600 }}>
            {data.identity.site}
          </span>
          <span style={{ color: MUTED }}>{data.identity.statusLineShort}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 600, lineHeight: 1 }}>
            {data.identity.name}
          </div>
          <div style={{ fontSize: 46, color: SPARK, fontWeight: 600, marginTop: 20 }}>
            {copy.headline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 28 }}>
          <span style={{ color: MUTED }}>{copy.support}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistRegular, style: "normal", weight: 400 },
        { name: "Geist", data: geistSemiBold, style: "normal", weight: 600 },
      ],
    },
  );
}
