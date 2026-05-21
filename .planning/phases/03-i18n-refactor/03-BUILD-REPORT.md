# Phase 3 Build Report — i18n Refactor

**Date:** 2026-05-10
**Branch:** v2.0.0
**Status:** ✅ Complete

---

## Bundle Delta vs Phase 2

**Expected:** ~0 — Phase 3 is data-only (locale JSON + type definitions + a 25-line hook). The hook is client-side and dynamically imports the same locale JSON the existing `useTranslation` already loads; no new transitive runtime deps.

**Measurement:** Deferred to Phase 9 (QA, Performance & Deploy). Per RC-04 the baseline is owned by Phase 9. Running `npm run build` between phases adds noise to the per-phase delta but does not validate the FR-02/FR-05 success criteria, which are functional, not size-based.

---

## Files Added / Modified

### Added
- `my-app/src/app/i18n/portfolio.types.ts` — full `PortfolioData` TypeScript shape with sub-interfaces (`Identity`, `HeroCopy`, `SectionLabels`, `FeaturedProject`, `GridProject`, `StackCategories`, `ExperienceEntry`, `AboutCopy`, `ContactCopy`, `FooterCopy`). Zero `any` types.
- `my-app/src/app/i18n/usePortfolioData.ts` — client-side hook returning `{ data: PortfolioData | null, ready: boolean }`. Calls `initI18next()` and `i18nInstance.getResourceBundle(lng, 'common')`.
- `my-app/src/app/i18n/__assert.ts` — compile-time drift guard: imports both locale JSONs and assigns them to `PortfolioData`. `tsc --noEmit` fails if shape drifts.
- `.planning/phases/03-i18n-refactor/03-CONTEXT.md` — design decisions and references
- `.planning/phases/03-i18n-refactor/03-PLAN.md` — 6-task atomic plan
- `.planning/phases/03-i18n-refactor/03-BUILD-REPORT.md` — this file

### Modified
- `my-app/public/locales/en/common.json` — added 10 namespaces (`identity`, `hero`, `sections`, `featured`, `projects`, `stack`, `experience`, `about`, `contact`, `footer`); removed `spline.rotate` and `spline.rotate-mobile`. Legacy `nav`, `CV`, `form`, `about-me`, `proyects` keys preserved for v1 compatibility.
- `my-app/public/locales/es/common.json` — same 10 namespaces with Spanish translations (Rioplatense flavor on contact/CTAs); `spline.*` removed; legacy keys preserved.

### Touched then reverted (no net change)
- `my-app/src/app/[lang]/ClientPage.tsx` — temporary `console.log` smoke test of `usePortfolioData()`; reverted after manual `/en` + `/es` verification. The `chore(phase-3)` empty commit records the verification artifacts.

---

## Verification Results

### Type safety
- `npx tsc --noEmit` passes with zero errors after every commit
- `__assert.ts` enforces JSON ↔ `PortfolioData` parity at build time
- `grep -n 'any' src/app/i18n/portfolio.types.ts` → no matches

### Functional (smoke test on dev server, hard-refreshed both routes)
| Field | /en value | /es value | Different? |
|-------|-----------|-----------|------------|
| `identity.name` | Tomás Pérez | Tomás Pérez | (proper noun, same) |
| `identity.tagline` | "Creating software that solves real problems — not just technical ones." | "Creando software que resuelve problemas reales — no solo técnicos." | ✅ |
| `identity.statusLine` | "Available for product roles" | "Disponible para roles de producto" | ✅ |
| `hero.ctaPrimary` | "See selected work" | "Ver trabajos destacados" | ✅ |
| `featured.length` | 3 | 3 | (same shape) |
| `experience.length` | 6 | 6 | (same shape) |

### JSON parity (top-level keys)
EN keys: `CV, about, about-me, contact, experience, featured, footer, form, hero, identity, nav, projects, proyects, sections, stack`
ES keys: same set ✓

### Cleanup
- `grep -r '"spline"' my-app/public/locales` → no matches ✓
- `grep -r 'portfolio-data' my-app/src` → no matches (pre-existing; preserved) ✓

---

## Deviations from PLAN.md

**Tuple types relaxed to `readonly string[]`.**

PLAN.md Task 1 specified `readonly [string, string]` tuples for `quickFacts`, `metrics`, and `StackEntry`. JSON-imported types cannot be narrowed to fixed-length tuples (TS infers `string[][]` for nested arrays). The choice was either:

1. **Cast through `as unknown as PortfolioData`** in `__assert.ts` — this would have **defeated the entire purpose** of the assertion file (no type-checking power left)
2. **Relax tuples to `readonly string[]`** — preserves real `tsc` drift detection, sacrifices "exactly 2 elements" structural promise

Picked option 2. Each consumer (Phase 4 components) can destructure `const [label, value] = entry` — runtime semantics unchanged. Documented in `portfolio.types.ts` via the `StackEntry` alias.

---

## Commit Trail

| # | SHA | Message |
|---|-----|---------|
| 0 | ea0acaa | docs(phase-3): add context and plan for i18n refactor |
| 1 | b9f6b6a | feat(phase-3): define portfolio data TypeScript shape |
| 2 | 529ead4 | feat(phase-3): add typed i18n namespaces to en/common.json |
| 3 | 1e4b39e | feat(phase-3): add Spanish translations to es/common.json |
| 4 | 603fb56 | feat(phase-3): add usePortfolioData hook with type-checked locale bundles |
| 5 | 9ef484c | chore(phase-3): smoke-test usePortfolioData hook (no code retained) |
| 6 | (this commit) | docs(phase-3): finalize phase 3 build report and state |

---

## Success Criteria Status

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `usePortfolioData()` returns complete typed data in both `en` and `es` | ✅ |
| 2 | All key namespaces present and populated in both locale files | ✅ |
| 3 | `portfolio-data.js` is no longer imported anywhere in `my-app/src/` | ✅ (pre-existing, preserved) |
| 4 | Switching locale returns different string values from the hook | ✅ (smoke test) |

**All 4 success criteria met. Phase 3 ready for archive.**
