# Phase 4 Plan: Component Conversion — JSX → TSX

**Phase:** 4 of 9
**Complexity:** M
**Requirements:** FR-06, QR-01
**Depends on:** Phase 3 ✅
**Status:** Ready to execute

---

## Goal

Convert 9 redesign components from `.claude_design/export/components/*.jsx` into typed `.tsx` files in `my-app/src/app/components/redesign/`, each with explicit prop interfaces derived from `PortfolioData`. Audit `ui/Loader.tsx` and `ui/LangLoader.tsx`. `tsc --noEmit` ends with zero errors.

---

## Pre-Flight Checks

- [ ] On branch `v2.0.0` with Phase 3 commits merged (HEAD ≥ `4e8b532`)
- [ ] `cd my-app && npx tsc --noEmit` passes baseline before starting
- [ ] No uncommitted local changes
- [ ] `my-app/src/app/i18n/portfolio.types.ts` exports `PortfolioData` and all sub-interfaces

---

## Tasks (sequential — group by size, never break tsc between commits)

### Task 1 — Lock OQ-1 in PROJECT.md and scaffold directory

**Why:** Document the directory layout decision (resolved 2026-05-10) before files land.

**Actions:**
1. Append D-13 to PROJECT.md Key Decisions table:
   > **D-13** | Phase 4 redesign components live in flat `my-app/src/app/components/redesign/*.tsx`. Legacy `(sections)/landing/*` remains until later phases wire the redesign into the page. | 2026-05-10
2. Create directory `my-app/src/app/components/redesign/`
3. Commit: `docs(phase-4): lock D-13 redesign directory layout`

**Acceptance:**
- PROJECT.md contains D-13 row
- `my-app/src/app/components/redesign/` exists (empty)

---

### Task 2 — Convert the 4 small components (Footer, StackSection, ProjectsGrid, Experience)

**Why:** Low-risk warm-up. Each is < 65 lines and consumes a single `PortfolioData` sub-interface.

**Files to create:**
- `my-app/src/app/components/redesign/Footer.tsx` (from `Footer.jsx`, 27 lines)
- `my-app/src/app/components/redesign/StackSection.tsx` (from `StackSection.jsx`, 37 lines)
- `my-app/src/app/components/redesign/ProjectsGrid.tsx` (from `ProjectsGrid.jsx`, 50 lines)
- `my-app/src/app/components/redesign/Experience.tsx` (from `Experience.jsx`, 61 lines)

**Per-file actions:**
1. Read the source JSX file
2. Add `"use client";` if present in source
3. Define an `interface ComponentNameProps` near the top, importing from `app/i18n/portfolio.types`:
   - `Footer` → `{ data: FooterCopy }`
   - `StackSection` → `{ data: StackCategories; label: string }` (label from `SectionLabels.stack`)
   - `ProjectsGrid` → `{ data: readonly GridProject[]; label: string }`
   - `Experience` → `{ data: readonly ExperienceEntry[]; label: string }`
4. Replace function signature: `function Component({ data })` → `function Component({ data, label }: ComponentNameProps)`
5. Preserve all JSX, hooks, styles exactly
6. Run `npx tsc --noEmit` — must pass with zero errors

**Commit:** `feat(phase-4): convert Footer, StackSection, ProjectsGrid, Experience to TSX`

**Acceptance:**
- 4 new `.tsx` files in `components/redesign/`
- Each exports a default function with typed props
- `tsc --noEmit` passes

---

### Task 3 — Convert the 3 medium components (About, Nav, FeaturedWork)

**Files to create:**
- `my-app/src/app/components/redesign/About.tsx` (from `About.jsx`, 91 lines)
- `my-app/src/app/components/redesign/Nav.tsx` (from `Nav.jsx`, 80 lines)
- `my-app/src/app/components/redesign/FeaturedWork.tsx` (from `FeaturedWork.jsx`, 114 lines)

**Per-file actions:**
1. Read source JSX
2. Define `interface ComponentNameProps`:
   - `About` → `{ data: AboutCopy; identity: Identity }` (uses both `paragraphs` and identity quickFacts/bio)
   - `Nav` → `{ theme?: "dark" | "light"; onToggleTheme?: () => void; links?: ReadonlyArray<[string, string]> }` — no `PortfolioData` dep; section labels passed in via Phase 5 wrapper
   - `FeaturedWork` → `{ data: readonly FeaturedProject[]; label: string }`
3. Type all `useState` calls (e.g. `useState<boolean>(false)`)
4. Type event handlers: `(e: React.MouseEvent<HTMLElement>) => void`, scroll listeners with `(this: Window) => void` if needed
5. Type refs: `useRef<HTMLDivElement>(null)`
6. Preserve all JSX and styles
7. `tsc --noEmit` passes after each file

**Commit:** `feat(phase-4): convert About, Nav, FeaturedWork to TSX`

**Acceptance:**
- 3 new `.tsx` files with explicit typed state and event handlers
- `tsc --noEmit` passes

---

### Task 4 — Convert Contact

**File:** `my-app/src/app/components/redesign/Contact.tsx` (from `Contact.jsx`, 147 lines)

**Actions:**
1. Read `Contact.jsx`
2. Define `interface ContactProps { data: ContactCopy; identity: Pick<Identity, "email" | "phone" | "linkedin"> }`
3. Type form state: `useState<{ name: string; subject: string; message: string }>({ ... })`
4. Type form submit handler: `(e: React.FormEvent<HTMLFormElement>) => void`
5. Type input change handlers
6. Preserve all JSX, Calendly embed, Sonner toast hooks (UI level)
7. **DO NOT** wire to Nodemailer or any backend — Phase 7's job
8. `tsc --noEmit` passes

**Commit:** `feat(phase-4): convert Contact to TSX`

**Acceptance:**
- `Contact.tsx` exists with typed form state and submit handler
- `tsc --noEmit` passes
- No backend integration (form is presentational only)

---

### Task 5 — Convert Hero (biggest)

**File:** `my-app/src/app/components/redesign/Hero.tsx` (from `Hero.jsx`, 229 lines — 7 internal helpers)

**Actions:**
1. Read `Hero.jsx`
2. Define `interface HeroProps { data: Pick<Identity, "statusLine" | "location" | "timezone" | "tagline">; hero: HeroCopy; showStatus?: boolean }`
3. Type tilt state: `useState<{ x: number; y: number }>({ x: -22, y: 28 })`
4. Type time state: `useState<Date>(() => new Date())`
5. Type refs: `useRef<HTMLDivElement>(null)`
6. Type the `tick`, `onMove`, RAF cleanup carefully — preserve the existing animation logic verbatim including any pre-existing event listener imbalance (NOT a bug to fix in Phase 4)
7. Convert internal helpers (`GridBackdrop`, `VoxelArt`, `Voxel`, `KV`, `ScrollCue`, `Arrow`, `DownloadIcon`) inside the same file with typed props:
   - `VoxelArt({ tilt }: { tilt: { x: number; y: number } })`
   - `Voxel({ x, y, z, size, isYellow }: { x: number; y: number; z: number; size: number; isYellow: boolean })`
   - `KV({ k, v }: { k: string; v: string })`
8. The voxel `Set<string>` literals stay exactly as-is
9. `tsc --noEmit` passes

**Commit:** `feat(phase-4): convert Hero to TSX with typed voxel helpers`

**Acceptance:**
- `Hero.tsx` exists with all 7 internal helpers typed
- Voxel data structures preserved exactly
- `tsc --noEmit` passes

---

### Task 6 — Audit `ui/Loader.tsx` and `ui/LangLoader.tsx`

**Why:** Roadmap calls for an audit decision (keep/adapt/drop). CONTEXT.md locked the answer as KEEP for both — this task records the rationale in code via a one-line comment header (no functional change).

**Actions:**
1. Open `my-app/src/app/ui/Loader.tsx` — verify it still uses HeroUI `Skeleton` (Phase 2 already migrated it)
2. Open `my-app/src/app/ui/LangLoader.tsx` — verify it still uses HeroUI `Spinner` (Phase 2 migrated)
3. Add a one-line comment at the top of each:
   - `// Status: KEEP (Phase 4 audit) — re-evaluate when redesign Nav/Hero land in Phase 5+`
4. No other code changes
5. Commit: `docs(phase-4): annotate Loader/LangLoader audit status (KEEP)`

**Acceptance:**
- Both files have the status comment
- No functional change (diff is comment-only)

---

### Task 7 — Final verification + build report

**Actions:**
1. `cd my-app && npx tsc --noEmit` — must exit 0
2. `find my-app/src -name '*.jsx' 2>&1 | wc -l` — must report 0 (Glob equivalent for jsx pattern)
3. `ls my-app/src/app/components/redesign/` — must list 9 `.tsx` files
4. Run `npm run build` — must exit 0 (production build sanity check; redesign components are imported by `__assert.ts` indirectly via types? — NO: they're not imported anywhere. Build is for sanity on the rest of the app.)
5. Create `.planning/phases/04-component-conversion/04-BUILD-REPORT.md` with:
   - List of 9 converted files + line count delta (JSX → TSX)
   - tsc and build status
   - Any deviations encountered
   - Confirmation that `Loader.tsx` and `LangLoader.tsx` stay (audit result)
6. Update `.planning/STATE.md` — bump to "Phase 4 done. Next: Phase 5 (Hero + Nav)"
7. Commit: `docs(phase-4): finalize build report and state`

**Acceptance:**
- `tsc --noEmit` exits 0
- Zero `.jsx` files in `my-app/src/`
- 9 `.tsx` files in `components/redesign/`
- `npm run build` exits 0
- `04-BUILD-REPORT.md` and `STATE.md` reflect Phase 4 completion

---

## Commit Plan (atomic)

| # | Files | Message |
|---|-------|---------|
| 1 | `PROJECT.md`, new empty dir | `docs(phase-4): lock D-13 redesign directory layout` |
| 2 | 4 `.tsx` files | `feat(phase-4): convert Footer, StackSection, ProjectsGrid, Experience to TSX` |
| 3 | 3 `.tsx` files | `feat(phase-4): convert About, Nav, FeaturedWork to TSX` |
| 4 | `Contact.tsx` | `feat(phase-4): convert Contact to TSX` |
| 5 | `Hero.tsx` | `feat(phase-4): convert Hero to TSX with typed voxel helpers` |
| 6 | `Loader.tsx`, `LangLoader.tsx` (comment-only) | `docs(phase-4): annotate Loader/LangLoader audit status (KEEP)` |
| 7 | `04-BUILD-REPORT.md`, `STATE.md` | `docs(phase-4): finalize build report and state` |

---

## Success Criteria (from ROADMAP)

1. ✅ All 9 components exist as `.tsx` files with explicit prop interfaces
2. ✅ `tsc --noEmit` passes with zero TypeScript errors
3. ✅ No `.jsx` files remain in `my-app/src/` (already true; preserve)
4. ✅ Directory layout decision documented in PROJECT.md Key Decisions (D-13)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `useEffect` cleanup typing surprises in Hero (RAF + listeners) | Medium | Preserve source verbatim; type only the obvious values (state, refs). If TS complains, narrow with explicit signatures. |
| Component imports `next/image` or similar that needs Next-specific typing | Low-Medium | Source uses plain `<img>`. Audit Hero/About on read for hidden Next imports. |
| Prop interface mismatch with eventual Phase 5 wrapper | Medium | Wrappers in Phase 5 adapt; if interface needs broadening, Phase 5 can amend types. Phase 4 prioritizes faithful conversion. |
| `tsc --noEmit` flags `readonly` array mutations from `.map()` etc. | Low | `readonly T[]` is mappable. Use type assertions only as last resort. |
| `npm run build` fails because of an unrelated cache | Low | `rm -rf .next && npm run build` if cache stale (same as Phase 2 escape) |
| Voxel `Set<string>` literals break under `strictFunctionTypes` | Low | Sets are `Set<string>` — standard typing. No risk. |

---

## Goal-Backward Verification

**Goal:** 9 typed presentational components ready for Phase 5+ to wire into the page.

Working backward:
- Phase 5 needs `Hero.tsx` and `Nav.tsx` ready to import → Tasks 3 and 5 produce them ✓
- Phase 6 needs `FeaturedWork`, `ProjectsGrid`, `StackSection`, `Experience`, `About`, `Footer` → Tasks 2 and 3 produce them ✓
- Phase 7 needs `Contact.tsx` with form state ready to wire backend → Task 4 produces it ✓
- Phase 8 polish layer needs each component reachable for animation tuning → all 9 files in the same flat dir ✓
- QR-01 (`tsc --noEmit` zero errors) → Tasks 2-5 and Task 7 enforce ✓
- FR-06 (TSX + prop interfaces) → every task produces typed props ✓

All Phase 5-9 prerequisites covered.

---

## Out of Scope (explicitly)

- Wiring redesign components into `ClientPage.tsx` or any route
- Removing legacy `(sections)/landing/*` components
- Implementing the voxel hero (still placeholder from Phase 2)
- Theme toggle state management (Phase 5)
- LangSwitcher wiring (Phase 5)
- Contact form backend (Phase 7)
- Restyling, animation polish (Phase 8)
- Replacing `<img>` with `next/image`

---

*Plan written: 2026-05-10 — manual GSD format*
