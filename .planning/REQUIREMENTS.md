# Requirements: portfolio — tomas.dev · Milestone v2.1.0 (SEO & AI Discoverability)

**Defined:** 2026-06-14
**Core Value:** Make the portfolio fully discoverable and machine-readable — for recruiters, search engines, and AI candidate-search bots/agents — without sacrificing performance (in fact improving it).

> v2.0.0 (Visual Redesign) requirements archived in `.planning/REQUIREMENTS-v2.0.0.md`.

## v1 Requirements (this milestone)

Requirements for milestone v2.1.0. Each maps to a roadmap phase. Owner decisions already locked:
EN canonical / ES support · English level stays **B2 — Upper Intermediate** (no C1 claim) · "Context Engineering" **added** to AI Tooling · `sameAs` = **LinkedIn + own site** (no GitHub) · JSON-LD scope = **Person + featured projects**.

### SSR & Discoverability Foundation

- [ ] **SSR-01**: A crawler or bot (no JS execution) receives the fully-rendered portfolio content in the initial HTML on both `/en` and `/es` — never a spinner-only response.
- [ ] **SSR-02**: A server-safe `getPortfolioData(lang)` accessor provides portfolio content to server code (metadata, JSON-LD, OG image) without a `"use client"` boundary, as the single source of truth shared with the client.
- [ ] **SSR-03**: i18next (`i18next`, `react-i18next`, `i18next-resources-to-backend`) and the `LangLoader` spinner gate are removed with zero translation loss and zero hydration errors (`next build && next start`, console clean on both locales).

### Locale Correctness

- [ ] **LOCALE-01**: The `<html lang>` attribute reflects the actual route locale (`en` on `/en`, `es` on `/es`), derived from the route — not from the unset `NEXT_LOCALE` cookie.

### Keyword & Content Strategy

- [ ] **KW-01**: Visible content (`common.json` EN + ES) leads with AI-protagonist positioning (Agentic Workflows, AI-Driven Development) grounded in the real profile — no fabricated or stretched claims.
- [ ] **KW-02**: "Context Engineering" is added to `Stack > AI Tooling` in `common.json` (EN + ES).
- [ ] **KW-03**: Title and meta-description copy is finalized for both locales using the keyword podium, every claimed term traceable to visible content.

### Metadata & International SEO

- [ ] **META-01**: Each locale page emits a localized `<title>` and `<meta name="description">` via `generateMetadata`.
- [ ] **META-02**: Each locale page emits Open Graph and Twitter card meta tags.
- [ ] **META-03**: Canonical + hreflang (`en`, `es`, `x-default`) are correct and symmetric — `/es` self-canonicalizes to `/es`, `/en` to `/en`; `metadataBase` is set to the production origin.

### Structured Data (JSON-LD)

- [ ] **SCHEMA-01**: A schema.org `Person` JSON-LD block is server-rendered in the initial HTML, with `jobTitle`, `knowsAbout` (AI-trend terms first, then core stack), and `sameAs` (LinkedIn + own site) derived from visible content.
- [ ] **SCHEMA-02**: `CreativeWork` / `WorkExample` JSON-LD is emitted for the 3 featured projects (Zurich/Santander, DJ Presskit, iPhone BRC).
- [ ] **SCHEMA-03**: JSON-LD validates with no errors (Google Rich Results Test + schema.org validator); no claim appears in schema that is absent from visible content.

### Social Share Image

- [ ] **OG-01**: A per-locale Open Graph image (1200×630) is generated at build time and referenced by metadata; sharing the link (LinkedIn/Slack/WhatsApp) shows a professional preview.

### Crawler Directives

- [ ] **CRAWL-01**: `robots.ts` explicitly allows major AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended) and references the sitemap.
- [ ] **CRAWL-02**: `sitemap.xml` is verified correct (URLs, hreflang alternates, `lastModified`) and consistent with the canonical URLs from META-03.
- [ ] **CRAWL-03**: An `llms.txt` machine-readable summary is published, reflecting the finalized positioning.

### Performance Integrity

- [ ] **PERF-01**: Both `/en` and `/es` (and the OG image routes) render as static/SSG, not dynamic.
- [ ] **PERF-02**: Lighthouse and Core Web Vitals meet the v2.0.0 targets on both locales — LCP<2.5s, CLS<0.1, INP<200ms, Lighthouse ≥90 desktop / ≥80 mobile — no regression.
- [ ] **PERF-03**: The client bundle no longer ships both locales' JSON to every route (the `getPortfolioData` split is verified in the bundle analyzer).

## v2 Requirements (deferred)

### Richer Structured Data

- **SCHEMA-04**: `ProfilePage` wrapper schema.
- **SCHEMA-05**: `Organization` entries for employers/clients.

### Dynamic Discoverability

- **OG-02**: Dynamic per-request OG image reflecting live availability status.
- **CRAWL-04**: Sitemap fragments for sub-sections / future blog.

## Out of Scope

| Feature | Reason |
|---------|--------|
| `<meta keywords>` stuffing | Ignored by search engines; risks over-optimization signal |
| AI-generated "schema-only" claims not backed by visible content | Violates honesty gate + Google structured-data guidelines |
| GitHub in JSON-LD `sameAs` | Owner opted out for this milestone |
| C1 English claim | Factual accuracy — owner confirmed B2 — Upper Intermediate |
| "AI-Native Developer" / "AI-First Engineer" as job title | Misrepresents actual role (Full-stack, backend-oriented, AI-augmented) |
| "RAG" / "Vibe Coding" keywords | RAG: no backing in profile (stuffing). Vibe Coding: 2026 junior-tier framing |
| `/blog` for SEO content velocity | Out of milestone scope; no CMS (per v2.0.0 non-goals) |
| `ai.txt`, region-variant hreflang (en-US/en-GB), client-side JSON-LD | Non-standard / no benefit / defeats SSR purpose |
| Backend / contact-pipeline changes | This milestone is discoverability + SSR only |

## Traceability

Finalized mapping — phases continue from v2.0.0's Phase 9 (7 phases: 10-16). See `.planning/ROADMAP.md` Milestone v2.1.0 for full phase details and success criteria.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SSR-01 | Phase 10 | Pending |
| SSR-02 | Phase 10 | Pending |
| SSR-03 | Phase 10 | Pending |
| LOCALE-01 | Phase 11 | Pending |
| KW-01 | Phase 12 | Pending |
| KW-02 | Phase 12 | Pending |
| KW-03 | Phase 12 | Pending |
| META-01 | Phase 13 | Pending |
| META-02 | Phase 13 | Pending |
| META-03 | Phase 13 | Pending |
| SCHEMA-01 | Phase 13 | Pending |
| SCHEMA-02 | Phase 13 | Pending |
| SCHEMA-03 | Phase 13 | Pending |
| OG-01 | Phase 14 | Pending |
| CRAWL-01 | Phase 15 | Pending |
| CRAWL-02 | Phase 15 | Pending |
| CRAWL-03 | Phase 15 | Pending |
| PERF-01 | Phase 16 | Pending |
| PERF-02 | Phase 16 | Pending |
| PERF-03 | Phase 16 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-14*
*Last updated: 2026-06-14 — roadmap created, phase boundaries finalized (Phases 10-16)*
