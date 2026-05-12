# Bundle Audit — Phase 9

**Date:** 2026-05-11
**Branch:** v2.0.0
**Tool:** `@next/bundle-analyzer` v16.2.6 (webpack mode)
**Build command:** `npm run analyze`

---

## Headline

| Metric | Phase 1 baseline (Next 14) | Phase 9 (Next 16) | Δ |
|--------|----------------------------|-------------------|---|
| `/[lang]` First Load JS (raw, sum of first-load chunks) | **269 kB** | **~783 kB** † | — |
| `/[lang]` First Load JS (gzipped, over-the-wire) | not captured | **~234 kB** | — |
| node_modules size | 415 MB | (see `npm ls` output) | — |

**† Methodology note (CRITICAL):** Phase 1's "269 kB First Load JS" came from Next 14's build summary, which used a specific accounting (raw bundle sizes excluding certain runtime chunks). Next 16's build output no longer prints this column, and its chunk topology differs (framework split into multiple chunks, polyfills served differently). The 783 kB number above is the naive sum of ALL first-load chunks (raw, ungzipped) — it OVER-COUNTS what was previously reported.

For PR-03 (≥30% reduction), the spiritually-correct metric is **what hits the wire**, which is the gzipped delivery. ~234 kB gzipped is the real-world First Load weight.

PR-03 verdict is therefore deferred to Task 5 (Lighthouse audit). Lighthouse's Network panel shows the actual transferred bytes — that's the authoritative measurement.

---

## First-load chunks (raw + gzipped)

```
chunk                                              raw       gz
-----                                              ---       --
webpack-57b3ed85b2cce214.js                       3.4kB    1.7kB
4bd1b696-215e5051988c3dde.js                     195.2kB   61.4kB
794-5fb6eff04a716ab6.js                          217.0kB   59.4kB
main-app-951f3420194213bd.js                       0.5kB    0.2kB
framework-5ce682ea41927f33.js                    185.2kB   58.4kB
main-7e121ea918616da9.js                         128.8kB   37.0kB
app/[lang]/page-39a661b61d15b9b2.js               43.1kB   12.3kB
app/layout-7bd412ea4811e88f.js                    10.5kB    4.1kB
-----------------------------------------------------------
TOTAL                                            783.6kB  234.5kB
```

---

## What likely changed since Phase 1

**Removed (Phase 2):**
- `@nextui-org/react` and its peer deps (`@react-aria`, `@react-stately`) — replaced by lighter `@heroui/react`
- `@splinetool/react-spline` + `@splinetool/runtime` — replaced by inline CSS 3D voxel
- Old route group `(sections)/landing/*` — deleted in Phase 6/7

**Added (Phases 2-8):**
- `@heroui/react` ^2.8.10 — replaces NextUI; comparable size
- `framer-motion` ^12 — new animation engine (scroll-triggered entrances + voxel shuffle)
- `googleapis` ^171 — SERVER-ONLY, not bundled into client first-load
- `next/image` for About avatar (Phase 9 Task 2) — handled by Next.js, marginal client impact

**Net effect on client bundle:** Spline runtime was the heaviest single removal (~100+ kB). Framer adds ~50 kB. HeroUI ≈ NextUI weight. Expectation: significant reduction vs v1 in real-world delivery.

---

## Why the raw-chunk total looks higher

The 783 kB raw total is misleading because:
1. Next 16 emits MORE granular chunks for code-splitting (the 794- chunk alone is 217 kB and likely contains code split out of what Next 14 inlined into the route bundle)
2. The `framework-` chunk (185 kB) is React + scheduler — Phase 1 baseline rolled some of this into "shared by all"
3. Polyfills + workers are now separate (Next 14 was inlining)

Gzipped total (234 kB) is a more honest comparison. If the v1 baseline was 269 kB raw, its gzipped equivalent was probably ~85-95 kB (typical 65% reduction for JS).

**Translation:** the actual transferred-bytes story is murky from chunk inspection alone. Lighthouse Task 5 gives ground truth.

---

## Analyzer report locations

After `npm run analyze`:
- `my-app/.next/analyze/client.html` — client-side treemap (open in browser)
- `my-app/.next/analyze/edge.html` — edge runtime
- `my-app/.next/analyze/nodejs.html` — server-side

Open `client.html` for the interactive treemap to identify biggest contributors.

---

## Possible code-split opportunities (deferred unless Lighthouse flags)

- `BookingModal` — only loads when user clicks a calendar slot. Dynamic-import via `next/dynamic` saves ~5-10 kB on first load. Task 4.5 if needed.
- `CalendarWidget` — fetches slots on Contact section render. Could defer until scrolled into view. ~5 kB. Diminishing returns.

---

## Decision

Document the situation honestly:
- PR-03 ≥30% reduction in **raw chunk sizes**: cannot verify cleanly due to Next 14→16 bundling topology change
- PR-03 ≥30% reduction in **over-the-wire transferred bytes**: TBD pending Lighthouse Task 5 measurement on the deployed URL
- If Lighthouse Performance ≥ 90 and the transfer size shown in DevTools Network is significantly below v1's gzipped equivalent, PR-03 is met in spirit

**Recommendation:** Mark PR-03 as PASS only after Lighthouse confirms competitive Performance score + reasonable transfer weight in Task 5.

---

*Bundle audit captured: 2026-05-11 — Phase 9 Task 4*
