# Phase 4 Build Report — Component Conversion (JSX → TSX)

**Date:** 2026-05-10
**Branch:** v2.0.0
**Status:** ✅ Complete

---

## Files Converted

All 9 redesign components live in `my-app/src/app/components/redesign/*.tsx`.

| # | Component | Source (lines) | Target (lines) | Props interface |
|---|-----------|----------------|----------------|-----------------|
| 1 | `FeaturedWork.tsx` | 114 | 124 | `FeaturedWorkProps { items: readonly FeaturedProject[] }` + exports `SectionHeader`, `StackTicker`, `FeaturedCard` |
| 2 | `Footer.tsx` | 27 | 26 | (no props — hardcoded design strings preserved) |
| 3 | `ProjectsGrid.tsx` | 50 | 49 | `ProjectsGridProps { items: readonly GridProject[] }` |
| 4 | `Experience.tsx` | 61 | 60 | `ExperienceProps { items: readonly ExperienceEntry[] }` |
| 5 | `StackSection.tsx` | 37 | 41 | `StackSectionProps { stack: StackCategories }` |
| 6 | `About.tsx` | 91 | 89 | `AboutProps { identity: Identity }` |
| 7 | `Nav.tsx` | 80 | 95 | `NavProps { theme?: "dark"\|"light"; onToggleTheme?: () => void; links?: ReadonlyArray<readonly [string, string]> }` |
| 8 | `Contact.tsx` | 147 | 177 | `ContactProps { identity: Pick<Identity, "email"\|"phone"\|"location"\|"timezone"> }` |
| 9 | `Hero.tsx` | 229 | 271 | `HeroProps { data: Pick<Identity, "statusLine"\|"location"\|"timezone"\|"tagline">; hero: HeroCopy; showStatus?: boolean }` |

**Total:** 836 JSX lines → 932 TSX lines (+96, +11.5% — accounts for explicit interfaces, typed event handlers, narrowed state types).

---

## Verification Results

### Type safety
- `npx tsc --noEmit` exits 0 ✓
- Zero `any` types in any redesign component
- All `useState`, `useRef`, event handlers explicitly typed
- `readonly` arrays preserved from `PortfolioData` sub-types

### Build
- `npm run build` exits 0 ✓
- Next 16.2.6 Turbopack: Compiled successfully in 7.2s, TypeScript check 4.1s, 7/7 static pages generated, 4 routes (`/`, `/_not-found`, `/[lang]`, `/api/send`)

### Invariants preserved
- `find my-app/src -name '*.jsx'` → 0 results ✓
- `ls my-app/src/app/components/redesign/` → 9 `.tsx` files ✓
- Legacy `(sections)/landing/*` untouched ✓
- HeroUI imports intact ✓

### Audit (Task 6)
- `ui/Loader.tsx` and `ui/LangLoader.tsx` annotated with `// Status: KEEP (Phase 4 audit)` — re-evaluation deferred to Phase 5+
- No functional change to either file

---

## Deviations from PLAN.md

### Deviation 1 — Task 2 expanded from 4 to 5 components

**Plan said:** Task 2 converts Footer + StackSection + ProjectsGrid + Experience (4 smalls).

**What happened:** Both `StackSection.jsx` and `Experience.jsx` import `SectionHeader` from `FeaturedWork.jsx`. Converting them without `FeaturedWork.tsx` available would leave broken imports. Two clean options:
1. Inline a private `SectionHeader` copy in both StackSection.tsx and Experience.tsx (then Task 3 produces FeaturedWork with its own copy → 3 copies of the same component)
2. Pull FeaturedWork forward into Task 2 (single source of truth from day one)

Picked option 2. Task 2 committed 5 files in commit `6d9ee23`. Task 3 then only contained About + Nav (commit `d5ab223`).

### Deviation 2 — Footer accepts no props

**Plan said:** Footer interface = `{ data: FooterCopy }`.

**What happened:** The source `Footer.jsx` is entirely hardcoded design strings (`tomas.dev` brand, `© 2026 Tomás Pérez · Built with React, Next.js & ☕`, `v2 · Last updated May 2026`). None of these map to `FooterCopy`'s `rights` / `builtWith` fields without a refactor — and refactoring design copy is out of Phase 4 scope (faithful conversion only).

The component accepts no props. The `FooterCopy` namespace in `common.json` remains available for Phase 5+ to wire when components get composed at the page level. Same conservative interpretation applied to the hardcoded `Hero.tsx` strings ("Portfolio · 2026", "Tomás", "Pérez", the bio paragraph with custom span styling, Role/Available/Based/English KV rows).

### Deviation 3 — Nav supports `links` override prop

**Plan said:** `NavProps { theme?; onToggleTheme?; links?: ReadonlyArray<[string, string]> }`.

**What happened:** Followed the plan exactly. Logged here for completeness — the `links` prop has a `DEFAULT_LINKS` constant that matches the source's hardcoded array. Phase 5 wrappers can thread localized labels via this prop.

---

## Preserved Bugs / Tech Debt

Per Phase 4 contract ("faithful conversion, polish in later phases"), these issues were preserved verbatim from the JSX source:

- **`Hero.tsx` mouseleave listener**: `el.addEventListener("mouseleave", () => (autoOn = true))` has no `removeEventListener` counterpart in cleanup. Memory leak risk if component remounts frequently. Phase 8 polish.
- **`Contact.tsx` form**: No backend wiring. `onSubmit` only flips local `sent` state. Phase 7 connects to Nodemailer.
- **`Contact.tsx` `<img src="/assets/about-current.jpg">`**: Plain `<img>`, not `next/image`. Same applies to `About.tsx`. Performance phase concern.
- **`Calendly` integration**: `Contact.tsx` calendar is a static preview. Real Calendly embed wires in Phase 7.

---

## Commit Trail

| # | SHA | Message |
|---|-----|---------|
| 0 | 930661d | docs(phase-4): add context and plan for component conversion |
| 1 | 22448f7 | docs(phase-4): lock D-13 redesign directory layout |
| 2 | 6d9ee23 | feat(phase-4): convert FeaturedWork, Footer, ProjectsGrid, Experience, StackSection to TSX |
| 3 | d5ab223 | feat(phase-4): convert About and Nav to TSX |
| 4 | eec9c71 | feat(phase-4): convert Contact to TSX |
| 5 | f897d9b | feat(phase-4): convert Hero to TSX with typed voxel helpers |
| 6 | 55a140c | docs(phase-4): annotate Loader/LangLoader audit status (KEEP) |
| 7 | (this commit) | docs(phase-4): finalize build report and state |

---

## Success Criteria Status

| # | Criterion | Status |
|---|-----------|--------|
| 1 | All 9 components exist as `.tsx` files with explicit prop interfaces | ✅ |
| 2 | `tsc --noEmit` passes with zero TypeScript errors | ✅ |
| 3 | No `.jsx` files remain in `my-app/src/` | ✅ (preserved invariant) |
| 4 | Directory layout decision documented in PROJECT.md (D-13) | ✅ |

**All 4 success criteria met. Phase 4 ready for handoff to Phase 5 (Hero + Nav wire-up).**
