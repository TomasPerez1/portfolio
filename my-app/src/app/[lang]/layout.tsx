import type { Metadata } from "next";
import { getPortfolioData } from "../i18n/getPortfolioData";
import { SEO_COPY, getAlternates, ogLocale, SITE_URL } from "../i18n/seo";
import { jsonLdToString } from "../i18n/jsonld";
import { i18n } from "../i18n-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const copy = SEO_COPY[lang] ?? SEO_COPY[i18n.defaultLocale];
  const data = getPortfolioData(lang);

  return {
    title: copy.title,
    description: copy.description,
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

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const jsonLd = jsonLdToString(lang);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {children}
    </>
  );
}
