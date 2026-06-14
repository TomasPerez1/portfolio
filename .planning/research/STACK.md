# Technology Stack: SEO & AI Discoverability (v2.1.0)

**Project:** portfolio — tomas.dev
**Researched:** 2026-06-13
**Next.js version (verified):** ^16.2.6 (Context7 docs checked against `/vercel/next.js/v16.2.2`)

## Headline Finding

**Zero new npm dependencies are required.** Everything in this milestone's scope — per-locale metadata, hreflang/canonical, JSON-LD, dynamic OG images, sitemap/robots, llms.txt — is a **native Next.js 16 App Router file convention or export**. All of it runs server-side (RSC / build-time / edge image generation), adding **0 bytes to the client JS bundle**. This aligns perfectly with the "performance is non-negotiable" constraint.

The only optional addition is a **devDependency** (`schema-dts`, types-only, zero runtime weight) for type-safe JSON-LD — and even that is "nice to have," not required.

---

## Recommended Stack

### Core Framework (unchanged — confirmed current)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | ^16.2.6 | App Router, Metadata API, `next/og` | Already installed. All APIs below verified against Context7 docs for `v16.2.2` (closest indexed version to 16.2.6) — **no breaking changes** to `generateMetadata`, `alternates`, `robots.ts`, `sitemap.ts`, or `next/og` import path between v15 and v16.2.x. |
| React | ^19.2.6 | Server Components for metadata + JSON-LD | Already installed. `generateMetadata` and JSON-LD `<script>` injection both run in RSC — no client component needed. |

### New: Per-Route Metadata (zero deps)

| API | Where it lives | Purpose | Why |
|-----|----------------|---------|-----|
| `generateMetadata` (async function) | `src/app/[lang]/page.tsx` (or a new `src/app/[lang]/layout.tsx`) | Per-locale `title`, `description`, `openGraph`, `twitter`, `alternates` | Native API, runs server-side, resolved into `<head>` before first byte. Receives `params: Promise<{ lang: string }>` — **must `await params`** (Next 15+ requirement, confirmed still true in 16.2.2). |
| `metadata.alternates.canonical` + `metadata.alternates.languages` | Same `generateMetadata` return | hreflang `<link rel="alternate" hreflang="...">` tags + canonical `<link rel="canonical">` | Confirmed exact output in Context7 docs — Next generates the `<link>` tags automatically from this object. No manual `<head>` manipulation needed. |
| `metadataBase` (root layout `metadata` export, unchanged) | `src/app/layout.tsx` | Resolves relative URLs in `alternates`, `openGraph.images`, etc. into absolute URLs | Already a one-line addition: `metadataBase: new URL("https://tomasperezdev.space")`. Required for relative canonical/OG paths to resolve correctly — **add this now**, it's currently missing from `layout.tsx`. |

### New: JSON-LD Structured Data (zero deps, optional types-only dep)

| Approach | Where | Purpose | Why |
|----------|-------|---------|-----|
| Inline `<script type="application/ld+json">` with `dangerouslySetInnerHTML` | `src/app/[lang]/page.tsx` (server component) | `Person` schema (+ optional `WebSite`/`ProfilePage`) | This is Next's **official current recommendation** (docs/01-app/02-guides/json-ld.mdx, v16.2.2) — explicitly states `next/script` is NOT appropriate here ("JSON-LD is structured data, not executable code, a native `<script>` tag is the right choice"). Must escape `<` as `<` via `.replace(/</g, '\\u003c')` to prevent XSS — confirmed in docs. |
| `schema-dts` (optional, **devDependency only**) | type definitions for the `jsonLd` object | Compile-time type safety for `Person`/`WebSite` schema shape | Purely a TS types package — zero runtime/bundle impact. Optional; skip if you want zero new deps at all. Import pattern: `import { Person, WithContext } from "schema-dts"` then type the object as `WithContext<Person>`. |

### New: Dynamic Open Graph Images (zero deps)

| API | Import path | Where | Purpose | Why |
|-----|-------------|-------|---------|-----|
| `ImageResponse` | `next/og` (confirmed — **same path in v16.2.2**, no migration to a different module) | `src/app/[lang]/opengraph-image.tsx` (file convention) | Generates a 1200x630 PNG per-locale at request/build time | File-convention based: export `alt`, `size = { width: 1200, height: 630 }`, `contentType = 'image/png'`, and a default async function returning `new ImageResponse(jsx, options)`. Next auto-wires the `<meta property="og:image">` tags — no manual metadata entry needed. |

**Static vs Dynamic OG image tradeoff for THIS project:**

- **Recommended: static-per-locale, generated at BUILD time** (not per-request). Because `opengraph-image.tsx` under `app/[lang]/` runs through `generateStaticParams` (same as the page), Next can pre-render one OG image per locale (`en`, `es`) at build time and serve them as static assets on Vercel's CDN — **zero per-request compute cost**, zero cold-start latency for the share-preview use case (which is the "primary real-world use case" per the milestone brief).
- If the design needs the image to reflect dynamic data (e.g., name pulled from the JSON locale file rather than hardcoded), that's still fine at build time — `usePortfolioData`-equivalent JSON import is synchronous and available during static generation.
- **Avoid:** runtime-only (`force-dynamic`) OG image generation unless you actually need per-request personalization (e.g., OG image that varies by query param). There's no such requirement here — a static per-locale image is strictly better for performance and is simpler to reason about.
- **Font note:** if the OG image design uses a custom font (e.g., Bricolage Grotesque to match brand), `ImageResponse` requires loading font binary data via `fs.readFile` (Node) at generation time — confirmed pattern in docs: `readFile(join(process.cwd(), 'assets/Inter-SemiBold.ttf'))`, passed via the `fonts` option. This runs at build time only, so no runtime cost. Keep the font file small (subset if possible) since it's bundled into the build, not shipped to the client.

### New: hreflang + Canonical Correctness (zero deps — same mechanism as metadata above)

This is **not a separate library** — it's the `alternates` field of `generateMetadata`'s return value, confirmed in docs:

```ts
alternates: {
  canonical: `https://tomasperezdev.space/${lang}`,
  languages: {
    "en": "https://tomasperezdev.space/en",
    "es": "https://tomasperezdev.space/es",
    "x-default": "https://tomasperezdev.space/en", // recommended for AI/bot crawlers without a clear locale match
  },
}
```

Output confirmed in Context7 docs:
```html
<link rel="canonical" href="..." />
<link rel="alternate" hreflang="en" href="..." />
<link rel="alternate" hreflang="es" href="..." />
```

EN is canonical per project decision — so for the `/en` route, `canonical` points to itself; for `/es`, `canonical` should likely also point to `/es` (each locale is canonical for itself; hreflang handles cross-linking — do NOT set `/es`'s canonical to `/en`, that would tell Google to drop the ES page from the index entirely, which contradicts "ES support").

### New: sitemap.ts and robots.ts Improvements (zero deps — extend existing files)

| File | Current state | What to add | Why |
|------|---------------|--------------|-----|
| `src/app/sitemap.ts` | Already exists, returns `MetadataRoute.Sitemap[]` for en/es with `alternates.languages` | Mostly fine as-is. Consider: confirm `lastModified` reflects actual content change dates (currently `new Date()` on every build — acceptable but not meaningful; could hardcode to milestone ship date and bump manually, or leave as-is — low priority). | Current implementation already follows the correct `MetadataRoute.Sitemap` shape per v16.2.2 docs — confirmed no API changes needed. |
| `public/robots.txt` (static) | Minimal: `User-agent: *` / `Allow: /` / `Sitemap: ...` | **Migrate to `src/app/robots.ts`** (file convention, `MetadataRoute.Robots`) to get typed output AND to add per-bot rules for AI crawlers (see below). | `robots.ts` is the modern convention — same output, but typed and co-located with other metadata file conventions (`sitemap.ts`, `opengraph-image.tsx`). Confirmed `MetadataRoute.Robots` shape supports array of per-`userAgent` rules. |

**robots.ts recommended shape** (confirmed `MetadataRoute.Robots` type supports arrays of rules):

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Explicitly allow AI search/answer bots that drive referral traffic
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-User", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: "https://tomasperezdev.space/sitemap.xml",
  };
}
```

**Rationale for ALLOW (not block) on AI crawlers:** This is a portfolio whose explicit goal is to be discovered by recruiters and AI agents doing candidate search (per PROJECT.md: "AI / Agentic Development is the protagonist of the messaging"). Blocking GPTBot/ClaudeBot/PerplexityBot would actively work against the milestone's stated goal. The MEDIUM-confidence 2026 community guidance (see Pitfalls/Sources) is to block *training-only* scraper bots that don't drive traffic (e.g., `CCBot`) on content-heavy sites with IP concerns — that calculus doesn't apply to a public portfolio whose entire purpose is being found and read by exactly these bots.

### New: llms.txt (zero deps — static file)

| Approach | File | Why |
|----------|------|-----|
| **Static file in `public/llms.txt`** | `my-app/public/llms.txt` | Recommended for this project. The content (name, role, skills, project summaries, contact) changes only when you ship a new milestone — same cadence as the rest of the static JSON content. A static file is simplest, has zero runtime cost, and is trivially served by Next's existing static file handling (same mechanism as `robots.txt` currently). |
| (Not recommended) Dynamic route handler `app/llms.txt/route.ts` | — | Only valuable if content is generated from a CMS/database that changes independently of deploys. This project's content is static JSON checked into the repo — a route handler would add indirection with no benefit. If you want it derived from the same `common.json` source to avoid drift, a **build-time generation script** (Node script run in `prebuild`) that writes `public/llms.txt` from the locale JSON is a reasonable middle ground — still zero runtime cost. |

`llms.txt` format convention (MEDIUM confidence — emerging spec, not yet IETF/W3C standardized, but widely adopted pattern as of 2026): Markdown file with H1 title, short summary blockquote, then H2 sections linking to key pages/resources. For a portfolio: link to `/en`, `/es`, CV PDFs, and a short structured summary of role/stack/availability — essentially a plain-language complement to the JSON-LD `Person` schema for LLMs that fetch this file directly (some agents check `/llms.txt` before/instead of crawling HTML).

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Metadata management | Native `generateMetadata` + `Metadata` type | `next-seo` package | `next-seo` predates the App Router Metadata API and is largely redundant for App Router projects — it wraps APIs Next now provides natively. Adds a dependency for zero gain; some of its patterns (e.g., `NextSeo` component) are Pages Router idioms incompatible with RSC-first metadata resolution. |
| JSON-LD typing | `schema-dts` (optional, types-only) | Hand-rolled types / no types | `schema-dts` is Google's own package for schema.org TypeScript types, zero runtime cost (devDependency), and is the package explicitly referenced in Next's own JSON-LD guide. Low-cost correctness win if the team wants type safety; entirely optional. |
| Dynamic OG images | `next/og` `ImageResponse` (file convention, build-time static) | `@vercel/og` package directly | `@vercel/og` was the precursor package; its functionality was merged into `next/og` as a built-in. Installing `@vercel/og` separately would be redundant — Next 16 ships it natively via `next/og`. |
| Dynamic OG images | Build-time static per-locale `opengraph-image.tsx` | Per-request dynamic generation (`force-dynamic`) | No personalization requirement exists (per milestone scope: "professional share preview" is the use case). Static generation = served from Vercel CDN edge cache with zero compute per request; dynamic = cold-start + compute on every social-media unfurl request. Static wins on both performance and cost for this use case. |
| AI crawler file | Static `public/llms.txt` | Dynamic `app/llms.txt/route.ts` | Content cadence matches static JSON locale files (changes per-milestone, not per-request). A route handler adds a serverless function invocation per crawl for no benefit when content is this static. |
| robots control | Native `app/robots.ts` (`MetadataRoute.Robots`) | Keep static `public/robots.txt` | `robots.ts` gives typed, per-bot array rules (needed for the AI crawler allowlist) and lives alongside `sitemap.ts`/`opengraph-image.tsx` as part of the same metadata-file-convention family — more maintainable and discoverable than a flat static text file once you need >1 user-agent block. |

---

## Installation

```bash
# No required dependencies — everything is built into next@^16.2.6

# OPTIONAL (types-only, zero runtime cost):
npm install -D schema-dts
```

---

## Integration Points with the i18next-removal / SSR-fix Work

This is the most important cross-cutting note for the roadmapper:

1. **`generateMetadata` MUST live in a server component** (`page.tsx` or a new `layout.tsx` under `src/app/[lang]/`). Currently `src/app/[lang]/page.tsx` is already a server component that renders `<ClientPage lang={lang} />` (a `"use client"` component). This is fine — `generateMetadata` is exported alongside the server `Page` component and does NOT need to touch `ClientPage` at all. **No conflict with the SSR-fix work**, but there IS a natural sequencing dependency:

   - The SSR-fix work converts `ClientPage` from a client component gated on `useTranslation(lang, "common").ready` into a server-rendered tree that reads `usePortfolioData(lang)` synchronously from the static JSON import.
   - `generateMetadata` in `page.tsx` will want to read the **same locale JSON data** (e.g., `identity.name`, `identity.role`, `identity.tagline` from `common.json`) to populate `title`/`description`/OG content per locale — so it should use the **same data-loading approach** that the SSR-fix introduces for `usePortfolioData`. If SSR-fix lands first, `generateMetadata` can import the exact same helper; if SEO work lands first, `generateMetadata` can do its own lightweight synchronous JSON import (`import en from "../../../public/locales/en/common.json"` style) since `public/locales/{lang}/common.json` is already a static JSON file importable at build/server time regardless of the client-side hook's fate.

2. **`<html lang>` fix** (from PROJECT.md's target feature list) and **hreflang/canonical** are closely related but distinct: `<html lang={lang}>` should be derived from the route param in `src/app/[lang]/layout.tsx` (a new file, or move logic from root `layout.tsx`) — NOT from the `NEXT_LOCALE` cookie as currently implemented in `src/app/layout.tsx` line 53 (`const lang = (await cookies()).get("NEXT_LOCALE")?.value || "en"`). This is a **separate small fix** but should land in the same phase as metadata work since both depend on "what locale is this route" being resolved from `params.lang`, not a cookie. Recommend a `src/app/[lang]/layout.tsx` that sets `<html lang={lang}>` and wraps `RootLayout`'s children — verify this doesn't create nested `<html>` tags (only ONE layout in the tree should render `<html>`; if root `layout.tsx` currently renders `<html>`, the `[lang]/layout.tsx` should NOT — instead, root layout needs to become locale-aware, OR root layout's `<html lang>` becomes a default and `[lang]/layout.tsx` is removed in favor of passing lang down. **This needs explicit architectural decision in the roadmap phase, not assumed here.**)

3. **i18next removal and `generateMetadata` are independent** — `generateMetadata` runs at the Next.js metadata-resolution layer (RSC, before page render), completely separate from `react-i18next`'s client-side `useTranslation` hook. Removing i18next does not block or require changes to `generateMetadata` implementation, beyond the shared-data-source consideration in point 1.

---

## What NOT to Add

- **No `next-seo`** — redundant with native Metadata API (see Alternatives table).
- **No `next-sitemap`** — `sitemap.ts` file convention already covers this; `next-sitemap` is a Pages-Router-era package for generating sitemaps as a postbuild script, unnecessary when the App Router has a native typed file convention.
- **No separate OG image service** (e.g., `@vercel/og` as standalone, Cloudinary OG templates, Bannerbear, etc.) — `next/og`'s `ImageResponse` is already the merged/native version of `@vercel/og` and handles this fully.
- **No `react-helmet` / `react-meta-tags`** — these are React-Router/CRA-era client-side head-management libraries; fundamentally incompatible with and unnecessary for RSC-based Metadata API (would also add client bundle weight, violating the zero-client-cost constraint).
- **No heavyweight JSON-LD libraries** (e.g., full `json-ld` processing/validation libraries) — a plain object + `JSON.stringify` in a `<script>` tag is the entire implementation, per Next's own docs.
- **No i18n routing middleware packages** (e.g., `next-intl`'s routing layer) for the hreflang/alternates work — the existing `[lang]` segment + `i18n-config.ts` (`locales: ["en", "es"]`) is sufficient input to generate `alternates.languages` and `generateStaticParams` for both metadata and `opengraph-image.tsx`.

---

## Sources

- **Context7** `/vercel/next.js/v16.2.2` (HIGH confidence — version-matched to project's `^16.2.6`):
  - `generateMetadata` function signature, `params: Promise<...>` requirement, `ResolvingMetadata` parent param
  - `alternates.canonical` / `alternates.languages` → confirmed `<link rel="canonical">` / `<link rel="alternate" hreflang="...">` output
  - `metadataBase` usage with relative paths for `alternates` and `openGraph.images`
  - JSON-LD guide (`docs/01-app/02-guides/json-ld.mdx`) — official recommendation for `<script type="application/ld+json">` with `dangerouslySetInnerHTML`, XSS escaping via `<`, explicit guidance AGAINST `next/script` for this use case, `schema-dts` typing pattern
  - `next/og` `ImageResponse` — confirmed import path `from 'next/og'` unchanged in v16.2.2; `opengraph-image.tsx` file convention with `alt`/`size`/`contentType` exports; font-loading pattern via `readFile`
  - `robots.ts` / `MetadataRoute.Robots` — confirmed array-of-rules shape for per-user-agent directives; `sitemap.ts` / `MetadataRoute.Sitemap` shape (matches existing implementation, no changes needed)

- **WebSearch (MEDIUM confidence, verified against above where overlapping):**
  - [Functions: generateMetadata | Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — confirms `themeColor`/`colorScheme` deprecated from `metadata` since Next 14, must live in `viewport` export (already correctly done in current `layout.tsx`, no change needed)
  - [AI Crawlers Explained: GPTBot, ClaudeBot, PerplexityBot and How to Let Them In (2026) | Anagram](https://www.anagram.ai/blog/ai-crawlers-explained-gptbot-claudebot-perplexitybot-and-how-to-let-them-in-2026) — per-bot user-agent strings (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended), and the distinction between training bots vs. search/answer bots
  - [llms.txt Explained (May 2026) | Codersera](https://codersera.com/blog/llms-txt-complete-guide-2026/) and [How to Add llms.txt to Next.js and React Apps](https://llms-txt.io/blog/how-to-add-llms-txt-to-nextjs-react) — static `public/llms.txt` vs. dynamic route handler tradeoffs; llms.txt is a complement to, not replacement for, robots.txt

## Confidence Notes / Open Items for Roadmap

- **HIGH confidence:** All Metadata API, `next/og`, `sitemap.ts`/`robots.ts` signatures — directly verified against Context7 docs at the project's exact major/minor version.
- **MEDIUM confidence:** `llms.txt` format conventions — this is an emerging, not-yet-formally-standardized convention as of mid-2026; the "what to put in it" content structure is a best-practice pattern, not an enforced spec. Low risk either way since it's an additive static file.
- **MEDIUM confidence:** AI crawler user-agent list — based on 2026 web search aggregation, not an official single source-of-truth (no canonical registry exists). Recommend the roadmap phase re-verify the exact current user-agent strings against each vendor's published docs (OpenAI, Anthropic, Perplexity, Google) at implementation time, since these strings occasionally get new variants added.
- **OPEN ITEM (flagged above):** the `<html lang>` placement / layout nesting question (root `layout.tsx` vs. new `src/app/[lang]/layout.tsx`) needs an explicit architectural decision during roadmap/phase planning — this research surfaces the constraint but does not resolve it, since it depends on how the SSR-fix phase restructures the `[lang]` tree.
