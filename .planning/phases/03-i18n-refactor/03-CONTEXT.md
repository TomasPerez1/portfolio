# Phase 3: i18n Refactor — Data → Locales

**Gathered:** 2026-05-10
**Status:** Ready for planning
**Source:** Manual draft (gsd-sdk unavailable)

<domain>
## Phase Boundary

Port all portfolio copy from `.claude_design/export/lib/portfolio-data.js` (the design system's reference data) into typed i18n locale files. Build a `usePortfolioData()` hook that returns the full data shape with zero `any` types. Remove obsolete `spline.*` keys left over from Phase 2.

**In scope:**
- Add namespaces to `public/locales/en/common.json` and `public/locales/es/common.json`: `identity`, `hero`, `sections`, `featured`, `projects`, `stack`, `experience`, `about`, `contact`, `footer`
- Translate every new key into Spanish (port from EN content)
- Remove obsolete keys `spline.rotate` and `spline.rotate-mobile`
- Create `my-app/src/app/i18n/portfolio.types.ts` — full TypeScript shape
- Create `my-app/src/app/i18n/usePortfolioData.ts` — hook returning typed data
- Verify hook switches data when locale changes (en ↔ es)

**Out of scope:**
- Converting existing JSX components to TSX (Phase 4)
- Wiring the redesign components (`Hero.jsx`, `Nav.jsx`, etc.) into `my-app/src/` (Phase 4-6)
- Restyling or visual changes
- Changing the `react-i18next` setup itself (`i18n/client.ts`, `i18n/index.ts`)

</domain>

<decisions>
## Implementation Decisions

### Locked from PROJECT.md / ROADMAP
- **FR-02**: All copy lives in typed i18n locale files
- **FR-05**: Single `usePortfolioData()` hook is the access point
- **RC-02**: v1 locale files preserved in git history (we modify, not branch)

### Phase-3 specific (Claude's discretion — confirmed by user 2026-05-10)
- **Source-of-truth**: `.claude_design/export/lib/portfolio-data.js` is reference only — NOT imported anywhere in `my-app/src/` (grep verified). Port content into locale JSON; the JS file stays in `.claude_design/` as design reference.
- **Hook location**: `my-app/src/app/i18n/usePortfolioData.ts` — co-located with existing `client.ts` and `index.ts`.
- **Types location**: `my-app/src/app/i18n/portfolio.types.ts` — separate file, exportable to Phase 4 components.
- **Nested-object access**: Current `useTranslation` in `i18n/client.ts` returns only strings. Hook bypasses this for structured data: calls `useTranslation(lng)` for the i18n instance, then uses `i18n.getResourceBundle(lng, 'common')` to return the fully-typed bundle. Hook still "calls useTranslation()" per the success criterion.
- **Translation gate**: Claude writes ES translations porting from EN. User reviews before final commit. No machine-translation API.
- **JSON merge strategy**: Keep existing keys (`nav`, `CV`, `form`, `about-me`, `proyects`) intact during transition. New namespaces are ADDED. The old `proyects` namespace stays until Phase 4 confirms no component reads it; mark for removal in a Phase 4 cleanup task.

</decisions>

<canonical_refs>
## Canonical References

### Project specs
- `.planning/PROJECT.md` — D-05 (i18n via react-i18next), D-12 (next/font, no CDN fonts)
- `.planning/REQUIREMENTS.md` — FR-02 (typed i18n), FR-05 (single hook)
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, key tasks

### Data sources (consumed, not modified)
- `.claude_design/export/lib/portfolio-data.js` — reference shape for all 10 namespaces

### Current i18n infrastructure (read; do not modify)
- `my-app/src/app/i18n/client.ts` — `useTranslation(lng, ns)` hook
- `my-app/src/app/i18n/index.ts` — `initI18next(lng, ns)` instance factory
- `my-app/src/app/i18n-config.ts` — locale list + default

### Files to modify
1. `my-app/public/locales/en/common.json` — add 10 namespaces, remove `spline.*`
2. `my-app/public/locales/es/common.json` — add 10 namespaces (translated), remove `spline.*`
3. `my-app/src/app/i18n/portfolio.types.ts` — NEW
4. `my-app/src/app/i18n/usePortfolioData.ts` — NEW

</canonical_refs>

<specifics>
## Specific Risks & Notes

- **i18next resource bundle availability**: `getResourceBundle()` returns `undefined` until init completes. Hook must return a `ready` flag or a sensible loading state — mirror the existing `useTranslation` `ready` pattern.
- **Type drift**: If JSON keys diverge from `portfolio.types.ts`, TypeScript won't catch it at runtime. Mitigation: a build-time assertion file (`__assert.ts`) that imports both locale JSONs and assigns them to the `PortfolioData` type. `tsc --noEmit` then fails on any drift.
- **HTML in strings**: The current `about-me` key contains inline HTML (`<strong>`, `<br/>`, `<a>`). Decide per-section: keep HTML in JSON and use `dangerouslySetInnerHTML` (current pattern), OR split into structured paragraphs (cleaner). For Phase 3, KEEP HTML-in-strings to avoid scope creep — Phase 4 components can decide rendering strategy.
- **Spanish translation quality**: Tech terms (Node.js, React, TypeScript, etc.) stay in English. Soft skills, tagline, bio — translate idiomatically (Rioplatense flavor where it fits).
- **`statusLine` and `tagline`**: These appear in Hero.jsx as `data.statusLine`, `data.tagline`. Map to `identity.statusLine` and `identity.tagline` keys.

</specifics>

<deferred>
## Deferred Ideas

- Removing the existing `proyects` namespace once Phase 4 confirms no component depends on it
- Splitting `about-me` HTML string into structured paragraphs (Phase 4 decision)
- Adding a third locale (pt-BR, etc.) — out of v2.0.0 scope
- Build-time codegen of types from JSON via `json-schema-to-typescript` — manual typing is fine for v2.0.0 scale

</deferred>

---

*Phase: 03-i18n-refactor*
*Context gathered: 2026-05-10 (manual)*
