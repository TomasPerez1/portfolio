---
gsd_state_version: 1.0
milestone: v2.1.0
milestone_name: SEO & AI Discoverability
status: executing
stopped_at: ROADMAP.md created for v2.1.0 (Phases 10-16, full coverage of 20 requirements), REQUIREMENTS.md traceability finalized, STATE.md updated.
last_updated: "2026-06-14T14:30:00.000Z"
last_activity: 2026-06-14 -- Phase 10 Plan 02 paused at human-verify checkpoint (build validation)
progress:
  total_phases: 7
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
  percent: 7
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-13)

**Core value:** Make the portfolio fully discoverable and machine-readable — for recruiters, search engines, and AI candidate-search bots/agents — without sacrificing performance (in fact improving it).
**Current focus:** Phase 10 — ssr-content-fix

## Current Position

Phase: 10 (ssr-content-fix) — EXECUTING
Plan: 2 of 2 (paused at build-validation human checkpoint)
Status: Plan 10-02 autonomous tasks done (dead modules deleted, i18next uninstalled); awaiting human build validation
Last activity: 2026-06-14 -- Phase 10 Plan 02 paused at human-verify checkpoint

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

v2.1.0 owner decisions locked (see REQUIREMENTS.md header + PROJECT.md):

- EN canonical / ES support (hreflang both, `/es` self-canonicalizes to `/es`)
- English level stays **B2 — Upper Intermediate** — no C1 claim anywhere in copy or metadata
- "Context Engineering" added as a 6th item to `Stack > AI Tooling` (EN + ES)
- JSON-LD `sameAs` = LinkedIn + own site only — **no GitHub**
- JSON-LD scope = `Person` + `CreativeWork`/`WorkExample` for the 3 featured projects (Zurich/Santander, DJ Presskit, iPhone BRC)
- Zero new npm dependencies required for this milestone (native Next.js 16 Metadata API / `next/og` / `robots.ts` / `sitemap.ts`); `schema-dts` optional as types-only devDependency

Architecture decision (from research, applies to Phase 11/13):

- Do NOT promote `app/[lang]/layout.tsx` to root. Keep `app/layout.tsx` as true root (`<html>`/`<body>`); read `<html lang>` via `(await headers()).get('x-locale')` set by `middleware.ts`. `[lang]/layout.tsx` stays a nested layout but gains `generateMetadata()` + JSON-LD `<script>`.

### Pending Todos

None yet — Phase 10 not yet planned.

### Blockers/Concerns

- **Phase 10 pre-check**: Read `app/i18n/__assert.ts` BEFORE deleting `app/i18n/client.ts` / `app/i18n/index.ts` — it may import from one of those and need its own update/deletion.
- **Phase 10 pre-check**: Confirm the exact position of the `CV` key in `common.json` (sibling of `identity` vs nested) before adding `cv: string` to the `Identity`/`PortfolioData` type.
- **Phase 10 exit criterion**: `next build && next start` (not dev mode) — browser console must be clean on both `/en` and `/es` (spinner-gate removal can surface latent hydration mismatches in `ThemeProvider`/theme-branching components for the first time).
- **Phase 12 hard gate**: No term may be written into Phase 13's `<title>`/`<meta description>`/JSON-LD `knowsAbout` unless it is already visible in `common.json` after Phase 12 — anti-fabrication / honesty gate.
- **Phase 13 verification**: Hreflang/canonical symmetry and JSON-LD must both be checked against Google Rich Results Test AND schema.org validator — plain `Person` JSON-LD will not produce a rich SERP result, that's expected, not a failure.
- **Phase 14 verification**: Confirm `next build` marks `opengraph-image.tsx` routes as static/SSG for both locales before relying on them; fonts must be loaded as TTF via `fs.readFile` (WOFF2/`next/font` vars don't work inside Satori).
- **Phase 16 mandatory exit gate**: Milestone is not complete until Lighthouse ≥90 desktop / ≥80 mobile, LCP<2.5s, CLS<0.1, INP<200ms are re-confirmed on BOTH `/en` and `/es`, with no regression vs the v2.0.0 baseline.
- AI crawler user-agent list (GPTBot, ClaudeBot, etc.) is MEDIUM confidence — re-verify exact strings against each vendor's current docs at Phase 15 implementation time.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Testing | Playwright E2E tests | Deferred (v2.0.0 OQ-5) | v2.0.0 SPEC §8 |
| Schema | `ProfilePage` wrapper, `Organization` entries | Deferred to v2 (SCHEMA-04, SCHEMA-05) | REQUIREMENTS.md v2.1.0 |
| OG | Dynamic per-request OG image (live availability) | Deferred to v2 (OG-02) | REQUIREMENTS.md v2.1.0 |
| Crawl | Sitemap fragments for sub-sections/blog | Deferred to v2 (CRAWL-04) | REQUIREMENTS.md v2.1.0 |

## Session Continuity

Last session: 2026-06-14
Stopped at: Phase 10 Plan 02 — grep gate passed, four dead i18n modules deleted (9e5d682), three i18next packages uninstalled (ed77640). Paused at the blocking human-verify checkpoint: production build validation (next build && next start + browser console hydration check on /en and /es) cannot be auto-run (CLAUDE.md "Never build after changes"). Awaiting human "approved".
Resume file: .planning/phases/10-ssr-content-fix/10-02-PLAN.md (resume at Task 3 curl checks + Task 4 hydration verify after human confirms build)

---

*Next action: `/gsd:plan-phase 10` — plan the SSR Content Fix phase (foundational, perf-positive, unblocks all subsequent phases)*
