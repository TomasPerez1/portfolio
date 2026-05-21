# Phase 6 Plan: Content Sections Wire-up

**Phase:** 6 of 9
**Complexity:** L
**Requirements:** FR-01, FR-06, QR-03
**Depends on:** Phase 5 ✅
**Status:** Ready to execute

---

## Goal

Wire the 6 remaining redesign components (FeaturedWork, ProjectsGrid, StackSection, Experience, About, Footer) plus the redesign Contact UI into `/[lang]`, replacing all v1 sections. After Phase 6, the page is 100% redesign (Contact backend wiring deferred to Phase 7). Add reduced-motion pause to StackTicker. Delete legacy chrome files now unreferenced.

---

## Pre-Flight Checks

- [ ] On branch `v2.0.0` with Phase 5 commits merged (HEAD ≥ `5ff033e`)
- [ ] `cd my-app && npx tsc --noEmit` passes baseline
- [ ] `npm run build` passes baseline
- [ ] No uncommitted local changes
- [ ] Dev server runs on `/en` and `/es` — Phase 5 chrome (Nav + Hero) renders correctly

---

## Tasks (sequential)

### Task 1 — Build 7 wrappers (one commit)

**Files to create** under `my-app/src/app/components/redesign/wrappers/`:
1. `FeaturedWorkWrapper.tsx`
2. `ProjectsGridWrapper.tsx`
3. `StackSectionWrapper.tsx`
4. `ExperienceWrapper.tsx`
5. `AboutWrapper.tsx`
6. `ContactWrapper.tsx`
7. `FooterWrapper.tsx`

**Pattern (per wrapper):**
```ts
"use client";
import { usePortfolioData } from "../../../i18n/usePortfolioData";
import ComponentX from "../ComponentX";

export interface ComponentXWrapperProps { lang: string }

export default function ComponentXWrapper({ lang }: ComponentXWrapperProps) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  return <ComponentX items={data.SLICE} />;
}
```

**Per-wrapper mapping:**
- `FeaturedWorkWrapper` → `<FeaturedWork items={data.featured} />`
- `ProjectsGridWrapper` → `<ProjectsGrid items={data.projects} />`
- `StackSectionWrapper` → `<StackSection stack={data.stack} />`
- `ExperienceWrapper` → `<Experience items={data.experience} />`
- `AboutWrapper` → `<About identity={data.identity} />`
- `ContactWrapper` → `<Contact identity={data.identity} />` (pass full Identity; Contact only Picks what it needs)
- `FooterWrapper` → `<Footer />` (no data dependency; wrapper for API consistency)

**Acceptance:**
- 7 new files
- `npx tsc --noEmit` passes
- Each wrapper is self-contained and exports default

**Commit:** `feat(phase-6): add 7 content section wrappers for redesign components`

---

### Task 2 — Add reduced-motion pause to StackTicker animation

**File:** `my-app/src/app/globals.css`

**Actions:**
1. Read existing globals.css; find or confirm the `.animate-ticker` CSS class definition (or its `@keyframes ticker` rule)
2. At the end of the file, append:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .animate-ticker {
       animation: none;
     }
   }
   ```
3. If `.animate-ticker` is NOT defined in globals.css (i.e., it relies on a Tailwind plugin or comes from elsewhere), still append the rule — harmless if it matches nothing, future-proof if it's added.
4. `npm run build` passes

**Commit:** `feat(phase-6): pause StackTicker animation under prefers-reduced-motion`

**Acceptance:**
- Rule appended to globals.css
- Build still passes

---

### Task 3 — Swap ClientPage.tsx to redesign sections

**File:** `my-app/src/app/[lang]/ClientPage.tsx`

**Actions:**
1. Remove imports for `AboutMe`, `Proyects`, `Contact` (v1 from `(sections)/landing/`)
2. Add imports for the 7 new wrappers + `StackTicker` (which is a named export from `FeaturedWork.tsx`)
3. Replace the `<section id="content">` block with the new ordering:
   ```tsx
   <NavWrapper lang={lang} />
   <HeroWrapper lang={lang} />
   <StackTicker />
   <FeaturedWorkWrapper lang={lang} />
   <ProjectsGridWrapper lang={lang} />
   <StackSectionWrapper lang={lang} />
   <ExperienceWrapper lang={lang} />
   <AboutWrapper lang={lang} />
   <ContactWrapper lang={lang} />
   <FooterWrapper lang={lang} />
   ```
4. Keep the `useTranslation` `ready` gate + `<LangLoader />` for the initial load
5. Simplify the outer `<main>` to a vertical stack (no flex layout — single column)
6. `npx tsc --noEmit` passes
7. `npm run build` passes (TypeScript check + static generation)

**Commit:** `feat(phase-6): wire all redesign sections into ClientPage (v1 sections removed)`

**Acceptance:**
- ClientPage imports zero `(sections)/landing/*` references
- Section ordering matches design canonical order
- Build passes

---

### Task 4 — Delete unreferenced legacy files

**Actions:**
1. Verify no other imports of the legacy files via grep:
   ```bash
   grep -r "from.*SideBar" my-app/src
   grep -r "from.*NavBar" my-app/src
   grep -r "from.*LangSwitcher" my-app/src    # ui/ one
   grep -r "from.*landing/landing" my-app/src
   grep -r "from.*landing/about-me" my-app/src
   grep -r "from.*landing/proyects" my-app/src
   ```
2. For each path with ZERO matches → delete the file (or directory if all files in it are unreferenced):
   - `my-app/src/app/ui/SideBar.tsx`
   - `my-app/src/app/ui/NavBar.tsx`
   - `my-app/src/app/ui/LangSwitcher.tsx`
   - `my-app/src/app/(sections)/landing/landing/` (entire directory)
   - `my-app/src/app/(sections)/landing/about-me/` (entire directory)
   - `my-app/src/app/(sections)/landing/proyects/` (entire directory)
3. **DO NOT delete `(sections)/landing/contact/`** — Phase 7 will port email logic from `SendEmail.tsx`. Leave the directory intact.
4. If after deletions `(sections)/landing/` only contains `contact/`, leave the parent group intact.
5. Run `npx tsc --noEmit` — must pass after deletions
6. Run `npm run build` — must pass

**Commit:** `chore(phase-6): delete unreferenced legacy v1 chrome and section files`

**Acceptance:**
- Listed files gone from disk
- `(sections)/landing/contact/` preserved
- tsc + build pass

---

### Task 5 — Manual smoke test

**Verifications (you do this in browser):**
1. `npm run dev` (webpack flag)
2. Hard refresh `/en` — verify page renders ALL sections in canonical order:
   - Nav floating pill at top
   - Hero with voxel
   - StackTicker marquee
   - FeaturedWork (3 case studies)
   - ProjectsGrid (6 projects)
   - StackSection (5 stack categories)
   - Experience (6 entries)
   - About (bento grid)
   - Contact (form + calendar mock)
   - Footer
3. Switch to `/es` via LangSwitch — verify all section text shows Spanish
4. Toggle theme via Nav button — verify all sections respond (note any sections that break visually in light mode — that's a Phase 1 gap, document but don't fix)
5. Open DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → verify StackTicker stops animating
6. Tab through page from Nav onwards → verify focus reaches interactive elements in each section
7. Console: check for new errors (next/image warnings are pre-existing; ignore)
8. Network tab: verify the locale JSON is fetched once (not 8 times)

**No commit yet.** Report observations for the build report.

**Acceptance:**
- 8 verification steps recorded (PASS or known-gap with note)

---

### Task 6 — Build report + STATE.md

**Actions:**
1. Create `.planning/phases/06-content-sections/06-BUILD-REPORT.md`:
   - Files created/modified/deleted
   - tsc + build status
   - Smoke test results
   - Deviations
   - Deferred items (Hero mouseleave leak, light-mode gaps if any, Contact backend, `(sections)/landing/contact/` preserved)
2. Update `.planning/STATE.md` to Phase 6 done, Phase 7 next
3. Commit: `docs(phase-6): finalize build report and state`

**Acceptance:**
- BUILD-REPORT.md + STATE.md committed
- All 5 success criteria from ROADMAP documented as met (or known-gap)

---

## Commit Plan (atomic)

| # | Files | Message |
|---|-------|---------|
| 1 | 7 wrapper files | `feat(phase-6): add 7 content section wrappers for redesign components` |
| 2 | `globals.css` | `feat(phase-6): pause StackTicker animation under prefers-reduced-motion` |
| 3 | `[lang]/ClientPage.tsx` | `feat(phase-6): wire all redesign sections into ClientPage (v1 sections removed)` |
| 4 | Multiple `.tsx` deletions + dir removals | `chore(phase-6): delete unreferenced legacy v1 chrome and section files` |
| 5 | (no commit — smoke test) | — |
| 6 | `06-BUILD-REPORT.md`, `STATE.md` | `docs(phase-6): finalize build report and state` |

---

## Success Criteria (from ROADMAP)

1. ✅ Scrolling shows all 6 content sections populated with real data
2. ✅ All section text updates correctly when language is switched
3. ✅ All sections visible in dark and light themes without layout breaks
4. ✅ FeaturedWork ticker animation runs (pauses under reduced motion)
5. ✅ All interactive elements keyboard-reachable

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Light-mode CSS variables incomplete from Phase 1 | Medium-High | Document any breaks in smoke test; do NOT fix in Phase 6 (out of scope). Phase 8 polish or Phase 1 retro fix. |
| 8 simultaneous `usePortfolioData()` calls fetch 8 times | Low-Medium | i18next caches the resource bundle per instance. Verify via Network tab; if redundant, defer optimization to Phase 8. |
| Legacy file deletion breaks an unknown import | Low | Grep BEFORE delete (Task 4 step 1). |
| `StackTicker` not visible because CSS animation class missing | Low | Even if missing, the items render statically. Phase 8 polish can address. |
| `(sections)/landing/contact/SendEmail.tsx` removed accidentally | Low | Explicit DO-NOT-DELETE noted in CONTEXT.md and Task 4 step 3. |
| `npm run build` fails due to import resolution after deletions | Low | Build runs after Task 4. If it fails, fix imports inline. |

---

## Goal-Backward Verification

**Goal:** Entire page is v2 redesign; theme + lang switching work across every section.

Working backward:
- Phase 7 needs `Contact.tsx` already wired visually so it can swap in real backend → Tasks 1+3 deliver ✓
- Phase 8 polish needs every section in place to add animation triggers → Tasks 1+3 deliver ✓
- Phase 9 audit needs the final page surface → Tasks 1+3+4 deliver ✓
- FR-01 (copy from i18n) → Task 1 wrappers deliver ✓
- FR-06 (redesign live) → Task 3 delivers ✓
- QR-03 (reduced-motion ticker) → Task 2 delivers ✓

---

## Out of Scope (explicitly)

- Contact form backend wiring (Nodemailer, Sonner, Calendly real embed) — Phase 7
- Scroll-driven animations, page transitions — Phase 8
- `Hero.tsx` mouseleave listener cleanup fix — Phase 8
- Light-mode CSS variable fixes (if discovered) — Phase 8 polish or Phase 1 retro
- `next/image` migration — Phase 9 perf
- `usePortfolioData()` instance sharing optimization — Phase 8 polish

---

*Plan written: 2026-05-10 — manual GSD format*
