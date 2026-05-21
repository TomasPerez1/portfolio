# Phase 1 Plan: Foundation Migration

**Phase:** 1 of 9
**Complexity:** S
**Requirements:** FR-01
**Depends on:** — (first phase)
**Status:** Ready to execute

---

## Goal

Establish the design token system, typography, and MCP tooling so every subsequent phase builds on a consistent foundation — without modifying any visible component.

---

## Pre-Flight Checks

Before starting any task:
- [ ] Working tree clean on branch `v2.0.0` (`git status` shows only `.planning/`/`.claude_design/` untracked dirs already known)
- [ ] `cd my-app && npm install` runs cleanly (no missing deps from prior work)
- [ ] `.claude_design/export/tailwind.config.js` and `.claude_design/export/styles/globals.css` exist

---

## Tasks

### Task 1 — Capture v1 bundle baseline (RC-04 gate)

**Why:** Phase 9 must prove ≥30% bundle reduction (PR-03). Without a recorded v1 baseline, the claim is unverifiable.

**Actions:**
1. `cd my-app && npm run build` → capture stdout
2. Save the full build output (the "Route (app)" / "First Load JS" tables) to `.planning/phases/01-foundation-migration/baseline-v1.txt`
3. Also record the `node_modules` size (`du -sh node_modules` or equivalent) inside that file as a header comment
4. Commit: `chore(phase-1): capture v1 bundle baseline`

**Acceptance:**
- `baseline-v1.txt` exists, contains the full Next.js build report including the per-route First Load JS column, and is committed.

---

### Task 2 — Merge Tailwind theme extensions

**File:** `my-app/tailwind.config.js`

**Source of truth:** `.claude_design/export/tailwind.config.js`

**Actions:**
1. Inside `theme.extend.colors`, add (alongside existing `background`/`foreground`):
   ```js
   bg:        "var(--c-bg)",
   fg:        "var(--c-fg)",
   "fg-soft":  "var(--c-fg-soft)",
   "fg-faint": "var(--c-fg-faint)",
   line:      "var(--c-line)",
   "line-2":  "var(--c-line-2)",
   card:      "var(--c-card)",
   "card-2":  "var(--c-card-2)",
   purple:    "#22014d",
   spark:     "var(--c-spark)",
   "spark-2": "var(--c-spark-2)",
   ```
2. Add `theme.extend.fontFamily`:
   ```js
   fontFamily: {
     display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
     body:    ['var(--font-body)',    'ui-sans-serif', 'system-ui', 'sans-serif'],
     mono:    ['var(--font-mono)',    'ui-monospace', 'monospace'],
   },
   ```
   (Use `var(--font-...)` so Tailwind reads the `next/font` CSS variables defined in Task 4.)
3. Add `theme.extend.letterSpacing`: `tightest: "-0.04em"`, `tightish: "-0.03em"`, `tightish2: "-0.02em"`.
4. Add `theme.extend.animation` and `theme.extend.keyframes` exactly as in the design config (`ticker`, `scroll-line`, `spin-slow` + their keyframes).
5. Leave existing items intact: `nextui()` plugin, `bg-grid`/`bg-grid-small`/`bg-dot` utility plugin, `darkMode: "class"`, `xs: '440px'` screen.

**Acceptance:**
- `tailwind.config.js` contains every key from `.claude_design/export/tailwind.config.js` `theme.extend` (additively merged)
- `npm run dev` starts without Tailwind config errors
- A throwaway test element with `className="bg-spark text-fg font-display"` renders with the purple background and Bricolage font once Task 4 lands

---

### Task 3 — Append CSS custom properties + atomic classes to `globals.css`

**File:** `my-app/src/app/globals.css`

**Source:** `.claude_design/export/styles/globals.css` lines 10-64 (everything EXCEPT the `@import url("https://fonts.googleapis.com/...")` line — that line MUST NOT be copied per D-12)

**Actions:**
1. Append after the existing `@media (prefers-color-scheme: dark) {...}` block (do NOT delete the existing `--background`/`--foreground` block — v1 components still consume it):
   - `:root { --c-bg, --c-fg, --c-fg-soft, --c-fg-faint, --c-line, --c-line-2, --c-card, --c-card-2, --c-spark, --c-spark-2 }`
   - `:root.light, :root[data-theme="light"] { ... }` light overrides
   - `html { scroll-behavior: smooth; }` and the `::selection` rule
   - The full `@layer components { .display, .display-xl, .display-l, .display-m, .eyebrow, .badge, .chip, .btn, .btn-primary }` block
2. **Do NOT** copy the `@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque...")` line. Fonts are handled by `next/font` in Task 4.
3. Do NOT modify the existing `body { font-family: Arial... }`, `#content`, `#navigation`, scrollbar rules, or the legacy `--background`/`--foreground` block — Phase 5/6 will clean those up.

**Acceptance:**
- New tokens resolve in browser DevTools at `:root` (e.g. `getComputedStyle(document.documentElement).getPropertyValue('--c-spark')` returns `#b521ff`)
- Toggling `document.documentElement.setAttribute('data-theme','light')` flips `--c-bg` to `#ffffff`
- A throwaway `<button class="btn btn-primary">` renders with the purple gradient + pill shape

---

### Task 4 — Self-host fonts via `next/font` (D-12)

**Files:**
- New: `my-app/src/app/fonts.ts`
- Modified: `my-app/src/app/layout.tsx`

**Why:** Per D-12, no Google Fonts CDN. `next/font` self-hosts at build time and exposes a CSS variable.

**Actions:**
1. Create `my-app/src/app/fonts.ts`:
   ```ts
   import { Bricolage_Grotesque, Geist, JetBrains_Mono } from 'next/font/google';

   export const bricolage = Bricolage_Grotesque({
     subsets: ['latin'],
     weight: ['400', '500', '600', '700', '800'],
     variable: '--font-display',
     display: 'swap',
   });

   export const geist = Geist({
     subsets: ['latin'],
     weight: ['300', '400', '500', '600', '700'],
     variable: '--font-body',
     display: 'swap',
   });

   export const jetbrainsMono = JetBrains_Mono({
     subsets: ['latin'],
     weight: ['400', '500', '600'],
     variable: '--font-mono',
     display: 'swap',
   });
   ```
2. In `my-app/src/app/layout.tsx`:
   - Import `{ bricolage, geist, jetbrainsMono }` from `./fonts`
   - On the `<html>` element add `className={\`${bricolage.variable} ${geist.variable} ${jetbrainsMono.variable}\`}`
   - **Keep** the existing `Poppins` import and `<body className={poppins.className}>` for now — v1 components depend on it. Phase 5 will swap `body` to use `font-body` once they're gone.
3. Verify there is no `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` anywhere in `my-app/src/`. If `globals.css` accidentally got the `@import url("https://fonts.googleapis.com/...")` line in Task 3, remove it now.

**Acceptance:**
- `next dev` starts without errors
- DevTools `<html>` element has all three CSS variable classes (`--font-display`, `--font-body`, `--font-mono` resolve to actual font-family values)
- A test element `<div className="font-display">Test</div>` renders in Bricolage Grotesque
- Network tab shows fonts served from same origin (no `fonts.googleapis.com` requests)

---

### Task 5 — Install HeroUI MCP (D-07)

**Why:** D-07 — required tooling for Phase 2 component swap.

**Actions:**
1. Run `npx -y @heroui/react-mcp` in the project root (or as documented by HeroUI). This registers the MCP server with Claude Code.
2. Verify the MCP server shows up under `/mcp` (or equivalent) inside Claude Code.
3. Note the verification result in the commit message.

**Acceptance:**
- `/mcp` lists the HeroUI MCP as connected (or its tools are available in `ToolSearch`)

**Note:** This is a developer-machine action. No code change. If the user has already installed it, mark this task done and move on.

---

### Task 6 — Install shadcn MCP (D-08)

**Why:** D-08 — required entry point to consume the react-bits registry in Phase 8.

**Actions:**
1. Run `npx shadcn@latest mcp init --client claude` in the project root.
2. Verify the MCP server is connected.

**Acceptance:**
- `/mcp` lists the shadcn MCP as connected

**Note:** Same as Task 5 — local install, no repo change.

---

## Commit Plan (atomic)

| # | Files | Message |
|---|-------|---------|
| 1 | `.planning/phases/01-foundation-migration/baseline-v1.txt` | `chore(phase-1): capture v1 bundle baseline` |
| 2 | `my-app/tailwind.config.js` | `feat(phase-1): merge design tokens into tailwind config` |
| 3 | `my-app/src/app/globals.css` | `feat(phase-1): add design system CSS custom properties and atomic classes` |
| 4 | `my-app/src/app/fonts.ts`, `my-app/src/app/layout.tsx` | `feat(phase-1): self-host fonts via next/font` |
| 5 | `.planning/phases/01-foundation-migration/PHASE-COMPLETE.md` | `docs(phase-1): record MCP install verification and complete phase` |

(Tasks 5 and 6 are local-machine MCP installs — no repo files. Commit 5 is a small phase-completion note recording that they were verified.)

---

## Success Criteria (from ROADMAP)

Verification after all tasks land:

1. ✅ CSS custom properties (`--c-bg`, `--c-spark`, etc.) resolve correctly in browser DevTools at `:root`
2. ✅ Font variables (`font-display`, `font-body`, `font-mono`) render the correct typefaces in a test element
3. ✅ Tailwind color utilities (`bg-spark`, `text-fg`) work without errors in any component
4. ✅ Bundle baseline figure recorded in `.planning/phases/01-foundation-migration/baseline-v1.txt` and committed
5. ✅ Both MCP servers install without errors and appear in `/mcp`

**Verification checklist (manual smoke test):**
- Build a throwaway `app/test/page.tsx` with `<div className="bg-spark text-fg font-display p-4">TEST</div>` → renders purple background, light text, Bricolage font
- Toggle `data-theme="light"` on `<html>` via DevTools → background flips to white, text to dark
- Open Network tab → no requests to `fonts.googleapis.com`
- Delete `app/test/page.tsx` before merge

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tailwind colliding `colors.bg` shorthand vs Tailwind core `bg-*` utilities | Low | `bg` as a custom color is namespaced — `bg-bg` is the utility. If conflict appears, rename to `bg-app`. Document in commit. |
| `next/font` package name for `Bricolage_Grotesque` differs by Next version | Low | If import fails, check `node_modules/next/font/google.d.ts` for actual export name and adjust. Bricolage is supported in Next 14.2+. |
| Legacy `Poppins` global className clobbers `font-body` utility on v1 pages | Low | Acceptable for Phase 1 — v1 keeps Poppins. Cleanup queued for Phase 5. |
| RC-04 baseline run fails because `npm run build` errors out on existing v1 issues | Medium | If build is already broken, fix the breakage first as a Task 0 BEFORE running baseline; document as deviation. |
| MCP install requires Claude Code restart and disrupts the session | Medium | Run MCPs at the END (Task 5, 6) so the rest of Phase 1 isn't blocked. |

---

## Goal-Backward Verification

**Goal:** Foundation infrastructure ready for Phase 2-9 to consume.

Working backward:
- Phase 2 needs HeroUI MCP installed → Task 5 ✓
- Phase 8 needs shadcn MCP installed → Task 6 ✓
- Phase 4+ needs `font-display`/`font-body`/`font-mono` Tailwind utilities → Tasks 2+4 ✓
- Phase 5+ needs `bg-spark`/`text-fg` etc. Tailwind utilities → Task 2 ✓
- Phase 5+ needs `--c-bg`/`--c-spark` etc. CSS variables for `data-theme="light"` toggling → Task 3 ✓
- Phase 5+ needs atomic `.btn`/`.chip`/`.badge` classes → Task 3 ✓
- Phase 9 needs v1 bundle baseline to compute ≥30% reduction → Task 1 ✓

All Phase 2-9 prerequisites covered.

---

## Out of Scope (explicitly)

- Replacing `@nextui-org/react` (Phase 2)
- Removing Spline (Phase 2)
- Updating any component file under `my-app/src/components/`
- Removing legacy `--background`/`--foreground` and `Poppins`
- Token contrast / WCAG audit (Phase 9)

---

*Plan written: 2026-05-10 — manual GSD format (gsd-sdk binary unavailable)*
