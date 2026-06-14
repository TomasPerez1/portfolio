---
phase: 10
slug: ssr-content-fix
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-14
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> This phase's goal is "what does the SERVER-RENDERED HTML look like" — validation is build + curl + grep + manual-browser, NOT unit tests. No test framework is installed (Playwright deferred per v2.0.0 OQ-5). Do NOT add one — this phase only REMOVES dependencies.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None configured (no Jest/Vitest/Playwright in `my-app/`) — by design |
| **Config file** | none |
| **Quick run command** | `cd my-app && npm run build` (type-check + compile; fails fast on broken imports / `cv` rename) |
| **Full suite command** | `cd my-app && npm run build && npm run start` (then manual SSR/hydration check) |
| **Estimated runtime** | ~30–90 seconds (build) |

---

## Sampling Rate

- **After every task commit:** `cd my-app && npm run build` — catches broken imports and the `cv: string` / JSON key-rename type errors immediately
- **After every plan wave:** `npm run build && npm run start` + manual browser console check on `/en` and `/es` (hydration)
- **Before `/gsd:verify-work`:** All six requirement checks below green
- **Max feedback latency:** ~90 seconds (build)

---

## Per-Task Verification Map

Task IDs are assigned by the planner; each task maps to one or more requirement checks below.

| Req ID | Behavior | Test Type | Command / Check | Status |
|--------|----------|-----------|-----------------|--------|
| SSR-01 | Initial HTML (no JS) contains full content on `/en` and `/es` | smoke (curl) | `curl -s localhost:3000/en \| grep -c "Tomás"` >0; `/es` with a Spanish-only string | ⬜ pending |
| SSR-01 | Spinner markup absent, Hero present in server HTML | smoke (curl) | `curl -s localhost:3000/en \| grep -c "animate-spin"` == 0; `grep -c "Voxel · click to shuffle"` >0 | ⬜ pending |
| SSR-02 | `getPortfolioData.ts` has NO `"use client"` and is server-importable | file + build | `head -1 src/app/i18n/getPortfolioData.ts` is not `"use client";`; build succeeds when a server component imports it | ⬜ pending |
| SSR-03 | `next build && next start` clean; zero hydration warnings on `/en` + `/es` | manual (browser devtools) | Open both locales, console shows no "Hydration failed" / "Text content does not match" | ⬜ pending |
| SSR-03 | i18next deps absent from package.json + node_modules | dependency audit | `grep -E "i18next" my-app/package.json` no matches; `npm ls i18next react-i18next i18next-resources-to-backend` not found | ⬜ pending |
| SSR-03 | Zero source references to deleted i18n modules | static grep | `grep -rn "i18n/client\|i18n/index\|LangLoader\|from \"i18next\"\|from \"react-i18next\"" my-app/src/` zero matches | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] No test framework — **acceptable for Phase 10**. Validation is SSR-HTML inspection + browser console, not unit-testable logic. Installing a framework is OUT OF SCOPE and contradicts the "only remove dependencies" guidance.
- [x] No automated hydration-mismatch tool — `next build && next start` + manual console inspection is the documented sufficient method (PITFALLS.md Pitfall 2).

*Existing infrastructure (Next build) covers all phase requirements that can be automated; the rest are curl/grep/manual by design.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Zero hydration warnings on both locales | SSR-03 | No Playwright (deferred); hydration warnings only surface in a real browser console | `npm run build && npm run start`; open `localhost:3000/en` and `/es`; DevTools console must show no "Hydration failed" / "Text content does not match" |
| All content (incl. CV link, about copy) renders identically to before in EN + ES | SSR-01 | Visual/content parity is a human judgment | Compare both locales against current production before/after the change |

---

## Validation Sign-Off

- [ ] All tasks have an automated (build/curl/grep) verify or a documented manual check
- [ ] Sampling continuity: `npm run build` after every task commit
- [ ] Wave 0 covers all gaps (none require new infra)
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
