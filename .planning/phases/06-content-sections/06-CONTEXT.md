# Phase 6: Content Sections

**Gathered:** 2026-05-10
**Status:** Ready for planning
**Source:** Manual draft (gsd-sdk unavailable)

<domain>
## Phase Boundary

Wire the remaining 6 redesign components into `/[lang]` via data wrappers. Replace legacy v1 sections (`AboutMe`, `Proyects`, `Contact` from `(sections)/landing/`) inside `ClientPage.tsx`. After Phase 6, the entire page is v2 redesign — no v1 components rendered. Delete legacy chrome files that are no longer referenced.

**In scope:**
- Build wrappers for 6 components (using HeroWrapper/NavWrapper pattern from Phase 5):
  - `FeaturedWorkWrapper(lang)` → passes `data.featured`
  - `ProjectsGridWrapper(lang)` → passes `data.projects`
  - `StackSectionWrapper(lang)` → passes `data.stack`
  - `ExperienceWrapper(lang)` → passes `data.experience`
  - `AboutWrapper(lang)` → passes `data.identity`
  - `FooterWrapper(lang)` → passes `data.footer` (or no props if Footer remains parameterless per Phase 4 decision)
- Replace `<AboutMe>`, `<Proyects>`, `<Contact>` (v1) in `ClientPage.tsx` with the 6 new wrappers
- Keep v1 `Contact` from `(sections)/landing/` for now (Phase 7 wires backend + replaces UI; Phase 6 uses redesign `Contact` as PRESENTATIONAL ONLY — see note below)
- Verify all sections render in EN and ES, dark and light
- Add `prefers-reduced-motion` pause to `StackTicker` animation (CSS `animation-play-state: paused`)
- Delete legacy files now confirmed unreferenced: `ui/SideBar.tsx`, `ui/NavBar.tsx`, `(sections)/landing/landing/Landing.tsx`, `ui/LangSwitcher.tsx`, plus the directories under `(sections)/landing/` once their components are unreferenced

**Out of scope:**
- **Contact form backend wiring** — Phase 7. Phase 6 mounts the redesign `Contact` component for visual completeness; the form's `onSubmit` remains the stub from Phase 4 (no actual email send). Phase 7 swaps in real Nodemailer + Sonner + Calendly integration.
- Animation polish (scroll triggers, page entrance, ticker variants) — Phase 8
- Performance/Lighthouse audit, bundle slim — Phase 9
- Adding new content fields to `PortfolioData` (e.g., extending `FooterCopy` with the brand string) — out of scope; Phase 4 conservatively kept hardcoded design strings, that stays.

</domain>

<decisions>
## Implementation Decisions

### Locked from ROADMAP
- **FR-01**: All visible copy from `usePortfolioData()`
- **FR-06**: Redesign components live in route
- **QR-03**: Reduced-motion respected for ticker animation

### Phase-6 specific (Claude's discretion — confirm)
- **Wrapper pattern**: Same as Phase 5 — one wrapper per component, calls `usePortfolioData(lang)`, gates render on `ready && data`, passes the appropriate sub-slice. Pure pass-through; no business logic in wrappers.
- **Wrapper directory**: All under `my-app/src/app/components/redesign/wrappers/` (existing dir from Phase 5).
- **Single `usePortfolioData()` call per page vs per wrapper**: Each wrapper calls its own. `i18next` caches the resource bundle per language, so additional calls are cheap (no re-fetch). Component-local calls keep wrappers self-contained and movable.
- **Footer**: Footer.tsx currently has NO props (Phase 4 decision — hardcoded design strings). `FooterWrapper` is therefore trivial — just renders `<Footer />`. We include it as a wrapper anyway for API consistency; Phase 7+ can extend if needed.
- **Contact**: Mount redesign `Contact` in Phase 6 with `data.identity` passed via `ContactWrapper`. Form submit remains the Phase 4 stub (`setSent(true)` + 2.4s timeout). User will visually see the redesign Contact but submitting does nothing real until Phase 7. **Banner the deferred wiring in a code comment** so it's obvious.
- **Legacy file deletions**: After Phase 6 successfully wires the redesign, delete `ui/SideBar.tsx`, `ui/NavBar.tsx`, `ui/LangSwitcher.tsx`, `(sections)/landing/landing/Landing.tsx`. Grep first to confirm zero remaining imports.
- **`(sections)/landing/about-me/`, `proyects/`, `contact/` directories**: These v1 components still exist and have lots of sub-files. After replacing them in `ClientPage`, DELETE the entire directories — no other route references them. (Verify via grep.)
- **StackTicker reduced-motion**: The current CSS class `animate-ticker` defines the marquee keyframe. Add a media query in `globals.css` that sets `animation-play-state: paused` (or `animation: none`) under `prefers-reduced-motion: reduce`. Cleanest fix — no JS needed.
- **Section ordering in ClientPage**: Hero → StackTicker → FeaturedWork → ProjectsGrid → StackSection → Experience → About → Footer. Matches the JSX Page export from `.claude_design/export/Page.jsx` (canonical design order).
- **StackTicker placement**: Currently exported from `FeaturedWork.tsx`. Render it as a SEPARATE element in ClientPage between Hero and FeaturedWork (per the design's `Page.jsx`). No wrapper needed (no data dependency).

### Claude's Discretion
- Whether to test in light theme explicitly — yes, manual smoke test step 4.
- Whether to fix the pre-existing Hero `mouseleave` leak in Phase 6 — NO, Phase 8 polish target (consistent with Phase 4-5).

</decisions>

<canonical_refs>
## Canonical References

### Project specs
- `.planning/PROJECT.md` — D-13 (flat layout), D-14 (theme)
- `.planning/REQUIREMENTS.md` — FR-01, FR-06, QR-03
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria

### Phase 3-5 outputs (consumed)
- `my-app/src/app/i18n/portfolio.types.ts` — all sub-interfaces
- `my-app/src/app/i18n/usePortfolioData.ts` — data hook
- `my-app/src/app/components/redesign/{FeaturedWork,ProjectsGrid,StackSection,Experience,About,Footer,Contact}.tsx` — Phase 4 typed components
- `my-app/src/app/components/redesign/wrappers/{HeroWrapper,NavWrapper}.tsx` — pattern reference
- `my-app/src/app/theme/useTheme.ts` — for any wrapper that needs theme awareness

### Reference (design export, NOT modified)
- `.claude_design/export/Page.jsx` — canonical section ordering

### Files to modify
1. `my-app/src/app/[lang]/ClientPage.tsx` — replace 3 legacy sections with 6+1 redesign sections + StackTicker
2. `my-app/src/app/globals.css` — add `@media (prefers-reduced-motion: reduce) { .animate-ticker { animation-play-state: paused; } }`

### Files to create (6 wrappers)
1. `my-app/src/app/components/redesign/wrappers/FeaturedWorkWrapper.tsx`
2. `my-app/src/app/components/redesign/wrappers/ProjectsGridWrapper.tsx`
3. `my-app/src/app/components/redesign/wrappers/StackSectionWrapper.tsx`
4. `my-app/src/app/components/redesign/wrappers/ExperienceWrapper.tsx`
5. `my-app/src/app/components/redesign/wrappers/AboutWrapper.tsx`
6. `my-app/src/app/components/redesign/wrappers/ContactWrapper.tsx`
(Footer needs no wrapper — uses no data — but for API consistency create `FooterWrapper.tsx` that just renders `<Footer />`)

### Files to delete (after wire-up verified)
- `my-app/src/app/ui/SideBar.tsx`
- `my-app/src/app/ui/NavBar.tsx`
- `my-app/src/app/ui/LangSwitcher.tsx`
- `my-app/src/app/(sections)/landing/landing/Landing.tsx` (and the `landing/landing/` directory)
- `my-app/src/app/(sections)/landing/about-me/` (entire directory: AboutMe.tsx, ExternalLinks.tsx, ProfileCarroucel.tsx)
- `my-app/src/app/(sections)/landing/proyects/` (entire directory: Proyects.tsx, ProyectCard.tsx, Carousel.tsx)
- `my-app/src/app/(sections)/landing/contact/` (entire directory: Contact.tsx, SendEmail.tsx, Adress.tsx)
- Possibly the whole `(sections)/landing/` route group if empty

</canonical_refs>

<specifics>
## Specific Risks & Notes

- **`usePortfolioData()` called 8 times on the same page** (HeroWrapper + 6 new wrappers + ContactWrapper). i18next caches at the instance level. Each wrapper creates its own `initI18next` instance (per the current hook implementation). Verify no duplicate network fetches in DevTools Network tab during smoke test. If issue: refactor `usePortfolioData()` to share an instance via Context (deferred to Phase 8 polish).
- **`AboutMe.tsx` v1 imports `ProfileCarroucel.tsx` which imports `ExternalLinks.tsx`** — full chain dies when AboutMe is dropped from ClientPage. Verify nothing else (e.g., a route I'm not aware of) imports any of these before deletion.
- **`Proyects.tsx` v1 → `ProyectCard.tsx` → `Carousel.tsx` chain** — same as above.
- **`Contact.tsx` v1 → `SendEmail.tsx` → `Adress.tsx` chain** — same. Note: SendEmail.tsx contains the actual Nodemailer call. Phase 7 will need this logic — DO NOT delete `SendEmail.tsx` yet. Decision: **keep `(sections)/landing/contact/` directory intact** until Phase 7 ports the email logic, then delete.
- **`Loader.tsx` and `LangLoader.tsx`** stay in `ui/` (Phase 4 audit decided KEEP). They're used by `ClientPage` for the loading gate.
- **`Adress.tsx`** uses HeroUI Tooltip — innocuous; safe to delete with the rest of `contact/`.
- **`globals.css` reduced-motion addition**: Verify the existing `.animate-ticker` class is defined there (Phase 1 should have ported it). If not, the rule is harmless (matches no element).
- **Section ordering ID anchors**: `Nav` links use `#work`, `#stack`, `#experience`, `#about`, `#contact`. The corresponding section elements MUST keep these IDs after wrapping. Verified per Phase 4 conversion — all section `id` props preserved.
- **Light theme verification**: Phase 1 may not have added light-mode CSS variables. If light mode renders broken sections, that's a Phase 1 gap, not a Phase 6 bug. Document but don't fix in Phase 6 (out of scope; record as deferred).

</specifics>

<deferred>
## Deferred Ideas

- Refactor `usePortfolioData()` to share an i18next instance via Context (perf optimization) — Phase 8 polish if Network tab shows redundant fetches
- Fix Hero mouseleave listener leak — Phase 8
- Replace v1 Contact backend integration with redesign UI — Phase 7
- Light-mode CSS variable gaps (if any surface) — Phase 1 retroactive fix or Phase 8 polish
- Delete `(sections)/landing/contact/` directory — Phase 7 (after porting email logic)
- Smooth theme transition CSS — Phase 8 polish
- `next/image` migration in About.tsx and any other redesign component using `<img>` — Phase 9 perf

</deferred>

---

*Phase: 06-content-sections*
*Context gathered: 2026-05-10 (manual)*
