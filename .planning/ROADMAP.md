# Roadmap: portfolio — tomas.dev

## Overview

This roadmap covers two milestones. **v2.0.0 (Visual Redesign, Phases 1-9)** transformed the existing Next.js codebase into the redesigned portfolio and is complete history — preserved below, do not edit. **v2.1.0 (SEO & AI Discoverability, Phases 10-16)** is the active milestone: it fixes the SSR/spinner-gate bug that currently hides all content from crawlers, then layers per-locale metadata, JSON-LD, OG images, and AI-crawler directives on top — closing with a mandatory performance re-verification gate.

## Milestones

- ✅ **v2.0.0 — Visual Redesign** — Phases 1-9 (complete)
- 🚧 **v2.1.0 — SEO & AI Discoverability** — Phases 10-16 (in progress)

---

# Milestone v2.0.0 — Visual Redesign (Phases 1-9)

Nine sequential phases transform the existing Next.js 14 codebase into a redesigned v2.0.0 portfolio. The sequence is strictly linear: each phase unblocks the next. Phases 1-4 are infrastructure (tokens, stack swap, i18n, TypeScript); Phases 5-7 build and wire the visible product; Phases 8-9 add the animation layer and ship to production.

## Phases

- [ ] **Phase 1: Foundation Migration** — Install design tokens, fonts, MCP tooling. No components touched.
- [ ] **Phase 2: Stack Migration — NextUI → HeroUI + Spline Removal** — Mechanical dependency swap. API parity audit included.
- [ ] **Phase 3: i18n Refactor — Data → Locales** — portfolio-data.js split into ES/EN JSON + `usePortfolioData()` hook.
- [ ] **Phase 4: Component Conversion — JSX → TSX** — All 9 design components typed. Directory layout decided.
- [ ] **Phase 5: Hero + Nav** — Highest-visibility shell: voxel hero, floating Nav, theme toggle, LangSwitcher.
- [ ] **Phase 6: Content Sections** — FeaturedWork, ProjectsGrid, StackSection, Experience, About, Footer.
- [ ] **Phase 7: Contact Wire-up** — New Contact UI bound to existing Nodemailer + Calendly + Sonner.
- [ ] **Phase 8: Animation & Polish** — Framer Motion scroll layer + selective react-bits (≤2 components).
- [ ] **Phase 9: QA, Performance & Deploy** — Lighthouse, bundle analysis, cross-browser, Vercel production.

---

## Phase Details

### Phase 1: Foundation Migration
**Goal**: Establish the design token system, typography, and MCP tooling so every subsequent phase builds on a consistent foundation.
**Depends on**: Nothing (first phase)
**Requirements**: FR-01
**Complexity**: S
**Key Tasks**:
- Merge `tailwind.config.js` from `.claude_design/export/` into `my-app/tailwind.config.js` (colors, fonts, keyframes)
- Copy `globals.css` CSS custom properties and atomic classes into `my-app/src/app/globals.css`
- Install `next/font` declarations for Bricolage Grotesque, Geist, JetBrains Mono; remove any Google Fonts CDN references
- Run `npx -y @heroui/react-mcp` to install HeroUI MCP
- Run `npx shadcn@latest mcp init --client claude` to install shadcn MCP
- Measure and record v1 bundle baseline (`next build` output) — gates PR-03
**Success Criteria** (what must be TRUE):
  1. CSS custom properties (`--c-bg`, `--c-spark`, etc.) resolve correctly in the browser dev tools
  2. Font variables (`font-display`, `font-body`, `font-mono`) render the correct typefaces in a test element
  3. Tailwind color utilities (`bg-spark`, `text-fg`) work without errors in any component
  4. Bundle baseline figure is recorded (number available for Phase 9 comparison)
  5. Both MCP servers install without errors
**Plans**: TBD
**Open Questions**: None for this phase.

---

### Phase 2: Stack Migration — NextUI → HeroUI + Spline Removal
**Goal**: Eliminate Spline and NextUI from the dependency tree and replace with HeroUI, unblocking the design system adoption.
**Depends on**: Phase 1
**Requirements**: PR-03
**Complexity**: M
**Key Tasks**:
- Audit all `@nextui-org/react` imports across the codebase — build API parity map (RC-01)
- Install `@heroui/react`; replace `NextUIProvider` with `HeroUIProvider` in `providers.tsx`
- Replace all `@nextui-org/react` component imports with `@heroui/react` equivalents; patch any breaking API changes
- Remove `@nextui-org/react` from `package.json`
- Remove `@splinetool/react-spline` from `package.json`; delete or stub the Spline components (placeholder for Hero.tsx in Phase 5)
- Verify `next build` completes without errors
**Success Criteria** (what must be TRUE):
  1. `package.json` contains no references to `@nextui-org/react` or `@splinetool/react-spline`
  2. `next build` completes without TypeScript or module errors
  3. The running app has no broken imports or white-screen crashes caused by the swap
  4. `next/bundle-analyzer` (or build output) shows measurable First Load JS reduction vs Phase 1 baseline
**Plans**: TBD
**Open Questions**: None (RC-01 resolved within this phase).

---

### Phase 3: i18n Refactor — Data → Locales
**Goal**: All portfolio copy lives in typed i18n locale files and is accessible via a single `usePortfolioData()` hook, replacing the flat `portfolio-data.js` import.
**Depends on**: Phase 2
**Requirements**: FR-02, FR-05
**Complexity**: M
**Key Tasks**:
- Add all new i18n key namespaces to `public/locales/en/common.json` and `public/locales/es/common.json`: `identity`, `hero`, `sections.*`, `featured`, `projects`, `stack`, `experience`, `about`, `contact`, `footer`
- Translate all keys into Spanish for `es/common.json` — port from `portfolio-data.js` content
- Remove obsolete keys `spline.rotate` and `spline.rotate-mobile` from both locale files (keep v1 files in git history per RC-02)
- Build `usePortfolioData()` hook: calls `useTranslation()`, returns fully-typed shape, zero `any` types
- Verify hook returns correct data when locale is switched to ES
**Success Criteria** (what must be TRUE):
  1. `usePortfolioData()` returns complete typed data in both `en` and `es` without errors
  2. All key namespaces are present and populated in both locale files
  3. `portfolio-data.js` is no longer imported anywhere in `my-app/src/`
  4. Switching locale (via LangSwitcher) returns different string values from the hook
**Plans**: TBD
**Open Questions**: None for this phase (OQ-1 is Phase 4).

---

### Phase 4: Component Conversion — JSX → TSX
**Goal**: All nine design components exist as typed `.tsx` files in the decided directory layout, ready to be implemented in Phases 5-7.
**Depends on**: Phase 3
**Requirements**: FR-06, QR-01
**Complexity**: M
**Key Tasks**:
- **Decide directory layout** (OQ-1): keep `(sections)/landing/*` or adopt flat `components/redesign/*` — document decision in PROJECT.md
- Convert all 9 JSX components from `.claude_design/export/components/` to `.tsx` files in the decided directory
- Define prop interfaces for each component (derived from `usePortfolioData()` shape)
- Audit `ui/Loader.tsx` and `ui/LangLoader.tsx` — keep, adapt, or drop
- Verify `tsc --noEmit` passes with zero errors on all 9 converted files
- Confirm no `.jsx` files remain in `my-app/src/`
**Success Criteria** (what must be TRUE):
  1. All 9 components exist as `.tsx` files with explicit prop interfaces
  2. `tsc --noEmit` passes with zero TypeScript errors
  3. No `.jsx` files remain in `my-app/src/`
  4. Directory layout decision is documented in PROJECT.md Key Decisions
**Plans**: TBD
**Open Questions**:
- **OQ-1**: Directory layout — keep `(sections)/landing/*` or flat `components/redesign/*`? Decide at Phase 4 start.
**UI hint**: yes

---

### Phase 5: Hero + Nav
**Goal**: The highest-visibility shell of the portfolio is live — visitors see a compelling above-the-fold experience with working theme toggle and language switching.
**Depends on**: Phase 4
**Requirements**: FR-01, FR-04, FR-06, FR-07, QR-03
**Complexity**: L
**Key Tasks**:
- Implement `Hero.tsx` — voxel CSS 3D replacing Spline, identity copy from `usePortfolioData()`, CTA buttons, scroll indicator; throttle rAF (RC-03), static fallback under `prefers-reduced-motion`
- Implement `Nav.tsx` — floating pill layout, theme toggle wired to `data-theme` + localStorage (D-11), integrate existing `LangSwitcher` logic (FR-07)
- Verify theme toggle cycles `data-theme` and all CSS custom properties respond
- Verify LangSwitcher switches locale without full page reload
- Verify keyboard navigation reaches all Nav elements
**Success Criteria** (what must be TRUE):
  1. Hero section renders with voxel 3D element (no Spline SDK call), identity copy, and two CTA buttons
  2. Nav renders as floating pill, is sticky, and is reachable by keyboard
  3. Theme toggle switches between dark and light; refreshing the page restores the last choice
  4. Language switcher in Nav changes all visible text without a page reload
  5. Under `prefers-reduced-motion`, voxel animation is replaced with a static render
**Plans**: TBD
**Open Questions**:
- **OQ-2**: Theme persistence — `localStorage` only, or sync with `prefers-color-scheme` as default? Decide at Phase 5 start.
**UI hint**: yes

---

### Phase 6: Content Sections
**Goal**: All content sections below the fold are implemented and display real data — the portfolio is fully readable end-to-end in both languages and themes.
**Depends on**: Phase 5
**Requirements**: FR-01, FR-06, QR-03
**Complexity**: L
**Key Tasks**:
- Implement `FeaturedWork.tsx` — 3 featured case studies from `usePortfolioData()`, metrics display, `StackTicker` marquee animation
- Implement `ProjectsGrid.tsx` — 6 additional projects in grid layout
- Implement `StackSection.tsx` — skill categories with grouped tech tags
- Implement `Experience.tsx` — timeline or list of work history from `usePortfolioData()`
- Implement `About.tsx` — bento grid layout with bio and quick facts
- Implement `Footer.tsx` — copy, builtWith, version fields from hook
- Verify all sections render correctly in ES and EN
- Verify all sections render correctly in dark and light themes
**Success Criteria** (what must be TRUE):
  1. Scrolling through the page shows all 6 content sections populated with real data
  2. All section text updates correctly when language is switched
  3. All sections are visible in both dark and light themes without layout breaks
  4. FeaturedWork ticker animation runs (and pauses under reduced motion)
  5. All interactive elements in sections are keyboard-reachable
**Plans**: TBD
**Open Questions**: None for this phase.
**UI hint**: yes

---

### Phase 7: Contact Wire-up
**Goal**: The contact section is fully functional — visitors can send an email, book a meeting, and receive feedback — all using the existing backend without changes.
**Depends on**: Phase 6
**Requirements**: FR-03, QR-03
**Complexity**: M
**Key Tasks**:
- Implement `Contact.tsx` — new design UI with form fields (name, email, message) wired to existing Nodemailer API route
- Embed Calendly widget via `react-calendly`
- Wire Sonner toasts: success toast on email send, error toast on failure
- Implement client-side form validation (required fields, email format)
- All form labels and strings from `usePortfolioData()` (i18n)
- Verify form submits end-to-end in development
**Success Criteria** (what must be TRUE):
  1. Submitting the contact form with valid data triggers an email delivery (confirmed in dev)
  2. Submitting with missing required fields shows inline validation — form does not submit
  3. A success Sonner toast appears on successful send
  4. An error Sonner toast appears when the request fails
  5. Calendly widget renders and is interactive
**Plans**: TBD
**Open Questions**:
- **OQ-3**: Contact form security — add honeypot field and/or rate-limit, or trust current setup? Decide at Phase 7 start.

---

### Phase 8: Animation & Polish
**Goal**: The Framer Motion scroll animation layer is applied across all sections and up to 2 react-bits components add targeted visual moments — the portfolio feels alive without being noisy.
**Depends on**: Phase 7
**Requirements**: QR-04
**Complexity**: M
**Key Tasks**:
- Add Framer Motion `whileInView` / `initial` / `animate` entrance animations to section headings and cards
- Decide and implement ≤2 react-bits components (OQ-4) — candidates: animated text on Hero name, gradient reveal on section eyebrows, StackTicker enhancement
- Wrap all Framer Motion animations with `useReducedMotion()` — skip animations when preference active (QR-04)
- Ensure all CSS keyframe animations (`tickerFlow`, `spinSlow`, `scrollLine`) respect `prefers-reduced-motion` via `@media`
- Review all transitions, hovers, and micro-interactions for consistency with design tokens
- Final visual QA pass against `.claude_design/screenshots_designed/` references
**Success Criteria** (what must be TRUE):
  1. Section content entrance animations trigger on scroll into view
  2. The selected react-bits components render without layout shift (CLS stays < 0.1)
  3. With `prefers-reduced-motion` enabled in OS, all Framer Motion animations are skipped and no jarring motion occurs
  4. The running app visually matches the design reference screenshots at 1024px and 375px
**Plans**: TBD
**Open Questions**:
- **OQ-4**: react-bits placement — which 2 spots? Candidates: Hero name animated text, StackTicker enhancement, section transition reveals. Decide at Phase 8 start.
**UI hint**: yes

---

### Phase 9: QA, Performance & Deploy
**Goal**: The portfolio meets all Lighthouse, bundle, and cross-browser targets and is live on Vercel production.
**Depends on**: Phase 8
**Requirements**: PR-01, PR-02, PR-03, PR-04, QR-02
**Complexity**: M
**Key Tasks**:
- Run Lighthouse CI on Vercel preview — target ≥90 desktop / ≥80 mobile (PR-01); iterate on failures
- Compare final bundle output vs Phase 1 baseline — verify ≥30% reduction (PR-03)
- Cross-browser smoke test: Chrome, Firefox, Safari at 320px, 375px, 414px, 768px, 1024px (QR-02)
- Verify Core Web Vitals: LCP<2.5s, CLS<0.1, INP<200ms (PR-02)
- Decide Playwright E2E scope (OQ-5) — add minimal smoke tests or defer
- Confirm Vercel Analytics is recording; check bounce rate after soft-launch period (PR-04)
- Merge `v2.0.0` → `develop` → production via PR
**Success Criteria** (what must be TRUE):
  1. Lighthouse Performance ≥ 90 on desktop, ≥ 80 on mobile (confirmed in Vercel CI)
  2. Final First Load JS is ≥30% smaller than the Phase 1 baseline measurement
  3. No layout breaks or console errors on Chrome, Firefox, Safari at all target viewports
  4. Core Web Vitals report shows LCP<2.5s, CLS<0.1, INP<200ms on production URL
  5. Production URL is live and the `v2.0.0` → `develop` → main merge is complete
**Plans**: TBD
**Open Questions**:
- **OQ-5**: Playwright E2E — add minimal smoke tests (Nav, Contact form, language switch) in this phase, or defer entirely to a future milestone? Decide at Phase 9 start.

---

## Progress — v2.0.0

**Execution Order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 (strictly linear)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation Migration | 0/? | Not started | - |
| 2. Stack Migration — NextUI → HeroUI | 0/? | Not started | - |
| 3. i18n Refactor — Data → Locales | 0/? | Not started | - |
| 4. Component Conversion — JSX → TSX | 0/? | Not started | - |
| 5. Hero + Nav | 0/? | Not started | - |
| 6. Content Sections | 0/? | Not started | - |
| 7. Contact Wire-up | 0/? | Not started | - |
| 8. Animation & Polish | 0/? | Not started | - |
| 9. QA, Performance & Deploy | 0/? | Not started | - |

---

# Milestone v2.1.0 — SEO & AI Discoverability (Phases 10-16)

## Overview

Seven sequential phases fix a portfolio that currently ships **zero crawlable content** (the i18next spinner gate hides the entire tree from any non-JS request) and then layer the full native Next.js Metadata/SEO toolkit on top: per-locale `generateMetadata`, JSON-LD `Person` + featured-project structured data, static OG images, AI-crawler-aware `robots.ts`, and `llms.txt`. Phase 10 (SSR fix) is foundational — it unblocks every later phase and is framed as **perf-positive** (smaller client bundle, faster LCP), not a tradeoff. Phase 12 (keyword/copy strategy) is a **hard gate**: every AI-trend term claimed in metadata or JSON-LD must already be visible in `common.json` before Phase 13 writes it into `<title>`, `<meta description>`, or `knowsAbout`. Phase 16 (performance verification) is a **mandatory exit gate** — the milestone is not done until Lighthouse/CWV targets are re-confirmed on both locales.

Zero new npm dependencies are required (everything is a native Next.js 16 file convention or export); the only optional addition is `schema-dts` as a types-only devDependency.

## Phases

- [x] **Phase 10: SSR Content Fix** — Remove i18next + spinner gate; create server-safe `getPortfolioData(lang)`. Foundational, perf-positive. (completed 2026-06-14)
- [ ] **Phase 11: `<html lang>` Fix** — Middleware sets `x-locale` header; root layout reads it for `<html lang>`. Small, isolated.
- [ ] **Phase 12: Keyword Strategy & Copy** — Apply the keyword podium to `common.json` (EN + ES). Hard gate before metadata/JSON-LD.
- [ ] **Phase 13: Metadata, Canonical/Hreflang & JSON-LD** — `generateMetadata` + `Person` + `CreativeWork` for the 3 featured projects.
- [ ] **Phase 14: OG Images** — Per-locale `opengraph-image.tsx`, static at build time.
- [ ] **Phase 15: Crawler Directives** — `robots.ts` AI allowlist, sitemap verification, `llms.txt`.
- [ ] **Phase 16: Performance Verification** — Final exit gate: Lighthouse + bundle analysis on both locales.

---

## Phase Details

### Phase 10: SSR Content Fix
**Goal**: A crawler or bot with no JS execution receives the fully-rendered portfolio content in the initial HTML on both `/en` and `/es` — never a spinner. This is the single highest-leverage fix: every later phase (metadata, JSON-LD, OG images) describes content that, from a crawler's perspective, doesn't exist until this lands. The fix is perf-positive (smaller client bundle, faster LCP), not a tradeoff.
**Depends on**: Nothing (first phase of this milestone; builds on completed v2.0.0)
**Requirements**: SSR-01, SSR-02, SSR-03
**Key Tasks**:
- Remove the `useTranslation().ready` async gate and `LangLoader` spinner from `app/[lang]/ClientPage.tsx`, `Hero.tsx`, `Footer.tsx`
- Add `cv: string` to the `Identity`/`PortfolioData` type (confirm `CV` key position in `common.json` first)
- Create NEW `app/i18n/getPortfolioData.ts` — plain sync, server-safe accessor (no `"use client"`), single source of truth for content, consumed later by metadata/JSON-LD/OG image (Phases 13-14)
- Check `app/i18n/__assert.ts` for imports from `client.ts`/`index.ts` before deleting; delete `app/i18n/client.ts`, `app/i18n/index.ts`, `app/ui/LangLoader.tsx`
- Remove `i18next`, `react-i18next`, `i18next-resources-to-backend` from `package.json`
- Verify with `next build && next start` — check browser console for hydration errors on both `/en` and `/es` (spinner-gate removal surfaces latent mismatches for the first time)
**Success Criteria** (what must be TRUE):
  1. View-source (or `curl`) on `/en` and `/es` shows the full rendered portfolio content in the initial HTML — no spinner-only response
  2. `getPortfolioData(lang)` is callable from server-only code (no `"use client"` boundary) and returns the same shape as the client hook
  3. `next build && next start` completes cleanly; browser console shows zero hydration errors/warnings on both `/en` and `/es`
  4. `package.json` no longer lists `i18next`, `react-i18next`, or `i18next-resources-to-backend`; all content (including CV/about copy) renders identically to before in both locales
**Plans**: 2 plans
- [x] 10-01-PLAN.md — Data-layer foundation + i18next consumer migration (cv type/JSON rename, getPortfolioData.ts, Hero/Footer/ClientPage off useTranslation + spinner gate)
- [x] 10-02-PLAN.md — Grep gate, delete dead i18n modules, npm uninstall i18next, SSR/curl + hydration validation (grep gate passed, 4 modules deleted, 3 packages uninstalled; human-verified production build: full crawlable content + zero hydration errors on /en and /es)
**Open Questions**: None — architecture and file sequence fully specified by research; execution is mechanical.

---

### Phase 11: `<html lang>` Fix
**Goal**: The `<html lang>` attribute correctly reflects the route locale on every page, derived from the request — not from a cookie that is never set. This is small and isolated (different files than Phase 10) but must land before Phase 13, since hreflang correctness depends on a correct `<html lang>`.
**Depends on**: Phase 10 (sequenced after for clarity; touches disjoint files but both must be correct before Phase 13)
**Requirements**: LOCALE-01
**Key Tasks**:
- `middleware.ts` — set a new `x-locale` request header from the already-computed `locale` (path-rewrite logic stays unchanged)
- `app/layout.tsx` — read `(await headers()).get('x-locale')` for `<html lang>`; remove the `NEXT_LOCALE` cookie read entirely
- Verify both `/en` and `/es` (and the `/` redirect target) emit the correct `lang` attribute
**Success Criteria** (what must be TRUE):
  1. View-source on `/en` shows `<html lang="en">`
  2. View-source on `/es` shows `<html lang="es">`
  3. No code path reads `NEXT_LOCALE` cookie for `<html lang>` anymore (verified by grep/search)
  4. `next build && next start` still completes cleanly — no new hydration mismatch introduced by the header read
**Plans**: TBD
**Open Questions**: None — middleware-header pattern documented and small (~3-line middleware change + 1-line layout change).

---

### Phase 12: Keyword Strategy & Copy
**Goal**: The visible copy in `common.json` (EN + ES) leads with the AI-protagonist positioning (Agentic Workflows, AI-Driven Development, Harness Engineering) — grounded entirely in real, existing profile content. This is a content/copy phase, not a code phase, and it is a **hard gate**: Phase 13 may not write any term into `<title>`, `<meta description>`, or JSON-LD `knowsAbout` that is not already visible here. No fabricated or stretched claims (honesty gate).
**Depends on**: Nothing technical (independent of Phases 10-11), but must complete BEFORE Phase 13
**Requirements**: KW-01, KW-02, KW-03
**Key Tasks**:
- Apply the validated keyword podium to `common.json` (EN + ES): 1st "Agentic Workflows"/"Agentic Engineering", 2nd "AI-Driven Development", 3rd "Harness Engineering" — woven into Stack/About section copy and `tagHighlight` subhead (e.g. "...working AI-augmented, agentic-first, every day")
- Add "Context Engineering" as a 6th item to `Stack > AI Tooling` in `common.json` (EN + ES) — per locked owner decision
- Confirm English level stays "B2 — Upper Intermediate" everywhere (no C1 claim anywhere in copy) — per locked owner decision
- Draft final `<title>` tag and `<meta description>` text for both locales (Option B framing: "Tomas Perez — Full-Stack Developer | Agentic AI-Driven Development"), ready for Phase 13 to consume
- Draft the `knowsAbout` term list (AI-trend terms first, then core stack) for Phase 13's JSON-LD — every term traceable to a `common.json` key
**Success Criteria** (what must be TRUE):
  1. `common.json` (EN + ES) contains visible copy referencing "Agentic Workflows"/"Agentic Engineering" and "AI-Driven Development" — both already marked "Active"/"Daily" in the existing Stack data
  2. `Stack > AI Tooling` lists 6 items including "Context Engineering" in both locales
  3. No occurrence of "C1" or a C1 English claim exists anywhere in `common.json` (EN or ES)
  4. A finalized title-tag string, meta-description string (both locales), and ordered `knowsAbout` array are written down and every term in them can be pointed to a specific line in `common.json`
**Plans**: TBD
**Open Questions**: None — owner decisions (Context Engineering, B2 vs C1, sameAs scope) are locked in PROJECT.md/REQUIREMENTS.md.

---

### Phase 13: Metadata, Canonical/Hreflang & JSON-LD
**Goal**: Every locale page emits correct, localized `<title>`/`<meta description>`/OG/Twitter tags, symmetric canonical + hreflang (en/es/x-default), and server-rendered JSON-LD (`Person` + the 3 featured projects) — all derived from `getPortfolioData(lang)` and the Phase 12 copy. This phase converges the data layer (Phase 10), the locale signal (Phase 11), and the finalized copy (Phase 12).
**Depends on**: Phase 10 (data layer), Phase 11 (`<html lang>` correctness), Phase 12 (finalized copy — hard gate)
**Requirements**: META-01, META-02, META-03, SCHEMA-01, SCHEMA-02, SCHEMA-03
**Key Tasks**:
- Add `metadataBase` (production origin, e.g. `new URL("https://tomasperezdev.space")`) to root layout metadata
- `app/[lang]/layout.tsx` — implement `generateMetadata()`: title/description (from Phase 12), OG tags, Twitter card, via `getPortfolioData(lang)`
- Build a centralized `getAlternates(lang)` helper for symmetric `alternates.canonical` + `alternates.languages` (en/es/x-default) — `/es` self-canonicalizes to `/es`, `/en` to `/en`
- Add JSON-LD `Person` `<script type="application/ld+json">` (server component, `dangerouslySetInnerHTML`, escaped) in `[lang]/layout.tsx` — `jobTitle`, `knowsAbout` (Phase 12's ordered list), `sameAs` (LinkedIn + own site only — no GitHub, per locked decision)
- Add JSON-LD `CreativeWork`/`WorkExample` blocks for the 3 featured projects (Zurich/Santander, DJ Presskit, iPhone BRC)
- Validate all JSON-LD with Google's Rich Results Test AND the schema.org validator
**Success Criteria** (what must be TRUE):
  1. View-source on `/en` and `/es` shows distinct, correct `<title>` and `<meta name="description">` matching Phase 12's copy
  2. `/es`'s canonical self-references `/es` and `/en`'s self-references `/en`; both emit `hreflang` alternates for `en`, `es`, and `x-default`; `metadataBase` resolves to the production origin (no `localhost` leakage)
  3. View-source on both locales shows a `Person` JSON-LD block with `jobTitle`, `knowsAbout` (AI-trend terms first), and `sameAs` containing exactly LinkedIn + own site (no GitHub)
  4. View-source shows `CreativeWork`/`WorkExample` JSON-LD for all 3 featured projects
  5. Google Rich Results Test and the schema.org validator report no errors for either locale; no claim in any JSON-LD block is absent from visible `common.json` content
**Plans**: TBD
**Open Questions**: Hreflang/canonical symmetry and JSON-LD validation are subtle (Pitfalls 5/6) — plan explicit verification steps against Rich Results Test + schema.org validator during execution.

---

### Phase 14: OG Images
**Goal**: Sharing the portfolio link (LinkedIn/Slack/WhatsApp) shows a professional, per-locale 1200x630 preview image — generated at build time with zero per-request cost. Sequenced after Phase 12/13 so the image text matches the finalized title/description.
**Depends on**: Phase 10 (`getPortfolioData`), Phase 12 (finalized copy for image text), Phase 13 (metadata references the image)
**Requirements**: OG-01
**Key Tasks**:
- Create `app/[lang]/opengraph-image.tsx` per locale using `next/og`'s `ImageResponse` (1200x630)
- Load 1-2 TTF font weights via `fs.readFile` into `assets/og/` (WOFF2/`next/font` CSS vars do not work inside Satori)
- Build a minimal template: identity name, role/title text (from Phase 12), brand colors/tokens from the design system
- Confirm `next build` output marks the OG image route as static/SSG for both locales (not dynamic)
- Verify `generateMetadata` (Phase 13) references the generated OG image correctly
**Success Criteria** (what must be TRUE):
  1. Requesting the OG image URL for `/en` and `/es` returns a 1200x630 image reflecting that locale's title/role text
  2. `next build` output shows the OG image routes as static/SSG, not dynamic, for both locales
  3. Pasting the portfolio URL into a link-preview tool (or LinkedIn Post Inspector / Twitter Card Validator) shows the generated image and correct title/description
**Plans**: TBD
**Open Questions**: Font-loading mechanics for `ImageResponse` (TTF extraction via `readFile`, static-generation verification) are new to this codebase — confirm build output marks routes static before relying on them.

---

### Phase 15: Crawler Directives
**Goal**: AI crawlers and search engines receive explicit, correct directives — `robots.ts` allowlists major AI bots and references the sitemap, the sitemap is verified consistent with Phase 13's canonical URLs, and `llms.txt` publishes a machine-readable summary reflecting the finalized positioning from Phase 12.
**Depends on**: Phase 12 (positioning for `llms.txt` content), Phase 13 (canonical URLs for sitemap consistency)
**Requirements**: CRAWL-01, CRAWL-02, CRAWL-03
**Key Tasks**:
- Create `app/robots.ts` (`MetadataRoute.Robots`) with explicit `Allow` rules for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended; reference the sitemap
- Delete `public/robots.txt` (static file and route convention cannot coexist for the same path)
- Verify `sitemap.ts` — `lastModified`, URL/trailing-slash consistency, and hreflang alternates match Phase 13's canonical URLs
- Create `public/llms.txt` — markdown summary using Phase 12's finalized positioning (AI-trend terms, role, stack)
**Success Criteria** (what must be TRUE):
  1. `/robots.txt` (served by `app/robots.ts`) explicitly allows all 9 listed AI crawler user-agents and references `/sitemap.xml`; `public/robots.txt` no longer exists
  2. `/sitemap.xml` lists `/en` and `/es` with correct `hreflang` alternates and `lastModified`, consistent with Phase 13's canonical URLs
  3. `/llms.txt` is publicly accessible and its content reflects the AI-protagonist positioning finalized in Phase 12 (no stale/contradictory claims)
**Plans**: TBD
**Open Questions**: None — `MetadataRoute.Robots`/`Sitemap` shapes confirmed against Context7 docs, no API ambiguity.

---

### Phase 16: Performance Verification
**Goal**: The cumulative additions from Phases 10-15 (JSON-LD payload, extra hreflang link tags, OG image routes, robots/sitemap changes) have not regressed the v2.0.0 performance baseline — on both locales. This is the milestone's mandatory exit gate, not optional cleanup; performance is non-negotiable.
**Depends on**: Phase 10 through Phase 15 (all content/code additions must be in place)
**Requirements**: PERF-01, PERF-02, PERF-03
**Key Tasks**:
- Review `next build` output — confirm `/en`, `/es`, and both OG image routes are static/SSG, not dynamic (watch for accidental `cookies()`/`headers()` calls in `generateMetadata` forcing dynamic rendering)
- Run Lighthouse on both `/en` and `/es` — compare against PROJECT.md targets (LCP<2.5s, CLS<0.1, INP<200ms, Lighthouse ≥90 desktop / ≥80 mobile)
- Run bundle analyzer — confirm `getPortfolioData` split (Phase 10) means each route ships only its own locale's JSON, not both
- If any regression is found, fix and re-verify before closing the milestone
**Success Criteria** (what must be TRUE):
  1. `next build` output shows `/en`, `/es`, and both OG image routes as static/SSG (○ or ●), not dynamic (λ)
  2. Lighthouse Performance ≥ 90 desktop / ≥ 80 mobile on both `/en` and `/es`, with LCP<2.5s, CLS<0.1, INP<200ms — no regression vs the v2.0.0 baseline
  3. Bundle analyzer confirms the client bundle for `/en` does not include `es/common.json` (and vice versa) — the locale-split is real, not theoretical
**Plans**: TBD
**Open Questions**: None — this is a verification/measurement phase against already-established targets.

---

## Progress — v2.1.0

**Execution Order:** 10 → 11 → 12 → 13 → 14 → 15 → 16 (linear; Phase 12 is a hard gate before Phase 13)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 10. SSR Content Fix | 2/2 | Complete   | 2026-06-14 |
| 11. `<html lang>` Fix | 0/? | Not started | - |
| 12. Keyword Strategy & Copy | 0/? | Not started | - |
| 13. Metadata, Canonical/Hreflang & JSON-LD | 0/? | Not started | - |
| 14. OG Images | 0/? | Not started | - |
| 15. Crawler Directives | 0/? | Not started | - |
| 16. Performance Verification | 0/? | Not started | - |
