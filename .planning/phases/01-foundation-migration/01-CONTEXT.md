# Phase 1: Foundation Migration — Context

**Gathered:** 2026-05-10
**Status:** Ready for planning
**Source:** Manual draft (gsd-sdk unavailable; plan-phase workflow followed in spirit)

<domain>
## Phase Boundary

Establish the design-token system (Tailwind extensions + CSS custom properties), self-hosted typography via `next/font`, and MCP tooling — without touching component code yet. This is pure infrastructure: every subsequent phase consumes what lands here.

**In scope:**
- Bundle baseline measurement of v1 (gates PR-03 ≥30% reduction claim in Phase 9)
- Merge Tailwind theme extensions from `.claude_design/export/tailwind.config.js` into `my-app/tailwind.config.js`
- Add new CSS custom properties + atomic component classes to `my-app/src/app/globals.css`
- Self-host Bricolage Grotesque, Geist, JetBrains Mono via `next/font`; remove any Google Fonts CDN reference
- Install HeroUI MCP and shadcn MCP

**Out of scope (future phases):**
- Replacing `@nextui-org/react` (Phase 2)
- Removing Spline (Phase 2)
- Wiring components to the new tokens (Phase 5+)
- Removing the legacy `--background`/`--foreground` tokens (deferred until Phase 5/6 when v1 components are gone)

</domain>

<decisions>
## Implementation Decisions

### Locked from PROJECT.md
- **D-07**: HeroUI MCP installed via `npx -y @heroui/react-mcp`
- **D-08**: shadcn MCP installed via `npx shadcn@latest mcp init --client claude`
- **D-12**: Fonts via `next/font` (self-hosted) — NO Google Fonts CDN

### Phase-1 specific (Claude's discretion)
- **Tailwind config strategy**: Additive merge — keep existing `nextui()` plugin, `bg-grid`/`bg-dot` utilities, and screen breakpoints. Phase 2 will remove the `nextui()` plugin when the swap happens.
- **globals.css strategy**: Append new tokens + atomic classes. Do NOT delete the legacy `--background`/`--foreground` block — v1 components still depend on it. Cleanup deferred.
- **Font declaration location**: Create `my-app/src/app/fonts.ts` exporting the three `next/font` instances and their CSS variables. `layout.tsx` adds `${bricolage.variable} ${geist.variable} ${mono.variable}` to `<html>` className. Existing `Poppins` import stays for v1 components — removed in a later phase.
- **Baseline artifact**: Save `next build` output to `.planning/phases/01-foundation-migration/baseline-v1.txt` so Phase 9 can diff it. Commit it.
- **MCP installs**: User-machine concern (registers with Claude Code config). Document the commands and confirmation in PLAN.md output; do not script them as part of CI.

### Claude's Discretion
- Exact `next/font` weight subsets (will use what design tokens reference: 400/500/600/700 minimum)
- Whether to keep `@import "/.../fonts.googleapis.com..."` from the design export — **NO** per D-12. Drop it on copy.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs
- `.planning/PROJECT.md` — locked decisions D-07, D-08, D-12 and tech stack
- `.planning/REQUIREMENTS.md` — FR-01 (design token system)
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, RC-04 baseline gate

### Design source
- `.claude_design/export/tailwind.config.js` — colors, fonts, animations to merge
- `.claude_design/export/styles/globals.css` — CSS custom properties + atomic classes
- `.planning_docs/REDESIGN-SPEC.md` — original spec

### Current code (targets to modify)
- `my-app/tailwind.config.js`
- `my-app/src/app/globals.css`
- `my-app/src/app/layout.tsx` — font wiring entry point
- `my-app/package.json` — baseline reference

</canonical_refs>

<specifics>
## Specific Ideas

- Token names must match design verbatim: `--c-bg`, `--c-fg`, `--c-fg-soft`, `--c-fg-faint`, `--c-line`, `--c-line-2`, `--c-card`, `--c-card-2`, `--c-spark`, `--c-spark-2`
- Tailwind color keys must match design verbatim: `bg`, `fg`, `fg-soft`, `fg-faint`, `line`, `line-2`, `card`, `card-2`, `spark`, `spark-2`, `purple` (#22014d)
- Font CSS variables: `--font-display`, `--font-body`, `--font-mono` (consumed by Tailwind `fontFamily.{display,body,mono}`)
- Animations to register: `tickerFlow` (38s linear infinite), `scrollLine` (2s ease-in-out infinite), `spinSlow` (30s linear infinite)
- Atomic classes to add under `@layer components`: `.display`, `.display-xl`, `.display-l`, `.display-m`, `.eyebrow`, `.badge`, `.chip`, `.btn`, `.btn-primary`

</specifics>

<deferred>
## Deferred Ideas

- Removing legacy `--background` / `--foreground` CSS vars and the `Poppins` import from `layout.tsx` — defer until v1 components are dropped (Phase 5/6).
- Removing `nextui()` plugin from Tailwind — Phase 2.
- WCAG contrast verification of token pairs — Phase 9 QA.

</deferred>

---

*Phase: 01-foundation-migration*
*Context gathered: 2026-05-10 (manual)*
