# Phase 9 Plan: QA, Performance & Deploy

**Phase:** 9 of 9 (FINAL of milestone v2.0.0)
**Complexity:** M
**Requirements:** PR-03 (≥30% bundle reduction), QR-01, OQ-5 (resolves as D-17)
**Depends on:** Phase 8 ✅ (Phase 7 user setup still pending — gates Task 9 production smoke test)
**Status:** Ready to execute

---

## Goal

Ship v2.0.0 to production. Pass Lighthouse ≥ 90 in all categories. Bundle First Load JS < 188 kB. All buttons functional across all major browsers. Phase 7 calendar + email verified end-to-end on production URL.

---

## Pre-Flight Checks

- [ ] On branch `v2.0.0` with Phase 8 commits merged (HEAD ≥ `3a75330`)
- [ ] `npx tsc --noEmit` passes baseline
- [ ] `npm run build` passes baseline
- [ ] Vercel project already linked (or user creates one in Task 7)
- [ ] User has completed Google Cloud setup (`SETUP.md`) — required for Tasks 9
- [ ] User has `EMAIL_USER`+`EMAIL_PASSWORD` ready — required for Tasks 9

---

## Tasks (sequential)

### Task 1 — Lock D-17 (OQ-5 resolved: defer Playwright)

**Actions:**
1. Append D-17 to PROJECT.md Key Decisions:
   > **D-17** | Playwright E2E suite deferred to post-v2.0.0 (resolves OQ-5). Rationale: testing the calendar flow requires test credentials in CI or mocked Google APIs — disproportionate ops cost for a single-developer portfolio. Manual smoke tests sufficient through v2.0.0.
2. Commit: `docs(phase-9): lock D-17 deferring Playwright to post-v2.0.0`

**Acceptance:**
- PROJECT.md contains D-17

---

### Task 2 — Fix About avatar image: migrate to next/image + correct asset path

**File:** `my-app/src/app/components/About.tsx`

**Actions:**
1. Replace the avatar `<img src="/assets/about-current.jpg" ... />` with `<Image src="/profile/cvprofile.jpg" alt="Tomás Pérez" fill sizes="56px" className="object-cover" style={{ objectPosition: "center 30%" }} />`
2. Add `import Image from "next/image";`
3. Verify the asset exists at `my-app/public/profile/cvprofile.jpg` (confirmed in earlier session)
4. `npx tsc --noEmit` passes

**Commit:** `fix(phase-9): migrate About avatar to next/image and use existing profile asset`

**Acceptance:**
- About renders the avatar with no 404
- DevTools Network shows the image loading successfully
- No `next/image` warning in console for this image

---

### Task 3 — Improve metadata for production SEO

**File:** `my-app/src/app/layout.tsx`

**Actions:**
1. Replace placeholder `metadata`:
   ```ts
   export const metadata: Metadata = {
     title: "Tomás Pérez — Full-stack Developer",
     description: "3+ years building enterprise platforms with Node.js, React, Next.js and TypeScript. Backend-oriented full-stack developer based in Buenos Aires, Argentina.",
     keywords: ["full-stack developer", "node.js", "react", "nextjs", "typescript", "nestjs", "backend", "argentina"],
     authors: [{ name: "Tomás Pérez" }],
     openGraph: {
       title: "Tomás Pérez — Full-stack Developer",
       description: "Portfolio · Full-stack engineer · Buenos Aires, Argentina",
       type: "website",
       locale: "en_US",
       alternateLocale: ["es_AR"],
     },
   };
   ```
2. `npx tsc --noEmit` passes

**Commit:** `feat(phase-9): production-grade metadata with OpenGraph and proper description`

**Acceptance:**
- Metadata in browser tab + view-source shows new values
- Lighthouse SEO won't penalize missing description

---

### Task 4 — Install bundle analyzer and audit

**Actions:**
1. `cd my-app && npm install --save-dev @next/bundle-analyzer`
2. Edit `next.config.mjs` (or whatever the current config file is) to wrap config:
   ```js
   import bundleAnalyzer from '@next/bundle-analyzer';
   const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
   export default withBundleAnalyzer({/* existing config */});
   ```
3. Add `analyze` script to `package.json`: `"analyze": "ANALYZE=true next build"`. On Windows use `cross-env` or PowerShell-native `$env:ANALYZE='true'; next build`.
4. Run analyzer: `npm run analyze` (or PowerShell equivalent). Inspect the generated `.next/analyze/client.html` treemap.
5. Capture First Load JS for `/[lang]` from `npm run build` output.
6. Write `.planning/phases/09-qa-perf-deploy/BUNDLE.md` with:
   - Phase 1 baseline (269 kB)
   - Current First Load JS
   - Reduction %
   - Top 5 contributors (from treemap)
   - PASS/FAIL vs PR-03 (≥30% reduction → target < 188 kB)
7. If FAIL: identify high-impact splits (likely candidates: dynamic-import BookingModal — only loads when user clicks a calendar slot)

**Commit:** `feat(phase-9): add bundle analyzer and document bundle audit`

**Acceptance:**
- BUNDLE.md committed with measurements
- PR-03 status documented (pass or remediation plan)
- If under target → done. If not → Task 4.5 applies remediation.

---

### Task 4.5 — (Conditional) Dynamic-import BookingModal if bundle target missed

**Skip if Task 4 shows pass.**

**Actions:**
1. In `Contact.tsx`, replace static `import BookingModal from "../ui/BookingModal"` with:
   ```ts
   import dynamic from "next/dynamic";
   const BookingModal = dynamic(() => import("../ui/BookingModal"), { ssr: false });
   ```
2. Rebuild and remeasure
3. Update BUNDLE.md

**Commit (if executed):** `perf(phase-9): dynamic-import BookingModal to slim First Load JS`

---

### Task 5 — Lighthouse audit (user-executed in Chrome)

**Actions (user does this):**
1. `npm run dev` (local) OR use the Vercel preview URL once deployed — Lighthouse on the deployed URL is the real-world measurement
2. Open Chrome DevTools → Lighthouse tab
3. Mode: Navigation. Device: Mobile. Categories: All. Generate report on `/en`
4. Repeat for `/es`
5. Capture all 4 scores per locale (Performance, Accessibility, Best Practices, SEO)
6. If any < 90, expand the failing audit → list the issue
7. Run again for Desktop (same flow)
8. Send Claude the 8 scores (2 locales × 4 categories × 2 devices = 16 actually, or just the lowest 4 per locale)

**Acceptance:**
- 4+ scores per locale recorded
- Any < 90 issues documented in `LIGHTHOUSE.md`

---

### Task 5.5 — Fix Lighthouse issues (Claude does — if needed)

**Skip if all scores ≥ 90.**

**Actions:**
1. For each failing audit Claude addresses the fix
2. Common likely fixes:
   - Missing alt text on images
   - Missing `lang` attribute (already set by Phase 5)
   - Missing `<title>` (set in Task 3)
   - Low-contrast text (Phase 6 should have fixed this)
   - Render-blocking resources
   - Unused JavaScript (Task 4/4.5 should address)
   - Missing robots.txt / sitemap → add them
3. Re-run Lighthouse → confirm scores ≥ 90
4. Update LIGHTHOUSE.md with before/after

**Commit pattern:** `perf(phase-9): {specific fix description}`

---

### Task 6 — Cross-browser smoke (user)

**Actions (user):**
1. On local dev or preview URL, smoke test each browser:
   - Chrome: full flow (form, calendar, voxel, theme toggle, lang switch)
   - Firefox: visual parity + voxel rendering (CSS 3D) + form
   - Safari (if available): voxel CSS 3D especially — Safari has historical preserve-3d quirks
   - Edge: same as Chrome (Chromium-based)
2. Note any visual / functional differences
3. Send observations to Claude — if anything breaks in a specific browser, hotfix on `v2.0.0`

**Acceptance:**
- Smoke results captured per browser (PASS or issues listed)

---

### Task 7 — Vercel env vars setup (user)

**Prerequisite:** User has completed Phase 7's Google Cloud SETUP.md.

**Actions:**
1. In Vercel dashboard → Project Settings → Environment Variables
2. Add 11 vars from `env.example` for BOTH Production AND Preview:
   - `EMAIL_USER`, `EMAIL_PASSWORD`
   - `OWNER_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY_B64`, `GOOGLE_CALENDAR_ID`
   - `OWNER_TIMEZONE`, `WORK_HOURS_START`, `WORK_HOURS_END`, `SLOT_DURATION_MIN`, `SLOT_BUFFER_MIN`
3. Save

**Acceptance:**
- 11 env vars visible in Vercel dashboard
- Vercel will rebuild automatically OR user triggers redeploy

---

### Task 8 — Production deploy

**Actions (user):**
1. Push `v2.0.0` branch: `git push origin v2.0.0`
2. Vercel auto-creates preview deployment
3. Verify preview URL works — smoke test (5 min)
4. If OK: merge `v2.0.0` → `main` (or whatever production branch is): `git checkout main && git merge v2.0.0 && git push`
5. Vercel auto-deploys to production
6. Wait for green checkmark in dashboard
7. Note the production URL

**Acceptance:**
- Production deploy succeeds
- Production URL accessible

---

### Task 9 — Production smoke test (user) — RETROACTIVE for Phase 7 too

**Actions:**
1. Open production URL (e.g. `tomasperezdev.vercel.app` or custom domain)
2. Hard refresh `/en`:
   - Nav pill renders
   - Hero voxel renders 21 voxels, click cycles 5 states
   - StackTicker animates
   - All 6 content sections render
   - Footer with working external links
3. Switch `/es` — content translates
4. Theme toggle works + persists
5. Booking flow:
   - Click a calendar slot → modal opens
   - Fill form → Confirm → 200 response → Google Calendar event created → invite email received
6. Contact form:
   - Fill name + email + subject + message → Send → Sonner success → email received
7. Mobile (DevTools or real device): all of the above works
8. Console: no errors (warnings OK)

**Acceptance:**
- All 8 checks pass on production URL
- Any failures → hotfix on v2.0.0 → redeploy → re-verify

---

### Task 10 — Build report, milestone closure

**Actions:**
1. Create `.planning/phases/09-qa-perf-deploy/09-BUILD-REPORT.md`:
   - Files added/modified
   - tsc + build status
   - BUNDLE.md summary (before/after)
   - LIGHTHOUSE.md summary
   - Cross-browser results
   - Production smoke results
   - Deviations
   - Deferred items (the full v2.1 list)
2. Create `.planning/phases/09-qa-perf-deploy/DEPLOY.md` — guide for future deploys (env var checklist, smoke test checklist)
3. Update `.planning/STATE.md`:
   - Phase 9 done. **Milestone v2.0.0 complete.**
4. Optionally: `git tag v2.0.0 && git push --tags` to mark the release
5. Commit: `docs(phase-9): finalize build report, deploy guide, and close milestone v2.0.0`

**Acceptance:**
- All Phase 9 docs committed
- Milestone v2.0.0 marked complete in STATE.md
- Tag v2.0.0 pushed (optional)

---

## Commit Plan (atomic)

| # | Files | Message |
|---|-------|---------|
| 1 | `PROJECT.md` | `docs(phase-9): lock D-17 deferring Playwright to post-v2.0.0` |
| 2 | `About.tsx` | `fix(phase-9): migrate About avatar to next/image and use existing profile asset` |
| 3 | `layout.tsx` | `feat(phase-9): production-grade metadata with OpenGraph and proper description` |
| 4 | `package.json`, `next.config.mjs`, `BUNDLE.md` | `feat(phase-9): add bundle analyzer and document bundle audit` |
| 4.5 | (conditional) `Contact.tsx` | `perf(phase-9): dynamic-import BookingModal to slim First Load JS` |
| 5 | (no commit, user-driven) | — |
| 5.5 | (conditional, depends on findings) `LIGHTHOUSE.md` + per-fix commits | `perf(phase-9): {specific fix}` |
| 6 | (no commit, user-driven) | — |
| 7 | (no commit, Vercel dashboard) | — |
| 8 | (no commit, user pushes to remote) | — |
| 9 | (no commit unless hotfix) | possibly `hotfix(phase-9): {issue} discovered in production` |
| 10 | `09-BUILD-REPORT.md`, `DEPLOY.md`, `STATE.md` | `docs(phase-9): finalize build report, deploy guide, and close milestone v2.0.0` |

---

## Success Criteria (from ROADMAP + PR-03)

1. ✅ Bundle First Load JS for `/[lang]` < 188 kB (≥30% reduction vs Phase 1's 269 kB)
2. ✅ Lighthouse Performance ≥ 90 on mobile + desktop
3. ✅ Lighthouse Accessibility ≥ 95
4. ✅ Lighthouse Best Practices ≥ 90
5. ✅ Lighthouse SEO ≥ 90
6. ✅ No console errors on production
7. ✅ Form + Calendar + theme + lang + voxel all functional on production
8. ✅ Works on Chrome, Firefox, Safari, Edge
9. ✅ OQ-5 resolved (D-17)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Bundle exceeds 188 kB target | Low-Medium | Phase 2 already removed NextUI + Spline (huge wins). Task 4.5 dynamic-imports BookingModal if needed (~5-10 kB savings) |
| Lighthouse Performance < 90 on mobile | Medium | Common cause: image weight. Task 2 helps. Could also add `priority` to Hero images, lazy-load below-fold images |
| Safari voxel breaks | Low | Phase 4 preserved original CSS. If breaks: add `-webkit-` prefixes to `transformStyle` |
| Vercel env var typo blocks production | Medium | Task 9 catches it on smoke test; hotfix env in dashboard |
| User's Google Cloud setup incomplete | High (currently blocking) | Phase 9 docs are written assuming setup is done; execution can pause if needed |
| Calendar API quota in production | Low | Portfolio traffic well within free tier |
| Hard refresh breaks framer animations | Low | Animations gated by `whileInView` viewport — re-trigger on first visibility, not on hard refresh per se |
| Production deploy fails for unrelated reason | Low | Vercel preview catches most issues before production |

---

## Goal-Backward Verification

**Goal:** v2.0.0 live in production. PR-03 hit. Lighthouse green. All buttons work.

Working backward:
- Public visitor reaches the production URL → site renders < 2s → form submits → calendar books a meeting. Tasks 2-9 deliver.
- PR-03 ≥30% reduction → Tasks 4 + 4.5 measure and remediate. ✓
- Lighthouse ≥ 90 → Tasks 2, 3, 5, 5.5 fix what's necessary. ✓
- Cross-browser → Task 6 verifies. ✓
- Milestone closure → Task 10. ✓

---

## Out of Scope (explicitly)

- Playwright E2E (D-17)
- Custom domain (deploy to vercel.app subdomain or user's existing custom domain)
- New features
- v2.1 roadmap items (deferred list)
- Lighthouse CI automation
- BrowserStack-style real device testing

---

*Plan written: 2026-05-11 — manual GSD format. Final phase of milestone v2.0.0.*
