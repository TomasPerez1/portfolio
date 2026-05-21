# Phase 2 Plan: Stack Migration — NextUI → HeroUI + Spline Removal

**Phase:** 2 of 9
**Complexity:** M
**Requirements:** PR-03
**Depends on:** Phase 1 ✅
**Status:** Ready to execute

---

## Goal

Eliminate `@nextui-org/react` and `@splinetool/react-spline` from the dependency tree, replace with `@heroui/react`, and stub Spline so the app renders cleanly. Measure bundle drop vs Phase 1 baseline (269 kB).

---

## Pre-Flight Checks

- [ ] On branch `v2.0.0` with Phase 1 commits (`d24f3a9`, `c3c1f9c`) merged
- [ ] `npm run build` passes baseline before starting
- [ ] No uncommitted local changes

---

## Tasks (executed sequentially — never break the app between commits)

### Task 1 — Install HeroUI alongside NextUI

**Why:** Co-existence allows file-by-file swap with safe rollback.

**Actions:**
1. `cd my-app && npm install @heroui/react`
2. Inspect `node_modules/@heroui/react/package.json` to confirm exported components match the audit (Card, Accordion, Form, Input, Button, Textarea, Spinner, Switch, Skeleton, Tooltip, Navbar*, HeroUIProvider)
3. Confirm Tailwind plugin location: check `node_modules/@heroui/theme` or `node_modules/@heroui/react` for the `heroui()` plugin export
4. Commit: `feat(phase-2): install @heroui/react`

**Acceptance:**
- `npm ls @heroui/react` reports installed
- Build still passes (NextUI is still present, HeroUI is unused at this point)

---

### Task 2 — Swap `NextUIProvider` → `HeroUIProvider`

**File:** `my-app/src/app/providers.tsx`

**Actions:**
1. Replace the import:
   ```ts
   // before
   import { NextUIProvider } from "@nextui-org/react";
   // after
   import { HeroUIProvider } from "@heroui/react";
   ```
2. Replace `<NextUIProvider>` with `<HeroUIProvider>` JSX
3. Run `next dev`; visit `http://localhost:3000/[lang]` (en or es)
4. Confirm app renders without console errors
5. Commit: `feat(phase-2): swap NextUIProvider for HeroUIProvider`

**Acceptance:**
- Dev server returns HTTP 200 on `/[lang]/en`
- No "missing provider" runtime errors in console
- All NextUI children components STILL work because they coexist on the page (NextUI not yet uninstalled)

---

### Task 3 — Update `tailwind.config.js` plugin

**File:** `my-app/tailwind.config.js`

**Actions:**
1. Replace `const { nextui } = require("@nextui-org/react");` with `const { heroui } = require("@heroui/react");` (or `@heroui/theme` if that's the documented entry — verify in Task 1)
2. Replace content path `"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"` with the HeroUI equivalent
3. Replace `nextui()` in plugins array with `heroui()`
4. Run `next dev`; verify no Tailwind compilation errors
5. Commit: `feat(phase-2): switch tailwind plugin from nextui to heroui`

**Acceptance:**
- Tailwind compiles without errors
- HeroUI components rendered on screen still have their styling

---

### Task 4 — Swap remaining 8 component imports

**Files:**
- `src/app/(sections)/landing/proyects/ProyectCard.tsx`
- `src/app/(sections)/landing/contact/SendEmail.tsx`
- `src/app/(sections)/landing/contact/Adress.tsx`
- `src/app/ui/LangLoader.tsx`
- `src/app/ui/LangSwitcher.tsx`
- `src/app/ui/SideBar.tsx`
- `src/app/ui/Loader.tsx`

**Actions:**
1. In each file, replace the literal `"@nextui-org/react"` with `"@heroui/react"` on the import line
2. Run `tsc --noEmit` (or rely on `next build` later) to surface any API drift
3. If any component throws a TS error, document it in this PLAN.md as a deviation and patch
4. Commit: `feat(phase-2): swap remaining @nextui-org/react imports to @heroui/react`

**Acceptance:**
- No `@nextui-org/react` imports remain in `my-app/src/`
- `tsc --noEmit` passes (or only emits pre-existing warnings)

---

### Task 5 — Stub Spline in `Landing.tsx`

**File:** `my-app/src/app/(sections)/landing/landing/Landing.tsx`

**Actions:**
1. Read the file to understand current Spline usage (lazy + Suspense)
2. Remove the `React.lazy(() => import("@splinetool/react-spline"))` line and any `<Suspense>` wrapper around it
3. Replace the `<Spline />` JSX with a placeholder:
   ```tsx
   {/* TODO(phase-5): replace with voxel CSS 3D hero */}
   <div
     aria-hidden
     className="w-full h-full flex items-center justify-center text-fg-faint font-mono text-xs"
   >
     [hero placeholder — phase 5]
   </div>
   ```
   Match whatever container dimensions the existing Spline was inhabiting so layout doesn't shift.
4. Remove now-unused imports (`React.lazy`, `Suspense` if not used elsewhere)
5. Verify `/en` and `/es` render without runtime errors
6. Commit: `feat(phase-2): stub Spline hero pending phase 5 voxel`

**Acceptance:**
- `next dev` renders `/[lang]` cleanly with the placeholder visible
- No `@splinetool/react-spline` imports anywhere in `my-app/src/`
- DevTools Network tab shows zero requests to `prod.spline.design`

---

### Task 6 — Uninstall NextUI and Spline; verify build

**Actions:**
1. `cd my-app && npm uninstall @nextui-org/react @splinetool/react-spline`
2. Run `npm run build` and capture output
3. Compare First Load JS for `/[lang]` against baseline (269 kB)
4. Save a `phase2-build.txt` with the new build report into `.planning/phases/02-stack-migration/`
5. Update STATE.md with Phase 2 progress
6. Commit: `chore(phase-2): remove @nextui-org/react and @splinetool/react-spline`

**Acceptance:**
- `package.json` has zero references to `@nextui-org/react` or `@splinetool/react-spline`
- `package-lock.json` no longer contains those entries
- `next build` exits 0
- `phase2-build.txt` exists with the new report
- No white-screen or import errors at runtime on `/[lang]/en` and `/[lang]/es`

---

## Commit Plan (atomic)

| # | Files | Message |
|---|-------|---------|
| 1 | `package.json`, `package-lock.json` | `feat(phase-2): install @heroui/react` |
| 2 | `src/app/providers.tsx` | `feat(phase-2): swap NextUIProvider for HeroUIProvider` |
| 3 | `tailwind.config.js` | `feat(phase-2): switch tailwind plugin from nextui to heroui` |
| 4 | 7 component files | `feat(phase-2): swap remaining @nextui-org/react imports to @heroui/react` |
| 5 | `Landing.tsx` | `feat(phase-2): stub Spline hero pending phase 5 voxel` |
| 6 | `package.json`, `package-lock.json`, `.planning/phases/02-stack-migration/phase2-build.txt`, `STATE.md` | `chore(phase-2): remove @nextui-org/react and @splinetool/react-spline` |

---

## Success Criteria (from ROADMAP)

1. ✅ `package.json` contains no references to `@nextui-org/react` or `@splinetool/react-spline`
2. ✅ `next build` completes without TypeScript or module errors
3. ✅ Running app has no broken imports or white-screen crashes from the swap
4. ✅ Build output shows measurable First Load JS reduction vs Phase 1 baseline (269 kB)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| HeroUI component API differs (e.g. prop renamed) | Medium | Coexist install (Task 1) + per-file swap (Task 4) — `tsc` surfaces drift before runtime |
| HeroUI Tailwind plugin entry differs from `@heroui/react` | Low-Medium | Inspect `node_modules` in Task 1 before Task 3 |
| `Spline` placeholder breaks Hero section layout | Low | Match existing dimensions; layout stays stable |
| Build fails after uninstall due to caching | Low | `rm -rf .next && npm run build` if cache stale |
| `// @ts-expect-error` in layout.tsx becomes invalid (HeroUI types are clean) | Low | If TS complains "unused expect-error", remove the directive; not a blocker |

---

## Goal-Backward Verification

**Goal:** NextUI and Spline gone; HeroUI in; bundle drops.

Working backward:
- Phase 9 needs measurable bundle reduction → Task 6 captures new metric ✓
- Phases 5-7 use HeroUI components → Tasks 1-4 land HeroUI ✓
- Phase 5 needs Hero.tsx free of Spline → Task 5 removes Spline call site ✓
- Phase 5 voxel implementation needs a clean placeholder → Task 5 leaves a stable container ✓

All Phase 5+ prerequisites covered.

---

## Out of Scope (explicitly)

- Implementing Hero voxel (Phase 5)
- Restyling any component
- Touching contact pipeline backend
- Removing `Poppins` font / `--background` legacy tokens

---

*Plan written: 2026-05-10 — manual GSD format*
