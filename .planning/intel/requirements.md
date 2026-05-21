# Requirements

> Source: `.planning_docs/REDESIGN-SPEC.md` [SPEC] § 2, § 7
> Precedence: SPEC (1)

---

## Functional Requirements

### FR-01 — Visual Identity
Ship a new visual identity (design system from `.claude_design/export/`) that reflects current seniority and personality.

### FR-02 — i18n Preservation
All new components must support ES and EN via `useTranslation()` + existing `[lang]` routing segment.

### FR-03 — Contact Pipeline
Contact form must send email via Nodemailer, embed Calendly widget, and show success/error toasts via Sonner.

### FR-04 — Theme Toggle
Dark/light theme toggle via `data-theme` attribute. State persisted to `localStorage`.

### FR-05 — Data Hook
`usePortfolioData()` hook that returns typed shape sourced from `useTranslation()`. Replaces `portfolio-data.js` flat import.

### FR-06 — Component Set
Nine components from design must be implemented as TSX: `Nav`, `Hero`, `FeaturedWork`, `ProjectsGrid`, `StackSection`, `Experience`, `About`, `Contact`, `Footer`.

### FR-07 — Lang Switcher Integration
Existing `LangSwitcher` logic preserved and integrated into `Nav`.

---

## Performance Requirements

### PR-01 — Lighthouse
- Desktop: ≥ 90 (Performance, Accessibility, SEO)
- Mobile: ≥ 80

### PR-02 — Core Web Vitals
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms

### PR-03 — Bundle Reduction
≥ 30% reduction vs v1 (baseline measured pre-Phase 1; Spline + NextUI removal is primary driver).

### PR-04 — Bounce Rate
Homepage bounce rate < 50% (measured via Vercel Analytics).

---

## Quality Requirements

### QR-01 — Type Safety
Zero `any` types in new components. All props typed from `usePortfolioData()` shape.

### QR-02 — Cross-Browser
Chrome, Firefox, Safari — all viewports in [320px, 375px, 414px, 768px, 1024px].

### QR-03 — A11y Basics
Keyboard nav, focus rings, alt text, ARIA labels on icon buttons. WCAG AA basics (not full audit).

### QR-04 — Reduced Motion
`prefers-reduced-motion` respected in all Framer Motion animations.

---

## Non-Functional Requirements (out of scope)

- No backend changes
- No new features beyond the design
- No full content rewrite (copy ported, not redrafted)
- No WCAG full audit
- No CMS or blog
- No analytics dashboard
- Playwright E2E tests: deferred (open question Phase 9)
