# Constraints

> Source: `.planning_docs/REDESIGN-SPEC.md` [SPEC] § 1, § 5, § 8

---

## Hard Constraints

### C-01 — No Backend Work
Zero API or data-layer changes. Contact pipeline (Nodemailer, Calendly) stays as-is.

### C-02 — react-bits Hard-Cap
≤ 2 components from react-bits across the entire project. Each use requires explicit rationale. Decided in Phase 8.

### C-03 — Design Source Fidelity
Design system comes from `.claude_design/export/` — do not create ad-hoc one-off styles that bypass design atoms (`.btn`, `.chip`, `.badge`, etc.).

### C-04 — TSX Only
All new and migrated components must be TypeScript. No `.jsx` files in `my-app/src/`.

### C-05 — i18n Required
Every user-facing string must go through `useTranslation()`. No hardcoded copy in components.

---

## Risk Constraints

### RC-01 — HeroUI API Parity
Phase 2 must include API parity audit before removing NextUI. Patch any breaking changes before proceeding.

### RC-02 — i18n Key Migration
Keep v1 locale files in git history. Review diff before merging translated keys to avoid copy loss.

### RC-03 — Voxel Performance
Throttle `requestAnimationFrame` for voxel CSS animation. Fallback to static render under `prefers-reduced-motion`.

### RC-04 — Bundle Baseline
Measure bundle size baseline before Phase 1 starts. Gates the ≥30% reduction claim in Phase 9.

---

## Open Questions (deferred to discuss-phase per phase)

| # | Question | Phase |
|---|----------|-------|
| OQ-1 | Directory layout: keep `(sections)/landing/*` or flat `components/redesign/*`? | 4 |
| OQ-2 | Theme persistence: `localStorage` only, or sync with `prefers-color-scheme`? | 5 |
| OQ-3 | Contact form: add honeypot/rate-limit or trust current setup? | 7 |
| OQ-4 | react-bits: which 2 spots (Hero name? StackTicker? transitions)? | 8 |
| OQ-5 | Playwright E2E: add in this milestone or defer? | 9 |
