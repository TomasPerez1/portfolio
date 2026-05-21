# Phase 5: Hero + Nav

**Gathered:** 2026-05-10
**Status:** Ready for planning
**Source:** Manual draft (gsd-sdk unavailable)

<domain>
## Phase Boundary

Wire the new redesign `Hero` and `Nav` (from Phase 4) into the live `/[lang]` route. Implement theme system (`data-theme` attribute + localStorage + `prefers-color-scheme` default). Integrate LangSwitcher INSIDE the new Nav. Add reduced-motion fallback and rAF throttling to Voxel animation.

**In scope:**
- Create `ThemeProvider` client component — sets `data-theme="dark"|"light"` on `<html>`, reads localStorage, falls back to `prefers-color-scheme` on first visit, exposes `useTheme()` hook
- Mount `ThemeProvider` in `providers.tsx` alongside `HeroUIProvider`
- Add a `<NavWrapper lang>` client wrapper that calls `usePortfolioData(lang)` + `useTheme()` and passes data + theme + onToggleTheme into `Nav`
- Add a `<HeroWrapper lang>` client wrapper that calls `usePortfolioData(lang)` and passes the `Pick<Identity>` slice + `HeroCopy` into `Hero`
- Add a `<LangSwitch>` element INSIDE the redesign Nav (right of the theme toggle button) — same routing logic as current `ui/LangSwitcher.tsx` but visually consistent with the pill Nav
- Throttle Voxel `requestAnimationFrame` to ~30fps (frame skip)
- Add `prefers-reduced-motion: reduce` static fallback for Voxel (no animation; render at default tilt)
- Edit `ClientPage.tsx` to render `<NavWrapper>` + `<HeroWrapper>` at the top, keep legacy v1 sections (`AboutMe`, `Proyects`, `Contact` from `(sections)/landing/`) underneath
- Remove the legacy `ui/SideBar` + `ui/NavBar` mobile/desktop nav (replaced by the redesign Nav)
- Remove the legacy `Landing` section (replaced by Hero)
- Verify keyboard reaches all Nav controls

**Out of scope:**
- Wiring redesign sections (FeaturedWork, Stack, Experience, About, Footer) — Phase 6
- Replacing legacy v1 Contact UI — Phase 7
- Animation polish (scroll triggers, page transitions) — Phase 8
- Bundle audit, Lighthouse, deploy — Phase 9
- Removing the legacy `ui/LangSwitcher.tsx` file (still used by legacy `ui/SideBar`/`NavBar` — but we're removing those in this phase, so consider this in scope; if any other component still imports it, defer removal)

</domain>

<decisions>
## Implementation Decisions

### Locked from PROJECT.md / ROADMAP
- **D-11**: Theme toggle uses `data-theme` attribute, NOT NextUI's theme system
- **D-09**: i18n stays react-i18next + `[lang]` segment routing — LangSwitcher routing logic survives intact
- **FR-04**: Theme toggle wired to `data-theme` + localStorage
- **FR-07**: LangSwitcher integrated into Nav
- **QR-03**: Reduced-motion respected
- **RC-03**: rAF throttling applied to voxel animation

### Phase-5 specific (decided 2026-05-10 with user)
- **OQ-2 (resolved)**: Theme persistence = **localStorage override + `prefers-color-scheme` as first-visit default**. First load reads `localStorage.theme`; if absent, applies media query result. Toggle click writes to localStorage and applies to `<html data-theme>`. SSR safe: server renders without `data-theme` (or sets it to a stable default), client hydrates with the resolved value via `useEffect`. Adds D-14 to PROJECT.md.
- **Wire-up scope**: Phase 5 swaps Hero + Nav slot only. Legacy v1 sections (`AboutMe`, `Proyects`, `Contact` under `(sections)/landing/`) stay below until Phase 6. Page may look visually mixed between phases — acceptable trade-off for incremental verification.
- **LangSwitch placement**: INSIDE the redesign Nav, positioned after the theme toggle button. Same routing logic as legacy `ui/LangSwitcher.tsx` (route to `/en` or `/es`), but uses a compact button styled to match the Nav pill aesthetic — NOT a HeroUI `Switch`. Two-letter chip "EN" / "ES" toggling.
- **Removing legacy chrome**: `SideBar`, `NavBar`, `Landing` are no longer rendered by `ClientPage.tsx` after Phase 5. The files stay on disk (Phase 6 cleanup may delete) — preserves history and simplifies diff.
- **`useTheme` hook signature**: `{ theme: "dark"|"light"; setTheme: (next: "dark"|"light") => void; toggleTheme: () => void; ready: boolean }`. The `ready` flag is true after the first client-side mount completes — components can gate render to avoid hydration flash.
- **Voxel throttle**: Frame skip — only update tilt state every other frame (~30fps). The animation already runs slow visually; halving the rate is imperceptible. Falls under RC-03 mitigation.
- **Voxel reduced-motion**: Detect via `window.matchMedia("(prefers-reduced-motion: reduce)")` inside the existing useEffect; if matched, skip the rAF loop entirely. Static tilt = initial `{ x: -22, y: 28 }`.

### Claude's Discretion
- Whether `ThemeProvider` uses `React.Context` or just a module-level subscription — pick `Context` (idiomatic; type-safe consumer)
- Whether to fix the pre-existing `mouseleave` listener leak in Hero (Phase 4 deferred). Decision: NO — keep scope tight. Phase 8 polish.
- Whether to migrate `ui/LangSwitcher.tsx` HeroUI `Switch` away — NO, the legacy component will simply stop being rendered. Phase 6+ cleanup may delete the file.

</decisions>

<canonical_refs>
## Canonical References

### Project specs
- `.planning/PROJECT.md` — D-11 (data-theme), D-09 (i18n stays), to be amended with D-14 (theme persistence strategy)
- `.planning/REQUIREMENTS.md` — FR-01, FR-04, FR-06, FR-07, QR-03
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria, OQ-2

### Phase 3-4 outputs (consumed)
- `my-app/src/app/i18n/portfolio.types.ts` — `Identity`, `HeroCopy`
- `my-app/src/app/i18n/usePortfolioData.ts` — data hook
- `my-app/src/app/components/redesign/Hero.tsx` — receives `data`, `hero`, `showStatus`
- `my-app/src/app/components/redesign/Nav.tsx` — receives `theme`, `onToggleTheme`, `links`

### Files to modify
1. `my-app/src/app/providers.tsx` — mount `ThemeProvider`
2. `my-app/src/app/[lang]/ClientPage.tsx` — swap Landing/SideBar/NavBar for HeroWrapper/NavWrapper
3. `my-app/src/app/components/redesign/Hero.tsx` — add rAF throttle + reduced-motion fallback (modify the useEffect block)
4. `my-app/src/app/components/redesign/Nav.tsx` — add LangSwitch slot (children prop or inline)
5. `.planning/PROJECT.md` — append D-14

### Files to create
1. `my-app/src/app/theme/ThemeProvider.tsx` — Context + setter + persistence + media query
2. `my-app/src/app/theme/useTheme.ts` — consumer hook
3. `my-app/src/app/components/redesign/wrappers/HeroWrapper.tsx` — calls `usePortfolioData` + passes slices to Hero
4. `my-app/src/app/components/redesign/wrappers/NavWrapper.tsx` — calls `usePortfolioData` + `useTheme` + passes everything to Nav
5. `my-app/src/app/components/redesign/LangSwitch.tsx` — new in-Nav language toggle (renders inside Nav children slot or imported by Nav directly)

### Files to inspect (no modification expected)
- `my-app/src/app/ui/LangSwitcher.tsx` — reference for routing logic (we re-implement, don't reuse)
- `my-app/src/app/ui/SideBar.tsx`, `ui/NavBar.tsx` — will stop being rendered (files stay)

</canonical_refs>

<specifics>
## Specific Risks & Notes

- **Hydration mismatch on theme**: Server can't know the user's `prefers-color-scheme` or localStorage. Safest approach: render `<html>` WITHOUT `data-theme` server-side, set it in a `useEffect` on client mount. Initial paint may flash if the user prefers light — mitigated by inline `<script>` in `<head>` that reads localStorage/media query and sets the attribute before React hydrates (industry-standard "FART" — Flash Of Wrong Theme — fix).
- **Inline theme-resolution script**: Add to `app/layout.tsx` `<head>`. Must use `dangerouslySetInnerHTML` to bypass React string-escaping. Script size ~15 lines, no dependencies.
- **`useTheme` SSR**: The hook returns `{ theme: "dark", ready: false }` during SSR + first render. Components rendering theme-dependent UI gate with `ready` to avoid hydration warnings.
- **rAF throttle interaction with reduced-motion**: If `prefers-reduced-motion: reduce`, we skip rAF entirely. Otherwise, throttle to 30fps via a counter inside `tick()`.
- **Pre-existing Hero `mouseleave` leak**: Phase 4 preserved this. Phase 5 still doesn't fix it (out of scope per CONTEXT.md). Document in BUILD-REPORT.md.
- **`useTranslation` already runs in ClientPage**: We add `usePortfolioData(lang)` calls in wrappers. Two i18n init paths now share the same `common` namespace — i18next should de-dup the bundle load. Verify in smoke test no double network requests.
- **Removing legacy sections from ClientPage** breaks the page visually (no AboutMe/Proyects/Contact yet from redesign). That's expected for Phase 5 — Phase 6 fills the gap. Acceptable per CONTEXT scope.
- **`Nav.tsx` `theme` prop typing**: `NavTheme = "dark" | "light"` already exists. `useTheme()` returns the same union — clean pass-through.
- **Keyboard nav verification**: Tab through Logo → 5 links → theme toggle → LangSwitch. Each must show focus ring (HeroUI default works, but pill Nav uses custom styling — verify).
- **`ClientPage.tsx` lang prop**: It already accepts `lang?: string`. Wrappers receive lang and pass to hooks. No new prop drilling needed.

</specifics>

<deferred>
## Deferred Ideas

- Animation polish (scroll-triggered Nav state, hero entrance) — Phase 8
- `Hero.tsx` mouseleave listener cleanup fix — Phase 8 polish
- Deleting legacy `ui/SideBar.tsx`, `ui/NavBar.tsx`, `(sections)/landing/landing/Landing.tsx`, `ui/LangSwitcher.tsx` files — Phase 6 cleanup (after Phase 6 verifies nothing else references them)
- Theme-dependent images (e.g. logo variants for light mode) — design hasn't specified
- Persisting `lang` choice in cookie/localStorage so root `/` route can redirect — out of v2.0.0 scope (middleware already handles this)
- Smooth theme transition (CSS `transition` on `:root` variables) — polish/Phase 8

</deferred>

---

*Phase: 05-hero-nav*
*Context gathered: 2026-05-10 (manual)*
