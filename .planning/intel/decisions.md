# Decisions

> Source: `.planning_docs/REDESIGN-SPEC.md` [SPEC] § 5. Stack Decisions
> All entries below are LOCKED — derived from SPEC (precedence 1).

---

## Framework

**Decision:** Keep Next.js 14 App Router — no migration.
**Status:** LOCKED
**Rationale:** Design is App Router compatible; no reason to migrate.

---

## Language

**Decision:** Convert all design components JSX → TSX.
**Status:** LOCKED
**Rationale:** Project standard; type safety on props. Zero `any` types.

---

## Component Library

**Decision:** Migrate `@nextui-org/react` → `@heroui/react`.
**Status:** LOCKED
**Rationale:** HeroUI is the maintained successor of NextUI; API near-identical, migration is mechanical.
**Removed:** `@nextui-org/react`
**Added:** `@heroui/react`

---

## 3D / Hero Animation

**Decision:** Replace Spline (`@splinetool/react-spline`) with voxel CSS 3D from design.
**Status:** LOCKED
**Rationale:** Bundle reduction, removes external SDK + cloud-hosted scenes. Zero runtime cost.
**Removed:** `@splinetool/react-spline`

---

## Animation Engine

**Decision:** Framer Motion (already installed) for global scroll/transition layer.
**Status:** LOCKED
**Rationale:** Already in use; covers 90% of animation needs.

---

## Selective Effects

**Decision:** react-bits — surgical use, ≤2 components max.
**Status:** LOCKED
**Rationale:** For specific wow moments (animated text, gradient reveals). NOT a base system. Hard-cap enforced in Phase 8.

---

## Tooling — HeroUI MCP

**Decision:** Install via `npx -y @heroui/react-mcp`.
**Status:** LOCKED
**Rationale:** Programmatic HeroUI component installation.

---

## Tooling — shadcn MCP

**Decision:** Install via `npx shadcn@latest mcp init --client claude`.
**Status:** LOCKED
**Rationale:** Required entry point to consume react-bits registry.

---

## i18n Strategy

**Decision:** Keep i18next + `[lang]` segment routing.
**Status:** LOCKED
**Rationale:** Already merged (PR #2 lang switcher). No reason to change.

---

## Contact Pipeline

**Decision:** Keep Nodemailer + Calendly + Sonner. No rebuild.
**Status:** LOCKED
**Rationale:** Working pipeline; Phase 7 only reskins the UI.

---

## Theming

**Decision:** Adopt `data-theme="light"` toggle from design. Replaces NextUI theme system.
**Status:** LOCKED
**Rationale:** Cleaner than NextUI's theme system; persisted to `localStorage`.

---

## Fonts

**Decision:** Bricolage Grotesque + Geist + JetBrains Mono via `next/font` (self-hosted).
**Status:** LOCKED
**Rationale:** Avoid Google Fonts CDN cost on prod; better LCP.
