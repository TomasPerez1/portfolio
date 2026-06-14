---
phase: 10-ssr-content-fix
plan: 01
subsystem: i18n / SSR data layer
tags: [ssr, seo, i18n, refactor, data-layer]
requires:
  - usePortfolioData.ts (existing sync static-JSON accessor)
  - public/locales/{en,es}/common.json (static content)
provides:
  - getPortfolioData(lang) — server-safe synchronous PortfolioData accessor (no "use client")
  - PortfolioData.cv — top-level typed CV path field
  - Unconditional <main> render in ClientPage (no spinner gate)
affects:
  - Hero.tsx, Footer.tsx (CV link now reads data.cv)
  - ClientPage.tsx (full tree renders into initial SSR HTML)
tech-stack:
  added: []
  patterns:
    - "Server-safe data accessor: plain sync fn over static JSON imports, no use client"
    - "Coupled type+JSON edit to keep `as unknown as` cast honest"
key-files:
  created:
    - my-app/src/app/i18n/getPortfolioData.ts
  modified:
    - my-app/src/app/i18n/portfolio.types.ts
    - my-app/public/locales/en/common.json
    - my-app/public/locales/es/common.json
    - my-app/src/app/components/Hero.tsx
    - my-app/src/app/components/Footer.tsx
    - my-app/src/app/[lang]/ClientPage.tsx
decisions:
  - "Bundled Footer FALLBACK_LINKS dead-code removal into the CV migration edit (10-RESEARCH.md Open Question 1) — file was already being edited; resulting early-return guard mirrors Hero.tsx"
  - "Renamed JSON key CV -> cv (option a) rather than runtime remap (option b) — eliminates the type/runtime mismatch permanently (10-RESEARCH.md Pitfall 2)"
requirements: [SSR-01, SSR-02]
metrics:
  duration: ~12 min
  completed: 2026-06-14
  tasks: 3
  files: 7
---

# Phase 10 Plan 01: SSR Data Foundation & i18next Consumer Migration Summary

Built a server-safe `getPortfolioData(lang)` accessor and migrated Hero/Footer/ClientPage off the async i18next chain, so the full portfolio tree (Nav, Hero, About, Footer) now renders into the initial server HTML on both `/en` and `/es` instead of a spinner-only response.

## What Was Done

**Task 1 — `cv` field + JSON rename (commit 3ce2dd1):**
- Added top-level `cv: string` to the `PortfolioData` interface, between `hero` and `sections`.
- Renamed the JSON key `"CV"` -> `"cv"` (line 7) in both `en/common.json` and `es/common.json`, preserving the original PDF paths.
- These landed in one commit because the JSON is consumed via `as unknown as PortfolioData` (a type assertion, not validation) — a casing mismatch would make `data.cv` silently `undefined` at runtime with no TS error (Pitfall 2).

**Task 2 — `getPortfolioData.ts` (commit 6fbc2a5):**
- New module mirroring `usePortfolioData.ts`'s `LOCALES` map, with two differences: no `"use client"` directive (importable from future Server Components in phases 11-16) and a plain function returning `PortfolioData` directly (no `{ data, ready }` wrapper).
- Synchronous (no `async`) — it is a static JSON read with no I/O.
- `usePortfolioData.ts` left unchanged (still the `"use client"` hook entry point).

**Task 3 — consumer migration (commit 42443f1):**
- `Hero.tsx`: removed `useTranslation` import + `const { t } = ...`; `cvLink={t("CV")}` -> `cvLink={data.cv}`.
- `Footer.tsx`: removed `useTranslation` import, dead `FALLBACK_LINKS` block, and `const { t } = ...`; added `if (!ready || !data) return null;` guard (mirrors Hero); replaced the conditional `links` ternary with a plain array literal; `href: t("CV")` -> `href: data.cv`.
- `ClientPage.tsx`: removed `LangLoader` and `useTranslation` imports, plus the `const { ready } = ...` / `if (!ready) return <LangLoader />` spinner gate; `<main>` now renders unconditionally.
- All three files retain `"use client"` on line 1 (Anti-Pattern 1: the directive does not block SSR).

## Scope Boundary (deferred to Plan 02)

This plan did the data layer + consumer migration ONLY. It did NOT:
- Delete the now-dead i18n files (`i18n/client.ts`, `i18n/index.ts`, `i18n/__assert.ts`, `ui/LangLoader.tsx`)
- Run `npm uninstall i18next react-i18next i18next-resources-to-backend`

Those happen in Plan 02 after a grep gate confirms zero remaining references (deleting before migration finishes would break the build — Pitfall 3). After this plan, `i18next` is still installed but no migrated source file imports the `i18n/client` runtime.

## Deviations from Plan

None — plan executed exactly as written. The Footer `FALLBACK_LINKS` removal and the JSON-rename approach were both explicit plan/research recommendations, not deviations.

## Verification

Per CLAUDE.md ("Never build after changes") and the plan's worktree note ("Do NOT run next build/start; production build validation deferred to plan 10-02's human checkpoint"), validation was done via grep acceptance criteria + static reasoning rather than `next build`.

- **Task 1:** `rg -c 'cv: string' portfolio.types.ts` = 1; `"cv"` = 1 / `"CV"` = 0 in both locales; values preserved; both JSON files parse via `JSON.parse`.
- **Task 2:** file exists; `head -1` is NOT `"use client";`; `export function getPortfolioData` = 1; `async` = 0; `usePortfolioData.ts` head -1 still `"use client";`.
- **Task 3:** `useTranslation` = 0 in all three files; `cvLink={data.cv}` = 1 (Hero); `href: data.cv` = 1 (Footer); `FALLBACK_LINKS` = 0; `LangLoader` = 0 (ClientPage); all three retain `"use client"` on line 1.
- **Cross-cutting:** zero remaining `i18n/client` / `t("CV")` references in the three migrated files; only Hero/Footer were the `t("CV")` consumers, both migrated — no orphan consumers.

**Note for Plan 02:** `next build && next start` + manual browser console hydration check on `/en` and `/es` (SSR-03) and curl content checks (SSR-01 runtime confirmation) are owned by Plan 02's human checkpoint. Local `tsc --noEmit` was attempted but TypeScript is not installed standalone (resolved transitively by Next at build time), so type validation relies on the build step in Plan 02.

## Known Stubs

None. `data.cv` is wired to a real value in both locales; no placeholders introduced.

## Threat Flags

None. This plan introduces no new attack surface — it removes a client-side translation library, renames one static JSON key, and swaps one URL string's source from a translation table to an already-bundled static object (consistent with the plan's threat_model, all dispositions `accept`/`n/a`).

## Commits

- `3ce2dd1` feat(10-01): add cv field to PortfolioData and rename JSON CV key
- `6fbc2a5` feat(10-01): add server-safe getPortfolioData accessor (SSR-02)
- `42443f1` feat(10-01): migrate Hero/Footer/ClientPage off i18next (SSR-01 foundation)

## Self-Check: PASSED

- FOUND: my-app/src/app/i18n/getPortfolioData.ts
- FOUND: .planning/phases/10-ssr-content-fix/10-01-SUMMARY.md
- FOUND commits: 3ce2dd1, 6fbc2a5, 42443f1
