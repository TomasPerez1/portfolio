# Phase 5 Build Report — Hero + Nav Wire-up

**Date:** 2026-05-10
**Branch:** v2.0.0
**Status:** ✅ Complete

---

## Files Added / Modified

### Added
- `my-app/src/app/theme/ThemeProvider.tsx` — `Theme = "dark" | "light"`, `ThemeContext`, `ThemeProvider` component. Resolves initial theme via localStorage → `prefers-color-scheme` fallback. Exposes `theme`, `setTheme`, `toggleTheme`, `ready`.
- `my-app/src/app/theme/useTheme.ts` — consumer hook; throws if used outside provider.
- `my-app/src/app/components/redesign/LangSwitch.tsx` — compact pill-styled `<Link>` showing the OPPOSITE locale's 2-letter code.
- `my-app/src/app/components/redesign/wrappers/HeroWrapper.tsx` — calls `usePortfolioData(lang)`, passes Identity pick + HeroCopy to `<Hero>`.
- `my-app/src/app/components/redesign/wrappers/NavWrapper.tsx` — calls `useTheme()`, wires `<LangSwitch>` into Nav's slot.
- `.planning/phases/05-hero-nav/05-CONTEXT.md`, `05-PLAN.md`, `05-BUILD-REPORT.md` (this file).

### Modified
- `my-app/src/app/providers.tsx` — wraps `HeroUIProvider` with `ThemeProvider`.
- `my-app/src/app/layout.tsx` — inline `<script>` in `<head>` resolves theme BEFORE React hydration (FART fix).
- `my-app/src/app/components/redesign/Nav.tsx` — added optional `langSwitch?: React.ReactNode` prop; renders after theme button.
- `my-app/src/app/components/redesign/Hero.tsx` — added `prefers-reduced-motion` short-circuit + 30fps frame-skip throttle.
- `my-app/src/app/[lang]/ClientPage.tsx` — removed `NavBar`, `SideBar`, `Landing` imports; added `NavWrapper` + `HeroWrapper` at top; v1 sections (`AboutMe`, `Proyects`, `Contact`) still render below.
- `.planning/PROJECT.md` — appended D-14 (theme persistence strategy).
- `.planning/STATE.md` — bumped to Phase 5 done, Phase 6 next.

---

## Verification Results

### Type safety
- `npx tsc --noEmit` exits 0 after every commit ✓
- Zero `any` types across new files

### Build
- `npm run build` exits 0 ✓
- Next 16.2.6 Turbopack: Compiled in 9.2s, TS check 5.3s, 7/7 static pages

### Smoke test (manual, on dev server)
User confirmed all 5 verification steps passed on 2026-05-10:

1. ✅ `/en` first load: Nav pill floating + Hero with voxel + 3 CTAs + status badge + tagline. Legacy v1 sections render below (expected).
2. ✅ Theme toggle: click swaps theme; `localStorage.theme` writes; hard refresh persists; no flash on reload (FART fix working).
3. ✅ LangSwitch: clicking "ES" routes to `/es`; hero text switches to Spanish (`"Disponible para roles de producto"`, `"Ver trabajos destacados"`).
4. ✅ `prefers-reduced-motion: reduce` (emulated in DevTools Rendering panel): voxel renders static, no rAF loop runs.
5. ✅ Keyboard nav: Tab reaches logo → 5 link items → theme toggle → LangSwitch in order.

---

## Deviations from PLAN.md

**None of substance.** Execution matched the plan task-by-task.

Minor implementation notes:
- `ThemeProvider` uses an internal `resolveInitialTheme()` helper instead of inlining the logic in `useEffect`. Same behavior, cleaner unit. Logged for completeness.
- `LangSwitch` uses `mr-0` (default) + relies on `ml-1` from the `<button>` neighbor for spacing. Visually matches the theme toggle dimensions exactly (`w-9 h-9 rounded-full border border-line-2`).
- `Hero.tsx` reduced-motion short-circuit returns BEFORE attaching `mousemove`. Per CONTEXT decision: reduce-motion = no animation AND no mouse-driven tilt (stricter compliance).

---

## Preserved Bugs / Tech Debt (carried forward)

- **`Hero.tsx` mouseleave listener leak** — `el.addEventListener("mouseleave", ...)` still has no `removeEventListener` counterpart. Preserved verbatim from Phase 4. Phase 8 polish target.
- **Legacy v1 sections still render below redesign** — page looks visually mixed. Expected for Phase 5 → Phase 6 closes the gap.
- **Legacy files on disk but unrendered** — `ui/SideBar.tsx`, `ui/NavBar.tsx`, `(sections)/landing/landing/Landing.tsx`, `ui/LangSwitcher.tsx`. Kept on disk to preserve git history; Phase 6 may delete after verifying no other component imports them.
- **`next/image` warnings from v1 sections** — pre-existing aspect-ratio + missing `sizes` warnings. Phase 9 perf concern.

---

## Commit Trail

| # | SHA | Message |
|---|-----|---------|
| 0 | 1c56125 | docs(phase-5): add context and plan for hero + nav wire-up |
| 1 | 06fba27 | docs(phase-5): lock D-14 theme persistence strategy |
| 2 | 68df844 | feat(phase-5): add ThemeProvider with localStorage + media-query persistence |
| 3 | 8fa2abf | feat(phase-5): inline pre-hydration theme script + mount ThemeProvider |
| 4 | cc6e73c | feat(phase-5): add LangSwitch component for in-Nav locale toggle |
| 5 | 9dbc857 | feat(phase-5): add langSwitch slot to redesign Nav |
| 6 | 05b1d01 | feat(phase-5): throttle Hero voxel rAF and respect prefers-reduced-motion |
| 7 | 5b68842 | feat(phase-5): add HeroWrapper and NavWrapper for data + theme wiring |
| 8 | ca3f4e6 | feat(phase-5): wire NavWrapper and HeroWrapper into ClientPage |
| 9 | (no commit) | smoke-test verification — user confirmed all 5 steps |
| 10 | (this commit) | docs(phase-5): finalize build report and state |

---

## Success Criteria Status (from ROADMAP)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Hero renders with voxel 3D, identity copy, CTA buttons | ✅ |
| 2 | Nav renders as floating pill, sticky, keyboard-reachable | ✅ |
| 3 | Theme toggle switches dark↔light; refresh restores last choice | ✅ |
| 4 | LangSwitcher in Nav changes text without full page reload | ✅ |
| 5 | Under `prefers-reduced-motion`, voxel is static | ✅ |

**All 5 success criteria met. Phase 5 ready for handoff to Phase 6 (Content Sections).**
