# Phase 11: `<html lang>` Fix - Research

**Researched:** 2026-06-15
**Domain:** Next.js 16 App Router — passing a middleware/proxy-computed locale into the root layout's `<html lang>` via a request header, without forcing the locale page routes off SSG
**Confidence:** HIGH (middleware→proxy rename, header-passing API, dynamic-rendering tradeoff, and a critical middleware-location bug all verified against Next.js v16.2.9 official docs via Context7 + nextjs.org, and against direct codebase reads)

## Summary

The bug is precise and confirmed: `app/layout.tsx` sets `<html lang={(await cookies()).get("NEXT_LOCALE")?.value || "en"}>`, but **nothing in the codebase ever sets the `NEXT_LOCALE` cookie** — `middleware.ts` and `layout.tsx` are the only two files that reference it, and both only READ it (`[VERIFIED: codebase — grep "NEXT_LOCALE" across my-app/src returns exactly 2 reads, 0 writes]`). The cookie is therefore always `undefined`, the `|| "en"` fallback always wins, and **every page — including `/es` — ships `<html lang="en">`**. That is exactly what LOCALE-01 targets.

The locked architecture decision (from STATE.md, and independently derived in the milestone's own `ARCHITECTURE.md` Q5) is the correct, lowest-risk fix: the middleware/proxy already computes the locale for path-rewriting, so it additionally writes that locale to a NEW `x-locale` **request** header via `NextResponse.next({ request: { headers } })`; the root `app/layout.tsx` then reads `(await headers()).get("x-locale")` and drops the cookie read entirely. This keeps `app/layout.tsx` as the true root (`<html>`/`<body>`) — no layout-tree restructuring — and leaves `app/[lang]/layout.tsx` as a nested layout (which will gain `generateMetadata`/JSON-LD in Phase 13 using `params.lang` directly). Both the header-set and header-read APIs are verified against Next.js v16.2.9 docs.

**Two findings escalate this "small, isolated" phase, and both MUST reach the planner:**

1. **CRITICAL — the middleware file is in the wrong location and almost certainly does not run.** Next.js requires the file at `src/middleware.ts` (sibling of `app/`), but this project's file is at `src/app/middleware.ts` — INSIDE `app/`. The official docs state the file must be "at the same level as `pages` or `app`." A middleware nested inside `app/` is not picked up by Next.js. This means the planned approach (proxy sets `x-locale`) will silently produce `null` and fall back to `"en"` forever — i.e., it will *look* implemented but not fix the bug — unless the file is first relocated. This also retroactively explains *why* `NEXT_LOCALE` is never set and why the cookie hack never worked: the cookie-setting/locale-detection code has never executed.

2. **Reading `headers()` in the root layout opts that render into dynamic rendering** — but the root layout is **already dynamic today** because it calls `await cookies()`. Swapping `cookies()` → `headers()` is dynamic-status-neutral. The real PERF-01 question (does this conflict with Phase 16's static/SSG goal?) needs an explicit decision and is analyzed in full below with three mitigation options.

**Primary recommendation:** Relocate the proxy file to `src/proxy.ts` (Next 16 renamed `middleware`→`proxy`; rename now to kill the deprecation warning and fix the location bug in one move), have it set an `x-locale` request header from the already-computed locale, and read that header in `app/layout.tsx` for `<html lang>`. Verify with `next build` that `/en` and `/es` page routes still render static (○) — if the root layout's `headers()` read pushes them to dynamic (ƒ), apply Mitigation A (accept `app/layout.tsx` dynamic, keep page routes static — the default behavior) and confirm in Phase 16.

## User Constraints (from STATE.md locked decision — no CONTEXT.md exists for this phase)

> No `11-CONTEXT.md` exists yet. The binding constraint is the locked architecture decision recorded in `.planning/STATE.md` (Accumulated Context → Decisions) and restated in the phase brief. Treat it with locked-decision authority.

### Locked Decisions
- Do **NOT** promote `app/[lang]/layout.tsx` to root. Keep `app/layout.tsx` as the true root (owns `<html>`/`<body>`).
- The middleware/proxy sets a new `x-locale` **request** header from the already-computed `locale`. The existing path-rewrite/redirect logic stays unchanged.
- Root `app/layout.tsx` reads `(await headers()).get("x-locale")` for `<html lang>`; the `NEXT_LOCALE` cookie read is removed entirely.
- Must land before Phase 13 (hreflang/canonical correctness depends on a correct `<html lang>`).

### Claude's Discretion
- Whether to rename `middleware.ts` → `proxy.ts` as part of this phase (recommended — see Pitfall 1; it is the same edit as the mandatory location fix).
- The exact fallback string when `x-locale` is absent (recommend `"en"`, matching `i18n.defaultLocale`).
- Whether to also fix the middleware **file location** in this phase (this is NOT optional for the fix to work — see Pitfall 1 — but the planner controls how it's framed as a task).

### Deferred Ideas (OUT OF SCOPE)
- `generateMetadata`, canonical/hreflang, JSON-LD on `app/[lang]/layout.tsx` — Phase 13.
- Promoting `[lang]/layout.tsx` to root — explicitly rejected by the locked decision; do not revisit.
- Setting a `NEXT_LOCALE` cookie to persist a user's language override across visits to `/` — not in scope; the URL is the source of truth.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LOCALE-01 | The `<html lang>` attribute reflects the actual route locale (`en` on `/en`, `es` on `/es`), derived from the route — not from the unset `NEXT_LOCALE` cookie. | Pattern 1 (proxy sets `x-locale` request header) + Pattern 2 (root layout reads `headers().get("x-locale")`) + Pitfall 1 (proxy file must be relocated to actually run) + Validation Architecture (view-source `lang` on `/en`, `/es`, `/` redirect target) |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Locale computation (cookie/Accept-Language/default → `en`\|`es`) | Frontend Server (Proxy/Middleware) | — | Already computed in `getLocale()` for path rewriting; this phase reuses that exact value, adds zero new logic |
| Locale signal transport (proxy → root layout) | Frontend Server (Proxy → request header) | — | `x-locale` request header is the documented Next.js mechanism to pass a same-request value from proxy to a layout that has no access to the `[lang]` route param (`app/layout.tsx` sits ABOVE the `[lang]` segment) |
| `<html lang>` emission | Frontend Server (SSR, root `app/layout.tsx`) | — | `<html>`/`<body>` can only be defined in the root layout; the root layout is OUTSIDE `[lang]`, so it cannot use `params.lang` — it must read the proxy-set header |
| Per-locale metadata / hreflang / JSON-LD | Frontend Server (`app/[lang]/layout.tsx`, via `params.lang`) | — | OUT OF SCOPE for Phase 11 (Phase 13). Listed only to make the boundary explicit: the nested `[lang]` layout uses `params.lang` directly and never needs the header |

## Standard Stack

### Core

No new libraries. This phase uses only Next.js 16 / React 19 primitives already installed.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.2.6 (installed; latest stable 16.2.9) | `NextResponse.next({ request: { headers } })` to set a request header in proxy; `headers()` from `next/headers` to read it in a Server Component | The documented, first-party mechanism for proxy→server-component value passing `[CITED: nextjs.org/docs/app/api-reference/file-conventions/proxy — "Setting Headers"]` |
| react | ^19.2.6 (installed) | Root layout Server Component render of `<html lang>` | Already in use; no change |

### Supporting

None.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `x-locale` **request** header (`NextResponse.next({ request: { headers } })`) | `x-locale` **response** header (`response.headers.set(...)`) | WRONG for this use case — a response header is sent to the *client*, not made available to *upstream* server rendering. The root layout reads request headers via `headers()`; only the `request: { headers }` form reaches it. The docs explicitly warn: use `NextResponse.next({ request: { headers } })`, NOT `NextResponse.next({ headers })`. `[CITED: nextjs.org proxy docs — "Setting Headers" note]` |
| `NEXT_LOCALE` cookie (current, broken) | Make proxy `response.cookies.set("NEXT_LOCALE", locale)` so the layout's existing `cookies()` read works | Rejected by locked decision AND technically inferior: cookies need a round-trip (set on response N, readable by the server on request N+1), so a fresh first visit still gets the fallback. A request header is available on the SAME request. `[CITED: ARCHITECTURE.md Q5 Option B analysis]` |
| Read `headers()` in root layout | Promote `[lang]/layout.tsx` to root and use `params.lang` | Rejected by locked decision (keep `app/layout.tsx` as root). Would also orphan the `/`-redirect path (`app/page.tsx`) from a root layout. `[CITED: STATE.md locked decision; ARCHITECTURE.md Q5 caveat]` |
| Set `<html lang>` in a client `useEffect` | `document.documentElement.lang = lang` after hydration | Anti-pattern — runs after SSR, so crawlers and screen readers see the wrong/default `lang` first. Defeats the entire purpose. `[CITED: ARCHITECTURE.md Anti-Pattern 2]` |

**Installation:** None — zero new dependencies (consistent with the milestone's "zero new npm dependencies" decision in STATE.md).

**Version verification:**
```
next: installed ^16.2.6; npm registry latest 16.2.9 (proxy docs page reports version 16.2.9, lastUpdated 2026-05-13)
```
`[VERIFIED: nextjs.org/docs proxy page header reports "version: 16.2.9"]` — the installed `^16.2.6` range resolves into the 16.2.x line where `middleware`→`proxy` is already in effect (rename landed in v16.0.0).

## Package Legitimacy Audit

> This phase installs **zero** external packages. The Package Legitimacy Gate (slopcheck, registry verification, postinstall inspection) applies only to NEW installs and is **not applicable** here. No table rows.

**Packages removed due to slopcheck [SLOP] verdict:** none (no installs).
**Packages flagged as suspicious [SUS]:** none (no installs).

## Architecture Patterns

### System Architecture Diagram

```
BEFORE (broken — this phase fixes)
──────────────────────────────────────────────────────────────
GET /es
    │
    ▼
src/app/middleware.ts        ◄── WRONG LOCATION (inside app/) → NOT EXECUTED by Next.js
    │  (computes locale, would set nothing useful — but never runs)
    │
    ▼
app/layout.tsx (root, Server Component)
    │  const lang = (await cookies()).get("NEXT_LOCALE")?.value || "en"
    │                                   ▲ cookie NEVER set → always undefined → "en"
    │  <html lang="en">   ◄── WRONG: /es also gets lang="en"
    ▼
app/[lang]/layout.tsx (nested, passthrough) → page.tsx → ClientPage (lang="es", content correct)
    ▼
HTML: <html lang="en"> ...Spanish content...   ◄── lang/content mismatch


AFTER (this phase)
──────────────────────────────────────────────────────────────
GET /es
    │
    ▼
src/proxy.ts                 ◄── RELOCATED to src/ root (sibling of app/) → NOW EXECUTES
    │  const locale = getLocale(request)            (unchanged logic)
    │  const requestHeaders = new Headers(request.headers)
    │  requestHeaders.set("x-locale", locale)        // NEW
    │  return NextResponse.next({ request: { headers: requestHeaders } })
    │         (existing redirect/rewrite branches keep their own returns — see Pattern 1)
    ▼
app/layout.tsx (root, Server Component)
    │  const lang = (await headers()).get("x-locale") ?? "en"   // cookie read REMOVED
    │  <html lang={lang}>   ◄── "es" on /es, "en" on /en  ✓
    ▼
app/[lang]/layout.tsx → page.tsx → ClientPage   (unchanged)
    ▼
HTML: <html lang="es"> ...Spanish content...   ◄── correct, consistent
```

### Recommended Project Structure (delta only)

```
my-app/src/
├── proxy.ts                 # RELOCATED from src/app/middleware.ts + renamed
│                            #   (Next 16: middleware→proxy). Sets x-locale request header.
│                            #   Imports i18n-config from "./app/i18n-config".
└── app/
    ├── layout.tsx           # MODIFIED — read headers().get("x-locale") instead of
    │                        #   cookies().get("NEXT_LOCALE"); drop `import { cookies }`
    ├── middleware.ts        # DELETED (moved to src/proxy.ts)
    ├── i18n-config.ts       # UNCHANGED — still the source of locales/defaultLocale
    └── [lang]/layout.tsx    # UNCHANGED in this phase (Phase 13 adds metadata/JSON-LD)
```

> Note on the import path after relocation: the current middleware imports `{ i18n } from "./i18n-config"` (sibling in `app/`). After moving to `src/proxy.ts`, that import becomes `"./app/i18n-config"`. The planner must update this import or the build breaks. `[VERIFIED: codebase — src/app/middleware.ts line 2]`

### Pattern 1: Proxy sets the `x-locale` request header (resolves LOCALE-01, transport half)

**What:** In the already-computed-locale branch(es) of the proxy, clone request headers, set `x-locale`, and return `NextResponse.next({ request: { headers } })`. The redirect (`/` → `/en`) and rewrite (other paths) branches keep their existing returns — but to guarantee the header is present on the *rendered* request in every case, set it on the rewrite path too (the redirect path renders nothing — the browser re-requests `/en`, which then flows through the `pathHasLocale` branch).

**When to use:** Now — this is the core transport mechanism.

**Current proxy structure (4 return points):** `[VERIFIED: codebase — src/app/middleware.ts]`
1. static/api/file paths → `NextResponse.next()` (no header needed — never renders a localized page)
2. `pathHasLocale` (`/en`, `/es`, `/en/...`, `/es/...`) → `NextResponse.next()` ◄── **the locale IS in the path here; this is where the rendered request needs `x-locale`**
3. `pathname === "/"` → `NextResponse.redirect("/en"|"/es")` (renders nothing; browser re-requests the target, which hits branch 2)
4. other non-locale paths → `NextResponse.rewrite("/${locale}${pathname}")` ◄── **rewrite target renders a localized page; needs `x-locale`**

**Target — example (note: locale must be derived in branch 2 from the path, since `getLocale()` isn't called there today):**
```ts
// Source: derived from my-app/src/app/middleware.ts + nextjs.org proxy "Setting Headers"
import { NextRequest, NextResponse } from "next/server";
import { i18n } from "./app/i18n-config";  // path updated after relocation to src/

function getLocale(request: NextRequest): string {
  // ...unchanged...
}

function withLocaleHeader(request: NextRequest, locale: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // pathHasLocale: locale is the FIRST path segment — derive it from the path,
  // not getLocale(), so x-locale matches the URL the user actually requested.
  const localeInPath = i18n.locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (localeInPath) {
    return withLocaleHeader(request, localeInPath);  // ◄── set header on the rendered request
  }

  const locale = getLocale(request);

  if (pathname === "/") {
    const url = new URL(`/${locale}`, request.url);
    url.search = searchParams;
    return NextResponse.redirect(url);   // renders nothing; target re-enters via localeInPath branch
  }

  const url = new URL(`/${locale}${pathname}`, request.url);
  url.search = searchParams;
  // rewrite target renders a localized page → carry x-locale through to it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)"],
};
```

> Key correctness point: in the existing `pathHasLocale` branch the code currently returns a bare `NextResponse.next()` and never derives the locale there. The locale that matters for `<html lang>` on `/es` is the one IN THE PATH (`es`), not whatever `getLocale()` (cookie/Accept-Language) would return. Deriving `localeInPath` from the path segment is the correct source and is `[ASSUMED]` to be the planner's intended reading of "the already-computed locale" — flag for confirmation if the planner prefers calling `getLocale()` uniformly. See Assumptions Log A2.

### Pattern 2: Root layout reads the header (resolves LOCALE-01, consumption half)

**What:** Replace the cookie read with a header read; remove the `cookies` import.

**Current:** `[VERIFIED: codebase — app/layout.tsx lines 5, 53]`
```tsx
import { cookies } from "next/headers";
// ...
const lang = (await cookies()).get("NEXT_LOCALE")?.value || "en";
```

**Target:**
```tsx
// Source: derived from app/layout.tsx + nextjs.org proxy "Accessing middleware headers in server components"
import { headers } from "next/headers";
// ...
const lang = (await headers()).get("x-locale") ?? "en";
```

`headers()` is **async** in Next.js 16 and must be `await`ed — confirmed by the docs example `(await headers()).get("x-sentinel")`. `[VERIFIED: nextjs.org/docs proxy + Context7 /vercel/next.js — "Accessing middleware headers in server components"]` The root layout is already an `async function RootLayout`, so no signature change is needed. The `<html suppressHydrationWarning>` attribute already on line 58 STAYS (see Pitfall 3).

### Anti-Patterns to Avoid

- **Setting `<html lang>` via `useEffect`** — runs post-hydration; crawlers/screen readers see the default first. `[CITED: ARCHITECTURE.md Anti-Pattern 2]`
- **Using a response header** (`NextResponse.next({ headers })`) instead of a request header (`NextResponse.next({ request: { headers } })`) — the former goes to the client, not upstream render; `headers()` won't see it. `[CITED: nextjs.org proxy "Setting Headers" note]`
- **Leaving the file at `src/app/middleware.ts`** — it does not run there; the fix becomes a silent no-op. (Pitfall 1.)
- **Re-introducing a `cookies()` call** in the root layout "for fallback" — that re-adds the dynamic-API cost without benefit; the header read alone is sufficient.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Passing a computed locale from proxy to a layout outside the `[lang]` segment | A global, a module-level variable, a custom in-memory store, or a `fetch` round-trip | `NextResponse.next({ request: { headers } })` + `headers()` | First-party, same-request, SSR-safe. The docs explicitly warn proxy "should not rely on shared modules or globals." `[CITED: nextjs.org proxy "Good to know"]` |
| Locale detection (cookie → Accept-Language → default) | A new detection routine | The existing `getLocale()` in the current middleware (carry it over verbatim) | Already written, already correct; this phase only ADDS a header, it does not rewrite detection |

**Key insight:** This phase adds exactly one new piece of data flow (an `x-locale` request header). Everything else — locale detection, route rewriting, the redirect — is existing code that must be carried over unchanged. The only "new build" temptation to resist is inventing a non-header transport; the header IS the supported transport.

## Runtime State Inventory

> This is a rename/relocation-touching phase (the file moves and the cookie read is removed), so the inventory applies.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. `NEXT_LOCALE` cookie was never written, so no stored cookie state exists to migrate. `[VERIFIED: codebase grep — 0 writes]` | None |
| Live service config | None. No external service holds the locale string. The proxy/middleware config (`matcher`) lives in the file itself and moves with it. | Carry `config.matcher` over to `src/proxy.ts` verbatim |
| OS-registered state | None — no scheduled tasks, no daemons reference this. | None |
| Secrets/env vars | None — no env var named for locale or `NEXT_LOCALE`. | None |
| Build artifacts | `.next/` build cache may reference the old `src/app/middleware.ts` path. A clean `next build` after relocation regenerates it. The `tsconfig.json` `include` array lists specific files but NOT the middleware path, so no tsconfig edit is needed for the move. `[VERIFIED: codebase — tsconfig.json include array]` | Run `next build` after the move (validation step already required) |

**The canonical question — after every file is updated, what runtime systems still carry the old string?** Answer: only the `.next/` build cache, cleared by the mandatory rebuild. The `NEXT_LOCALE` cookie has no persisted state anywhere because it was never set. There is no data migration — this is purely a code/route change.

## Common Pitfalls

### Pitfall 1: The middleware file is in the wrong directory and is NOT executed (CRITICAL — root-cause-adjacent)

**What goes wrong:** The proxy sets `x-locale`, the layout reads it, everything compiles — and `<html lang>` is STILL always `"en"` because the proxy never ran. The phase ships "done" but the bug persists.

**Why it happens:** The file is at `my-app/src/app/middleware.ts` (INSIDE `app/`). Next.js requires the proxy/middleware file at the project root or `src/` root — "located at the same level as `pages` or `app`" — i.e. `my-app/src/middleware.ts` (or `src/proxy.ts`). A file inside `app/` is treated as an ordinary module, not the proxy convention. `[VERIFIED: nextjs.org/docs/app/api-reference/file-conventions/proxy — "Create a proxy.ts ... in the project root, or inside src if applicable, so that it is located at the same level as pages or app"]` `[VERIFIED: codebase — src/ contains ONLY app/; there is no src/middleware.ts or src/proxy.ts]`

This independently explains the whole bug: the `NEXT_LOCALE` cookie is never set because the code that would set it (and the locale detection, and the rewrite) has never executed. The `/` → `/en` redirect that currently appears to work is served by `app/page.tsx`'s `redirect("/en")` Server Component — NOT by the middleware. `[VERIFIED: codebase — app/page.tsx calls redirect("/en")]`

**How to avoid:** Relocate the file to `src/proxy.ts` (sibling of `app/`). Update its internal import `"./i18n-config"` → `"./app/i18n-config"`. Rename the export `middleware` → `proxy` (or keep `middleware` at `src/middleware.ts` — but since Next 16 deprecated the `middleware` name and shows a warning, renaming to `proxy` is cleaner; both are valid). Use the codemod if preferred: `npx @next/codemod@canary middleware-to-proxy .` (verify the package before running per project norms; the manual move is equally fine and more controlled). `[CITED: nextjs.org proxy "Migration to Proxy"]`

**Warning signs:** After implementing, `curl -s localhost:3000/es | grep '<html'` still shows `lang="en"`. Or: adding a `console.log` in the proxy produces no server output on any request.

**Detection:** The PRIMARY validation gate for this phase — see Validation Architecture. The view-source `lang` check on `/es` is exactly the test that catches a non-running proxy.

### Pitfall 2: Reading `headers()` opts the route into dynamic rendering — PERF-01 tradeoff

**What goes wrong:** `headers()` is a Dynamic API. Reading it makes the rendering of that component request-time (dynamic), not build-time (static). If the root layout's dynamic-ness propagates to the `/en` and `/es` page routes, `next build` marks them `ƒ (Dynamic)` instead of `○ (Static)`, which would violate **PERF-01** ("Both `/en` and `/es` ... render as static/SSG, not dynamic") and the Phase 16 exit gate. `[VERIFIED: Context7 /vercel/next.js — runtime APIs like cookies()/headers() defer to request time; STATE.md Phase 16 blocker explicitly warns about "accidental cookies()/headers() calls forcing dynamic rendering"]`

**Why it happens:** `headers()`, `cookies()`, `searchParams`, etc. are inherently request-dependent — Next.js cannot know their values at build time, so any render that reads them is dynamic.

**Critical nuance that DE-RISKS this phase:** the root layout is **already dynamic today** because it already calls `await cookies()`. `[VERIFIED: codebase — app/layout.tsx line 53]` Swapping `cookies()` → `headers()` does NOT change the static/dynamic status of `app/layout.tsx` — it was already a dynamic-API consumer. So this phase introduces **no new** dynamic-rendering regression versus the current shipped state. The question is purely whether the page routes are static *today* despite the root layout's cookie read — that is a measurable fact the planner must capture from `next build` output BEFORE and AFTER, not assume.

**Mitigation options (pick based on the build-output measurement):**
- **Mitigation A (default, recommended):** Accept that `app/layout.tsx` reads a dynamic API and just verify the `/en`/`/es` **page** routes are still static in `next build`. In the App Router, a dynamic API in a layout does not automatically force every descendant page to be fully dynamic if the dynamic value is confined to the layout's own output; Next.js can still statically prerender the page subtree. **Measure, don't assume** — read the build output's route table. This is the lowest-effort path and changes nothing structurally. `[ASSUMED — needs confirmation from this project's actual next build route table; see Assumptions Log A1]`
- **Mitigation B (if A shows page routes went dynamic):** Wrap the dynamic read so the static shell prerenders and the locale streams in. Per Next 16 caching docs, components reading runtime APIs can be isolated behind `<Suspense>` (with `cacheComponents`) so the static shell is prerendered while the request-time value defers. For `<html lang>` specifically this is awkward (the `<html>` element is the shell root), so B is a fallback, not a first choice. `[CITED: Context7 /vercel/next.js — "Runtime APIs with Suspense Boundary"]`
- **Mitigation C (last resort):** Since `[lang]` is a fully enumerable param (`generateStaticParams` returns `["en","es"]`), the locale is ALSO available to the `[lang]` subtree via `params.lang` with zero dynamic-API cost. If `<html lang>` via header proves to force dynamic page routes AND the locked decision can be revisited, the `params.lang` approach (Phase 13's metadata path) is inherently static. **This contradicts the locked decision** (keep `app/layout.tsx` as root, read header) so it is NOT recommended for Phase 11 — but it is the escape hatch if PERF-01 cannot otherwise be met. Flag to the user before pursuing. `[CITED: ARCHITECTURE.md Q5]`

**How to avoid a surprise:** Make "read the `next build` route table and confirm `/en`, `/es` are `○` not `ƒ`" an explicit success criterion of this phase (it already is success-criterion #4 in the roadmap). Do not defer this to Phase 16.

**Warning signs:** `next build` output shows `ƒ /[lang]` (Dynamic, server-rendered on demand) instead of `○ /[lang]` (Static) — or shows the page prerendered for `en`/`es` as `●` (SSG). The legend is printed at the bottom of the build output.

### Pitfall 3: Hydration mismatch on `<html>` — already mitigated, must not regress

**What goes wrong:** The server renders `<html lang="es">` but the client reconciles a different value, producing a "Hydration failed" / attribute-mismatch warning on the `<html>` element.

**Why it does NOT happen here:** `lang` derives from the proxy-set request header, which is fixed for the request. The client does not recompute `lang` during hydration — React reads the already-rendered DOM attribute. The value is identical server-side (render) and client-side (hydration reconciliation). No `window`/`Date`/`localStorage` is involved in computing `lang`. `[CITED: ARCHITECTURE.md Pattern 3 hydration audit row "<html lang={lang}>"]`

**Interaction with `suppressHydrationWarning`:** `<html>` already carries `suppressHydrationWarning` (line 58) for the theme-flash script that sets `data-theme` pre-hydration. `[VERIFIED: codebase — app/layout.tsx line 58 + ThemeProvider.tsx applies data-theme via setAttribute, not React JSX]` This attribute MUST remain. Note a subtlety: `suppressHydrationWarning` suppresses warnings **one level deep** on the `<html>` element's own attributes — so even in the theoretical case where `lang` differed, the warning would be suppressed. This is a safety net, not the primary guarantee (the primary guarantee is that `lang` is identical on both sides). Do not rely on `suppressHydrationWarning` to MASK a real `lang` bug — the view-source check (server output) is the source of truth, since `suppressHydrationWarning` does not change what the server emits.

**Warning signs:** Console "Warning: Prop `lang` did not match. Server: ... Client: ..." — would indicate `lang` is being recomputed client-side (it should not be). With `suppressHydrationWarning` present this specific warning is suppressed, so the **view-source / curl** check is the authoritative validation, not the console.

## Code Examples

### Final `app/layout.tsx` (the two changed lines + import)
```tsx
// Source: derived from my-app/src/app/layout.tsx — only the locale source changes
import { headers } from "next/headers";        // was: import { cookies } from "next/headers";
// ...all other imports unchanged...

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = (await headers()).get("x-locale") ?? "en";   // was: (await cookies()).get("NEXT_LOCALE")?.value || "en"

  return (
    <html
      lang={lang}
      suppressHydrationWarning            // STAYS — theme-flash script + safety net
      className={`${bricolage.variable} ${geist.variable} ${jetbrainsMono.variable}`}
    >
      {/* ...unchanged: <head> theme script, <body>, Provider, Toaster, SpeedInsights... */}
    </html>
  );
}
```

### Minimal `src/proxy.ts` header-set (relocated + renamed)
```ts
// Source: nextjs.org proxy "Setting Headers" — the request-header form
const requestHeaders = new Headers(request.headers);
requestHeaders.set("x-locale", locale);
return NextResponse.next({ request: { headers: requestHeaders } });
// NOT: NextResponse.next({ headers: requestHeaders })  ← that sets a CLIENT-facing response header
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware` | `proxy.ts` + `export function proxy` (Node.js runtime, no edge) | Next.js **v16.0.0** | `middleware` name is deprecated and warns; codemod `@next/codemod middleware-to-proxy` available. Edge runtime is NOT supported in `proxy` — but this project uses no edge features, so the Node.js-only proxy is fine. `[CITED: nextjs.org proxy "Version history" + "Migration to Proxy"]` |
| `cookies()`/`headers()` synchronous | `await cookies()` / `await headers()` (async) | Next.js 15 → 16 | Already reflected in the current `app/layout.tsx` (`await cookies()`). The header read is likewise `await`ed. `[VERIFIED: codebase + Context7]` |
| `<html lang>` from a never-set cookie | `<html lang>` from a proxy-set `x-locale` request header | This phase (Phase 11) | Fixes LOCALE-01; correct `lang` on every locale route |

**Deprecated/outdated:**
- `src/app/middleware.ts` (wrong location, deprecated name) → replaced by `src/proxy.ts`.
- `NEXT_LOCALE` cookie read in `app/layout.tsx` → removed; no consumer remains after this phase. (The proxy's `getLocale()` still READS a `NEXT_LOCALE` cookie as one detection input — that read is harmless and unrelated to `<html lang>`; leave it or clean it at the planner's discretion, but note nothing sets it so it's always a no-op input.)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Mitigation A holds: a dynamic-API read confined to the root `app/layout.tsx` does NOT force the `/en`/`/es` **page** routes to render dynamic in this project's `next build`. | Pitfall 2 | If wrong, PERF-01 is violated and Mitigation B or C is needed. **Directly measurable** — the planner MUST read the `next build` route table as a phase success criterion (already roadmap criterion #4). Low residual risk because it's verified at build time, not deferred. |
| A2 | "The already-computed locale" for the `pathHasLocale` branch means the locale derived from the URL path segment (`localeInPath`), not the `getLocale()` cookie/Accept-Language result. | Pattern 1 | If the planner/user intends `getLocale()` uniformly, the header could disagree with the URL on edge cases (e.g. `/es` requested by an `Accept-Language: en` client). Deriving from the path is the correct choice for `<html lang>` correctness; confirm with user if uncertain. Low impact — both produce correct results for direct `/en` and `/es` visits. |
| A3 | Renaming `middleware`→`proxy` introduces no behavioral change beyond the location fix (matcher, getLocale, redirect/rewrite all behave identically under the Node.js proxy runtime). | Pitfall 1, State of the Art | If a future edge-runtime need arises, `proxy` doesn't support edge — but this project uses no edge features today. Verifiable via `next build` + the existing redirect/rewrite behavior. Low risk. |

## Open Questions

1. **Does this project's `next build` mark `/en` and `/es` as static after the header read? (resolves A1)**
   - What we know: the root layout is already a dynamic-API consumer (`cookies()`), and the page routes' current static/dynamic status is whatever it is today — measurable but not yet measured in this session (no build run here).
   - What's unclear: the actual route-table classification after the swap.
   - Recommendation: First task or validation step of the phase runs `cd my-app && npm run build` and records the route table for `/[lang]`. If static (`○`/`●`), Mitigation A is confirmed and the phase is done. If dynamic (`ƒ`), escalate to Mitigation B, then C (C requires revisiting the locked decision — surface to the user).

2. **Keep the proxy's internal `getLocale()` `NEXT_LOCALE` cookie read, or remove it?**
   - What we know: nothing sets that cookie, so the read is always a no-op detection input; removing it is pure cleanup.
   - What's unclear: whether a future "remember language" feature is planned (would set the cookie).
   - Recommendation: Leave it — it's harmless, out of LOCALE-01's scope, and removing it risks unrelated churn. Note it for a future phase if a persistence feature is ever added.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | `next build`, `next start` (validation) | ✓ | npm confirmed working this session | — |
| next CLI (`next build`/`next start`) | view-source/route-table validation | ✓ | ^16.2.6 (package.json) | — |
| curl (or browser view-source) | SSR `<html lang>` checks | ✓ (curl on Windows/Git Bash, or browser "View Source") | — | Browser DevTools → "View Page Source" (NOT Elements panel — see Validation note) |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none.

## Validation Architecture

> `.planning/config.json` does not exist (`workflow.nyquist_validation` absent ⇒ enabled). This section drives `11-VALIDATION.md`. Mirrors Phase 10's pattern: no unit-test framework is installed (Playwright deferred per v2.0.0 OQ-5); validation is `next build` + curl/view-source + grep. Do NOT install a test framework.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured (no Jest/Vitest/Playwright in `my-app/`) — by design, matches Phase 10 |
| Config file | none — see Wave 0 |
| Quick run command | `cd my-app && npm run build` (compiles proxy + layout; fails fast on the relocated import path; prints the static/dynamic route table) |
| Full suite command | `cd my-app && npm run build && npm run start` then curl/view-source on `/en`, `/es`, `/` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOCALE-01 | `/en` server HTML has `<html lang="en">` | smoke (curl/view-source) | `curl -s localhost:3000/en \| grep -o '<html[^>]*lang="[^"]*"'` → expect `lang="en"` | N/A — manual/curl |
| LOCALE-01 | `/es` server HTML has `<html lang="es">` | smoke (curl/view-source) | `curl -s localhost:3000/es \| grep -o '<html[^>]*lang="[^"]*"'` → expect `lang="es"` (THE test that catches a non-running proxy — Pitfall 1) | N/A — manual/curl |
| LOCALE-01 | `/` redirects to a locale route whose HTML has the correct `lang` | smoke (curl -L) | `curl -sL localhost:3000/ \| grep -o '<html[^>]*lang="[^"]*"'` → expect a valid `lang` (`en` default) | N/A — manual/curl |
| LOCALE-01 | No code path reads `NEXT_LOCALE` for `<html lang>` | static grep | `grep -rn "NEXT_LOCALE" my-app/src/app/layout.tsx` → 0 matches (the proxy's `getLocale` read may remain — scope it to layout.tsx) | N/A — grep |
| LOCALE-01 | Proxy actually executes (file in correct location) | build + behavior | `ls my-app/src/proxy.ts` exists AND `ls my-app/src/app/middleware.ts` does NOT; build prints `ƒ Proxy` / proxy compiled line | N/A — file check + build output |
| LOCALE-01 / PERF-01 | `/en`,`/es` page routes still static after header read (Pitfall 2 / A1) | build route table | `npm run build` → route table shows `○`/`●` for `/[lang]`, not `ƒ` | N/A — build output |
| LOCALE-01 | No new hydration warning on `<html>` | manual (browser) | `npm run start`; open `/en` and `/es`; DevTools console shows no "lang did not match" (note: `suppressHydrationWarning` suppresses it — view-source is authoritative) | N/A — manual |

### Sampling Rate
- **Per task commit:** `cd my-app && npm run build` (catches the relocated `./app/i18n-config` import immediately; prints the route table for the PERF-01 check)
- **Per wave merge:** `npm run build && npm run start` + curl/view-source on `/en`, `/es`, `/`
- **Phase gate:** All rows green before `/gsd:verify-work`; specifically the `/es` → `lang="es"` view-source check (proves the proxy runs) AND the build route table showing `/[lang]` static (PERF-01 guard).

### Wave 0 Gaps
- [ ] No test framework — **acceptable** (matches Phase 10); validation is build + curl/view-source + grep. Do NOT install one (out of scope; contradicts "zero new npm dependencies").
- [ ] No automated SSR-HTML assertion tool — curl + grep is the documented sufficient method (same as Phase 10).

*(No test-file gaps — every check is build/grep/curl/manual-browser, runnable on existing infrastructure.)*

**Validation note — view-source vs Elements panel:** the `<html lang>` value MUST be checked via **curl** or the browser's **"View Page Source"** (raw server HTML), NOT the DevTools **Elements** panel. The Elements panel shows the live, post-hydration DOM, which could mask a server/client discrepancy. For LOCALE-01, what crawlers and screen readers receive is the server HTML — curl/view-source is the only valid check. (And because `<html suppressHydrationWarning>` is present, the console will not flag a `lang` mismatch even if one existed — reinforcing that view-source is authoritative.)

## Security Domain

> `security_enforcement` not set in config (absent ⇒ enabled). This phase has minimal security surface: it relocates a proxy file, sets one non-sensitive request header (`x-locale` ∈ {`en`,`es`}), and reads it server-side. No auth, session, crypto, or user-controlled data handling is introduced.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A |
| V3 Session Management | No | N/A |
| V4 Access Control | No | N/A |
| V5 Input Validation | yes (minor) | The `x-locale` value is derived from a fixed enum (`i18n.locales` / path segment), never from raw user input echoed unescaped. The root layout uses it only as the `lang` attribute value. Constrain to known locales (the `?? "en"` fallback + `localeInPath` derivation already bound it to `["en","es"]`). |
| V6 Cryptography | No | N/A |

### Known Threat Patterns for Next.js 16 proxy + header passing
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client spoofs an inbound `x-locale` request header to inject a value into `<html lang>` | Spoofing/Tampering | The proxy SETS `x-locale` on every matched request via `new Headers(request.headers); set("x-locale", locale)` — `set()` overwrites any client-supplied value with the server-computed one, so an attacker-supplied `x-locale` is replaced. Additionally, bound the layout read to known locales if defense-in-depth is desired (`["en","es"].includes(v) ? v : "en"`). `[CITED: nextjs.org proxy "Setting Headers" — Headers.set overwrites]` |
| Header-size abuse (431) | Denial of Service | `x-locale` is 2 chars — negligible; docs' 431 warning concerns large headers only. |

## Sources

### Primary (HIGH confidence)
- **Direct codebase reads (this session):** `my-app/src/app/middleware.ts`, `my-app/src/app/layout.tsx`, `my-app/src/app/[lang]/layout.tsx`, `my-app/src/app/[lang]/page.tsx`, `my-app/src/app/page.tsx`, `my-app/src/app/i18n-config.ts`, `my-app/src/app/theme/ThemeProvider.tsx`, `my-app/package.json`, `my-app/next.config.mjs`, `my-app/tsconfig.json`; directory listing confirming `src/` contains only `app/` (no `src/middleware.ts`/`src/proxy.ts`); grep confirming `NEXT_LOCALE` = 2 reads / 0 writes.
- **nextjs.org/docs/app/api-reference/file-conventions/proxy** (reports version 16.2.9, lastUpdated 2026-05-13) — file-location requirement ("same level as pages or app"), `middleware`→`proxy` rename + codemod, request-header vs response-header "Setting Headers" note, Node.js-only runtime, version history. `[VERIFIED]`
- **Context7 `/vercel/next.js`** — `NextResponse.next({ request: { headers } })` pattern; `headers()` async read in a Server Component reading middleware-set headers; `version-16.mdx` upgrade guide (middleware→proxy, no edge in proxy); `caching.mdx` (runtime APIs defer to request time / Suspense for static shell); `force-static`. `[VERIFIED / CITED]`
- `.planning/research/ARCHITECTURE.md` Q5 + Anti-Patterns 2/3 + Pattern 3 hydration audit — milestone-level analysis that independently derived this exact middleware-header approach. `[CITED — HIGH, verified against Next 16 docs]`
- `.planning/STATE.md` (locked decision), `.planning/REQUIREMENTS.md` (LOCALE-01), `.planning/ROADMAP.md` (Phase 11 detail), `.planning/phases/10-ssr-content-fix/10-RESEARCH.md` + `10-VALIDATION.md` (validation pattern, hydration context, `suppressHydrationWarning` status).

### Secondary (MEDIUM confidence)
- None requiring attribution beyond the above.

### Tertiary (LOW confidence)
- A1 (dynamic-API-in-layout does not force page routes dynamic in THIS project) — general App Router behavior, **not yet measured against this project's `next build`**; flagged as the phase's first validation step.

## Metadata

**Confidence breakdown:**
- Transport mechanism (proxy header set + layout read): HIGH — both APIs verified verbatim against Next.js v16.2.9 official docs and Context7, plus the `request: { headers }` vs response-header distinction is explicitly called out.
- Middleware-location bug: HIGH — verified against the official file-location requirement AND a direct directory listing proving `src/` contains only `app/`.
- Dynamic-rendering tradeoff (PERF-01): MEDIUM-HIGH on the mechanism (headers() is a dynamic API — verified), MEDIUM on the project-specific outcome (whether page routes stay static — must be measured at build time; flagged A1/OQ-1).
- Hydration safety: HIGH — `lang` is request-fixed and not client-recomputed; `suppressHydrationWarning` already present and staying.

**Research date:** 2026-06-15
**Valid until:** Stable until Next.js minor/major upgrade changes the proxy convention or `headers()` semantics, or until the referenced codebase files change. Effectively valid for Phase 11 execution.
