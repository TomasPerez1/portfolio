# Portfolio v2.0.0 — Visual Redesign Spec

**Owner:** Tomás Pérez
**Status:** Draft for ingestion
**Target Branch:** `v2.0.0`
**Date:** 2026-05-10
**Doc Type:** SPEC (consumed by `/gsd-ingest-docs`)

---

## 1. Project Overview

This document specifies the visual redesign of the personal portfolio (`tomas.dev`) from its current v1 state into a v2.0.0 release. The redesign is **guided by a pre-existing design** authored with Claude Design, located at `.claude_design/export/` (drop-in React + Tailwind components) with reference screenshots at `.claude_design/screenshots_designed/`.

The work is a **structural and visual refactor** — not a from-scratch rewrite. We are merging a new design system into an existing Next.js 14 App Router codebase that already has working i18n, contact form (Nodemailer), Calendly integration, and Vercel Speed Insights.

### Goals

- Ship a new visual identity that reflects current seniority and personality
- Reduce bundle weight and runtime cost (drop heavy dependencies)
- Preserve and extend i18n support (ES/EN)
- Maintain functional contact pipeline (email + calendar)
- Improve performance metrics (Core Web Vitals)

### Non-Goals

- Full content rewrite — copy will be ported, not redrafted
- Backend changes — no API or data-layer work
- New features beyond the design (analytics dashboard, blog, CMS, etc.)
- A11y certification — we aim for WCAG AA basics, not full audit

---

## 2. Audience & Success Criteria

### Primary Audiences (mixed)

1. **Recruiters / hiring managers** — must quickly grasp seniority, stack, and current availability
2. **Freelance clients / agencies** — must see project work, case studies, and contact path

These two audiences guide content priority: status badge, role, availability, location must be visible in the first viewport. Featured work and contact CTA must be reachable in ≤2 scrolls.

### Success Signals (measurable)

- Bounce rate on homepage < 50% (current Vercel Analytics baseline)
- Time-to-contact (CTA click) tracked
- Lighthouse Performance score ≥ 90 on desktop, ≥ 80 on mobile
- LCP < 2.5s, CLS < 0.1, INP < 200ms
- Bundle size reduction ≥ 30% vs v1 (Spline + NextUI removal)

---

## 3. Current State (v1)

### Stack

- **Framework:** Next.js 14.2.16 (App Router, TypeScript)
- **UI Lib:** NextUI 2.4
- **Styling:** TailwindCSS 3.3
- **3D:** `@splinetool/react-spline` (two cloud-hosted scenes)
- **Animation:** Framer Motion 11
- **i18n:** i18next + react-i18next + next-i18next, `[lang]` route segment
- **Email:** Nodemailer + custom EmailTemplate
- **Calendar:** react-calendly
- **Toasts:** sonner
- **Analytics:** @vercel/speed-insights

### Structure (relevant files)

```
my-app/src/app/
├── (sections)/landing/
│   ├── about-me/
│   │   ├── AboutMe.tsx
│   │   ├── ExternalLinks.tsx
│   │   └── ProfileCarroucel.tsx
│   ├── contact/
│   │   ├── Adress.tsx
│   │   ├── Contact.tsx
│   │   ├── EmailTemplate.tsx
│   │   └── SendEmail.tsx
│   ├── landing/
│   │   └── Landing.tsx              ← Spline hero
│   └── proyects/                    ← typo: "proyects"
│       ├── Carousel.tsx
│       ├── ProyectCard.tsx
│       └── Proyects.tsx
├── ui/
│   ├── LangLoader.tsx
│   ├── LangSwitcher.tsx
│   ├── Loader.tsx
│   ├── NavBar.tsx
│   └── SideBar.tsx
├── [lang]/
│   ├── ClientPage.tsx
│   ├── layout.tsx
│   └── page.tsx
├── i18n/
│   ├── client.ts
│   └── index.ts
├── api/
├── lib/
├── globals.css
├── i18n-config.ts
├── layout.tsx
├── middleware.ts
├── page.tsx
└── providers.tsx

my-app/public/locales/
├── en/common.json
└── es/common.json
```

### Pain Points (drives the redesign)

- Visual: feels generic, no strong identity
- Performance: Spline scenes pull a heavy SDK and external assets
- Component duplication: NextUI tokens overlap with Tailwind
- Naming: `proyects/` typo, `Carroucel` typo, `SideBar` separate from `NavBar`

---

## 4. Target State (v2.0.0)

### Design Source

Drop-in components at `.claude_design/export/`:

- `Page.jsx` — composition root
- `tailwind.config.js` — token extension (colors, fonts, animations)
- `styles/globals.css` — CSS variables + reusable atoms (`.display`, `.eyebrow`, `.badge`, `.chip`, `.btn`, `.btn-primary`)
- `lib/portfolio-data.js` — flat copy/data object
- `components/`:
  - `Nav.jsx` — floating pill, theme toggle
  - `Hero.jsx` — voxel CSS 3D, status badges, dual CTAs
  - `FeaturedWork.jsx` — 3 case-study cards + StackTicker + SectionHeader
  - `ProjectsGrid.jsx` — 6 secondary projects
  - `StackSection.jsx` — 5-column matrix
  - `Experience.jsx` — timeline with hover-expand bullets
  - `About.jsx` — bento grid
  - `Contact.jsx` — form + calendar preview (UI only, no logic)
  - `Footer.jsx`

Reference screenshots at `.claude_design/screenshots_designed/` (10 JPEGs).

### Visual Tokens (from design)

```css
/* Dark (default) */
--c-bg:        #0a0a0a;
--c-fg:        #ededed;
--c-fg-soft:   rgba(237,237,237,.62);
--c-fg-faint:  rgba(237,237,237,.42);
--c-line:      rgba(237,237,237,.10);
--c-line-2:    rgba(237,237,237,.18);
--c-card:      #111111;
--c-card-2:    #161616;
--c-spark:     #b521ff;   /* signature purple */
--c-spark-2:   #d946ef;

/* Fonts */
--font-display: "Bricolage Grotesque";  /* h1, h2 — clamp(64px, 13vw, 220px) */
--font-body:    "Geist";
--font-mono:    "JetBrains Mono";       /* eyebrows, badges, chips */
```

### Custom Animations

- `tickerFlow` — infinite horizontal marquee (38s)
- `scrollLine` — vertical pulse for scroll cue
- `spinSlow` — 30s rotation for decorative elements

---

## 5. Stack Decisions (locked)

| Concern | Decision | Rationale |
|---------|----------|-----------|
| **Framework** | Keep Next.js 14 App Router | No reason to migrate; design is App Router compatible |
| **TypeScript** | Convert all design components from JSX → TSX | Project standard; type safety on props |
| **Component lib** | Migrate `@nextui-org/react` → `@heroui/react` | HeroUI is the maintained successor of NextUI; API near-identical, migration is mechanical |
| **3D / Hero animation** | Replace Spline with voxel CSS 3D (from design) | Bundle reduction, removes external SDK + cloud-hosted scenes, no runtime cost |
| **Animation engine** | Framer Motion (already installed) for global scroll/transition layer | Already in use; covers 90% of needs |
| **Selective effects** | react-bits — surgical use only, ≤2 components | For specific wow moments (animated text, gradient reveals); NOT as base system |
| **HeroUI MCP** | Install via `npx -y @heroui/react-mcp` | Programmatic component installation tool |
| **shadcn MCP** | Install via `npx shadcn@latest mcp init --client claude` | Required entry point to consume react-bits registry |
| **i18n** | Keep i18next + `[lang]` segment routing | Already merged from PR #2 (lang switcher) |
| **Contact pipeline** | Keep Nodemailer + Calendly + Sonner | Working, no need to rebuild |
| **Theming** | Adopt `data-theme="light"` toggle from design | Replaces NextUI theme system |
| **Fonts** | Bricolage Grotesque + Geist + JetBrains Mono via `next/font` | Self-host, avoid Google Fonts CDN cost on prod |

### Removed Dependencies

- `@nextui-org/react` (replaced by `@heroui/react`)
- `@splinetool/react-spline`

### Preserved Dependencies

- `framer-motion`, `i18next`, `react-i18next`, `next-i18next`, `i18next-resources-to-backend`
- `nodemailer`, `react-calendly`, `sonner`
- `clsx`, `tailwind-merge`
- `@vercel/speed-insights`, `axios`

### New Dependencies

- `@heroui/react` (replaces `@nextui-org/react`)
- Selective react-bits components (added as needed via shadcn registry)

---

## 6. Component Mapping (v1 → v2)

| v1 (current) | v2 (new) | Action |
|--------------|----------|--------|
| `app/ui/NavBar.tsx` + `app/ui/SideBar.tsx` | `Nav.tsx` | **Replace + merge** — fold mobile drawer into single floating pill nav |
| `app/ui/LangSwitcher.tsx` | Integrated into `Nav.tsx` | **Move** — keep current logic, restyle to fit pill |
| `app/ui/Loader.tsx` + `app/ui/LangLoader.tsx` | TBD | **Audit** — keep if needed for i18n hydration; restyle |
| `(sections)/landing/landing/Landing.tsx` | `Hero.tsx` | **Replace** — remove Spline, adopt voxel CSS |
| *(none)* | `StackTicker.tsx` (in FeaturedWork) | **New** — marquee with stack |
| `(sections)/landing/proyects/Proyects.tsx` | `FeaturedWork.tsx` + `ProjectsGrid.tsx` | **Split** — featured (3) + grid (6) |
| `(sections)/landing/proyects/ProyectCard.tsx` | Internal to `ProjectsGrid` | **Replace** |
| `(sections)/landing/proyects/Carousel.tsx` | *(removed)* | **Drop** — design uses grid, not carousel |
| *(none)* | `StackSection.tsx` | **New** — 5-column tech matrix |
| *(none)* | `Experience.tsx` | **New** — timeline with expand-on-hover |
| `(sections)/landing/about-me/AboutMe.tsx` + siblings | `About.tsx` | **Replace** — bento grid layout |
| `(sections)/landing/contact/Contact.tsx` | `Contact.tsx` | **Restyle, keep logic** — wire existing Nodemailer + Calendly |
| `(sections)/landing/contact/SendEmail.tsx` | Hook into new Contact form | **Adapt** |
| `(sections)/landing/contact/Adress.tsx` | Internal block of new Contact | **Merge** |
| `(sections)/landing/contact/EmailTemplate.tsx` | Keep as-is | **Preserve** |
| *(none)* | `Footer.tsx` | **New** |

### i18n Data Migration

`.claude_design/export/lib/portfolio-data.js` is a flat ES module with all copy. Must be split into:

- `public/locales/en/common.json` — extend existing keys
- `public/locales/es/common.json` — extend existing keys

New key namespaces to add (proposal):

```
identity.{name, tagline, statusLine, location, timezone, role, available, english}
hero.{eyebrow, ctaPrimary, ctaSecondary, ctaCv}
sections.{featured, projects, stack, experience, about, contact}.{title, eyebrow, description}
featured.[].{title, role, stack, description, link}
projects.[].{title, year, stack, description}
stack.{frontend, backend, db, devops, tools}.[]
experience.[].{role, company, period, bullets[]}
about.{bio, bento[]}
contact.{form: {name, email, message, submit}, success, error}
footer.{copy, builtWith, version}
```

Existing keys (`spline.rotate*`) become **obsolete** and are removed.

---

## 7. Phases (Roadmap)

### MILESTONE: v2.0.0 — Visual Redesign

#### Phase 1 — Foundation Migration

**Goal:** Set up design tokens, fonts, and tooling without touching components.

- [ ] Replace `my-app/tailwind.config.js` with extended config from design
- [ ] Replace `my-app/src/app/globals.css` with design's globals.css (preserve any project-specific imports)
- [ ] Configure `next/font` for Bricolage Grotesque, Geist, JetBrains Mono (drop Google CDN)
- [ ] Run `npx shadcn@latest mcp init --client claude` (shadcn MCP for react-bits)
- [ ] Run `npx -y @heroui/react-mcp` (HeroUI MCP)
- [ ] Verify dev server boots, current pages still render (broken visually is OK)

**Acceptance:** Dev server runs, fonts load, no console errors related to Tailwind compilation.

#### Phase 2 — Stack Migration: NextUI → HeroUI + Spline Removal

**Goal:** Mechanical migration of UI lib + removal of Spline.

- [ ] `npm uninstall @nextui-org/react @splinetool/react-spline`
- [ ] `npm install @heroui/react`
- [ ] Find-replace imports: `@nextui-org/react` → `@heroui/react` (9 files)
- [ ] Update `providers.tsx`: `NextUIProvider` → `HeroUIProvider`
- [ ] Verify HeroUI API parity for components in use (Button, Input, Tooltip, etc.) — patch any breaking change
- [ ] Remove all Spline references from `landing/Landing.tsx`
- [ ] Remove i18n keys `spline.rotate`, `spline.rotate-mobile` from `public/locales/{en,es}/common.json`
- [ ] Smoke test all pages

**Acceptance:** No `@nextui-org` or `@splinetool` references remain. App boots and is interactive.

#### Phase 3 — i18n Refactor: Data → Locales

**Goal:** Translate `portfolio-data.js` into i18n keys for both languages.

- [ ] Define namespace structure (see §6)
- [ ] Translate all design copy into `es/common.json`
- [ ] Mirror in `en/common.json`
- [ ] Write a `usePortfolioData()` hook that returns a typed shape consumable by new components, sourced from `useTranslation()`
- [ ] Validate type safety with TS interfaces

**Acceptance:** `usePortfolioData()` returns identical shape to `PORTFOLIO_DATA` object, both languages tested.

#### Phase 4 — Component Migration (JSX → TSX)

**Goal:** Convert all 9 design components to TypeScript with typed props.

- [ ] Create `my-app/src/app/components/redesign/` (or migrate into existing `(sections)/landing/`) — **decide directory layout in plan-phase**
- [ ] For each of: `Nav, Hero, FeaturedWork, ProjectsGrid, StackSection, Experience, About, Contact, Footer`:
  - [ ] Convert `.jsx` → `.tsx`
  - [ ] Type all props from `usePortfolioData()` shape
  - [ ] Replace inline copy with i18n keys
  - [ ] Preserve `"use client"` directive where needed

**Acceptance:** All components compile under `tsc --noEmit`. No `any` types.

#### Phase 5 — Hero + Nav (high-visibility shell)

**Goal:** Ship the most visible pieces first — they set the tone.

- [ ] Wire `Hero.tsx`: voxel art, mouse tilt, auto-animation, status badges, time/timezone display
- [ ] Wire `Nav.tsx`: floating pill, scroll behavior, theme toggle (`data-theme` attr)
- [ ] Integrate `LangSwitcher` into `Nav` (left side or rightmost item)
- [ ] Hook theme state to `localStorage` for persistence
- [ ] Test dark/light theme toggle

**Acceptance:** Loading the page shows the new Hero with voxel + Nav with all CTAs functional. Theme persists across reloads. Lang switcher works.

#### Phase 6 — Content Sections

**Goal:** Implement remaining section components.

- [ ] `FeaturedWork.tsx` + `StackTicker.tsx` — 3 case-study cards, marquee
- [ ] `ProjectsGrid.tsx` — 6 secondary projects
- [ ] `StackSection.tsx` — tech matrix
- [ ] `Experience.tsx` — timeline, hover-expand
- [ ] `About.tsx` — bento grid
- [ ] Wire all data via `usePortfolioData()`
- [ ] Add `/assets/projects-current.jpg` and `/assets/about-current.jpg` (or update paths)

**Acceptance:** Full landing page renders end-to-end with real content in both languages.

#### Phase 7 — Contact Wire-up (hybrid: new UI + existing logic)

**Goal:** New form UI bound to existing email + calendar pipeline.

- [ ] Implement `Contact.tsx` UI from design (form + calendar preview)
- [ ] Wire form `onSubmit` to existing `SendEmail.tsx` logic / `EmailTemplate.tsx`
- [ ] Embed `react-calendly` widget per design layout
- [ ] Preserve sonner toasts (success/error)
- [ ] Test full email flow end-to-end (dev + staging)

**Acceptance:** Submitting form sends email, success toast fires, errors are caught and toasted. Calendly widget loads.

#### Phase 8 — Animation & Polish Layer

**Goal:** Add motion, refine micro-interactions, evaluate react-bits selectively.

- [ ] Framer Motion: scroll-triggered reveals on section enter (Featured, Projects, Stack, Experience, About)
- [ ] Framer Motion: page transitions / route changes (subtle)
- [ ] Framer Motion: hover states on cards (lift, glow)
- [ ] **Decision point:** identify ≤2 spots where react-bits adds wow value (e.g., Hero name reveal, Stack ticker enhancement). Install only those. **DO NOT** flood the project with effects.
- [ ] Test reduced-motion preference (`prefers-reduced-motion`)

**Acceptance:** Animations feel intentional, not decorative. Reduced-motion respected.

#### Phase 9 — QA, Performance & Deploy

**Goal:** Production readiness.

- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Mobile breakpoint pass (320px, 375px, 414px, 768px, 1024px)
- [ ] A11y basics: keyboard nav, focus rings, alt text, ARIA labels on icon buttons
- [ ] Lighthouse: ≥90 desktop, ≥80 mobile (Performance, Accessibility, SEO)
- [ ] LCP <2.5s, CLS <0.1, INP <200ms
- [ ] Bundle analysis (`@next/bundle-analyzer`) — verify ≥30% reduction vs v1
- [ ] SEO: update meta tags, OG image, sitemap, robots.txt
- [ ] Vercel preview deploy + smoke test
- [ ] Merge `v2.0.0` → `develop` → production

**Acceptance:** All metrics hit, deploy live, no regressions reported in 48h post-merge.

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| HeroUI API drift from NextUI 2.4 | Medium | Medium | Phase 2 includes API parity audit; patch points isolated |
| i18n key migration loses copy | Low | High | Keep v1 locale files in git history; review diff before merge |
| Voxel CSS performance on low-end mobile | Medium | Low | Throttle `requestAnimationFrame`, fallback to static render under `prefers-reduced-motion` |
| Bundle reduction goal not hit (<30%) | Low | Low | Measure baseline before Phase 1; bundle analyzer gates Phase 9 |
| Design inconsistency between sections (atomic drift) | Medium | Medium | Phase 4 enforces using only design's atoms (`.btn`, `.chip`, etc.) — no custom one-off styles |
| react-bits over-adoption causing duplicate design system | Low | High | Phase 8 hard-cap: ≤2 components from react-bits, with explicit rationale per use |

---

## 9. References

- **Design source:** `.claude_design/export/`
- **Screenshots:** `.claude_design/screenshots_designed/` (10 JPEGs, mobile + desktop crops)
- **Existing app:** `my-app/`
- **HeroUI docs:** https://heroui.com (verify component API in Phase 2)
- **react-bits:** https://reactbits.dev (consume via shadcn MCP, registry-based)
- **shadcn MCP:** `npx shadcn@latest mcp init --client claude`
- **HeroUI MCP:** `npx -y @heroui/react-mcp`

---

## 10. Open Questions (to resolve in `/gsd-discuss-phase` per fase)

These are intentionally deferred — they should be answered during discuss-phase, not now:

1. Phase 4: directory layout — keep `(sections)/landing/*` or flat `components/redesign/*`?
2. Phase 5: theme persistence — `localStorage` only, or sync with system `prefers-color-scheme`?
3. Phase 7: should we add a honeypot or rate-limit to the contact form, or trust current setup?
4. Phase 8: which 2 spots get react-bits — name reveal in Hero? StackTicker upgrade? Section transitions?
5. Phase 9: do we set up E2E tests (Playwright) as part of this milestone, or defer?

---

**End of spec.** Ready for `/gsd-ingest-docs` ingestion.
