# Requirements: portfolio — tomas.dev

> Source: `.planning_docs/REDESIGN-SPEC.md` §2, §7
> Milestone: v2.0.0 — Visual Redesign
> Last updated: 2026-05-10

---

## Functional Requirements

### FR-01 — Visual Identity

**Name:** Ship new visual identity
**Description:** Implement the design system from `.claude_design/export/` across all nine components. The new identity uses the defined color tokens, typography stack, and atomic CSS classes — no ad-hoc styles that bypass design atoms.
**Acceptance Criteria:**
- All nine components render using CSS custom properties from `globals.css`
- Tailwind config extended with design tokens (colors, fonts, keyframes)
- No inline styles or one-off colors that contradict the token system
- Visual output matches `.claude_design/screenshots_designed/` references
**Priority:** P1
**Source:** SPEC §2, §7

---

### FR-02 — i18n Preservation

**Name:** Full ES/EN support on all new components
**Description:** Every user-facing string in every new or migrated component must pass through `useTranslation()`. No hardcoded copy. Locale JSON files extended with all new keys for both `en/common.json` and `es/common.json`.
**Acceptance Criteria:**
- Switching language (via LangSwitcher) updates all text without page reload
- No hardcoded strings visible in any component source file
- All new i18n key namespaces populated: `identity`, `hero`, `sections.*`, `featured`, `projects`, `stack`, `experience`, `about`, `contact`, `footer`
- Obsolete keys (`spline.rotate`, `spline.rotate-mobile`) removed from locale files
**Priority:** P1
**Source:** SPEC §2, §7

---

### FR-03 — Contact Pipeline

**Name:** Contact form with Nodemailer + Calendly + Sonner
**Description:** The contact section must send email via Nodemailer, embed the Calendly widget, and show success/error feedback via Sonner toasts. No backend logic changes — Phase 7 is UI-only reskin.
**Acceptance Criteria:**
- Submitting the form triggers an email via existing Nodemailer route
- Calendly widget renders and is bookable without errors
- Success toast appears on send success; error toast on failure
- Form validates required fields before submission
**Priority:** P1
**Source:** SPEC §2, §7

---

### FR-04 — Theme Toggle

**Name:** Dark/light theme toggle with persistence
**Description:** A theme toggle switches between dark and light mode by setting `data-theme` on the root element. Theme preference is persisted to `localStorage` and restored on next visit. Replaces the previous NextUI theme system.
**Acceptance Criteria:**
- Clicking the theme toggle switches `data-theme` attribute between `"dark"` and `"light"`
- All CSS custom properties respond correctly to `data-theme` value
- Theme preference survives a full browser refresh (localStorage)
- Toggle is accessible (keyboard + screen reader label)
**Priority:** P1
**Source:** SPEC §2, §5

---

### FR-05 — Data Hook

**Name:** `usePortfolioData()` hook replacing flat import
**Description:** A custom hook `usePortfolioData()` returns the full typed portfolio data shape by calling `useTranslation()` internally. It completely replaces the `portfolio-data.js` flat object import pattern. All components source their content from this hook.
**Acceptance Criteria:**
- `usePortfolioData()` returns a fully-typed object with no `any` types
- All nine components consume data exclusively from this hook
- `portfolio-data.js` is no longer imported anywhere in `my-app/src/`
- Hook covers all data namespaces: identity, featured, projects, stack, experience, about, contact, footer
**Priority:** P1
**Source:** SPEC §2, §7

---

### FR-06 — Component Set (9 TSX Components)

**Name:** Nine typed TSX components
**Description:** All nine design components (`Nav`, `Hero`, `FeaturedWork`, `ProjectsGrid`, `StackSection`, `Experience`, `About`, `Contact`, `Footer`) must be implemented as `.tsx` files with fully typed props derived from `usePortfolioData()`. No `.jsx` files allowed.
**Acceptance Criteria:**
- All nine components exist as `.tsx` files in `my-app/src/`
- Zero TypeScript `any` types in new component source
- Each component compiles without TypeScript errors (`tsc --noEmit` passes)
- Components render correctly in both ES and EN locales
- Components render correctly in both dark and light themes
**Priority:** P1
**Source:** SPEC §2, §7

---

### FR-07 — LangSwitcher Integration

**Name:** Existing LangSwitcher preserved and integrated into Nav
**Description:** The existing `LangSwitcher` component logic (from PR #2) must be preserved and integrated into the new `Nav.tsx`. No regression in language switching behavior. The standalone `LangSwitcher.tsx` file may be absorbed into Nav or kept as a sub-component — the logic must not be rewritten.
**Acceptance Criteria:**
- Language switching works from the Nav bar in both mobile and desktop viewports
- Switching language does not cause a full page reload (client-side routing preserved)
- `LangSwitcher` logic matches the behavior merged in PR #2
- No duplicate LangSwitcher instances on the page
**Priority:** P1
**Source:** SPEC §2, §7

---

## Performance Requirements

### PR-01 — Lighthouse Scores

**Name:** Lighthouse ≥90 desktop / ≥80 mobile
**Description:** After deploy to Vercel production (Phase 9), Lighthouse scores for Performance, Accessibility, and SEO must meet or exceed defined thresholds.
**Acceptance Criteria:**
- Lighthouse Performance ≥ 90 on desktop
- Lighthouse Performance ≥ 80 on mobile
- Accessibility ≥ 90 on both
- SEO ≥ 90 on both
**Priority:** P1
**Source:** SPEC §2

---

### PR-02 — Core Web Vitals

**Name:** LCP<2.5s, CLS<0.1, INP<200ms
**Description:** Core Web Vitals measured on Vercel production must meet Google's "good" thresholds.
**Acceptance Criteria:**
- Largest Contentful Paint (LCP) < 2.5 seconds
- Cumulative Layout Shift (CLS) < 0.1
- Interaction to Next Paint (INP) < 200ms
**Priority:** P1
**Source:** SPEC §2

---

### PR-03 — Bundle Reduction

**Name:** ≥30% bundle reduction vs v1 baseline
**Description:** Total JavaScript bundle size (measured by `next build` output) must be at least 30% smaller than the v1 baseline measured before Phase 1. Spline removal and NextUI→HeroUI migration are the primary drivers.
**Acceptance Criteria:**
- v1 bundle baseline measured and recorded before Phase 1 begins (RC-04)
- `next build` output after Phase 9 shows ≥30% reduction in First Load JS
- No new large dependencies introduced without explicit justification
**Priority:** P1
**Source:** SPEC §2

---

### PR-04 — Bounce Rate

**Name:** Homepage bounce rate < 50%
**Description:** After production deploy, Vercel Analytics must show a homepage bounce rate below 50% over the first measurement period.
**Acceptance Criteria:**
- Vercel Analytics enabled and recording bounce data post-deploy
- Homepage bounce rate < 50% on first available measurement window
**Priority:** P2
**Source:** SPEC §2

---

## Quality Requirements

### QR-01 — Type Safety

**Name:** Zero `any` types in new components
**Description:** All new and migrated TypeScript components must have fully typed props and return types. Using `any` is prohibited. Props must be typed from the `usePortfolioData()` shape.
**Acceptance Criteria:**
- `tsc --noEmit` passes with zero errors
- No `any` types in `my-app/src/` (enforced by tsconfig `strict: true`)
- All component prop interfaces explicitly defined
**Priority:** P1
**Source:** SPEC §5

---

### QR-02 — Cross-Browser Compatibility

**Name:** Chrome, Firefox, Safari — all target viewports
**Description:** All nine components must render and function correctly across Chrome, Firefox, and Safari at the following viewport widths: 320px, 375px, 414px, 768px, 1024px.
**Acceptance Criteria:**
- No layout breaks at any target viewport in Chrome, Firefox, or Safari
- Theme toggle works in all three browsers
- Language switching works in all three browsers
- Contact form submits correctly in all three browsers
- Voxel CSS 3D animation renders or falls back gracefully
**Priority:** P1
**Source:** SPEC §2

---

### QR-03 — Accessibility Basics

**Name:** WCAG AA basics — keyboard nav, ARIA, alt text
**Description:** Keyboard navigation works for all interactive elements. Icon buttons have ARIA labels. Images have alt text. Focus rings are visible. This is not a full WCAG audit — only the basics.
**Acceptance Criteria:**
- All interactive elements (buttons, links, form fields) are reachable via keyboard Tab
- Focus rings are visible in all browsers (not overridden by reset styles)
- Icon-only buttons have descriptive `aria-label` attributes
- All `<img>` elements have non-empty `alt` attributes
- Form inputs have associated `<label>` elements
**Priority:** P2
**Source:** SPEC §2

---

### QR-04 — Reduced Motion

**Name:** `prefers-reduced-motion` respected in all animations
**Description:** All Framer Motion animations and CSS custom animations must respect the `prefers-reduced-motion` media query. When the user has reduced motion enabled, animations must be disabled or replaced with instant transitions.
**Acceptance Criteria:**
- Framer Motion animations use `useReducedMotion()` or equivalent to disable when requested
- Voxel CSS animation falls back to static render under `prefers-reduced-motion`
- Ticker animation (`tickerFlow`) pauses under `prefers-reduced-motion`
- No jarring motion when the preference is active
**Priority:** P2
**Source:** SPEC §2

---

## Out of Scope (Non-Goals)

| Item | Reason |
|------|--------|
| Backend API changes | C-01: hard constraint |
| New features beyond the design | Scope boundary |
| Full content rewrite | Copy ported, not redrafted |
| Full WCAG audit | QR-03 covers basics only |
| CMS or blog | Not in design |
| Analytics dashboard | Not in design |
| Playwright E2E tests | Deferred — OQ-5, Phase 9 decision |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FR-01 | Phase 1, 5, 6 | Pending |
| FR-02 | Phase 3 | Pending |
| FR-03 | Phase 7 | Pending |
| FR-04 | Phase 5 | Pending |
| FR-05 | Phase 3 | Pending |
| FR-06 | Phase 4, 5, 6 | Pending |
| FR-07 | Phase 5 | Pending |
| PR-01 | Phase 9 | Pending |
| PR-02 | Phase 9 | Pending |
| PR-03 | Phase 2, 9 | Pending |
| PR-04 | Phase 9 | Pending |
| QR-01 | Phase 4 | Pending |
| QR-02 | Phase 9 | Pending |
| QR-03 | Phase 5, 6, 7 | Pending |
| QR-04 | Phase 8 | Pending |
