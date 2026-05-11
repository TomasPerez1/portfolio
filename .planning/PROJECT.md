# Project: portfolio — tomas.dev

## Overview

**Owner:** Tomás Pérez
**Branch:** v2.0.0
**Target runtime:** Vercel
**Last updated:** 2026-05-10

Visual redesign v2.0.0 merging the Claude Design system into the existing Next.js 14 App Router codebase. This is a structural and visual refactor, not a rewrite — existing functional pieces (i18n, contact pipeline, Calendly, analytics) are preserved; the heavy dependencies (Spline, NextUI) are replaced with a new design token system, HeroUI, and voxel CSS 3D.

---

## Audience

- **Recruiters / hiring managers** — first viewport must communicate: status, role, availability, and location immediately. Zero ambiguity about who this is and whether they are available.
- **Freelance clients / agencies** — featured work and contact CTA must be reachable in ≤2 scrolls from the top. The portfolio must read as the work of a senior, not a student.

---

## Goals

1. Ship a distinct visual identity with strong personality that reflects current seniority (vs. the current generic look)
2. Reduce bundle weight ≥30% by removing Spline + NextUI and replacing with lighter alternatives
3. Preserve and extend ES/EN i18n — all copy in both languages, no regressions
4. Maintain the contact pipeline (Nodemailer email + Calendly widget + Sonner toasts) without backend changes
5. Improve Core Web Vitals to meet production targets: LCP<2.5s, CLS<0.1, INP<200ms, Lighthouse ≥90 desktop / ≥80 mobile

---

## Non-Goals

- No backend changes (API routes, Nodemailer config, Calendly integration remain as-is)
- No new features beyond what is defined in the design
- No full content rewrite (copy is ported and translated, not redrafted)
- No WCAG full audit (WCAG AA basics only)
- No CMS or blog
- No analytics dashboard
- Playwright E2E tests: deferred to open question OQ-5 (Phase 9)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Performance — Desktop | ≥ 90 | Lighthouse CI on Vercel |
| Lighthouse Performance — Mobile | ≥ 80 | Lighthouse CI on Vercel |
| Largest Contentful Paint (LCP) | < 2.5s | Core Web Vitals |
| Cumulative Layout Shift (CLS) | < 0.1 | Core Web Vitals |
| Interaction to Next Paint (INP) | < 200ms | Core Web Vitals |
| Bundle reduction vs v1 baseline | ≥ 30% | next build output |
| Homepage bounce rate | < 50% | Vercel Analytics |

---

## Tech Stack

### Current (v1)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14.2.16, App Router, TypeScript |
| UI Library | NextUI 2.4 (`@nextui-org/react`) |
| Styling | TailwindCSS 3.3 |
| 3D / Hero | `@splinetool/react-spline` (cloud-hosted scenes) |
| Animation | Framer Motion 11 |
| i18n | i18next + react-i18next + next-i18next, `[lang]` routing |
| Email | Nodemailer + custom EmailTemplate |
| Calendar | react-calendly |
| Toasts | sonner |
| Analytics | @vercel/speed-insights |

### Target (v2)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14.2.16, App Router, TypeScript (unchanged) |
| UI Library | HeroUI (`@heroui/react`) — maintained successor of NextUI |
| Styling | TailwindCSS 3.3 + CSS custom properties (design tokens) |
| 3D / Hero | Voxel CSS 3D (zero runtime cost, bundle-free) |
| Animation | Framer Motion 11 (unchanged) + react-bits ≤2 components |
| i18n | i18next + react-i18next (unchanged), locale JSON expanded |
| Fonts | Bricolage Grotesque + Geist + JetBrains Mono via `next/font` |
| Email | Nodemailer (unchanged) |
| Calendar | react-calendly (unchanged) |
| Toasts | sonner (unchanged) |
| Analytics | @vercel/speed-insights (unchanged) |
| MCP Tooling | HeroUI MCP + shadcn MCP |

---

<decisions>

## Key Decisions

| # | Decision | Status | Rationale |
|---|----------|--------|-----------|
| D-01 | Keep Next.js 14 App Router — no migration | locked | Design is App Router compatible; no reason to migrate |
| D-02 | Convert all components JSX → TSX, zero `any` types | locked | Project standard; type safety on props |
| D-03 | Migrate `@nextui-org/react` → `@heroui/react` | locked | HeroUI is the maintained successor; API near-identical, migration is mechanical |
| D-04 | Replace Spline with voxel CSS 3D from design | locked | Bundle reduction, removes external SDK + cloud-hosted scenes; zero runtime cost |
| D-05 | Keep Framer Motion as animation engine | locked | Already in use; covers 90% of animation needs |
| D-06 | react-bits: ≤2 components max, surgical use only | locked | For specific wow moments only — NOT a base system; hard-cap enforced in Phase 8 |
| D-07 | Install HeroUI MCP via `npx -y @heroui/react-mcp` | locked | Programmatic HeroUI component installation |
| D-08 | Install shadcn MCP via `npx shadcn@latest mcp init --client claude` | locked | Required entry point to consume react-bits registry |
| D-09 | Keep i18next + `[lang]` segment routing | locked | Already merged (PR #2 lang switcher); no reason to change |
| D-10 | Keep Nodemailer + Calendly + Sonner — no rebuild | locked | Working pipeline; Phase 7 only reskins the UI |
| D-11 | Adopt `data-theme="light"` toggle from design (replaces NextUI theme) | locked | Cleaner than NextUI's theme system; state persisted to `localStorage` |
| D-12 | Fonts: Bricolage Grotesque + Geist + JetBrains Mono via `next/font` (self-hosted) | locked | Avoid Google Fonts CDN cost on prod; better LCP |
| D-13 | Phase 4 redesign components live in flat `my-app/src/app/components/redesign/*.tsx` (resolves OQ-1) | locked | Clear v1/v2 separation during transition; 1:1 map to source files in `.claude_design/export/components/`; legacy `(sections)/landing/*` stays until later phases wire redesign into the page |
| D-14 | Theme persistence: localStorage override + `prefers-color-scheme` as first-visit default. Inline `<script>` in `<head>` resolves before hydration (FART fix). Resolves OQ-2. | locked | Respects OS preference on first visit; explicit user toggle overrides and persists. Avoids theme flash via pre-hydration script. |

</decisions>

---

## Design Source

Pre-built by Claude Design at `.claude_design/export/`:
- `Page.jsx` — composition root showing component hierarchy
- `tailwind.config.js` — design token extension (colors, fonts, animations)
- `styles/globals.css` — CSS custom properties + atomic classes (`.btn`, `.chip`, `.badge`)
- `lib/portfolio-data.js` — flat copy object (to be split into i18n JSON keys)
- `components/` — 9 JSX components to be converted to TSX

Reference screenshots (10 JPEGs): `.claude_design/screenshots_designed/`

### Visual Token System

```css
--c-bg: #0a0a0a          --c-fg: #ededed
--c-spark: #b521ff       --c-spark-2: #d946ef   /* signature purple */
--c-card: #111111        --c-card-2: #161616
--font-display: "Bricolage Grotesque"
--font-body: "Geist"
--font-mono: "JetBrains Mono"
```

Custom animations: `tickerFlow` (38s marquee), `scrollLine` (vertical pulse), `spinSlow` (30s rotation).

---

## Component Migration Map

| v1 | v2 | Action |
|----|----|----|
| NavBar.tsx + SideBar.tsx | Nav.tsx | Replace + merge |
| LangSwitcher.tsx | Into Nav.tsx | Move (keep logic) |
| Landing.tsx | Hero.tsx | Replace (Spline → voxel) |
| Proyects.tsx | FeaturedWork.tsx + ProjectsGrid.tsx | Split |
| ProyectCard.tsx | Internal to ProjectsGrid | Replace |
| Carousel.tsx | (removed) | Drop |
| AboutMe.tsx + siblings | About.tsx | Replace (bento layout) |
| Contact.tsx | Contact.tsx | Restyle only (keep logic) |
| SendEmail.tsx | Into Contact | Adapt |
| Adress.tsx | Into Contact | Merge |
| EmailTemplate.tsx | EmailTemplate.tsx | Preserve as-is |
| — | StackSection.tsx | New |
| — | Experience.tsx | New |
| — | Footer.tsx | New |
| — | StackTicker (in FeaturedWork) | New |
