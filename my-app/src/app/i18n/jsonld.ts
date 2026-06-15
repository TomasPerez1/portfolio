import { getPortfolioData } from "./getPortfolioData";
import { SITE_URL, KNOWS_ABOUT } from "./seo";

/** Normalize the stored LinkedIn handle into an absolute https URL. */
function linkedinUrl(handle: string): string {
  const clean = handle.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return `https://www.${clean}`;
}

/**
 * Build the schema.org JSON-LD graph for a locale: a `Person` node plus a
 * `CreativeWork` node for each of the 3 featured projects (SCHEMA-01/02).
 * Every claim is derived from visible common.json content (honesty gate) — the
 * `Person.@id` is referenced by each work's `author`.
 */
export function buildJsonLd(lang: string) {
  const data = getPortfolioData(lang);
  const personId = `${SITE_URL}/#person`;

  const person = {
    "@type": "Person",
    "@id": personId,
    name: data.identity.name,
    jobTitle: data.identity.role,
    url: SITE_URL,
    email: `mailto:${data.identity.email}`,
    telephone: data.identity.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Buenos Aires",
      addressRegion: "CABA",
      addressCountry: "AR",
    },
    knowsAbout: [...KNOWS_ABOUT],
    sameAs: [linkedinUrl(data.identity.linkedin), SITE_URL],
  };

  const works = data.featured.map((f) => ({
    "@type": "CreativeWork",
    "@id": `${f.link}#creativework`,
    name: f.title,
    headline: f.kicker,
    description: f.blurb,
    url: f.link,
    dateCreated: f.year,
    keywords: [...f.stack],
    author: { "@id": personId },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [person, ...works],
  };
}

/**
 * Serialize JSON-LD for safe embedding in a <script> via dangerouslySetInnerHTML.
 * Escapes `<` to prevent breaking out of the script element (XSS hardening).
 */
export function jsonLdToString(lang: string): string {
  return JSON.stringify(buildJsonLd(lang)).replace(/</g, "\\u003c");
}
