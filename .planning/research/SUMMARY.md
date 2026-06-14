# Project Research Summary

**Project:** portfolio -- tomas.dev (milestone v2.1.0: SEO & AI Discoverability)
**Domain:** Senior developer portfolio -- Next.js 16 App Router SEO, structured data, and AI/agentic-trend positioning
**Researched:** 2026-06-13
**Confidence:** HIGH (mechanics) / MEDIUM (keyword trend rankings)

## Executive Summary

This milestone fixes a portfolio that currently ships **zero crawlable content** -- `/es` (and effectively `/en`) renders only `<LangLoader/>`'s spinner on first paint because `ClientPage.tsx` gates its entire tree on an async `useTranslation().ready` flag that never resolves during SSR. On top of that real bug, the milestone adds the full native Next.js 16 Metadata/SEO toolkit: per-locale `generateMetadata` (title/description/OG/twitter/canonical/hreflang), JSON-LD `Person` structured data, per-locale static OG images via `next/og`, AI-crawler-aware `robots.ts`, and a `llms.txt`. **Zero new npm dependencies are required** -- everything is a native Next 16 App Router file convention or export, runs server-side/build-time, and adds 0 bytes to the client bundle, which aligns perfectly with the "performance is non-negotiable" constraint. The only optional addition is `schema-dts` as a types-only devDependency.

All four research streams converge on the same root cause and the same fix order: the i18next async gate is the single blocker for everything else. Fix SSR content first (remove the gate, derive `usePortfolioData`/CV reads from static JSON), fix `<html lang>` (currently permanently `"en"` because it reads a `NEXT_LOCALE` cookie that nothing ever sets), THEN layer metadata, JSON-LD, OG images, and crawler directives on top -- all of which need a new server-safe `getPortfolioData(lang)` accessor (the current `usePortfolioData` is `"use client"` and can't be called from `generateMetadata`). Critically, the keyword/copy strategy (Part B of FEATURES.md -- the "Keyword Podium") must land BEFORE metadata/JSON-LD are finalized, because every AI-trend term claimed in `<title>`, `<meta description>`, or JSON-LD `knowsAbout` must already be visible in `common.json`'s Stack/About content -- otherwise it's keyword-stuffing/fabrication, which both Google's structured-data guidelines and the project's own honesty gate explicitly forbid.

The main risks are: (1) hydration mismatches surfacing for the first time once the spinner gate is removed and the full tree renders on the server (ThemeProvider/theme-branching components need an audit); (2) hreflang/canonical asymmetry -- `/es`'s canonical must self-reference `/es`, NOT point at `/en`, or Google drops the ES page from its index entirely; (3) several open content/product decisions (English B2 vs C1 discrepancy, whether to add "Context Engineering" to the stack, public GitHub for `sameAs`, `/` redirect behavior, 307 to 308) that block final copy and must go to the OWNER before metadata/JSON-LD text is locked in. None of these are technically hard -- they're sequencing and decision gates, which is exactly what the roadmap phases below are structured around.

## Key Findings

### Recommended Stack

**Zero new npm dependencies.** Everything in scope is native to Next.js ^16.2.6 / React ^19.2.6, verified against Context7 docs for `/vercel/next.js/v16.2.2` with no breaking changes vs v15 for any of the APIs below.

**Core technologies:**
- `generateMetadata` (async, in `app/[lang]/layout.tsx` or `page.tsx`) -- per-locale title/description/OG/twitter/`alternates` (canonical + hreflang). Must `await params`. Requires `metadataBase` set in root layout (currently missing -- add `new URL("https://tomasperezdev.space")`).
- Inline `<script type="application/ld+json">` with `dangerouslySetInnerHTML` (server component) -- JSON-LD `Person` schema. This is Next's official current recommendation; explicitly NOT `next/script`. Must escape angle brackets for XSS hardening.
- `next/og` `ImageResponse` via `opengraph-image.tsx` file convention -- per-locale (`[lang]/opengraph-image.tsx`), generated at BUILD time (static, zero per-request cost). Fonts must be loaded via `fs.readFile` as TTF/OTF (not WOFF2) -- `next/font` CSS variables don't work inside Satori.
- `app/robots.ts` (`MetadataRoute.Robots`) -- migrate from static `public/robots.txt`, add explicit per-bot Allow rules for AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended). **Must delete `public/robots.txt`** when migrating -- static file and route convention can't coexist for the same path without conflict.
- `public/llms.txt` (static markdown file) -- concise machine-readable summary + links. Lowest-dependency item, can ship any time, but sequence its content AFTER the keyword/copy phase.
- Optional devDependency: `schema-dts` (types-only, zero runtime weight) for typed JSON-LD `Person`/`WithContext`.

**What NOT to add:** `next-seo`, `next-sitemap`, `@vercel/og` (already merged into `next/og`), `react-helmet`/`react-meta-tags`, heavyweight JSON-LD validation libs, `ai.txt`, i18n routing middleware packages, region-variant hreflang (en-US/en-GB etc.).

### Expected Features

**Must have (table stakes / P1):**
- SSR content fix (i18next hook removal) -- prerequisite for literally everything else
- `<html lang>` fix (derive from route locale, not cookie)
- `generateMetadata` per locale: title, description, OG tags, twitter:card, canonical, hreflang (en/es/x-default)
- Static per-locale OG image (1200x630)
- `robots.ts` with explicit AI-crawler allowlist
- `sitemap.xml` (already mostly correct -- verify only)
- JSON-LD `Person` schema with `knowsAbout` populated from the Keyword Podium
- `llms.txt`

**Should have (P2, add after validation if time allows):**
- `ProfilePage` + `CreativeWork`/`WorkExample` JSON-LD for featured projects (Zurich/Santander, DJ Presskit, Tienda Lo Quiero Aca)
- `Organization`/`sameAs` linking to LinkedIn (and GitHub, pending owner confirmation it's public)

**Defer (v2.2+):**
- Dynamic/per-request OG image generation reflecting live availability status
- `FAQPage` schema
- Sitemap fragments for sub-sections

**Anti-features (explicitly do NOT build):** `<meta keywords>` stuffing, AI-generated "schema-only" claims not backed by visible content, a `/blog` for SEO content velocity, `ai.txt`, hreflang for region variants, client-side (`useEffect`-injected) JSON-LD.

### The Keyword Podium (AI-trend positioning, ranked)

Every term checked against `common.json`'s actual Stack > AI Tooling (5 items: Claude Code/Daily, AI-Driven Development/Daily, Harness Engineering/Active, LLM Orchestration/Active, Agentic Workflows/Active). Honesty rule: HIGH rank only if the term has strong 2026 demand AND maps directly to existing content without inflation.

1. **1st Place: "Agentic Workflows" / "Agentic Engineering"** -- the 2026-dominant framing, explicitly "vibe coding for production" / the senior framing. Direct match (listed as Active). Strong secondary in title/meta description, primary in JSON-LD `knowsAbout`.
2. **2nd Place: "AI-Driven Development"** -- broader, more recruiter-legible umbrella term. Listed as **"Daily"** -- the single highest-frequency, most defensible AI claim in the whole profile. **Recommended primary title-tag anchor** (Option B: "Tomas Perez -- Full-Stack Developer | Agentic AI-Driven Development").
3. **3rd Place: "Harness Engineering"** -- the sleeper differentiator. 2026 sources (Martin Fowler, Red Hat Developer, MindStudio) frame it as senior/architecture-level AI-tooling thinking (6x performance gap from harness design alone). Direct match (Active). Best placed in JSON-LD `knowsAbout` + optional About-section detail -- rewards the technical reader/AI agent doing deeper analysis.

**Honorable mentions (4-8):** LLM Orchestration (#4, JSON-LD only), AI Pair Programming/"Claude Code" (#5, good for visible copy -- concrete and credible), Context Engineering (#6, CONDITIONAL -- see open decisions), Vibe Coding (#7, AVOID -- now the "beginner" comparison point vs agentic), RAG (#8, **DO NOT USE** -- zero evidence in `common.json`, would be classic keyword stuffing).

**Recommended `knowsAbout` array (ordered):**

```
["Agentic Workflows", "AI-Driven Development", "Harness Engineering", "LLM Orchestration",
 "Node.js", "NestJS", "TypeScript", "React", "Next.js", "Hexagonal Architecture",
 "Clean Architecture", "SOLID Principles", "PostgreSQL", "Redis", "Claude Code"]
```

AI-trend terms first (protagonist positioning for AI agents), immediately followed by core technical stack (preserves ATS/recruiter keyword matching).

**Title tag recommendation:** Option B -- `Tomas Perez -- Full-Stack Developer | Agentic AI-Driven Development`. **Meta description:** packs real role + real stack + podium #1/#2 + real experience proof + CTA, all traceable to `common.json`.

**Explicitly rejected positioning terms:** "AI-Native Developer"/"AI-First Engineer" as a job TITLE -- Tomas's actual role is "Full-stack Developer (Backend-oriented)"; claiming an AI-Native Developer title would misrepresent his function. The honest framing is "[Full-stack/Backend Developer] who works AI-augmented daily."

### Architecture Approach

The fix centers on ONE structural insight: **all of `<html lang>`, `generateMetadata`, and JSON-LD need `params.lang`**, and the current `app/layout.tsx` (the true root layout, owns `<html>`/`<body>`) sits OUTSIDE the `[lang]` segment, so it has no access to that param -- hence the broken cookie workaround.

**Resolution (revised/final recommendation from ARCHITECTURE.md):** Do NOT do a full root-layout promotion. Instead:
- `app/layout.tsx` stays the true root (`<html>`/`<body>`, fonts, providers, theme script) -- but `<html lang>` is now read via `(await headers()).get('x-locale')`, a NEW request header set by `middleware.ts` (which already computes `locale` for path rewriting -- just also write it to a header). Zero round-trip lag (same request, unlike cookies).
- `app/[lang]/layout.tsx` remains a normal NESTED layout (cannot redefine `<html>`/`<body>`, but CAN have its own `generateMetadata` + JSON-LD `<script>`, both fully supported in nested layouts via `params.lang`).
- This is a SMALLER, LOWER-RISK diff than full promotion, solves `<html lang>`, metadata, AND JSON-LD simultaneously, and leaves `app/page.tsx`'s `/` redirect path completely undisturbed.

**Major components / files touched:**
1. `app/middleware.ts` -- set `x-locale` request header (small, isolated change)
2. `app/layout.tsx` -- read `headers().get('x-locale')` for `<html lang>` (one line)
3. `app/[lang]/ClientPage.tsx`, `Hero.tsx`, `Footer.tsx` -- remove `useTranslation`/`LangLoader` gate, read `data.cv` from static JSON (the actual SSR fix)
4. NEW `app/i18n/getPortfolioData.ts` -- plain server-safe sync accessor (no `"use client"`), single source of truth for content, metadata, JSON-LD, AND OG image text
5. `app/[lang]/layout.tsx` -- gains `generateMetadata()` + JSON-LD `<script type="application/ld+json">`
6. NEW `app/[lang]/opengraph-image.tsx` -- per-locale static OG image via `ImageResponse`
7. `app/robots.ts` (new, replacing `public/robots.txt`), `app/llms.txt` (new static file)
8. Deleted: `app/i18n/client.ts`, `app/i18n/index.ts`, `app/ui/LangLoader.tsx` (check `app/i18n/__assert.ts` first -- may import from these), and npm deps `i18next`/`react-i18next`/`i18next-resources-to-backend`

**Confirmed safe:** `"use client"` does NOT block SSR -- client components ARE server-rendered for the initial HTML. The blocker was always the async `useTranslation` gate, never the `"use client"` directive itself. Removing the gate introduces NO new hydration risk (per Pattern 3's audit) -- it's strictly safer than today.

### Critical Pitfalls

1. **`<html lang>` permanently stuck on `"en"`** -- `NEXT_LOCALE` cookie is read but NEVER SET anywhere in the codebase, so the `|| "en"` fallback always wins. `/es` pages currently ship `<html lang="en">`, which directly contradicts the hreflang work about to be added. Fix via middleware-set `x-locale` header, not cookies.
2. **Spinner-gate removal surfaces latent hydration mismatches for the first time** -- today, mismatches inside `Nav`/`Hero`/`About`/`Contact` are invisible because those components never exist in SSR HTML (only the spinner does). Once the gate is removed, the full tree hits `hydrateRoot` for real. Audit `ThemeProvider` and any theme-branching render logic; verify with `next build && next start` (not dev mode) plus browser console on both locales.
3. **`usePortfolioData` is `"use client"` and imports BOTH locale JSONs unconditionally** -- can't be called from `generateMetadata` (server-only), and ships both `en` + `es` payloads to every client bundle regardless of route. Must split into a plain `getPortfolioData(lang)` server-safe function (single source of truth for content, metadata, JSON-LD, OG image -- eliminates drift) plus a thin client wrapper.
4. **hreflang/canonical asymmetry** -- `/es`'s canonical must self-reference `/es`, NOT point at `/en` ("EN canonical" means EN is the primary market, not that ES should canonicalize to EN -- doing so would make Google drop `/es` from the index entirely). Centralize via one `getAlternates(currentLang)` helper called identically from both locales. Set `metadataBase` once (currently missing -- risk of `localhost` leaking into production canonical/OG URLs).
5. **JSON-LD `Person` content/schema mismatch ("fabrication" risk)** -- `knowsAbout`/`jobTitle`/`description` must be derived from the SAME `getPortfolioData(lang)` as visible copy. Sequence is: keyword strategy, then update visible copy in `common.json`, then write JSON-LD from that updated copy. Never the reverse. Validate with BOTH Google's Rich Results Test AND schema.org validator (plain `Person` won't produce a rich SERP result -- that's expected, not a failure).

## Implications for Roadmap

All four researchers converge on the same build order. Below is the recommended phase structure.

### Phase 1: SSR Content Fix
**Rationale:** Single highest-leverage fix -- currently crawlers see only a spinner. Everything else (metadata, JSON-LD, OG) is describing content that doesn't exist yet from a crawler's perspective. This must land first.
**Delivers:**
- `app/[lang]/ClientPage.tsx`, `Hero.tsx`, `Footer.tsx` -- remove `useTranslation`/`LangLoader` gate; `Hero`/`Footer` read `data.cv` from `usePortfolioData`
- Add `cv: string` to `Identity`/`PortfolioData` type (confirm JSON shape -- `CV` key currently sits outside `identity` in `common.json`)
- NEW `app/i18n/getPortfolioData.ts` -- plain sync server-safe accessor (foundation for Phase 3)
- Delete `app/i18n/client.ts`, `app/i18n/index.ts`, `app/ui/LangLoader.tsx` -- **check `app/i18n/__assert.ts` first**, it may import from these and need updating/deletion too
- Remove `i18next`, `react-i18next`, `i18next-resources-to-backend` from `package.json`

**Addresses:** SSR content fix (table stakes), prerequisite for `<html lang>`, `generateMetadata`, JSON-LD
**Avoids:** Pitfall 2 (hydration mismatches -- explicit exit criterion: `next build && next start`, check console on `/en` and `/es`), Pitfall 3 (data-layer shape -- get `getPortfolioData` right here, not later)

### Phase 2: `<html lang>` Fix
**Rationale:** Small, isolated, touches completely different files than Phase 1 (`middleware.ts` + `app/layout.tsx` only) -- could even run in parallel with Phase 1, but sequenced as its own phase for clarity since hreflang correctness (Phase 3) depends on it.
**Delivers:**
- `middleware.ts` -- set `x-locale` request header from the already-computed `locale`
- `app/layout.tsx` -- read `headers().get('x-locale')` for `<html lang>`, remove `NEXT_LOCALE` cookie read

**Addresses:** `<html lang>` table-stakes fix (real SEO + accessibility win)
**Avoids:** Pitfall 1 (cookie-derived lang divergence)

### Phase 3: Keyword Strategy & Copy Updates
**Rationale:** Must precede metadata/JSON-LD finalization per Pitfall 6/9 -- every AI-trend term claimed in title/description/JSON-LD must already be visible in `common.json`. This is a content/copy phase, not a code phase, and it's the phase that requires OWNER decisions (see Open Decisions below).
**Delivers:**
- Finalized Keyword Podium selections applied to `common.json` (en + es) -- Stack/About section copy, `tagHighlight` subhead injection (e.g., append "...working AI-augmented, agentic-first, every day")
- Resolution of the open decisions listed below
- Draft title tag, meta description, and `knowsAbout` array text for both locales -- ready to be consumed by Phase 4

**Addresses:** Keyword Podium honesty framing (FEATURES.md Part B)
**Avoids:** Pitfall 9 (title/H1/content mismatch, keyword stuffing)

### Phase 4: Per-Locale Metadata, Canonical/Hreflang, JSON-LD
**Rationale:** Depends on Phase 1 (content/data layer exists), Phase 2 (`<html lang>` correct), and Phase 3 (final copy text). All three preconditions converge here.
**Delivers:**
- `app/[lang]/layout.tsx` -- `generateMetadata()`: title/description/OG/twitter/`alternates` (canonical + hreflang en/es/x-default) via `getPortfolioData(lang)`
- Centralized `getAlternates(lang)` helper for symmetric hreflang
- `metadataBase` added to root layout metadata
- JSON-LD `Person` `<script type="application/ld+json">` in `[lang]/layout.tsx`, using `knowsAbout` from Phase 3

**Addresses:** `generateMetadata` (P1), JSON-LD `Person` + `knowsAbout` (P1)
**Avoids:** Pitfall 5 (hreflang asymmetry, self-referencing canonical, `metadataBase`), Pitfall 6 (JSON-LD content/schema mismatch), Pitfall 9 (override vs merge with root layout -- verify via view-source)

### Phase 5: OG Images
**Rationale:** Should come AFTER Phase 3/4 so OG image text matches finalized title/description, and AFTER `getPortfolioData()` exists (Phase 1).
**Delivers:**
- `app/[lang]/opengraph-image.tsx` -- per-locale static `ImageResponse` (1200x630), 1-2 TTF font weights in `assets/og/`, minimal template (text + brand colors)
- Verify `next build` output shows the route as static/SSG, not dynamic

**Addresses:** OG image (P1 -- "professional share preview")
**Avoids:** Pitfall 7 (font loading via `readFile`/TTF not WOFF2, static-vs-dynamic generation, per-locale doubling)

### Phase 6: robots.ts / sitemap verification / llms.txt
**Rationale:** Lowest-dependency item, but llms.txt content should reflect Phase 3's finalized positioning -- sequence last among content-bearing work. Can be combined with Phase 7 (perf verification) as a final cleanup pass.
**Delivers:**
- `app/robots.ts` (`MetadataRoute.Robots`) replacing `public/robots.txt` (delete the static file -- collision risk if both exist), with explicit AI-crawler allowlist (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended)
- `public/llms.txt` -- markdown summary using Phase 3's finalized positioning
- `sitemap.ts` verification (already mostly correct -- confirm `lastModified`, URL/trailing-slash consistency with canonical from Phase 4)
- Resolve the `/` to `/en` redirect ambiguity (307 vs 308, middleware vs page-level redirect -- see Open Decisions)

**Addresses:** robots.txt AI-allowlist (P1), sitemap (P2), llms.txt (P1/P2)
**Avoids:** Pitfall 8 (over-blocking `Google-Extended`, static/route convention collision), Pitfall 4 (redirect chain/status code)

### Phase 7: Performance Verification
**Rationale:** Final exit gate for the entire milestone. Cumulative additions (JSON-LD size, extra link tags for hreflang, OG image route, robots/sitemap changes) could each be individually negligible but collectively regress the v2.0.0 perf baseline.
**Delivers:**
- `next build` output review -- confirm `/en` and `/es` (and OG image routes) are static/SSG, not dynamic
- Lighthouse run on both locales, compared against PROJECT.md success metrics (LCP<2.5s, CLS<0.1, INP<200ms, Lighthouse >=90/>=80)
- Bundle analyzer check -- confirm `getPortfolioData` split eliminated the double-locale-JSON client bundle issue (Pitfall 3)

**Addresses:** Cross-cutting perf requirement
**Avoids:** Pitfall 10 (cumulative small regressions, accidental dynamic rendering from stray `cookies()`/`headers()` in `generateMetadata`)

### Phase Ordering Rationale

- **Phases 1 and 2 are independent** (different files: ClientPage/Hero/Footer/i18n modules vs middleware/root-layout) but both must complete before Phase 4, since `generateMetadata`/JSON-LD need both correct content (Phase 1) and correct locale signal (Phase 2).
- **Phase 3 (copy/keyword strategy) is a hard gate before Phase 4** -- this is the single most-repeated dependency across FEATURES.md, ARCHITECTURE.md, and PITFALLS.md. Writing JSON-LD/metadata before finalizing visible copy risks fabrication (the project's explicit honesty gate) and a title/H1/content mismatch that Google may flag.
- **Phase 5 (OG images) depends on Phase 3's finalized text** and Phase 1's `getPortfolioData` -- sequenced after Phase 4 so the image content matches the shipped title/description.
- **Phase 6 (robots/sitemap/llms.txt) is the lowest-risk, most independent workstream** but its CONTENT (llms.txt summary) benefits from Phase 3's positioning -- hence sequenced near the end despite minimal code dependencies.
- **Phase 7 is a mandatory final gate**, not optional cleanup -- re-verifying the v2.0.0 perf baseline is an explicit success metric for this milestone.

### Research Flags

Needs research during planning (`/gsd:plan-phase --research-phase <N>`):
- **Phase 4** (Metadata/hreflang/JSON-LD): the hreflang/canonical symmetry logic and JSON-LD validation steps are subtle enough (Pitfall 5/6) that implementation-time verification against Google's Rich Results Test + schema.org validator should be planned explicitly.
- **Phase 5** (OG images): font-loading mechanics for `ImageResponse` (TTF extraction, `readFile` paths, static-generation verification) are new to this codebase -- confirm Vercel build output marks the route static before relying on it.

Phases with standard, well-documented patterns (skip deep research):
- **Phase 1** (SSR fix): architecture research already provides the exact file-by-file sequence and hydration audit -- execution is mechanical.
- **Phase 2** (`<html lang>`): the middleware-header pattern is documented and small (~3-line middleware change + 1-line layout change).
- **Phase 6** (robots/sitemap/llms.txt): `MetadataRoute.Robots`/`Sitemap` shapes confirmed against Context7 docs, no API ambiguity remains.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All Metadata API, `next/og`, `sitemap.ts`/`robots.ts` signatures verified directly against Context7 docs at the project's exact version (`v16.2.2` vs installed `^16.2.6`, no breaking changes). |
| Features | MEDIUM-HIGH | Part A (SEO mechanics) is HIGH confidence/well-established. Part B (Keyword Podium trend rankings) is MEDIUM -- based on 2026 web sources, cross-checked across multiple independent articles, but trend journalism carries inherent hype-amplification bias. The honesty-check methodology (cross-referencing against actual `common.json` content) is the strongest part of this research. |
| Architecture | HIGH | Verified against both the current codebase (direct file reads) and Next.js v16.1.6 docs via Context7, including the official `examples/i18n-routing` reference implementation. The Q5 (`<html lang>`) analysis went through two iterations and the FINAL recommendation (middleware header, not layout promotion) is the one to use -- earlier framing in the same doc is superseded. |
| Pitfalls | HIGH | Directly grounded in codebase inspection (confirmed `NEXT_LOCALE` cookie is never set -- a verified, currently-shipping bug) plus Context7 docs for API-level pitfalls (metadataBase, static params, robots shape). AI crawler user-agent list is MEDIUM (no canonical registry exists -- recommend re-verifying exact strings at implementation time). |

**Overall confidence:** HIGH for the technical/architectural path; MEDIUM for the exact keyword/copy wording, which is explicitly gated on owner decisions.

### Gaps to Address

- **English B2 vs C1 discrepancy**: `common.json`'s `quickFacts`/`hero.facts.english` says "B2 -- Upper Intermediate," but the milestone brief and `about-me`'s EF SET certificate reference claim C1. This is a factual-accuracy gate that should resolve BEFORE Phase 3 copy work, since English-first metadata may reference proficiency level.
- **"Context Engineering" as a 6th AI Tooling item**: MEDIUM-HIGH 2026 demand signal, but nothing in `common.json` currently names it explicitly -- though it's arguably an implicit byproduct of Harness Engineering + LLM Orchestration + Agentic Workflows combined. Flagged as HIGH-VALUE but requires owner confirmation before adding to `common.json` (a content change, not assumed by research).
- **Public GitHub for JSON-LD `sameAs`**: research assumes `https://github.com/Pelucheado` is appropriate for `sameAs` -- verify this is the owner's intended public-facing profile before hardcoding into JSON-LD across both locales.
- **`/` to `/en` always vs Accept-Language-based redirect**: PROJECT.md says "EN canonical, ES support," which research interprets as favoring an always-`/en` redirect for crawler predictability -- but current middleware does Accept-Language matching. This is a PRODUCT decision (predictability for crawlers vs. locale-matching for human visitors), not purely technical -- needs explicit resolution in Phase 6.
- **307 vs 308 for the `/` redirect**: two redirect mechanisms exist (middleware + `page.tsx`'s `redirect()`); confirm which fires in production and switch to `permanentRedirect()`/308 for the permanent locale mapping.
- **`app/i18n/__assert.ts`**: must be read BEFORE deleting `i18n/client.ts`/`i18n/index.ts` in Phase 1 -- it may import from one of those modules and need its own update/deletion.
- **CV field typing**: `"CV"` exists in `common.json` but its exact position (sibling of `identity` vs nested) needs confirming before adding `cv: string` to the `Identity`/`PortfolioData` type in Phase 1.

## Sources

### Primary (HIGH confidence)
- Context7 `/vercel/next.js/v16.2.2` and `/vercel/next.js/v16.1.6` -- `generateMetadata`, `alternates`/`metadataBase`, JSON-LD guide (`docs/01-app/02-guides/json-ld.mdx`), `next/og` `ImageResponse`/`opengraph-image.mdx`, `robots.ts`/`sitemap.ts` (`MetadataRoute.Robots`/`Sitemap`), `examples/i18n-routing` reference implementation, internationalization guide, root layout `<html>`/`<body>` requirement
- Direct codebase reads (HIGH confidence): `my-app/src/app/layout.tsx`, `[lang]/{layout,page,ClientPage}.tsx`, `page.tsx`, `middleware.ts`, `sitemap.ts`, `public/robots.txt`, `i18n/{usePortfolioData,client,index}.ts`, `i18n-config.ts`, `theme/ThemeProvider.tsx`, `providers.tsx`, `components/Hero.tsx`, `components/Footer.tsx`, `public/locales/{en,es}/common.json`, `package.json`

### Secondary (MEDIUM confidence)
- AI crawler user-agent landscape (GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot, Google-Extended, etc.) -- Anagram.ai, nohacks.co, digitalapplied.com (2026) -- recommend re-verifying exact strings against each vendor's current docs at implementation time
- llms.txt format/adoption -- codersera.com, llms-txt.io, glasp.co (2026) -- emerging convention, ~10% domain adoption, no proven AI-crawler effect; treat as positioning signal, not discoverability lever
- Keyword Podium trend rankings (Agentic Workflows/Engineering, AI-Driven Development, Harness Engineering, Context Engineering, LLM Orchestration) -- Firecrawl, Medium ("From Vibe to Agentic"), NxCode, Martin Fowler, Red Hat Developer, MindStudio, Neo4j, Elastic, arXiv (2026) -- multiple independent sources cross-checked, but trend-journalism hype-bias acknowledged
- hreflang/canonical self-referencing and `x-default` best practices -- Search Engine Journal, SEOClarity, SearchViu (2026)

### Tertiary (LOW confidence)
- None flagged -- all findings traced to at least Context7 docs, direct codebase reads, or multiple cross-checked 2026 web sources.

---
*Research completed: 2026-06-13*
*Ready for roadmap: yes*
