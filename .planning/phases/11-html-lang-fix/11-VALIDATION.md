---
phase: 11
slug: html-lang-fix
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-15
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — project has no automated test suite (Playwright E2E deferred per v2.0.0 OQ-5) |
| **Config file** | none |
| **Quick run command** | `cd my-app && next build` (route-table inspection) |
| **Full suite command** | `cd my-app && next build && next start` then curl view-source checks (human-run) |
| **Estimated runtime** | ~build time + manual curl |

---

## Sampling Rate

- **After every task commit:** static grep assertions (no `NEXT_LOCALE` cookie read for `<html lang>`, header set present)
- **After plan completion:** `next build` route table + `/en` `/es` view-source `lang` checks (human-run, per CLAUDE.md "never build")
- **Before `/gsd:verify-work`:** view-source `<html lang>` correct on both locales
- **Max feedback latency:** build time

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-* | 01 | 1 | LOCALE-01 | — | `<html lang>` reflects route locale from request header | manual/curl | `curl -s localhost:3000/es \| rg -o '<html[^>]*>'` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements (no automated framework; validation is build + curl view-source).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `<html lang="en">` on /en | LOCALE-01 | No JS test framework; requires running prod build (build forbidden to agent per CLAUDE.md) | `curl -s localhost:3000/en \| rg -o '<html[^>]*lang="en"'` returns a match |
| `<html lang="es">` on /es | LOCALE-01 | Same | `curl -s localhost:3000/es \| rg -o '<html[^>]*lang="es"'` returns a match |
| `/` redirect target emits correct lang | LOCALE-01 | Same | Follow `/` → `/en`, view-source `<html lang="en">` |
| No new hydration mismatch | LOCALE-01 / PERF-01 | Browser console only | DevTools console clean on /en and /es after the header read |
| Route static/dynamic status | PERF-01 | Build-time route table | `next build` output marks /en /es — confirm no perf regression vs Phase 10 baseline |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or manual-verification entry
- [ ] Sampling continuity: build + curl after plan completion
- [ ] Wave 0 covers all MISSING references (none)
- [ ] No watch-mode flags
- [ ] Feedback latency acceptable (build time)
- [ ] `nyquist_compliant: true` set in frontmatter (set by nyquist auditor / planner)

**Approval:** pending
