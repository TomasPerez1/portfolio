---
phase: 10-ssr-content-fix
plan: 02
subsystem: i18n / SSR cleanup
tags: [ssr, seo, i18n, cleanup, dependency-removal]
requires:
  - phase: 10-01
    provides: getPortfolioData/usePortfolioData accessors + spinner-gate removal (every i18next source consumer already migrated)
provides:
  - Dead i18next runtime modules removed (i18n/client.ts, i18n/index.ts, i18n/__assert.ts, ui/LangLoader.tsx)
  - package.json with i18next / react-i18next / i18next-resources-to-backend uninstalled
  - Human-verified production build: full crawlable SSR content + zero hydration errors on /en and /es
affects: [Phase 11 (<html lang> fix), Phase 13 (metadata/JSON-LD), Phase 14 (OG images)]
tech-stack:
  added: []
  patterns:
    - "Grep gate as hard precondition before deleting modules (verify zero source references first)"
key-files:
  created: []
  modified:
    - my-app/package.json
    - my-app/package-lock.json
  deleted:
    - my-app/src/app/i18n/client.ts
    - my-app/src/app/i18n/index.ts
    - my-app/src/app/i18n/__assert.ts
    - my-app/src/app/ui/LangLoader.tsx
key-decisions:
  - "Deleted __assert.ts: confirmed it imported only the two common.json files + PortfolioData type (no client.ts/index.ts dependency) — its type-assertion role is subsumed by getPortfolioData.ts"
patterns-established:
  - "Grep gate before deletion: rg for i18n/client|i18n/index|LangLoader|i18next imports must return zero before removing dead modules"
requirements-completed: [SSR-01, SSR-03]
duration: ~10min
completed: 2026-06-14
---

# Phase 10 Plan 02: SSR Fix Close-Out Summary

**Removed the dead i18next runtime (four modules + three packages) after a zero-match grep gate, then human-verified that the production build serves full crawlable content with zero hydration errors on both `/en` and `/es`.**

## Performance

- **Duration:** ~10 min (autonomous tasks) + human build-validation checkpoint
- **Completed:** 2026-06-14
- **Tasks:** 4 (3 autonomous + 1 blocking human-verify checkpoint, now approved)
- **Files modified:** 2 modified, 4 deleted

## Accomplishments

- **Grep gate passed:** `rg "i18n/client|i18n/index|LangLoader|from \"i18next\"|from \"react-i18next\""` returned zero source matches — confirming Plan 01 migrated every consumer before any deletion (Pitfall 3 safeguard).
- **Dead modules deleted:** removed `i18n/client.ts`, `i18n/index.ts`, `i18n/__assert.ts`, and `ui/LangLoader.tsx`. `i18n-config.ts` and both data accessors (`getPortfolioData.ts`, `usePortfolioData.ts`) were preserved.
- **Packages uninstalled:** `npm uninstall i18next react-i18next i18next-resources-to-backend` — `package.json` now has zero `i18next` references.
- **Build human-verified:** the production build (`npm run build && npm run start`) was brought up locally by the human and the acceptance checks passed on both locales (see Verification).

## Task Commits

1. **Task 1: Grep gate + delete four dead i18n modules** - `9e5d682` (refactor)
2. **Task 2: Uninstall three i18next packages** - `ed77640` (chore)
3. **Task 3: SSR content + dependency-removal automated checks** - covered by the human-verified acceptance run (Task 4); no separate code commit (checks are read-only curl/grep)
4. **Task 4: Human-verify production build (hydration + content parity)** - APPROVED

**Progress commit:** `d529c9d` (docs: record deletion + uninstall, pause at build checkpoint)

_Note: Task 3's curl/grep checks produce no code change; they were executed against the running build as part of the human-approved acceptance run below._

## Files Created/Modified

- `my-app/package.json` - removed i18next, react-i18next, i18next-resources-to-backend from dependencies
- `my-app/package-lock.json` - lockfile updated to reflect the three removed packages
- `my-app/src/app/i18n/client.ts` - DELETED (i18next useTranslation wrapper, superseded)
- `my-app/src/app/i18n/index.ts` - DELETED (i18next instance initializer, no longer needed)
- `my-app/src/app/i18n/__assert.ts` - DELETED (type-assertion-only; role subsumed by getPortfolioData.ts)
- `my-app/src/app/ui/LangLoader.tsx` - DELETED (spinner component, unreferenced after Plan 01 gate removal)

## Decisions Made

- **Deleted `__assert.ts`:** the STATE.md pre-check flagged it for verification before deletion. Confirmed it imported only the two `common.json` files + the `PortfolioData` type (no import from `client.ts`/`index.ts`), so deleting it caused no broken imports — its `en/es as unknown as PortfolioData` type-check role is already covered by `getPortfolioData.ts`'s identical assertion.

## Deviations from Plan

None - plan executed exactly as written. The grep gate returned zero matches as expected, so deletion proceeded; no orphan references required fixing.

## Verification

Per project CLAUDE.md ("Never build after changes"), the production build was not run by the agent. Task 4 is a blocking human-verify checkpoint: the human brought up `npm run build && npm run start` locally and authorized the acceptance checks against the running server (http://localhost:3000). All Phase 10 scope checks PASSED:

- **SSR-01 content presence:** `/en` contains "Tomás" (4 matches, >0); `/es` contains "Sobre mí" (1, >0). Full `/es` tree present in SSR HTML: Sobre mí, Stack (3), Experiencia, Contacto, Voxel.
- **SSR-01 spinner absence + Hero:** `animate-spin` = 0 on both locales (spinner gate gone); `/en` Hero "Voxel" present in SSR HTML (1, >0).
- **CV links:** `/en` → FULLSTACK-TOMAS_PEREZ_en.pdf (2); `/es` → ..._es.pdf (2).
- **SSR-03 dependency/reference audit:** `rg -c "i18next" my-app/package.json` = 0; source-reference grep returns zero matches.
- **SSR-03 hydration:** browser console clean on both `/en` and `/es`. The only `hydrat` match in the HTML was `suppressHydrationWarning:true` (a React prop, NOT an error).
- **Content parity:** `/en` has no "Sobre mí" leak (0); `/es` has no English leak. Page sizes ~84KB (full content, not spinner stub).

## Known Stubs

None.

## Known Deferred Item (out of Phase 10 scope)

Both locales currently serve `<html lang="en">`. This is **expected** at the end of Phase 10, not a failure. The locked architecture decision in STATE.md defers the `<html lang>` fix (read `x-locale` from `middleware.ts` in the root layout, drop the `NEXT_LOCALE` cookie read) to **Phase 11** (with hreflang dependence in Phase 13). Plan 10-02 does not touch the root layout or middleware.

## Threat Flags

None. This plan only DELETES code and REMOVES packages — it introduces no new input handling, auth, network, or cryptography surface. `npm uninstall` strictly reduces supply-chain surface (no package installed). The spinner removal (done in Plan 01) exposes already-public, build-time static portfolio content (SSR-01 intended goal — no secrets/PII).

## Requirements Satisfied

- **SSR-01** — Crawler/bot with no JS receives full rendered content in initial HTML on both `/en` and `/es`, never a spinner (human-verified via curl on the production build).
- **SSR-03** — i18next + LangLoader spinner gate removed with zero translation loss and zero hydration errors (`package.json` clean, console clean on both locales).

_SSR-02 was completed in Plan 10-01 (server-safe `getPortfolioData(lang)`)._

## Self-Check: PASSED

- DELETED (confirmed absent): my-app/src/app/i18n/client.ts, index.ts, __assert.ts, ui/LangLoader.tsx
- PRESENT (confirmed): my-app/src/app/i18n-config.ts, getPortfolioData.ts, usePortfolioData.ts
- `grep -c "i18next" my-app/package.json` = 0
- FOUND commits: 9e5d682, ed77640, d529c9d
- FOUND: .planning/phases/10-ssr-content-fix/10-02-SUMMARY.md
