# Phase 3 Plan: i18n Refactor — Data → Locales

**Phase:** 3 of 9
**Complexity:** M
**Requirements:** FR-02, FR-05
**Depends on:** Phase 2 ✅
**Status:** Ready to execute

---

## Goal

Port all portfolio copy from `.claude_design/export/lib/portfolio-data.js` into typed i18n locale files (`en/common.json`, `es/common.json`). Build a `usePortfolioData()` hook that returns the full shape with zero `any` types. Remove obsolete `spline.*` keys.

---

## Pre-Flight Checks

- [ ] On branch `v2.0.0` with Phase 2 commits merged
- [ ] `cd my-app && npm run build` passes baseline before starting
- [ ] No uncommitted local changes
- [ ] Dev server (`npm run dev` with webpack flag) starts cleanly on /en and /es

---

## Tasks (sequential — never break the app between commits)

### Task 1 — Define the TypeScript shape

**Why:** Types-first prevents JSON drift and gives Phase 4 components a clean import target.

**File:** `my-app/src/app/i18n/portfolio.types.ts` (NEW)

**Actions:**
1. Create the file with full nested interfaces matching `.claude_design/export/lib/portfolio-data.js`:
   - `Identity` (name, role, location, timezone, email, phone, linkedin, site, statusLine, tagline, longBio[], quickFacts[][])
   - `FeaturedProject` (id, n, title, kicker, year, role, stack[], blurb, metrics[][], image, link)
   - `GridProject` (id, n, title, kicker, stack[], year)
   - `StackCategory` = `Record<string, [string, string][]>` — keyed by category name
   - `ExperienceEntry` (from, to, role, company, where, bullets[])
   - `HeroData` (greeting?, ctaPrimary, ctaSecondary, ctaTertiary)
   - `SectionLabels` (featured, projects, stack, experience, about, contact)
   - `ContactData` (heading, lead, formLabels, submitLabel, successMsg, errorMsg)
   - `FooterData` (rights, builtWith)
2. Export the top-level union `PortfolioData` combining all of the above.
3. **No `any` types anywhere.** Use `readonly` on arrays where applicable.
4. Commit: `feat(phase-3): define portfolio data TypeScript shape`

**Acceptance:**
- `tsc --noEmit` passes
- No `any` in the file (grep returns nothing)
- File exports `PortfolioData` and all sub-interfaces

---

### Task 2 — Populate English locale JSON

**File:** `my-app/public/locales/en/common.json`

**Actions:**
1. Read existing JSON; preserve `nav`, `CV`, `form`, `about-me`, `proyects` (legacy) keys.
2. REMOVE keys: `spline.rotate`, `spline.rotate-mobile` (the whole `spline` object).
3. ADD new top-level namespaces, porting content from `.claude_design/export/lib/portfolio-data.js`:
   - `identity` — full Identity block (name, role, location, timezone, email, phone, linkedin, site, statusLine, tagline, longBio array, quickFacts array)
   - `hero` — `{ ctaPrimary: "See selected work", ctaSecondary: "Get in touch", ctaTertiary: "Download CV" }`
   - `sections` — `{ featured, projects, stack, experience, about, contact }` (English labels for each section)
   - `featured` — array of 3 FeaturedProject objects (zurich-santander, dj-presskit, iphone-brc)
   - `projects` — array of 6 GridProject objects (tienda-lqa, property-scraper, hydrotek, spotsline, myfotolibro, properties-you)
   - `stack` — object with categories (Languages, Frontend, Backend, Data & Infra, AI Tooling), each an array of `[name, detail]` pairs
   - `experience` — array of 6 ExperienceEntry objects
   - `about` — `{ heading, paragraphs[] }` derived from `identity.longBio`
   - `contact` — `{ heading, lead, formLabels: { name, subject, message }, submitLabel, successMsg, errorMsg }` — reuse existing `form.*` strings where possible
   - `footer` — `{ rights, builtWith }`
4. Validate JSON: `node -e "JSON.parse(require('fs').readFileSync('my-app/public/locales/en/common.json','utf8'))"` exits 0.
5. Commit: `feat(phase-3): add typed i18n namespaces to en/common.json`

**Acceptance:**
- JSON parses without errors
- `spline` namespace gone
- All 10 new namespaces present with full content
- `grep -r '"spline"' my-app/public/locales` returns nothing

---

### Task 3 — Populate Spanish locale JSON (translated)

**File:** `my-app/public/locales/es/common.json`

**Actions:**
1. Read existing ES JSON; preserve existing keys.
2. REMOVE `spline` namespace.
3. ADD the same 10 namespaces as EN, with Spanish translations:
   - Tech terms stay in English (Node.js, React, TypeScript, NestJS, etc.)
   - `identity.tagline`, `identity.longBio`, `identity.statusLine`, `hero.cta*`, `sections.*`, `about.paragraphs`, `contact.heading/lead/successMsg/errorMsg`, project `kicker` and `blurb`, experience `role`/`where`/`bullets`, footer strings — all translated to natural Rioplatense Spanish
   - `featured[*].title`, `featured[*].year`, `featured[*].metrics` labels — keep proper nouns, translate labels (e.g. "Vulnerabilities fixed" → "Vulnerabilidades corregidas")
   - `stack` category names — translate ("Languages" → "Lenguajes", keep "Frontend", "Backend", "Data & Infra" → "Datos e Infra", "AI Tooling" → "Herramientas IA")
4. Validate JSON parse.
5. Commit: `feat(phase-3): add Spanish translations to es/common.json`

**Acceptance:**
- JSON parses without errors
- Same shape as EN (key-for-key)
- `spline` gone
- Manual spot-check: open both files side-by-side; every top-level key in EN exists in ES

**User review gate:** Before merging Task 3, the user reads the ES translations and approves or requests edits. This is a non-skippable human checkpoint.

---

### Task 4 — Build the `usePortfolioData()` hook

**File:** `my-app/src/app/i18n/usePortfolioData.ts` (NEW)

**Actions:**
1. Implement as a client-side hook:
   ```ts
   "use client";
   import { useEffect, useState } from "react";
   import { initI18next } from "./index";
   import type { PortfolioData } from "./portfolio.types";

   export function usePortfolioData(lng: string) {
     const [data, setData] = useState<PortfolioData | null>(null);
     const [ready, setReady] = useState(false);

     useEffect(() => {
       initI18next(lng, "common").then((i18nInstance) => {
         const bundle = i18nInstance.getResourceBundle(lng, "common") as PortfolioData;
         setData(bundle);
         setReady(true);
       });
     }, [lng]);

     return { data, ready };
   }
   ```
2. Add a build-time assertion file `my-app/src/app/i18n/__assert.ts`:
   ```ts
   import en from "../../../public/locales/en/common.json";
   import es from "../../../public/locales/es/common.json";
   import type { PortfolioData } from "./portfolio.types";

   const _en: PortfolioData = en as PortfolioData;
   const _es: PortfolioData = es as PortfolioData;
   // tsc will fail if the JSON shape drifts from PortfolioData
   void _en; void _es;
   ```
3. Run `cd my-app && npx tsc --noEmit` — fix any type errors surfaced (likely the `as PortfolioData` cast hides issues; tighten the types until cast is unnecessary for required fields).
4. Commit: `feat(phase-3): add usePortfolioData hook with type-checked locale bundles`

**Acceptance:**
- `tsc --noEmit` passes
- No `any` in the hook or types
- Hook returns `{ data, ready }` with `data: PortfolioData | null`
- `__assert.ts` exists and compiles

---

### Task 5 — Smoke test the hook in a scratch route

**Why:** Verify the hook returns different content per locale before Phase 4 wires it into real components.

**Actions:**
1. Temporarily edit `my-app/src/app/[lang]/ClientPage.tsx` (or add a small dev-only logger inside an existing client component) to consume the hook:
   ```ts
   const { data, ready } = usePortfolioData(lang);
   useEffect(() => { if (ready) console.log("[usePortfolioData]", lang, data?.identity?.name); }, [ready, data, lang]);
   ```
2. `npm run dev` (webpack flag), hard-refresh `/en` then `/es`.
3. Confirm browser console logs the data for each locale and shows DIFFERENT content (e.g., `tagline` reads in EN vs ES).
4. REMOVE the temporary logger before committing.
5. Commit: `chore(phase-3): smoke-test usePortfolioData hook (no code retained)`
   — this commit is a no-op on production code; the smoke-test verification is the artifact.

**Acceptance:**
- Console showed different `data.identity.tagline` for /en vs /es
- No temporary code left in committed files
- `npm run build` exits 0

---

### Task 6 — Document Phase 3 completion

**Actions:**
1. Create `.planning/phases/03-i18n-refactor/03-BUILD-REPORT.md` with:
   - Bundle delta vs Phase 2 (should be ~0 — i18n is data, not code growth)
   - List of files added/modified
   - Any deviations from plan
2. Update `.planning/STATE.md`:
   - Bump current position to "Phase 3 done. Next: Phase 4 (JSX → TSX)"
3. Commit: `docs(phase-3): finalize phase 3 build report and state`

**Acceptance:**
- `03-BUILD-REPORT.md` exists with the three required sections
- `STATE.md` reflects Phase 3 completion
- All commits land on `v2.0.0` branch

---

## Commit Plan (atomic)

| # | Files | Message |
|---|-------|---------|
| 1 | `src/app/i18n/portfolio.types.ts` | `feat(phase-3): define portfolio data TypeScript shape` |
| 2 | `public/locales/en/common.json` | `feat(phase-3): add typed i18n namespaces to en/common.json` |
| 3 | `public/locales/es/common.json` | `feat(phase-3): add Spanish translations to es/common.json` |
| 4 | `src/app/i18n/usePortfolioData.ts`, `src/app/i18n/__assert.ts` | `feat(phase-3): add usePortfolioData hook with type-checked locale bundles` |
| 5 | (no code retained) | `chore(phase-3): smoke-test usePortfolioData hook (no code retained)` |
| 6 | `.planning/phases/03-i18n-refactor/03-BUILD-REPORT.md`, `.planning/STATE.md` | `docs(phase-3): finalize phase 3 build report and state` |

---

## Success Criteria (from ROADMAP)

1. ✅ `usePortfolioData()` returns complete typed data in both `en` and `es` without errors
2. ✅ All key namespaces present and populated in both locale files
3. ✅ `portfolio-data.js` is no longer imported anywhere in `my-app/src/` (already true; verified by grep — preserve this invariant)
4. ✅ Switching locale via LangSwitcher returns different string values from the hook (Task 5 verifies)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| JSON shape drifts from `PortfolioData` type | Medium | `__assert.ts` casts JSON to `PortfolioData` — `tsc` fails on drift |
| `getResourceBundle()` returns `undefined` before init | Medium | Hook gates render via `ready` flag — same pattern as existing `useTranslation` |
| ES translations contain typos or wrong context | Medium-High | User review gate after Task 3 — non-skippable human checkpoint |
| HTML strings in `about-me` break with i18n interpolation | Low | Preserve current `dangerouslySetInnerHTML` pattern; Phase 4 decides rendering |
| Existing `proyects` legacy namespace conflicts with new `projects` | Low | They differ in spelling (`y` vs `j`); keep both until Phase 4 cleanup |
| Tech-term translation drift (e.g. "TypeScript" → "Mecanografiado") | Low | Locked in CONTEXT.md: tech proper nouns stay in English |

---

## Goal-Backward Verification

**Goal:** Single typed hook returns all portfolio copy; data lives in locale files; spline keys removed.

Working backward:
- Phase 4 needs typed props on 9 components → Task 1 ships `PortfolioData` types ✓
- Phase 4 needs ONE import to wire data → Task 4 ships `usePortfolioData()` ✓
- Phase 5 Hero needs `identity.statusLine`, `identity.tagline` → Task 2/3 populate these ✓
- Phase 6 sections need `featured`, `projects`, `stack`, `experience`, `about` namespaces → Task 2/3 populate these ✓
- Phase 7 contact form needs labels → Task 2/3 populate `contact.formLabels` ✓
- LangSwitcher already exists from v1 — no change needed; Task 5 confirms hook reacts to locale ✓

All Phase 4-7 prerequisites covered.

---

## Out of Scope (explicitly)

- Converting `.jsx` redesign components to `.tsx` (Phase 4)
- Wiring `usePortfolioData()` into any production component (Phase 4-7)
- Restyling
- Removing the legacy `proyects` namespace
- Splitting `about-me` HTML into structured paragraphs
- Adding a third locale
- Changing `react-i18next` infrastructure

---

*Plan written: 2026-05-10 — manual GSD format*
