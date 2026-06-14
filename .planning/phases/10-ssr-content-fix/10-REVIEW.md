---
phase: 10-ssr-content-fix
reviewed: 2026-06-14T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - my-app/src/app/[lang]/ClientPage.tsx
  - my-app/src/app/components/Hero.tsx
  - my-app/src/app/components/Footer.tsx
  - my-app/src/app/i18n/getPortfolioData.ts
  - my-app/src/app/i18n/portfolio.types.ts
  - my-app/public/locales/en/common.json
  - my-app/public/locales/es/common.json
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-06-14
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Phase 10 migrated `Hero`, `Footer`, and `ClientPage` off the async i18next chain, removed the
`LangLoader` spinner gate, renamed the JSON key `CV` -> `cv`, and added a `cv: string` field to
`PortfolioData`. The CV-key rename + type addition are correct and coupled (the `as unknown as`
cast would otherwise hide a runtime `undefined`). The spinner-gate removal in `ClientPage` is clean.

No BLOCKER-class issues (no injection, no secrets, no crash-on-load, no auth surface). However, the
phase narrative claims a "synchronous server-safe `getPortfolioData(lang)` accessor" migration — and
the actually-shipped consumers (`Hero`, `Footer`) do **not** use it. They still call the
`"use client"` hook `usePortfolioData`. `getPortfolioData.ts` is shipped but imported by zero files.
Per the plan summary this is a *documented* deferral (intended for Server Components in phases
11-16), so it is reported as Info, not a defect — but reviewers/consumers should not read this phase
as "components now use the server accessor." They do not.

The substantive concerns are robustness around the un-validated `as unknown as PortfolioData` cast
(a missing/renamed `cv` produces a broken `href` with no fallback in `Footer`), an HTML attribute
conflict on the CV anchor, and code duplication between the two accessor modules.

## Warnings

### WR-01: `Footer` renders a broken `href` if `cv` is missing — no fallback (asymmetric with `Hero`)

**File:** `my-app/src/app/components/Footer.tsx:23`
**Issue:** `data` is produced by `usePortfolioData`, which casts raw JSON via `as unknown as
PortfolioData` (see `usePortfolioData.ts:7-10` / `getPortfolioData.ts:6-8`). That cast performs **no
runtime validation** — if a locale JSON is missing `cv` (exactly the failure mode the `CV`->`cv`
rename was meant to prevent, and which can recur on the next JSON edit), `data.cv` is `undefined`.
`Footer` passes it straight through:
```ts
{ label: "CV", href: data.cv, external: true },
```
React renders `href={undefined}` as a missing attribute (anchor points to the current page), or
`href=""` if it ever becomes an empty string — a silently broken CV link. Note `Hero` already
guards this exact value with `cvLink={data.cv}` then `href={cvLink ?? "#"}` (Hero.tsx:167). `Footer`
is asymmetric and has no guard.
**Fix:**
```ts
{ label: "CV", href: data.cv ?? "#", external: true },
```
(Or, better, validate `cv` once in the accessor and fall back to the `en` value.)

### WR-02: `download` + `target="_blank"` on the CV anchor is a conflicting attribute combination

**File:** `my-app/src/app/components/Hero.tsx:166-175`
**Issue:** The CV link sets both `download` and `target="_blank"`:
```tsx
<a href={cvLink ?? "#"} download target="_blank" rel="noopener noreferrer" ...>
```
The `download` attribute is **ignored** by browsers when the resource is cross-origin, and its
interaction with `target="_blank"` is inconsistent across browsers — some open the PDF in a new tab
(ignoring `download`), some download. The intent ("Download CV") is therefore not reliably honored.
Additionally, when `cvLink` falls back to `"#"`, `download` on `href="#"` attempts to "download" the
current page. The asset is same-origin (`/cv/...pdf`), so `download` will usually win, but the
combination is contradictory and should be resolved deliberately.
**Fix:** Pick one behavior. For a forced download, drop `target`/`rel`:
```tsx
<a href={cvLink ?? "#"} download className="btn bg-transparent">
```
For open-in-new-tab preview, drop `download`. Keep `rel="noopener noreferrer"` only if `target="_blank"` stays.

### WR-03: `usePortfolioData` / `getPortfolioData` duplicate the `LOCALES` map and cast — divergence risk

**File:** `my-app/src/app/i18n/getPortfolioData.ts:5-12` (and `usePortfolioData.ts:7-14`)
**Issue:** Both modules independently declare the identical `LOCALES` record and the identical
`as unknown as PortfolioData` cast over the same two JSON imports. They differ only in the
`"use client"` directive and the return shape (`PortfolioData` vs `{ data, ready: true }`). When the
locale set, the cast strategy, or the fallback (`?? LOCALES.en`) changes, both must be edited in
lockstep; missing one produces a silent client/server data-shape divergence. This is the kind of
duplication an SSR/CSR boundary makes especially dangerous.
**Fix:** Extract the shared map + cast into one internal module and have both entry points consume it:
```ts
// portfolio-data.internal.ts (no "use client")
export const LOCALES: Record<string, PortfolioData> = {
  en: en as unknown as PortfolioData,
  es: es as unknown as PortfolioData,
};
export const resolvePortfolio = (lng: string): PortfolioData => LOCALES[lng] ?? LOCALES.en;
```
Then `getPortfolioData` returns `resolvePortfolio(lang)` and `usePortfolioData` returns
`{ data: resolvePortfolio(lng), ready: true }`.

### WR-04: `ready` flag is now dead/always-true — guards are misleading and the spinner gate's twin still exists

**File:** `my-app/src/app/components/Hero.tsx:26`, `my-app/src/app/components/Footer.tsx:18`
**Issue:** `usePortfolioData` now hardcodes `ready: true` (usePortfolioData.ts:14), so
`if (!ready || !data) return null;` can never short-circuit on `!ready`, and `data` is never null
either (the `?? LOCALES.en` fallback guarantees a value). These guards are dead branches that
imply an async/loading state that no longer exists — a maintenance trap (a future reader may "fix"
the data layer assuming this null path is live). The spinner gate was removed from `ClientPage` but
its conceptual twin (the always-false readiness guard) was left behind in the leaf components.
**Fix:** Drop the now-unreachable guard, or if you want defensive coding, narrow it to the only real
risk (`data` shape), and remove the `ready` channel from the hook's return type entirely so callers
stop branching on a constant:
```ts
// usePortfolioData.ts
export function usePortfolioData(lng: string) {
  return { data: LOCALES[lng] ?? LOCALES.en };
}
```
Then in components: `const { data } = usePortfolioData(lang);` with no `!ready` branch.

## Info

### IN-01: Phase narrative vs. shipped reality — `getPortfolioData` is imported by zero files

**File:** `my-app/src/app/i18n/getPortfolioData.ts:10`
**Issue:** The phase is described as migrating components to "a synchronous server-safe
`getPortfolioData(lang)` accessor," but a repo-wide grep shows `getPortfolioData` is referenced only
at its own definition — no consumer imports it. The actual migrated consumers (`Hero`, `Footer`,
plus `About`, `Contact`, `Experience`, `FeaturedWork`, `ProjectsGrid`, `StackSection`) all still use
the `"use client"` hook `usePortfolioData`. Per `10-01-SUMMARY.md` this is an intentional deferral
(the accessor exists for future Server Components in phases 11-16), so it is **not** a defect —
flagged so downstream readers don't assume the SSR data path runs through `getPortfolioData` today.
It does not; it is currently dead-but-reserved code.
**Fix:** None required for this phase. Track that `getPortfolioData` has no consumer until phase 11+,
or add a one-line doc comment marking it reserved-for-server-components to prevent a future
"unused export" cleanup from deleting it.

### IN-02: `as unknown as PortfolioData` defeats type checking on every locale edit

**File:** `my-app/src/app/i18n/getPortfolioData.ts:6-7`, `portfolio.types.ts:222-236`
**Issue:** Casting via `as unknown as PortfolioData` tells TypeScript to trust the JSON blindly.
The `CV`->`cv` bug this phase fixed is the textbook symptom: TS could not catch the mismatch because
the cast erased the check. The JSON also contains keys not in the interface (`nav`, `form`,
`about-me`, `proyects`) — harmless now, but the cast means any *required* field silently dropped in a
future edit becomes a runtime `undefined` with zero compile-time signal.
**Fix:** Replace the double-cast with `satisfies` against the typed import (TS validates structurally
while keeping the literal type), or add a lightweight runtime check in dev:
```ts
import en from "...common.json";
const LOCALES = { en, es } satisfies Record<string, PortfolioData>;
```
(`resolveJsonModule` must be on; `satisfies` will then flag missing required fields at compile time.)

### IN-03: Locale lookup is case-sensitive; middleware normalizes but the accessor does not

**File:** `my-app/src/app/i18n/getPortfolioData.ts:11` (and `usePortfolioData.ts:13`)
**Issue:** `LOCALES[lang] ?? LOCALES.en` is an exact-key match. `lang` originates from the URL
segment (`page.tsx:13`). Today `middleware.ts` only ever writes `"en"`/`"es"`, so this is safe — but
the accessor itself makes no guarantee: a direct hit to `/EN` or `/En` (or a future routing change)
would silently fall back to English rather than matching. The `?? LOCALES.en` fallback masks the
miss, so it would never surface as an error.
**Fix:** Normalize before lookup so the accessor is self-defending:
```ts
return LOCALES[lang?.toLowerCase()] ?? LOCALES.en;
```

### IN-04: `FooterLink` / `HeroSectionProps` define optional/unused shape fields after the migration

**File:** `my-app/src/app/components/Footer.tsx:7-11`, `my-app/src/app/components/Hero.tsx:17-22`
**Issue:** `FooterLink.external` is the only optional field still meaningful; fine. But
`HeroSectionProps.cvLink?: string` is now always supplied (`Hero.tsx:32`) from a value that is itself
always present post-cast, so the optionality is vestigial and pairs with the `?? "#"` fallback to
imply a nullability that the data layer no longer produces. Minor consistency smell, not a bug.
**Fix:** Either keep `cvLink?` and the `?? "#"` guard as genuine defense (preferred, given the
un-validated cast — see IN-02/WR-01), or make `cvLink: string` required and drop the fallback. Pick
one and apply it symmetrically with `Footer` (WR-01).

---

_Reviewed: 2026-06-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
