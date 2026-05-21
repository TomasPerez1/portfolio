# Phase 5 Plan: Hero + Nav Wire-up

**Phase:** 5 of 9
**Complexity:** L
**Requirements:** FR-01, FR-04, FR-06, FR-07, QR-03
**Depends on:** Phase 4 ✅
**Status:** Ready to execute

---

## Goal

Wire redesign `Hero` and `Nav` into `/[lang]` with full theme system (`data-theme` + localStorage + `prefers-color-scheme` default), integrated LangSwitch inside Nav, throttled + reduced-motion-safe voxel animation. Legacy v1 sections stay rendered below until Phase 6.

---

## Pre-Flight Checks

- [ ] On branch `v2.0.0` with Phase 4 commits merged (HEAD ≥ `473ada7`)
- [ ] `cd my-app && npx tsc --noEmit` passes baseline
- [ ] `npm run build` passes baseline
- [ ] No uncommitted local changes
- [ ] Dev server runs on `/en` and `/es` without console errors

---

## Tasks (sequential — break only between tasks, never inside)

### Task 1 — Lock D-14 in PROJECT.md (theme persistence strategy)

**Actions:**
1. Append D-14 to PROJECT.md Key Decisions table:
   > **D-14** | Theme persistence: localStorage override + `prefers-color-scheme` as first-visit default. Inline `<script>` in `<head>` resolves before hydration to prevent flash (FART fix). Resolves OQ-2. | 2026-05-10
2. Commit: `docs(phase-5): lock D-14 theme persistence strategy`

**Acceptance:**
- PROJECT.md contains D-14 row

---

### Task 2 — Build ThemeProvider + useTheme hook

**Files to create:**
- `my-app/src/app/theme/ThemeProvider.tsx`
- `my-app/src/app/theme/useTheme.ts`

**Actions:**
1. `ThemeProvider.tsx`:
   - `"use client"`
   - Define `Theme = "dark" | "light"`
   - Create `ThemeContext` with `{ theme: Theme; setTheme: (t: Theme) => void; toggleTheme: () => void; ready: boolean }`
   - On mount: read `localStorage.getItem("theme")` → if `"dark"` or `"light"`, use it; else read `window.matchMedia("(prefers-color-scheme: dark)").matches` → resolve to `"dark"` or `"light"`
   - Apply via `document.documentElement.setAttribute("data-theme", theme)`
   - On setTheme: write to localStorage AND update `<html>` attribute
   - Expose default initial value as `"dark"` (matches the inline script default)
2. `useTheme.ts`:
   - Single hook that reads from `ThemeContext`. Throws if used outside provider.
3. `npx tsc --noEmit` passes

**Commit:** `feat(phase-5): add ThemeProvider with localStorage + media-query persistence`

**Acceptance:**
- Two new files, fully typed
- `tsc --noEmit` passes
- Provider exposes the expected API surface

---

### Task 3 — Inline theme-resolution script in `<head>` (FART fix)

**File:** `my-app/src/app/layout.tsx`

**Actions:**
1. Read `layout.tsx`
2. Inside `<head>`, add a `<script dangerouslySetInnerHTML>` with this IIFE (kept minimal):
   ```js
   (function(){
     try {
       var s = localStorage.getItem("theme");
       var d = s || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
       document.documentElement.setAttribute("data-theme", d);
     } catch(e) {
       document.documentElement.setAttribute("data-theme", "dark");
     }
   })();
   ```
3. Mount `<ThemeProvider>` inside `providers.tsx`, wrapping (or wrapped by) `HeroUIProvider`. Order: `ThemeProvider > HeroUIProvider > children`.
4. `tsc --noEmit` passes
5. Dev-test: hard refresh `/en`, observe no theme flash; `localStorage.theme = "light"` in DevTools → refresh → page loads in light mode immediately.

**Commit:** `feat(phase-5): inline pre-hydration theme script + mount ThemeProvider`

**Acceptance:**
- Script present in `layout.tsx`
- `ThemeProvider` mounted globally via `providers.tsx`
- Manual: hard refresh in DevTools "Disable cache" mode → no FOUC/FART

---

### Task 4 — Build LangSwitch (in-Nav language toggle)

**File:** `my-app/src/app/components/redesign/LangSwitch.tsx` (NEW)

**Actions:**
1. Compact two-letter toggle styled for the pill Nav.
2. Props: `{ lang: string }`. Renders `<Link href={lang === "es" ? "/en" : "/es"}>` (preserving Phase 1 i18n routing per D-09).
3. Visual: a 9x9 rounded-full button matching the theme toggle dimensions, displaying the OPPOSITE locale's 2-letter code (e.g., on `/en` shows "ES", click navigates to `/es`).
4. No HeroUI dependency — pure Tailwind + Next `Link`.
5. `tsc --noEmit` passes

**Commit:** `feat(phase-5): add LangSwitch component for in-Nav locale toggle`

**Acceptance:**
- File exists with typed props
- Links to opposite locale
- Visual matches pill Nav aesthetic

---

### Task 5 — Extend Nav to accept LangSwitch slot

**File:** `my-app/src/app/components/redesign/Nav.tsx`

**Actions:**
1. Add an optional `langSwitch?: React.ReactNode` prop to `NavProps`
2. Render `{langSwitch}` immediately after the theme toggle button inside the `<nav>` pill (before its closing tag)
3. No layout shift if `langSwitch` is undefined (backward-compat)
4. `tsc --noEmit` passes

**Commit:** `feat(phase-5): add langSwitch slot to redesign Nav`

**Acceptance:**
- `NavProps` has the new optional field
- Rendering Nav without `langSwitch` produces the same DOM as before

---

### Task 6 — Throttle Hero rAF + add reduced-motion fallback

**File:** `my-app/src/app/components/redesign/Hero.tsx`

**Actions:**
1. Modify the second `useEffect` (the mouse-driven RAF loop):
   - Read `window.matchMedia("(prefers-reduced-motion: reduce)").matches` at the top of the effect
   - If reduce-motion is active: SKIP the rAF loop entirely. Tilt stays at initial `{ x: -22, y: 28 }`. Still attach `mousemove` so mouse-driven manual tilt works (optional — keeping it adds 14 lines, removing keeps the static promise; **decision: remove mousemove too under reduce-motion** for stricter compliance).
   - If reduce-motion is NOT active: add a frame counter (`let frame = 0;` outside `tick`), increment in `tick()`, only call `setTilt()` when `frame % 2 === 0` (~30fps cap).
2. Document the change with a one-line comment inside the function (NOT JSDoc): `// RC-03: reduced-motion + 30fps throttle`
3. The pre-existing `mouseleave` listener leak stays as-is (out of scope; deferred to Phase 8)
4. `tsc --noEmit` passes

**Commit:** `feat(phase-5): throttle Hero voxel rAF and respect prefers-reduced-motion`

**Acceptance:**
- `tsc --noEmit` passes
- Effect contains the matchMedia check + frame counter
- No new `any` types

---

### Task 7 — Build HeroWrapper and NavWrapper

**Files to create:**
- `my-app/src/app/components/redesign/wrappers/HeroWrapper.tsx`
- `my-app/src/app/components/redesign/wrappers/NavWrapper.tsx`

**Actions:**
1. `HeroWrapper.tsx`:
   - `"use client"`
   - Props: `{ lang: string }`
   - Calls `usePortfolioData(lang)`
   - On `ready && data`: passes `data={data.identity}` (Pick the 4 fields via destructure) and `hero={data.hero}` to `<Hero>`. Default `showStatus={true}`.
   - On not ready: returns `null` (parent gates with `LangLoader` already)
2. `NavWrapper.tsx`:
   - `"use client"`
   - Props: `{ lang: string }`
   - Calls `useTheme()` and constructs `<LangSwitch lang={lang} />`
   - Passes `theme`, `onToggleTheme={toggleTheme}`, `langSwitch={<LangSwitch lang={lang} />}` to `<Nav>`
   - Does NOT need `usePortfolioData` (Nav is data-free — labels are hardcoded design strings, will be localized in a polish pass if needed)
3. `tsc --noEmit` passes

**Commit:** `feat(phase-5): add HeroWrapper and NavWrapper for data + theme wiring`

**Acceptance:**
- Both wrappers exist, typed, fully delegate to redesign components
- `tsc --noEmit` passes

---

### Task 8 — Swap ClientPage.tsx to use new Hero + Nav

**File:** `my-app/src/app/[lang]/ClientPage.tsx`

**Actions:**
1. Read current `ClientPage.tsx`
2. Remove imports for `NavBar`, `SideBar`, `Landing` (legacy chrome)
3. Add imports for `NavWrapper`, `HeroWrapper` from `../components/redesign/wrappers/...`
4. Replace the JSX layout:
   - REMOVE the `<section>` blocks for `SideBar` and `NavBar` (the sm:hidden + sm:inline pair)
   - REMOVE the `<Landing>` render
   - At the top of the rendered tree, add `<NavWrapper lang={lang} />`
   - Below it, add `<HeroWrapper lang={lang} />`
   - KEEP `<AboutMe>`, `<Proyects>`, `<Contact>` legacy v1 below (Phase 6 replaces these)
5. The `useTranslation` `ready` gate stays (still needed for v1 sections)
6. The outer `<main>` styling may need adjustment — drop the `flex` layout (no more sidebar), use a vertical stack
7. `tsc --noEmit` passes
8. `npm run build` passes

**Commit:** `feat(phase-5): wire NavWrapper and HeroWrapper into ClientPage`

**Acceptance:**
- `ClientPage.tsx` renders NavWrapper, HeroWrapper, then v1 sections
- No imports of NavBar/SideBar/Landing
- `tsc --noEmit` + `npm run build` pass

---

### Task 9 — Manual smoke test on `/en` and `/es`

**Actions:**
1. Start dev server (`npm run dev` with webpack flag)
2. Hard refresh `/en`:
   - Verify Nav pill appears floating at top
   - Verify Hero renders with identity status badge + tagline + 3 CTA buttons
   - Verify Voxel renders (or static if reduce-motion)
   - Verify v1 sections (AboutMe, Proyects, Contact) still render below
3. Click theme toggle button → page background/text adjusts → refresh → theme persists
4. Click LangSwitch → URL changes to `/es` → all switched text shows Spanish
5. Hard refresh `/es` → repeat verifications
6. DevTools → Application → Local Storage → confirm `theme` key is set
7. DevTools → Rendering → toggle `prefers-reduced-motion: reduce` → reload → voxel is static
8. Tab through Nav with keyboard → focus reaches every button
9. Console must be free of new errors (next/image warnings from legacy sections are acceptable; same as pre-Phase-5 baseline)
10. Take note of any observation for the BUILD-REPORT.md

**No commit yet** — verification only. If issues are found, fix in this task and amend the relevant prior commit OR add a follow-up commit.

**Acceptance:**
- All 8 verification steps pass on both locales
- No new console errors
- Build report can record the smoke-test results

---

### Task 10 — Build report + STATE.md

**Actions:**
1. Create `.planning/phases/05-hero-nav/05-BUILD-REPORT.md` with:
   - List of files created/modified
   - tsc + build status
   - Smoke test results (all 8 verifications from Task 9)
   - Deviations from plan
   - Deferred items (Hero mouseleave leak, legacy file deletions)
2. Update `.planning/STATE.md` to mark Phase 5 done, Phase 6 next
3. Commit: `docs(phase-5): finalize build report and state`

**Acceptance:**
- BUILD-REPORT.md and STATE.md updated
- All Phase 5 success criteria status documented

---

## Commit Plan (atomic)

| # | Files | Message |
|---|-------|---------|
| 1 | `PROJECT.md` | `docs(phase-5): lock D-14 theme persistence strategy` |
| 2 | `theme/ThemeProvider.tsx`, `theme/useTheme.ts` | `feat(phase-5): add ThemeProvider with localStorage + media-query persistence` |
| 3 | `layout.tsx`, `providers.tsx` | `feat(phase-5): inline pre-hydration theme script + mount ThemeProvider` |
| 4 | `components/redesign/LangSwitch.tsx` | `feat(phase-5): add LangSwitch component for in-Nav locale toggle` |
| 5 | `components/redesign/Nav.tsx` | `feat(phase-5): add langSwitch slot to redesign Nav` |
| 6 | `components/redesign/Hero.tsx` | `feat(phase-5): throttle Hero voxel rAF and respect prefers-reduced-motion` |
| 7 | `components/redesign/wrappers/HeroWrapper.tsx`, `NavWrapper.tsx` | `feat(phase-5): add HeroWrapper and NavWrapper for data + theme wiring` |
| 8 | `[lang]/ClientPage.tsx` | `feat(phase-5): wire NavWrapper and HeroWrapper into ClientPage` |
| 9 | (no commit — smoke test) | — |
| 10 | `.planning/phases/05-hero-nav/05-BUILD-REPORT.md`, `.planning/STATE.md` | `docs(phase-5): finalize build report and state` |

---

## Success Criteria (from ROADMAP)

1. ✅ Hero renders with voxel 3D, identity copy, two CTA buttons (we render 3 CTAs — better than required)
2. ✅ Nav renders as floating pill, sticky, keyboard-reachable
3. ✅ Theme toggle switches dark↔light; refresh restores last choice
4. ✅ LangSwitcher in Nav changes text without full page reload (Next.js client routing)
5. ✅ Under `prefers-reduced-motion`, voxel is static

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hydration warning from theme attribute mismatch | High | Inline script sets `data-theme` BEFORE React hydrates; SSR omits the attribute or stamps a default that the script overrides |
| globals.css does not respond to `data-theme="light"` (variables only defined for dark) | Medium | Phase 1 should have added light-mode tokens. Verify in Task 3 smoke test — if missing, ADD them in `globals.css` as part of Task 3 (lock as deviation) |
| `useTheme()` consumed outside Provider during SSR | Low | The hook throws helpfully; wrappers all live under the Provider, so this only fires if a dev mistakenly calls it from a server component |
| Next 16 client/server boundary issue with the inline `<script>` | Low | Standard pattern, works in Next 13+. If issues, move to a `<Script strategy="beforeInteractive">` |
| Removing Landing breaks the `(sections)/landing/landing/Landing.tsx` file's imports elsewhere | Low | `Landing` is only imported from `ClientPage.tsx`. Verified earlier. |
| Phase 5 leaves the page visually broken (Hero looks redesigned, sections below look v1) | Expected | Documented in CONTEXT.md as acceptable trade-off. Phase 6 closes the gap. |
| 30fps throttle visibly stutters | Low | Voxel autoplay is slow (0.005 rad/frame). At 30fps it's still smooth. Manual user-driven tilt is direct (set on mousemove, not on tick) — no perceptible delay. |

---

## Goal-Backward Verification

**Goal:** Above-the-fold redesign is live; theme + lang switching work end-to-end.

Working backward:
- Phase 6 needs `data-theme` system in place so its sections respond to toggle → Task 2-3 deliver ✓
- Phase 6 needs `usePortfolioData()` wired in a real route → Task 7-8 establish the wrapper pattern; Phase 6 just adds more wrappers ✓
- Phase 7 needs Calendly + Sonner — independent; Phase 5 doesn't touch ✓
- Phase 8 polish needs a Nav that's already accessible/styled → Task 5 lands the slot, Task 9 verifies keyboard reach ✓
- QR-03 (reduced motion) → Task 6 ✓
- FR-04 (theme toggle + localStorage) → Tasks 2-3 ✓
- FR-07 (LangSwitcher integrated) → Tasks 4-5-7 ✓

All Phase 6-9 prerequisites covered.

---

## Out of Scope (explicitly)

- Wiring redesign content sections — Phase 6
- Replacing v1 Contact UI — Phase 7
- Deleting legacy `SideBar.tsx`, `NavBar.tsx`, `Landing.tsx`, `LangSwitcher.tsx` — Phase 6 cleanup
- Fixing the pre-existing Hero mouseleave listener leak — Phase 8
- Adding light-mode brand variants to images — design hasn't specified
- Animation polish, scroll effects — Phase 8

---

*Plan written: 2026-05-10 — manual GSD format*
