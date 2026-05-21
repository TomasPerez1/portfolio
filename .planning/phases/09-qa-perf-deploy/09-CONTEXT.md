# Phase 9: QA, Performance & Deploy

**Gathered:** 2026-05-11
**Status:** Ready for planning (execution gated on Phase 7 setup completion)
**Source:** Manual draft (gsd-sdk unavailable)

<domain>
## Phase Boundary

Last phase of milestone v2.0.0. Make the site production-ready: migrate remaining `<img>` to `next/image`, audit and slim the bundle to meet PR-03 (≥30% reduction vs Phase 1's 269 kB baseline = target < 188 kB), pass Lighthouse with all categories ≥ 90, smoke-test across major browsers, deploy to Vercel production. Resolve OQ-5 (Playwright E2E scope).

**In scope:**
- Migrate `<img>` tags in About.tsx (and any other component using raw img) to `next/image` with `width`+`height` or `fill`+`sizes`
- Install `@next/bundle-analyzer` (dev dep) and run bundle audit
- Compare First Load JS for `/[lang]` against Phase 1 baseline (269 kB → target < 188 kB)
- If bundle exceeds target: identify largest contributors and code-split where high-impact (e.g. dynamic-import BookingModal, defer googleapis to server only — already server-side so no client impact)
- Run Lighthouse mobile + desktop on `/en` and `/es`
- Fix any Lighthouse issues that block ≥90 scores in Performance / Accessibility / Best Practices / SEO
- Cross-browser smoke: Chrome, Firefox, Safari (if user has access), Edge
- Document service account + email env vars for Vercel dashboard
- Push v2.0.0 to Vercel production (or merge to main per user's branching preference)
- Post-deploy smoke test on production URL
- Resolve OQ-5 → defer Playwright per recommendation (see decisions)
- Phase 7 retroactive verification: once env setup is complete, verify form + calendar work locally THEN on production

**Out of scope:**
- New features
- Playwright E2E suite (deferred — see D-17)
- v2.1 enhancements (per-child stagger, react-bits, theme transition animations)
- Custom domain setup (out of scope — assume Vercel preview/prod URLs sufficient)
- CI/CD pipeline beyond Vercel's default git integration
- Lighthouse CI (Lighthouse-on-PR automation) — possible v2.1
- Service worker / offline support
- A11y audit beyond Lighthouse's automated checks (manual screen-reader pass deferred)

</domain>

<decisions>
## Implementation Decisions

### Locked from PROJECT.md / ROADMAP
- **D-10**: Keep Nodemailer + Calendly + Sonner — Phase 7 ported these; Phase 9 only audits
- **PR-03**: Bundle reduction ≥ 30% vs Phase 1's 269 kB → target < 188 kB First Load JS

### Phase-9 specific (Claude's recommendations — confirm in execution)
- **D-17 (to be locked)**: OQ-5 resolved → **Playwright E2E deferred to post-v2.0.0**. Rationale: testing the calendar booking flow requires either (a) a test Google Cloud service account with a dedicated test calendar OR (b) mocked Google API responses — both add CI ops complexity disproportionate to portfolio scale. Single-developer project; manual smoke tests are sufficient. Document explicitly so v2.1 can revisit.
- **Bundle audit tool**: `@next/bundle-analyzer` (official Next.js plugin). Generates a treemap HTML report. No runtime cost — only runs in `npm run analyze` mode.
- **Image migration priority**: About.tsx avatar `<img src="/assets/about-current.jpg">` is the only direct `<img>` in redesign components. FeaturedWork uses `backgroundImage` style (not migratable to next/image without DOM change). Lower-priority: backgroundImage stays for v2.0.0; revisit if Lighthouse flags LCP issues.
- **Missing asset path fix**: About.tsx points to `/assets/about-current.jpg` which doesn't exist in `public/` (Phase 6 deviation noted). Phase 9 fix: change to an existing asset OR add the asset. Decision: change reference to `/profile/cvprofile.jpg` (existing) — simpler than introducing a new asset.
- **Lighthouse thresholds**: Performance ≥ 90 (target), Accessibility ≥ 95 (raise above baseline since redesign emphasized a11y), Best Practices ≥ 90, SEO ≥ 90.
- **Cross-browser scope**: Chrome (primary dev) + Firefox + Safari (visual parity, voxel CSS 3D) + Edge (compat sanity). Mobile: Chrome DevTools device emulation; real device check ideal but optional.
- **Deploy strategy**: assume user pushes `v2.0.0` branch to GitHub → Vercel auto-deploys preview. After approval, merge `v2.0.0` → `develop` (or `main`) and trigger production deploy. Vercel env vars must be set BEFORE first deploy.
- **Env var migration to Vercel**: all 11 env vars from `env.example` go into Vercel dashboard → Project Settings → Environment Variables. Set per-environment (preview vs production) — same values for both unless user maintains separate dev/prod calendars.
- **Phase 7 retroactive verification**: post-deploy, user runs the 9-step smoke from Phase 7 task 9 against the production URL. If anything fails, hotfix on `v2.0.0` and redeploy.

### Claude's Discretion
- Whether to add `<meta>` SEO tags (description, OG image, twitter card) — YES, in Lighthouse fixes if SEO score is below threshold
- Whether to add a `robots.txt` and `sitemap.xml` — YES if SEO score drops below 90
- Whether to update `metadata` in `layout.tsx` with proper description + OG — YES, current title is "Tomas Perez Portfolio" / desc is "make some noise!" — should be more professional for production

</decisions>

<canonical_refs>
## Canonical References

### Project specs
- `.planning/PROJECT.md` — D-10, OQ-5 (to be resolved as D-17)
- `.planning/REQUIREMENTS.md` — PR-03 (≥30% bundle reduction)
- `.planning/ROADMAP.md` — Phase 9 goal, success criteria

### Baseline (consumed)
- `.planning/phases/01-foundation-migration/baseline-v1.txt` — 269 kB First Load JS for `/[lang]` from Phase 1
- All prior phase build reports — context on what shipped

### Files to modify
1. `my-app/src/app/components/About.tsx` — migrate `<img>` to `next/image`, fix asset path
2. `my-app/src/app/layout.tsx` — improve `metadata` (title, description, OG)
3. `my-app/next.config.mjs` (or `.ts`) — wrap with bundle-analyzer + add image domains if needed
4. `my-app/package.json` — add `@next/bundle-analyzer` dev dep + `analyze` script
5. `.planning/PROJECT.md` — append D-17

### Files to create
1. `.planning/phases/09-qa-perf-deploy/DEPLOY.md` — production deploy guide (env vars, commands, smoke checklist)
2. `.planning/phases/09-qa-perf-deploy/LIGHTHOUSE.md` — Lighthouse results (before/after fixes)
3. `.planning/phases/09-qa-perf-deploy/BUNDLE.md` — bundle analysis output + reduction calc vs 269 kB
4. `.planning/phases/09-qa-perf-deploy/09-BUILD-REPORT.md` — final phase report

### Optional files to create
- `my-app/public/robots.txt` (if Lighthouse SEO flags)
- `my-app/src/app/sitemap.ts` (if Lighthouse SEO flags)

</canonical_refs>

<specifics>
## Specific Risks & Notes

- **Bundle target may not be achievable**: Phase 1 baseline was 269 kB with NextUI + Spline. Phase 2 swap to HeroUI + removed Spline should already drop dramatically. Adding googleapis (server-only, doesn't bundle to client) doesn't increase client bundle. Framer-motion is ~50 kB. Expectation: well under 188 kB. If miss: dynamic-import BookingModal (~5-10 kB savings).
- **`@next/bundle-analyzer` integration**: wrap `next.config.mjs` with `withBundleAnalyzer()`. Run `ANALYZE=true npm run build` to generate report. Treemap HTML opens in browser.
- **Image migration breaking change**: `next/image` needs `width`+`height` (intrinsic) OR `fill` (parent must be positioned). About.tsx avatar is in a `<div className="w-14 h-14 rounded-full bg-card overflow-hidden">` — use `fill` + `sizes="56px"`.
- **About.tsx asset 404**: current `/assets/about-current.jpg` doesn't exist. Will 404 in dev right now (visible as broken image). Fix to `/profile/cvprofile.jpg` solves it.
- **Hydration errors with motion + ssr**: framer-motion has occasional SSR mismatches if `useReducedMotion` returns different values server vs client. Wrapped in `useEffect` should be fine. Monitor Lighthouse Best Practices for console errors.
- **Vercel cold-start latency**: API routes (calendar/slots, calendar/book, send) initialize `googleapis` + `nodemailer` on first request. Cold start ~1-2s. Acceptable for low-traffic portfolio.
- **Safari iOS voxel rendering**: CSS 3D `transformStyle: preserve-3d` historically had bugs in older Safari. Test on real device or via BrowserStack if available. Phase 4 preserved existing CSS verbatim — should be no regression vs the design's original Safari support.
- **Lighthouse "no robots.txt"**: SEO category penalizes missing robots. Easy add.
- **Lighthouse "image elements do not have explicit width and height"**: about-current.jpg fix resolves this.
- **Hard-coded English UI strings in voxel/contact**: "Voxel · click to shuffle", "Send a message", "Replies within 24h" — these still don't switch with locale. Lighthouse won't catch (it's about semantic HTML/perf), but it's a quality gap. Document as deferred to v2.1 — out of Phase 9 scope.
- **OWNER_EMAIL hardcoded fallback**: `api/send/route.ts` has `?? "tomas.perez.developer@gmail.com"`. Remove the fallback once Vercel env is set (forces explicit config; fails loud if missing).
- **Calendar widget Spanish locale**: month/weekday labels are English-only ("MON-SUN", "January-December"). Acceptable for v2.0.0; deferred to v2.1.

</specifics>

<deferred>
## Deferred Ideas (post-v2.0.0)

- Playwright E2E suite (D-17)
- Lighthouse CI automation
- Custom domain on Vercel (if not already configured)
- Service worker / PWA
- Per-child stagger on list sections (variants exist in `_animations.ts`)
- react-bits surgical adoption (≤2 components per D-06)
- Animated theme transitions
- Animated locale change
- Calendar widget Spanish locale strings
- Voxel hint copy ("click to shuffle") localization
- Real device cross-browser test (BrowserStack or similar)
- Manual screen-reader pass
- SEO sitemap automation
- Open Graph image generation
- Per-section schema.org markup

</deferred>

---

*Phase: 09-qa-perf-deploy*
*Context gathered: 2026-05-11 (manual)*
