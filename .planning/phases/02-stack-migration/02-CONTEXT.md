# Phase 2: Stack Migration — NextUI → HeroUI + Spline Removal

**Gathered:** 2026-05-10
**Status:** Ready for planning
**Source:** Manual draft (gsd-sdk unavailable)

<domain>
## Phase Boundary

Eliminate `@nextui-org/react` and `@splinetool/react-spline` from the dependency tree. Replace NextUI with `@heroui/react` (its maintained successor — near-identical API). Stub Spline-loading code with a placeholder; Hero.tsx's voxel implementation lands in Phase 5.

**In scope:**
- API parity audit (RC-01) — completed in this CONTEXT.md
- Install `@heroui/react` and its theme/plugin equivalent
- `NextUIProvider` → `HeroUIProvider` in `providers.tsx`
- Replace 8 component imports (`@nextui-org/react` → `@heroui/react`) — same component names expected
- Replace lazy Spline import in `Landing.tsx` with a static placeholder (Phase 5 will install voxel)
- Update `tailwind.config.js` plugin (`nextui()` → `heroui()`) and content path
- Remove `@nextui-org/react` and `@splinetool/react-spline` from `package.json`
- Verify `next build` passes without errors
- Measure new First Load JS vs Phase 1 baseline (269 kB)

**Out of scope:**
- Implementing Hero voxel CSS 3D (Phase 5)
- Restyling any component (Phases 5-7)
- Removing legacy `--background`/`--foreground` tokens or `Poppins` import
- Touching the Nodemailer / Calendly / Sonner pipeline (Phase 7 only restyles)

</domain>

<decisions>
## Implementation Decisions

### Locked from PROJECT.md
- **D-03**: NextUI → HeroUI swap (mechanical; HeroUI is the maintained successor)
- **D-04**: Replace Spline with voxel CSS 3D — Phase 5 implements; Phase 2 only **stubs** the call site so the app still renders

### Phase-2 specific (Claude's discretion)
- **HeroUI install strategy**: `npm install @heroui/react framer-motion` (HeroUI requires framer-motion peer; we already have it from v1)
- **Tailwind plugin source**: HeroUI exposes the plugin via `@heroui/react` (or `@heroui/theme`) — verify on install. Update content path from `@nextui-org/theme` to the HeroUI equivalent.
- **Spline stub**: In `Landing.tsx`, replace the lazy `Spline` component with a `<div>` placeholder carrying the same dimensions and an `aria-hidden` attribute. A TODO marker (`// TODO(phase-5): voxel hero`) makes the deferred work discoverable.
- **Removal order**: Install HeroUI FIRST, swap imports SECOND, then `npm uninstall` NextUI/Spline LAST — never break the app between commits.
- **Per-component verification**: After each swap commit, run `next dev` and check the affected route. Catches API drift before it compounds.

### Claude's Discretion
- Whether to use `@heroui/theme` or `@heroui/react` for the Tailwind plugin export — decide on install based on what `node_modules/@heroui/react/package.json` exports

</decisions>

<canonical_refs>
## Canonical References

### Project specs
- `.planning/PROJECT.md` — D-03 (HeroUI swap), D-04 (Spline removal)
- `.planning/REQUIREMENTS.md` — PR-03 (≥30% bundle reduction; baseline = 269 kB)
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria

### Phase 1 outputs (consumed)
- `.planning/phases/01-foundation-migration/baseline-v1.txt` — 269 kB target diff base
- `my-app/tailwind.config.js` — design tokens already in place (Phase 1)
- `my-app/src/app/globals.css` — atomic classes already in place (Phase 1)

### Targets to modify (audit complete)
1. `my-app/src/app/providers.tsx` — `NextUIProvider`
2. `my-app/src/app/(sections)/landing/proyects/ProyectCard.tsx` — `Card, CardHeader, CardBody, Accordion, AccordionItem`
3. `my-app/src/app/(sections)/landing/landing/Landing.tsx` — `Spline` lazy import → stub
4. `my-app/src/app/(sections)/landing/contact/SendEmail.tsx` — `Form, Input, Button, Textarea`
5. `my-app/src/app/(sections)/landing/contact/Adress.tsx` — `Tooltip`
6. `my-app/src/app/ui/LangLoader.tsx` — `Spinner`
7. `my-app/src/app/ui/LangSwitcher.tsx` — `Switch`
8. `my-app/src/app/ui/SideBar.tsx` — `Navbar, NavbarContent, NavbarMenu, NavbarMenuToggle, NavbarMenuItem`
9. `my-app/src/app/ui/Loader.tsx` — `Skeleton`
10. `my-app/tailwind.config.js` — plugin + content path
11. `my-app/package.json` — remove deps

</canonical_refs>

<specifics>
## Specific Risks & Notes

- **RC-01 (API parity)**: Audit complete — all components NextUI 2.4 uses appear in HeroUI's roster. Verification gate: `npm install @heroui/react && tsc --noEmit` after swap. Any TypeScript error reveals an API drift point.
- **RC-03 (animation throttling)**: Not applicable to Phase 2 (Hero animation is Phase 5).
- **The `// @ts-expect-error - NextUI type complexity` comment in `layout.tsx`** wraps `<Provider>`. After HeroUI swap, this directive may need updating or removal if HeroUI's types are clean.
- **Sonner Toaster** in `layout.tsx` is independent of NextUI — leaves untouched.
- **Spline lazy import** uses `React.lazy()` with `Suspense`. The stub must NOT be a lazy component (no need); just inline a placeholder div.

</specifics>

<deferred>
## Deferred Ideas

- Removing the `// @ts-expect-error` directive in `layout.tsx` if HeroUI types are clean — noted but not a Phase 2 success criterion
- Removing `clsx` / `tailwind-merge` if HeroUI bundles its own — defer until measurable

</deferred>

---

*Phase: 02-stack-migration*
*Context gathered: 2026-05-10 (manual)*
