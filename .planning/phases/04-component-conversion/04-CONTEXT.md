# Phase 4: Component Conversion — JSX → TSX

**Gathered:** 2026-05-10
**Status:** Ready for planning
**Source:** Manual draft (gsd-sdk unavailable)

<domain>
## Phase Boundary

Convert all 9 redesign components from `.claude_design/export/components/*.jsx` to typed `.tsx` files inside `my-app/src/app/components/redesign/`. Define explicit prop interfaces using `PortfolioData` sub-types from Phase 3. Audit existing `ui/Loader.tsx` and `ui/LangLoader.tsx`.

**In scope:**
- Create directory `my-app/src/app/components/redesign/`
- Convert 9 components from `.jsx` to `.tsx`: `Hero`, `Nav`, `FeaturedWork`, `ProjectsGrid`, `StackSection`, `Experience`, `About`, `Contact`, `Footer`
- Define prop interfaces for each, importing types from `app/i18n/portfolio.types`
- Replace inline data shapes with `PortfolioData` references (e.g. `Hero({ data })` → `Hero({ data }: { data: Pick<PortfolioData, "identity" | "hero"> })`)
- Audit `ui/Loader.tsx` and `ui/LangLoader.tsx`: decide keep / adapt / drop (default: keep, both still used by current LangSwitcher flow)
- `tsc --noEmit` zero errors across the whole app
- No `.jsx` files in `my-app/src/` (already true; preserve invariant)

**Out of scope:**
- Wiring redesign components into `ClientPage.tsx` or any route (Phase 5+)
- Replacing legacy v1 components (`(sections)/landing/*`) — they stay until later phases wire the redesign into the page
- Restyling, animation tuning (Phase 8)
- Voxel hero implementation (Phase 5)
- Theme toggle wiring, LangSwitcher wiring (Phase 5)
- Contact form backend rewire (Phase 7)

</domain>

<decisions>
## Implementation Decisions

### Locked from PROJECT.md / ROADMAP
- **FR-06**: All components in `.tsx` with explicit prop interfaces
- **QR-01**: `tsc --noEmit` passes with zero errors
- **OQ-1 (resolved 2026-05-10)**: Directory layout = **flat `components/redesign/*`**. User-chosen; engram observation `phase-4/oq-1`. To be added to PROJECT.md as D-13.

### Phase-4 specific (Claude's discretion — to be confirmed)
- **Prop interface sourcing**: Each component's props derive from `PortfolioData` sub-types via `Pick<>` or direct sub-interface imports. No new ad-hoc types unless a component has UI-only state (e.g. `theme` toggle on `Nav`).
- **Self-contained data fetching**: Components do NOT call `usePortfolioData()` internally — they accept `data` props. The wrapper that calls the hook lives at Phase 5+ (page-level). Pure presentational components are easier to test and reuse.
- **`children` and event handler typing**: `React.ReactNode` for children, explicit `() => void` (or typed equivalents) for callbacks.
- **Asset imports**: Components reference `assets/` paths via plain string props (no `next/image` migration in this phase — that's a polish concern). Phase 5+ wiring handles this if needed.
- **`Hero.jsx` voxel sub-components (`GridBackdrop`, `VoxelArt`, `Voxel`, `KV`, `ScrollCue`, `Arrow`, `DownloadIcon`)**: Convert in place inside `Hero.tsx`. They stay private helpers — not separate files unless one exceeds ~60 lines.
- **`Loader.tsx` and `LangLoader.tsx` audit**: KEEP both. `LangLoader` is rendered by `ClientPage` during `useTranslation` boot; `Loader` (Skeleton) is used by component-level loading states. No adaptation needed for Phase 4 — re-audit at Phase 5+ if redesign hero/nav need their own loaders.

### Claude's Discretion
- Whether to split `Hero`'s voxel helpers into a `Voxel.tsx` sub-module — defer until Phase 5 (when voxel implementation lands; might warrant its own file then)
- Whether to use `interface` vs `type` for prop definitions — pick `interface` for top-level component props, `type` for utility unions/picks. Matches Phase 3 convention.

</decisions>

<canonical_refs>
## Canonical References

### Project specs
- `.planning/PROJECT.md` — to be amended with D-13 (OQ-1 resolution)
- `.planning/REQUIREMENTS.md` — FR-06 (TSX + prop interfaces), QR-01 (tsc zero errors)
- `.planning/ROADMAP.md` — Phase 4 goal, key tasks, success criteria

### Phase 3 outputs (consumed)
- `my-app/src/app/i18n/portfolio.types.ts` — `Identity`, `HeroCopy`, `SectionLabels`, `FeaturedProject`, `GridProject`, `StackCategories`, `ExperienceEntry`, `AboutCopy`, `ContactCopy`, `FooterCopy`, `PortfolioData`
- `my-app/src/app/i18n/usePortfolioData.ts` — hook (consumed by Phase 5+, NOT by Phase 4 components)

### Source files (convert these)
- `.claude_design/export/components/Hero.jsx` (229 lines — biggest, voxel helpers inside)
- `.claude_design/export/components/Contact.jsx` (147 lines)
- `.claude_design/export/components/FeaturedWork.jsx` (114 lines)
- `.claude_design/export/components/About.jsx` (91 lines)
- `.claude_design/export/components/Nav.jsx` (80 lines)
- `.claude_design/export/components/Experience.jsx` (61 lines)
- `.claude_design/export/components/ProjectsGrid.jsx` (50 lines)
- `.claude_design/export/components/StackSection.jsx` (37 lines)
- `.claude_design/export/components/Footer.jsx` (27 lines)

Total: 836 lines JSX → ~9 TSX files with prop interfaces.

### Files to inspect (no modification expected)
- `my-app/src/app/ui/Loader.tsx`
- `my-app/src/app/ui/LangLoader.tsx`

</canonical_refs>

<specifics>
## Specific Risks & Notes

- **No runtime test possible**: These components are NOT wired into any route yet. The only validation gate is `tsc --noEmit`. If a component has a runtime-only bug (bad event listener cleanup, etc.), Phase 5+ will catch it — Phase 4 cannot.
- **`Hero.jsx` is special**: 229 lines with 7 internal helpers (`GridBackdrop`, `VoxelArt`, `Voxel`, `KV`, `ScrollCue`, `Arrow`, `DownloadIcon`). The voxel logic uses `useEffect` + `requestAnimationFrame` with `el.addEventListener("mouseleave", ...)` and an unbalanced cleanup (no removeEventListener for `mouseleave`). The current TS conversion preserves the bug as-is (Phase 8 polish can fix it).
- **`data` shape per component (from JSX usage)**:
  - `Hero({ data, showStatus })` — uses `data.statusLine`, `data.location`, `data.timezone`, `data.tagline`. Maps to `Pick<Identity, "statusLine"|"location"|"timezone"|"tagline">`.
  - `Nav({ theme, onToggleTheme })` — local-only state, no `PortfolioData` dependency
  - `FeaturedWork`, `ProjectsGrid`, `StackSection`, `Experience`, `About`, `Contact`, `Footer` — TBD per component during conversion; each maps to one or more `PortfolioData` sub-interfaces.
- **`onToggleTheme` callback**: `() => void`. Theme state lives elsewhere (Phase 5 decision).
- **`href="#work"` etc.**: Internal anchor links. No TypeScript impact.
- **No `next/image` migration**: Components use plain `<img>` or whatever the JSX original uses. Phase 4 keeps them identical; image optimization is a separate concern.
- **`"use client"` directive**: Preserve on every converted component (matches source).

</specifics>

<deferred>
## Deferred Ideas

- `Hero.tsx` voxel split into `Voxel.tsx` — defer to Phase 5 if it grows
- `Loader.tsx` / `LangLoader.tsx` migration to use the new redesign aesthetic — Phase 5 decision
- Replacing plain `<img>` with `next/image` in redesign components — polish/perf phase
- Adding Storybook or Ladle for isolated component preview — out of v2.0.0 scope
- Removing legacy `(sections)/landing/*` components — must wait until Phase 5+ wires redesign into the page

</deferred>

---

*Phase: 04-component-conversion*
*Context gathered: 2026-05-10 (manual)*
