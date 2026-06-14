# Phase 10: SSR Content Fix - Research

**Researched:** 2026-06-14
**Domain:** Next.js 16 App Router SSR — removing an async i18next gate that blocks server-rendered content
**Confidence:** HIGH

## Summary

This phase removes the single bug that makes the portfolio invisible to crawlers: `ClientPage.tsx` gates its entire `<main>` tree behind `useTranslation(lang, "common").ready`, which is a `useState(false)` that only flips to `true` inside a `useEffect` — a hook that legitimately never resolves during SSR. The server-rendered HTML for both `/en` and `/es` is therefore just `<LangLoader/>`'s spinner markup, with zero text content.

The fix is mechanical and low-risk because `usePortfolioData(lang)` — the data hook already used by 9 of 11 components — is a **plain synchronous function** (`LOCALES[lng] ?? LOCALES.en`, static JSON imports, `ready: true` always). It is hydration-safe and SSR-safe today; only `Hero.tsx` and `Footer.tsx`'s `t("CV")` calls and `ClientPage.tsx`'s `!ready` gate still depend on the async i18next chain. This phase: (1) removes the gate from `ClientPage.tsx`, (2) migrates `Hero.tsx`/`Footer.tsx`'s CV link reads from `t("CV")` to a typed `data.cv` field sourced from `usePortfolioData`, (3) creates a new server-safe `getPortfolioData(lang)` accessor (no `"use client"`) that future phases (11-16) will use for `generateMetadata`/JSON-LD/OG images, (4) deletes the now-dead i18next modules (`i18n/client.ts`, `i18n/index.ts`, `ui/LangLoader.tsx`, and `i18n/__assert.ts` which itself imports the deleted modules' sibling JSON pattern), and (5) removes `i18next`, `react-i18next`, `i18next-resources-to-backend` from `package.json`.

**Primary recommendation:** Do the type/data change first (add `cv: string` to `Identity` + create `getPortfolioData.ts`), then edit `Hero.tsx`/`Footer.tsx`/`ClientPage.tsx` in any order (independent files), then delete the dead i18n files (verify zero remaining imports via grep), then remove the 3 npm deps, then validate with `next build && next start` + console check on both locales. No intermediate broken state is required — each file edit is self-contained.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Portfolio content (text, CV link, stack, etc.) | Browser/Client (rendered by `"use client"` components) | API/Backend — N/A, static JSON | Content originates from `public/locales/{lang}/common.json`, statically imported at build time; both client components (via `usePortfolioData`) and future server code (via `getPortfolioData`) read the SAME bundled JSON — no runtime fetch |
| Initial HTML render (SSR output for crawlers) | Frontend Server (SSR) | — | `"use client"` components ARE server-rendered for the initial HTML in the App Router; this phase removes the only blocker (`useTranslation().ready`) preventing that SSR output from containing real content |
| Server-safe data accessor (`getPortfolioData`) | Frontend Server (SSR) | — | New module with NO `"use client"` — callable from `generateMetadata`, JSON-LD `<script>`, and `opengraph-image.tsx` in later phases (11-16); this phase creates it as a foundation, even though phase 10 itself doesn't consume it from a Server Component yet |
| Locale routing (`/en`, `/es`) | Frontend Server (SSR) | Browser/Client | `[lang]` route segment param, threaded via `params` into `page.tsx` → `ClientPage` prop; unchanged by this phase |
| i18next runtime (async translation loading) | Browser/Client (REMOVED) | — | Entirely deleted — was the ONLY client-side async gate blocking SSR content; no replacement needed because `usePortfolioData`/`getPortfolioData` already cover all content needs synchronously |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SSR-01 | A crawler/bot (no JS execution) receives fully-rendered portfolio content in initial HTML on both `/en` and `/es` — never a spinner-only response | Pattern 1 (gate removal) — removing `!ready` early-return in `ClientPage.tsx` is the entire fix; `usePortfolioData` already SSR-safe (Pattern 3 hydration audit) |
| SSR-02 | A server-safe `getPortfolioData(lang)` accessor provides portfolio content to server code (metadata, JSON-LD, OG image) without a `"use client"` boundary, as the single source of truth shared with the client | Pattern 2 (new file `app/i18n/getPortfolioData.ts`) — plain sync function mirroring `usePortfolioData`'s `LOCALES` map, no `"use client"` directive |
| SSR-03 | i18next (`i18next`, `react-i18next`, `i18next-resources-to-backend`) and `LangLoader` are removed with zero translation loss and zero hydration errors (`next build && next start`, console clean on both locales) | Pattern 1 (file deletions + dependency removal) + Pitfall 1 (hydration audit — confirms no NEW hydration risk is introduced) |
</phase_requirements>

## Standard Stack

### Core

No new libraries are introduced in this phase — it is a pure removal/refactor using existing Next.js 16 / React 19 primitives already in the project.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.2.6 (installed) | App Router SSR, static JSON module imports | Already in use; `"use client"` components are server-rendered for initial HTML — confirmed Next.js App Router behavior `[CITED: Next.js docs via milestone ARCHITECTURE.md research]` |
| react | ^19.2.6 (installed) | Component rendering, hooks | Already in use; no version change needed |
| typescript | (via @types/react ^19.2.14) | Type-checking `Identity`/`PortfolioData` shape changes | Already in use |

### Supporting

None — no supporting libraries needed for this phase.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Deleting i18next entirely | Keep i18next but make `useTranslation` synchronous (e.g., suspense-based) | Rejected — `usePortfolioData` already covers 100% of i18next's remaining use case (the CV link string); keeping i18next for ONE string is unjustified complexity and directly contradicts SSR-03's "remove with zero translation loss" requirement |
| `getPortfolioData(lang)` as new standalone module | Export a non-`"use client"` function from `usePortfolioData.ts` itself (remove the directive) | Rejected — `usePortfolioData.ts` is imported by `"use client"` components (`Hero`, `Footer`, `ClientPage`, etc.); removing `"use client"` from it doesn't change correctness (data hooks with no React state work fine either way) but the milestone research (Pitfall 3) explicitly recommends a SEPARATE module so Server Components (future `generateMetadata`/JSON-LD in phase 13) have an unambiguous, dedicated import path that's never bundled into client chunks unnecessarily |

**Installation:**
No installation needed for additions. Removal only:
```bash
npm uninstall i18next react-i18next i18next-resources-to-backend
```

**Version verification:** N/A — no new packages. Verified current installed versions of the packages being REMOVED (for the audit table below):
```
i18next: 26.3.1 (registry latest; installed range ^24.2.3 per package.json)
react-i18next: 17.0.8 (registry latest; installed range ^15.4.1)
i18next-resources-to-backend: 1.2.1 (registry latest; installed range ^1.2.1, matches)
```
`[VERIFIED: npm registry — npm view <pkg> version]` — confirms these packages exist and are installed; irrelevant to recommendation since they are being removed, not added.

## Package Legitimacy Audit

> This phase **removes** npm packages and adds **zero** new dependencies — the Package Legitimacy Gate (slopcheck, registry verification) applies to NEW package installs and is not applicable here.

| Package | Action | Notes |
|---------|--------|-------|
| `i18next` | REMOVE | Confirmed present in `my-app/package.json` dependencies (`^24.2.3`) and `src/app/i18n/index.ts` |
| `react-i18next` | REMOVE | Confirmed present (`^15.4.1`), used only via `initReactI18next` in `src/app/i18n/index.ts` |
| `i18next-resources-to-backend` | REMOVE | Confirmed present (`^1.2.1`), used only in `src/app/i18n/index.ts` |

**Packages removed due to slopcheck [SLOP] verdict:** none (not applicable — no install)
**Packages flagged as suspicious [SUS]:** none (not applicable — no install)

**Verification command for the removal task:**
```bash
npm uninstall i18next react-i18next i18next-resources-to-backend
```
After running, confirm via `npm ls i18next react-i18next i18next-resources-to-backend` that all three report "not found" (exit non-zero / empty), and confirm `package.json`'s `dependencies` block no longer lists them.

## Architecture Patterns

### System Architecture Diagram

```
BEFORE (broken — this phase fixes)
─────────────────────────────────────
GET /en or /es
    │
    ▼
app/[lang]/page.tsx (Server Component)
    │  generateStaticParams() → en, es
    │  renders <ClientPage lang={lang}>
    ▼
app/[lang]/ClientPage.tsx ("use client", SSR'd)
    │
    │  useTranslation(lang, "common")
    │    └─ useState(false) "ready"
    │    └─ useEffect → initI18next().then(() => setReady(true))
    │         ▲ never resolves during SSR (async, effect-gated)
    │
    │  if (!ready) return <LangLoader/>   ◄── SSR OUTPUT STOPS HERE
    │
    └─ (unreachable during SSR) <main> Nav, Hero, About, ... </main>
    ▼
Initial HTML response: ONLY <LangLoader/> spinner markup
    │
    ▼
Client hydration → useEffect resolves → ready=true → re-render <main> tree
    (crawlers/bots without JS execution NEVER see this)


AFTER (this phase)
─────────────────────────────────────
GET /en or /es
    │
    ▼
app/[lang]/page.tsx (Server Component) — UNCHANGED
    │  renders <ClientPage lang={lang}>
    ▼
app/[lang]/ClientPage.tsx ("use client", SSR'd)
    │
    │  NO useTranslation, NO ready gate
    │
    └─ <main>
         Nav(lang) ─┐
         Hero(lang) │  each calls usePortfolioData(lang)
         About(lang)│   → LOCALES[lang] ?? LOCALES.en   (sync static import)
         ...        │   → { data, ready: true }  (ready always true)
         Footer(lang)┘
       </main>
    ▼
Initial HTML response: FULL content — all section text, CV link (data.cv),
                        crawlable, no spinner
    ▼
Client hydration: identical tree (no mismatch — usePortfolioData returns
                   the same value SSR and CSR, see Pitfall: Hydration Audit)


NEW (foundation for phases 11-16, created but not yet consumed by Server
     Components in phase 10 itself)
─────────────────────────────────────
app/i18n/getPortfolioData.ts  (NO "use client")
    │  same LOCALES map pattern as usePortfolioData
    │  plain function: getPortfolioData(lang) → PortfolioData
    │
    ├─ usable from: generateMetadata (phase 13)
    ├─ usable from: JSON-LD <script> (phase 13)
    └─ usable from: opengraph-image.tsx (phase 14)
```

### Recommended Project Structure

```
my-app/src/app/
├── [lang]/
│   ├── ClientPage.tsx          # MODIFIED — remove useTranslation + LangLoader gate
│   ├── layout.tsx               # unchanged in this phase
│   └── page.tsx                 # unchanged
├── components/
│   ├── Hero.tsx                 # MODIFIED — t("CV") → data.cv
│   └── Footer.tsx                # MODIFIED — t("CV") → data.cv, simplify FALLBACK_LINKS
├── i18n/
│   ├── usePortfolioData.ts       # unchanged (already SSR-safe)
│   ├── getPortfolioData.ts       # NEW — server-safe sync accessor, no "use client"
│   ├── portfolio.types.ts        # MODIFIED — add `cv: string` to Identity
│   ├── client.ts                 # DELETED
│   ├── index.ts                  # DELETED
│   └── __assert.ts                # DELETED (imports same JSON pattern, now redundant —
│                                   #   getPortfolioData.ts supersedes its type-check role)
├── ui/
│   └── LangLoader.tsx            # DELETED
└── i18n-config.ts                # unchanged
```

### Pattern 1: Remove the spinner gate (resolves SSR-01, SSR-03)

**What:** `ClientPage.tsx` stops importing `useTranslation` and `LangLoader`, stops calling `useTranslation(lang, "common")`, and stops the `if (!ready) return <LangLoader/>` early return. The component body becomes an unconditional render of `<main>`.

**When to use:** This is the core fix — apply now.

**Example — current code (to be removed):**
```tsx
// Source: my-app/src/app/[lang]/ClientPage.tsx (current, lines 1-21)
"use client";

import LangLoader from "../ui/LangLoader";
import { useTranslation } from "../i18n/client";
// ... other imports unchanged

function ClientPage({ lang = "en" }: ClientPageProps) {
  const { ready } = useTranslation(lang, "common");
  if (!ready) return <LangLoader />;
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      ...
```

**Example — target code:**
```tsx
// Source: derived from my-app/src/app/[lang]/ClientPage.tsx
"use client";

import Nav from "../components/Nav";
import Hero from "../components/Hero";
import FeaturedWork, { StackTicker } from "../components/FeaturedWork";
import ProjectsGrid from "../components/ProjectsGrid";
import StackSection from "../components/StackSection";
import Experience from "../components/Experience";
import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

interface ClientPageProps {
  lang?: string;
}

function ClientPage({ lang = "en" }: ClientPageProps) {
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Nav lang={lang} />
      <Hero lang={lang} />
      <StackTicker />
      <About lang={lang} />
      <FeaturedWork lang={lang} />
      {/* <ProjectsGrid lang={lang} /> */}
      <StackSection lang={lang} />
      <Experience lang={lang} />
      <Contact lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}

export default ClientPage;
```

Keep `"use client"` — it remains the correct boundary for Hero's voxel animation, framer-motion, and theme context consumers. `"use client"` does NOT prevent SSR `[CITED: milestone ARCHITECTURE.md Pattern 3, verified against Next.js App Router docs]`.

### Pattern 2: Add `cv: string` to `Identity` + create `getPortfolioData.ts` (resolves SSR-02)

**What:** Two coordinated changes to the data layer, done FIRST (prerequisite for Pattern 3).

**Step 2a — extend `portfolio.types.ts`:**

The `"CV"` key sits at the TOP LEVEL of `common.json` (sibling of `identity`, `hero`, `nav`, etc. — confirmed via direct read: `public/locales/en/common.json` line 7 is `"CV": "/cv/FULLSTACK-TOMAS_PEREZ_en.pdf"`, OUTSIDE the `"identity": {...}` block which starts at line 36). Both `en` and `es` JSON files have this identical top-level shape — `[VERIFIED: codebase — public/locales/en/common.json, public/locales/es/common.json]`.

Add a top-level `cv: string` field to `PortfolioData` (matching the JSON's actual top-level shape — do NOT nest it inside `Identity`, since the JSON doesn't nest it there):

```typescript
// Source: my-app/src/app/i18n/portfolio.types.ts — add to PortfolioData interface
export interface PortfolioData {
  identity: Identity;
  hero: HeroCopy;
  cv: string;                    // NEW — top-level, matches JSON shape ("CV" key)
  sections: SectionLabels;
  sectionHeaders: SectionHeaders;
  featuredViewLabel: string;
  featured: readonly FeaturedProject[];
  projects: readonly GridProject[];
  stack: StackCategories;
  experience: readonly ExperienceEntry[];
  about: AboutCopy;
  contact: ContactCopy;
  footer: FooterCopy;
}
```

**Important note on JSON key casing:** the JSON key is `"CV"` (uppercase), but TypeScript interface fields conventionally use lowercase/camelCase (`cv`). Since `common.json` is imported `as unknown as PortfolioData` (a type assertion, not runtime validation — confirmed in `usePortfolioData.ts` line 8: `en as unknown as PortfolioData`), there is a **mismatch between the asserted type's `cv` field and the actual JSON's `CV` field**. Two options:

- **(a) Rename the JSON key** from `"CV"` to `"cv"` in both `public/locales/en/common.json` and `public/locales/es/common.json` — clean, but touches content files (low risk, single key rename, both locales).
- **(b) Keep JSON key as `"CV"`, type field as `cv`, and read via `(data as any).CV` or a small runtime remap inside `getPortfolioData`/`usePortfolioData`** — avoids touching JSON, but creates a permanent type/runtime mismatch (`as unknown as PortfolioData` already hides type errors here, so TypeScript won't catch a typo).

**Recommendation: (a)** — rename `"CV"` → `"cv"` in both JSON files. This is a 1-line change per file, eliminates the type/runtime mismatch permanently, and is exactly the kind of "do it right since we're already touching this" cleanup the milestone research flags. Verify no OTHER code reads `data.CV` or `t("CV")` besides `Hero.tsx`/`Footer.tsx` (confirmed via grep — only those two files + the two JSON files reference `"CV"`/`t("CV")`).

**Step 2b — create `app/i18n/getPortfolioData.ts`:**

```typescript
// Source: derived from my-app/src/app/i18n/usePortfolioData.ts (no "use client")
import en from "../../../public/locales/en/common.json";
import es from "../../../public/locales/es/common.json";
import type { PortfolioData } from "./portfolio.types";

const LOCALES: Record<string, PortfolioData> = {
  en: en as unknown as PortfolioData,
  es: es as unknown as PortfolioData,
};

export function getPortfolioData(lang: string): PortfolioData {
  return LOCALES[lang] ?? LOCALES.en;
}
```

This is intentionally a near-duplicate of `usePortfolioData`'s `LOCALES` map, MINUS the `"use client"` directive and the `ready` field (always `true`, so callers don't need it). Both modules statically import the SAME two JSON files — Next.js/webpack dedupes identical static imports across modules in the bundle graph, so this does not double the JSON payload `[ASSUMED — standard bundler behavior, not independently re-verified for this Next.js version in this session]`.

`usePortfolioData.ts` itself is left UNCHANGED in this phase (per milestone ARCHITECTURE.md: "Unchanged — already does static JSON import, already SSR-safe"). It remains the `"use client"` entry point for `Hero`, `Footer`, `ClientPage`, etc. `getPortfolioData.ts` is additive — a new sibling module for future Server Component consumers (phases 11-16).

### Pattern 3: Migrate `Hero.tsx` and `Footer.tsx` off `t("CV")` (resolves SSR-01, SSR-03)

**What:** Remove `useTranslation` import and the `t("CV")` calls; read the CV path from `usePortfolioData`'s `data.cv` (after Pattern 2's type/JSON change).

**`Hero.tsx` — current (lines 1-38):**
```tsx
// Source: my-app/src/app/components/Hero.tsx (current)
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Identity, HeroCopy } from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { useTranslation } from "../i18n/client";          // ← REMOVE
import { VOXEL_STATES } from "./voxel-states";

export default function Hero({ lang, showStatus = true }: { lang: string; showStatus?: boolean }) {
  const { data, ready } = usePortfolioData(lang);
  const { t } = useTranslation(lang, "common");            // ← REMOVE
  if (!ready || !data) return null;
  const { statusLine, statusLineShort, location, timezone, tagline, tagHighlight, tagTrailing } = data.identity;
  return (
    <HeroSection
      data={{ statusLine, statusLineShort, location, timezone, tagline, tagHighlight, tagTrailing }}
      hero={data.hero}
      cvLink={t("CV")}                                       // ← CHANGE to data.cv
      showStatus={showStatus}
    />
  );
}
```

**`Hero.tsx` — target (only the outer `Hero` function changes; `HeroSection` and below are untouched):**
```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Identity, HeroCopy } from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { VOXEL_STATES } from "./voxel-states";

export default function Hero({ lang, showStatus = true }: { lang: string; showStatus?: boolean }) {
  const { data, ready } = usePortfolioData(lang);
  if (!ready || !data) return null;
  const { statusLine, statusLineShort, location, timezone, tagline, tagHighlight, tagTrailing } = data.identity;
  return (
    <HeroSection
      data={{ statusLine, statusLineShort, location, timezone, tagline, tagHighlight, tagTrailing }}
      hero={data.hero}
      cvLink={data.cv}
      showStatus={showStatus}
    />
  );
}
```

**`Footer.tsx` — current (lines 1-33):**
```tsx
// Source: my-app/src/app/components/Footer.tsx (current)
"use client";
import { m, useReducedMotion } from "framer-motion";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { useTranslation } from "../i18n/client";           // ← REMOVE
import { noMotion, sectionReveal } from "./_animations";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const GITHUB_URL = "https://github.com/Pelucheado";
const FALLBACK_LINKS: readonly FooterLink[] = [             // ← dead code, see below
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Email", href: "#" },
  { label: "CV", href: "#" },
];

export default function Footer({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  const { t } = useTranslation(lang, "common");             // ← REMOVE
  const reduce = useReducedMotion();
  const links: readonly FooterLink[] = !ready || !data
    ? FALLBACK_LINKS
    : [
        { label: "GitHub", href: GITHUB_URL, external: true },
        { label: "LinkedIn", href: `https://${data.identity.linkedin}`, external: true },
        { label: "Email", href: `mailto:${data.identity.email}` },
        { label: "CV", href: t("CV"), external: true },     // ← CHANGE to data.cv
      ];
```

**`Footer.tsx` — target:**
```tsx
"use client";
import { m, useReducedMotion } from "framer-motion";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { noMotion, sectionReveal } from "./_animations";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const GITHUB_URL = "https://github.com/Pelucheado";

export default function Footer({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  const reduce = useReducedMotion();
  if (!ready || !data) return null;
  const links: readonly FooterLink[] = [
    { label: "GitHub", href: GITHUB_URL, external: true },
    { label: "LinkedIn", href: `https://${data.identity.linkedin}`, external: true },
    { label: "Email", href: `mailto:${data.identity.email}` },
    { label: "CV", href: data.cv, external: true },
  ];
  // ... rest of JSX unchanged
```

**Note on `FALLBACK_LINKS` removal:** `usePortfolioData` ALWAYS returns `ready: true` and `data` is NEVER null (`LOCALES[lng] ?? LOCALES.en` always resolves to a value) — so the `!ready || !data` branch was already dead code. The milestone research (ARCHITECTURE.md Pattern 2, step 3) flags this as "cleanup, not required for the SSR fix." **Recommendation for this phase: remove `FALLBACK_LINKS` and the `!ready || !data` ternary** while editing this file anyway (the `if (!ready || !data) return null;` early-return pattern, mirroring `Hero.tsx`, is simpler and consistent) — since the file is already being edited for the `t("CV")` removal, doing this cleanup in the SAME edit avoids a separate "dead code cleanup" task later. This is a Claude's-discretion call with no CONTEXT.md objection (no CONTEXT.md exists for this phase).

### Pattern 4: Delete dead i18n modules — `__assert.ts` MUST be inspected first

**What:** Delete `app/i18n/client.ts`, `app/i18n/index.ts`, `app/ui/LangLoader.tsx`, and `app/i18n/__assert.ts`.

**`__assert.ts` inspection result (read directly):**
```typescript
// Source: my-app/src/app/i18n/__assert.ts (current, full file)
import en from "../../../public/locales/en/common.json";
import es from "../../../public/locales/es/common.json";
import type { PortfolioData } from "./portfolio.types";

const _en: PortfolioData = en as unknown as PortfolioData;
const _es: PortfolioData = es as unknown as PortfolioData;

void _en;
void _es;
```

**Finding:** `__assert.ts` does NOT import from `i18n/client.ts` or `i18n/index.ts` — it imports the SAME two JSON files as `usePortfolioData.ts` and asserts they conform to `PortfolioData` (a compile-time-only type-check file; `void _en`/`void _es` exist purely to avoid "unused variable" lint errors). It is **independent of the i18next chain** and was likely a standalone type-safety guard.

**Decision:** `__assert.ts` is now FULLY REDUNDANT once `getPortfolioData.ts` exists (Pattern 2) — `getPortfolioData.ts` performs the exact same `as unknown as PortfolioData` assertion on the exact same two JSON files, as part of its normal operation (not a separate assert-only file). Recommend **deleting `__assert.ts`** in this phase as part of the i18n module cleanup — its type-checking role is subsumed by `getPortfolioData.ts` (if the JSON shape ever drifts from `PortfolioData`, `getPortfolioData.ts` would fail to typecheck the same way `__assert.ts` did, with zero loss of safety and one less file).

**Verification before deleting `client.ts`/`index.ts`/`LangLoader.tsx`:** after Patterns 1 and 3 are applied, run:
```bash
grep -rn "i18n/client\|i18n/index\|LangLoader\|i18next" my-app/src/ --include="*.tsx" --include="*.ts"
```
Expected result: ZERO matches (all four files listed in `i18n-config.ts`'s import or `i18next` package imports should be gone — note `i18n-config.ts` itself, which defines `i18n.locales`/`defaultLocale`/`fallbackLng`, is UNCHANGED and NOT part of this deletion; it's consumed by `app/[lang]/page.tsx`'s `generateStaticParams` and is unrelated to the i18next runtime).

### Anti-Patterns to Avoid

- **Removing `"use client"` from `ClientPage`/`Hero`/`Footer` to "make them SSR":** `"use client"` does NOT block SSR. These components are ALREADY server-rendered for initial HTML; the ONLY blocker was the `useTranslation().ready` gate. Removing `"use client"` would break framer-motion/voxel/theme-context interactivity for zero SEO benefit `[CITED: milestone ARCHITECTURE.md Anti-Pattern 1]`.
- **Setting `<html lang>` or any locale-dependent value via client-side `useEffect`:** out of scope for THIS phase (owned by Phase 11/LOCALE-01), but do not introduce any new `useEffect`-based locale logic while touching these files.
- **Cargo-culting `await` onto `getPortfolioData()`:** it is a synchronous JSON read with no I/O. Do not make it `async` "to match `generateMetadata`'s async signature" — that's unnecessary microtask overhead and contradicts PERF-01 (static rendering).
- **Leaving `__assert.ts` in place "just in case":** it becomes dead weight once `getPortfolioData.ts` exists — same assertion, same files, redundant file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale-aware data access for server code | A new i18n library, a fetch-based content API, or a "translation service" abstraction | `getPortfolioData(lang)` — plain function over static JSON imports | The content is static, bundled JSON; a sync function is the entire solution. Any abstraction beyond `LOCALES[lang] ?? LOCALES.en` is over-engineering for a 2-locale static site |
| "Ready" state for content availability | A loading/ready state machine for `getPortfolioData`/`usePortfolioData` | Nothing — both ALWAYS return `ready: true` / a non-null object | The data is in the bundle at build time; there is no async boundary to represent |

**Key insight:** This phase's entire complexity is "stop pretending data loading is async when it isn't." Both `usePortfolioData` (existing) and `getPortfolioData` (new) are correct precisely because they do NOT model loading states.

## Common Pitfalls

### Pitfall 1: Spinner-gate removal surfaces latent hydration mismatches for the first time

**What goes wrong:** Today, `<LangLoader/>` renders during SSR and the FULL `<main>` tree only renders client-side after `ready` flips to `true` — so any hydration mismatch inside `Nav`/`Hero`/`About`/`Contact`/etc. is currently INVISIBLE (it's a pure client-side re-render, not a hydration diff). Once the gate is removed, the full tree hits `hydrateRoot` for the first time, and React 19 will log any server/client output mismatch to the console.

**Why it happens:** Removing a loading gate is the highest-risk operation for surfacing hydration bugs — it's the first time the "real" tree is diffed against SSR output.

**How to avoid:**
- Audited `ThemeProvider.tsx` directly (read in full this session): `useState<Theme>("dark")` initial value, `useEffect` reads `localStorage`/`matchMedia` and calls `applyTheme` (sets `data-theme` attribute directly on `document.documentElement`, NOT via React-managed JSX). React does not manage `<html data-theme>`, so there is nothing for React's hydration diff to compare — `[VERIFIED: codebase — my-app/src/app/theme/ThemeProvider.tsx, my-app/src/app/layout.tsx]` confirms the pre-hydration `<script dangerouslySetInnerHTML>` in `layout.tsx` (lines 62-67) sets `data-theme` BEFORE React hydrates, and `<html suppressHydrationWarning>` (line 58) is already present and must REMAIN.
- `Hero.tsx`'s `useState({x:-22,y:28})`, `useState(0)`, `useState(false)` (voxel state) are all hardcoded literals — identical SSR/CSR by construction. `voxelMounted` starts `false` on both server and client, and only flips via `requestAnimationFrame` inside `useEffect` — `{voxelMounted && <VoxelArt .../>}` renders nothing on server AND nothing on client's first paint. This is the correct deferred-mount pattern already in place; no change needed `[VERIFIED: codebase — my-app/src/app/components/Hero.tsx lines 41-65, 197]`.
- `usePortfolioData`/`getPortfolioData` return identical values SSR vs CSR (static JSON, `lang` from route params — not `window`/`Date.now()`/`localStorage`) — no mismatch possible.

**Warning signs:** Browser console shows "Hydration failed because the server rendered HTML didn't match the client" on `/en` or `/es` after `next build && next start`.

**Detection:** This is the PRIMARY validation step for this phase — see Validation Architecture below.

### Pitfall 2: JSON key casing mismatch (`"CV"` vs `cv`) hidden by `as unknown as PortfolioData`

**What goes wrong:** `usePortfolioData.ts`/`getPortfolioData.ts` use `en as unknown as PortfolioData` — a type ASSERTION, not validation. If `PortfolioData.cv: string` is added to the interface but the JSON key remains `"CV"` (uppercase), TypeScript will NOT catch the mismatch (the `as unknown as` cast suppresses structural checking), and `data.cv` will be `undefined` at runtime — the CV download link silently breaks (`href={undefined}` → `href="#"` fallback or broken link), with no build error.

**Why it happens:** `as unknown as X` is an escape hatch that bypasses TypeScript's structural type checking entirely — it's "trust me" syntax.

**How to avoid:** Rename the JSON key `"CV"` → `"cv"` in BOTH `public/locales/en/common.json` (line 7) and `public/locales/es/common.json` (line 7) as PART OF Pattern 2's type change — do this BEFORE or IN THE SAME COMMIT as adding `cv: string` to `PortfolioData`. After the rename, `data.cv` resolves correctly for both `usePortfolioData` and `getPortfolioData` callers.

**Warning signs:** `data.cv` is `undefined` in browser devtools / React component tree despite no TypeScript error; CV download button links to `#` or is broken.

**Detection:** After the edit, `console.log(data.cv)` (temporarily, or via browser devtools React inspector) on both `/en` and `/es` should show `/cv/FULLSTACK-TOMAS_PEREZ_en.pdf` and `/cv/FULLSTACK-TOMAS_PEREZ_es.pdf` respectively. Also covered by the curl/view-source check in Validation Architecture (the CV href should appear in SSR'd HTML).

### Pitfall 3: Deleting `i18n/client.ts`/`index.ts` before all consumers are migrated

**What goes wrong:** If `app/i18n/client.ts` or `app/i18n/index.ts` are deleted BEFORE `Hero.tsx`, `Footer.tsx`, and `ClientPage.tsx` are edited to remove their imports, the build fails immediately (`Module not found`).

**Why it happens:** Natural ordering mistake — "delete dead files first, then clean up imports" is backwards for this phase.

**How to avoid:** Strict ordering — Pattern 2 (type/data layer) → Pattern 3 (Hero/Footer edits) → Pattern 1 (ClientPage edit) → grep verification (Pattern 4) → THEN delete `client.ts`/`index.ts`/`LangLoader.tsx`/`__assert.ts` → THEN `npm uninstall`. Each step can be its own commit; the grep step is a hard gate before deletion.

**Detection:** `npm run build` fails with `Module not found: Can't resolve '../i18n/client'` (or similar) if deletion happens out of order.

## Code Examples

### Final `ClientPage.tsx` (complete)
```tsx
// Source: derived from my-app/src/app/[lang]/ClientPage.tsx, gate removed
"use client";

import Nav from "../components/Nav";
import Hero from "../components/Hero";
import FeaturedWork, { StackTicker } from "../components/FeaturedWork";
import ProjectsGrid from "../components/ProjectsGrid";
import StackSection from "../components/StackSection";
import Experience from "../components/Experience";
import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

interface ClientPageProps {
  lang?: string;
}

function ClientPage({ lang = "en" }: ClientPageProps) {
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Nav lang={lang} />
      <Hero lang={lang} />
      <StackTicker />
      <About lang={lang} />
      <FeaturedWork lang={lang} />
      {/* <ProjectsGrid lang={lang} /> */}
      <StackSection lang={lang} />
      <Experience lang={lang} />
      <Contact lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}

export default ClientPage;
```

### `getPortfolioData.ts` (complete, new file)
```typescript
// Source: derived from my-app/src/app/i18n/usePortfolioData.ts (no "use client")
import en from "../../../public/locales/en/common.json";
import es from "../../../public/locales/es/common.json";
import type { PortfolioData } from "./portfolio.types";

const LOCALES: Record<string, PortfolioData> = {
  en: en as unknown as PortfolioData,
  es: es as unknown as PortfolioData,
};

export function getPortfolioData(lang: string): PortfolioData {
  return LOCALES[lang] ?? LOCALES.en;
}
```

### JSON key rename (both locale files, line 7)
```diff
- "CV": "/cv/FULLSTACK-TOMAS_PEREZ_en.pdf",
+ "cv": "/cv/FULLSTACK-TOMAS_PEREZ_en.pdf",
```
(and the `es` equivalent with `_es.pdf`)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Async `useTranslation(lang, "common")` from `react-i18next`, gated render via `ready` flag | Synchronous static-JSON accessor (`usePortfolioData`/`getPortfolioData`), unconditional render | This phase (Phase 10) | SSR HTML now contains full page content — the entire fix for SSR-01 |
| `t("CV")` dynamic translation lookup for a single static URL string | `data.cv` direct property read from typed `PortfolioData` | This phase | One fewer i18next call site; CV link now resolves synchronously during SSR |

**Deprecated/outdated:**
- `app/i18n/client.ts` (i18next `useTranslation` wrapper) — replaced by `usePortfolioData`/`getPortfolioData`, deleted this phase
- `app/i18n/index.ts` (i18next instance initializer) — no longer needed, deleted this phase
- `app/ui/LangLoader.tsx` — no longer referenced anywhere, deleted this phase
- `app/i18n/__assert.ts` — superseded by `getPortfolioData.ts`'s equivalent type assertion, deleted this phase
- npm packages `i18next`, `react-i18next`, `i18next-resources-to-backend` — fully removed, zero remaining references after this phase

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Next.js/webpack dedupes identical static JSON imports across `usePortfolioData.ts` and `getPortfolioData.ts` (no doubled bundle payload from having two modules import the same JSON files) | Pattern 2, Standard Stack | If wrong, client bundle size could increase slightly (both locale JSONs imported twice across two modules) — low impact, would surface in Phase 16's bundle-analyzer check (PERF-03), not blocking for Phase 10's SSR-01/02/03 |
| A2 | Renaming `"CV"` → `"cv"` in both `common.json` files has no other consumers besides `Hero.tsx`/`Footer.tsx` | Pattern 2 (Pitfall 2) | If another file reads `t("CV")` or `data.CV` and isn't migrated, that link would break silently (same failure mode as Pitfall 2) — mitigated by the grep verification step already run this session (only 2 source files + 2 JSON files matched) |

**If this table is empty:** N/A — both assumptions above are LOW-risk and easily caught by the validation steps below (build output review for A1, view-source CV link check for A2).

## Open Questions

1. **Should `FALLBACK_LINKS`/`!ready || !data` dead-code removal in `Footer.tsx` be bundled into this phase's edit, or deferred as separate cleanup?**
   - What we know: it's genuinely dead code (per milestone ARCHITECTURE.md and direct codebase confirmation — `usePortfolioData` always returns `ready: true`, non-null `data`).
   - What's unclear: whether the planner wants this as part of the SAME task/commit as the `t("CV")` → `data.cv` edit, or a separate "cleanup" task.
   - Recommendation: bundle it — the file is already being edited for the CV migration, and the resulting code (early-return `if (!ready || !data) return null;` matching `Hero.tsx`'s pattern) is simpler and more consistent. Low risk, no CONTEXT.md objection exists.

## Environment Availability

> Skip condition does not apply — this phase touches `package.json`/`node_modules` (npm uninstall) and requires a build step for validation.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | `npm uninstall`, `next build`, `next start` | ✓ | npm confirmed working (registry queries succeeded) | — |
| next CLI (`next build`, `next start`) | Validation Architecture (hydration check) | ✓ | ^16.2.6 (package.json) | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none.

## Validation Architecture

> `workflow.nyquist_validation` is not set in `.planning/config.json` (absent = enabled). This section drives `10-VALIDATION.md`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured (no Jest/Vitest/Playwright config found in `my-app/`) |
| Config file | none — see Wave 0 |
| Quick run command | `npm run build` (type-check + compile; fails fast on broken imports) |
| Full suite command | `npm run build && npm run start` (manual SSR/hydration check — see REQ map below) |

This phase has NO unit-test framework dependency. Validation is primarily **manual SSR/build verification** — appropriate for a phase whose entire goal is "what does the SERVER-RENDERED HTML look like."

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SSR-01 | Initial HTML (no JS) contains full portfolio content on `/en` and `/es` — not just a spinner | smoke (curl) | `curl -s http://localhost:3000/en \| grep -c "Tomás"` (expect >0; repeat for `/es` with a Spanish-only string e.g. "Sobre mí") | N/A — manual/curl, no test file |
| SSR-01 | View-source confirms `<main>` content (Nav/Hero/About/etc.) present, `<LangLoader/>`'s spinner markup absent | smoke (curl) | `curl -s http://localhost:3000/en \| grep -c "animate-spin"` (expect `0`); `curl -s http://localhost:3000/en \| grep -c "Voxel · click to shuffle"` (expect >0, confirms Hero rendered) | N/A — manual/curl |
| SSR-02 | `getPortfolioData(lang)` is importable from a context with NO `"use client"` and returns the correct locale's data synchronously | server-only import smoke | `node -e "require('./src/app/i18n/getPortfolioData')"` will fail (TS/ESM, not directly node-runnable) — instead: create a throwaway `.ts` script OR rely on `npm run build` succeeding when a Server Component (even a temporary one) imports `getPortfolioData` without a `"use client"` directive. Practical check: confirm `getPortfolioData.ts` has NO `"use client"` directive via `head -1 src/app/i18n/getPortfolioData.ts` (expect first line is NOT `"use client";`) | N/A — file-content check + build success |
| SSR-03 | `next build && next start` succeeds; browser console shows ZERO hydration warnings on `/en` and `/es` | manual (browser devtools) | `npm run build && npm run start`, open `http://localhost:3000/en` and `http://localhost:3000/es` in a browser, check DevTools console for "Hydration failed" / "Text content does not match" warnings (expect none) | N/A — manual browser check, no automated test |
| SSR-03 | `i18next`, `react-i18next`, `i18next-resources-to-backend` are absent from `package.json` dependencies and `node_modules` | dependency audit | `grep -E "i18next\|react-i18next" my-app/package.json` (expect no matches); `npm ls i18next react-i18next i18next-resources-to-backend` (expect "not found" for all three) | N/A — grep/npm check |
| SSR-03 | Zero remaining source references to deleted i18n modules | static grep | `grep -rn "i18n/client\|i18n/index\|LangLoader\|from \"i18next\"\|from \"react-i18next\"" my-app/src/` (expect zero matches) | N/A — grep check |

### Sampling Rate
- **Per task commit:** `npm run build` (catches broken imports, type errors from `cv: string`/JSON key rename immediately — fast fail, ~30-60s for this project size)
- **Per wave merge:** `npm run build && npm run start` + manual browser console check on `/en` and `/es` (the hydration check — cannot be meaningfully automated without Playwright, which is explicitly deferred per STATE.md "Testing: Playwright E2E tests — Deferred (v2.0.0 OQ-5)")
- **Phase gate:** All six rows in the Requirements → Test Map above must pass before `/gsd:verify-work` — curl-based content checks (SSR-01), file-content/build checks (SSR-02), and the manual hydration + dependency-removal checks (SSR-03)

### Wave 0 Gaps

- [ ] No test framework exists (Jest/Vitest/Playwright) — **this is acceptable for Phase 10**, since validation is fundamentally "inspect SSR HTML output" and "check browser console," not unit-testable business logic. Do NOT install a test framework as part of this phase — out of scope, and contradicts "zero new npm dependencies" guidance from the milestone research (this phase only REMOVES dependencies).
- [ ] No automated hydration-mismatch detection tool — `next build && next start` + manual browser console inspection is the documented, sufficient method per the milestone PITFALLS.md research (Pitfall 2: "Run a production build... and check browser console... on both `/en` and `/es`").

*(No test file gaps — this phase has no unit-testable logic; all six requirement checks above are build/grep/curl/manual-browser based, runnable without new infrastructure.)*

## Security Domain

> `security_enforcement` is not referenced in `.planning/config.json` (absent = enabled per the protocol), but this phase has NO security-relevant surface — it removes a client-side translation library and edits static-data reads. No new input handling, auth, session, or cryptography is introduced.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A — no auth surface touched |
| V3 Session Management | No | N/A |
| V4 Access Control | No | N/A |
| V5 Input Validation | No | N/A — no new user input; `getPortfolioData(lang)` receives `lang` from `params` (route segment), already validated by `generateStaticParams`'s fixed `["en","es"]` enumeration in `i18n-config.ts` |
| V6 Cryptography | No | N/A |

### Known Threat Patterns for {stack}

None applicable — this phase is a static-content/dependency-removal refactor with no new attack surface. The `LOCALES[lang] ?? LOCALES.en` fallback pattern (already in `usePortfolioData`, copied to `getPortfolioData`) safely handles any unexpected `lang` value by defaulting to `en` — no injection vector (the value is never used in a query, file path beyond the static import map, or shell command).

## Sources

### Primary (HIGH confidence)
- Direct codebase reads (this session): `my-app/src/app/[lang]/ClientPage.tsx`, `my-app/src/app/components/Hero.tsx`, `my-app/src/app/components/Footer.tsx`, `my-app/src/app/i18n/usePortfolioData.ts`, `my-app/src/app/i18n/client.ts`, `my-app/src/app/i18n/index.ts`, `my-app/src/app/i18n/__assert.ts`, `my-app/src/app/i18n/portfolio.types.ts`, `my-app/src/app/theme/ThemeProvider.tsx`, `my-app/src/app/layout.tsx`, `my-app/src/app/[lang]/layout.tsx`, `my-app/src/app/[lang]/page.tsx`, `my-app/src/app/ui/LangLoader.tsx`, `my-app/src/app/i18n-config.ts`, `my-app/package.json`, `my-app/public/locales/en/common.json`, `my-app/public/locales/es/common.json`
- `.planning/research/ARCHITECTURE.md` — Pattern 1/2/3, Q1/Q5, build-order graph (HIGH confidence, milestone-level research verified against Next.js v16.1.6 docs via Context7)
- `.planning/research/PITFALLS.md` — Pitfall 1, 2, 3 (HIGH confidence, directly grounded in codebase inspection)
- `.planning/REQUIREMENTS.md` — SSR-01/02/03 definitions
- `.planning/STATE.md` — locked decisions, pre-checks for Phase 10

### Secondary (MEDIUM confidence)
- `npm view i18next/react-i18next/i18next-resources-to-backend version` — confirms registry presence of packages being removed (not relevant to recommendation, only to the removal audit table) `[VERIFIED: npm registry]`

### Tertiary (LOW confidence)
- A1 (bundler dedup of identical static JSON imports across two modules) — based on general Next.js/webpack module-graph behavior, not independently re-verified in this session. Flagged in Assumptions Log; low-impact, checkable in Phase 16's bundle analyzer.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies, all changes are edits/deletions to code directly read this session
- Architecture: HIGH — file-by-file sequence verified against both the milestone ARCHITECTURE.md research AND direct reads of every file in scope
- Pitfalls: HIGH — hydration audit grounded in direct reads of `ThemeProvider.tsx`, `Hero.tsx`, `layout.tsx`; CV key casing issue discovered via direct grep this session (not in milestone research)

**Research date:** 2026-06-14
**Valid until:** No external API/library dependency to go stale — this research remains valid until the codebase files it references are changed by a different phase. Effectively valid for the duration of Phase 10's execution.
