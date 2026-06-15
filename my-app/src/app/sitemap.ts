import type { MetadataRoute } from "next";

const BASE_URL = "https://tomasperezdev.space";
const LOCALES = ["en", "es"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified,
    changeFrequency: "monthly",
    priority: locale === "en" ? 1.0 : 0.9,
    alternates: {
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `${BASE_URL}/${l}`])),
        "x-default": `${BASE_URL}/en`,
      },
    },
  }));
}
