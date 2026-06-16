import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Provider } from "../providers";
import { Toaster } from "sonner";
import { bricolage, geist, jetbrainsMono } from "../fonts";
import { getPortfolioData } from "../i18n/getPortfolioData";
import { SEO_COPY, getAlternates, ogLocale, SITE_URL } from "../i18n/seo";
import { jsonLdToString } from "../i18n/jsonld";
import { i18n } from "../i18n-config";
import "../globals.css";

// Root layout lives under the [lang] dynamic segment (Next 16 supports this) so
// <html lang> is derived from params.lang — fully static, NO headers() read — letting
// /en and /es prerender as static (PERF-01). The proxy handles the "/" redirect.
export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const copy = SEO_COPY[lang] ?? SEO_COPY[i18n.defaultLocale];
  const data = getPortfolioData(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: copy.title,
    description: copy.description,
    keywords: [
      "full-stack developer",
      "agentic workflows",
      "ai-driven development",
      "node.js",
      "react",
      "nextjs",
      "typescript",
      "nestjs",
      "backend",
      "argentina",
      "buenos aires",
    ],
    authors: [{ name: data.identity.name }],
    alternates: getAlternates(lang),
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: `${SITE_URL}/${lang}`,
      siteName: data.identity.name,
      locale: ogLocale(lang),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const jsonLd = jsonLdToString(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Theme-flash prevention: must run synchronously before paint. next/script strategies would cause FOUC. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("theme");var d=s||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",d);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </head>
      <body>
        <Provider>
          <>
            {children}
            <Toaster
              duration={3000}
              style={{ backgroundColor: "#D9D9D9" }}
              richColors
              gap={2}
            />
            <SpeedInsights />
          </>
        </Provider>
      </body>
    </html>
  );
}
