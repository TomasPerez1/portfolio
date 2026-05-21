# Roadmap: portfolio — tomas.dev

## Overview

Nine sequential phases transform the existing Next.js 14 codebase into a redesigned v2.0.0 portfolio. The sequence is strictly linear: each phase unblocks the next. Phases 1-4 are infrastructure (tokens, stack swap, i18n, TypeScript); Phases 5-7 build and wire the visible product; Phases 8-9 add the animation layer and ship to production.

## Milestones

- 🚧 **v2.0.0 — Visual Redesign** — Phases 1-9 (in progress)

---

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

## Progress

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
