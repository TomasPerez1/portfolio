# Phase 10: SSR Content Fix - Pattern Map

**Mapped:** 2026-06-14
**Files analyzed:** 8 (1 new, 4 modified, 4 deleted, 1 removal target for npm deps)
**Analogs found:** 4 / 4 (files requiring an analog)

## File Classification

| New/Modified/Deleted File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `my-app/src/app/i18n/getPortfolioData.ts` | utility (data accessor) | request-response (sync data read) | `my-app/src/app/i18n/usePortfolioData.ts` | exact — same `LOCALES` map pattern, minus `"use client"` and `ready` |
| `my-app/src/app/i18n/portfolio.types.ts` | model (type definitions) | transform (type shape) | itself (in-place edit) | exact — additive field on existing interface |
| `my-app/src/app/[lang]/ClientPage.tsx` | component (page composition root) | request-response (render gate removal) | itself (in-place edit) | exact — current file IS the analog for "before" state |
| `my-app/src/app/components/Hero.tsx` | component | request-response | itself (in-place edit) | exact |
| `my-app/src/app/components/Footer.tsx` | component | request-response | itself (in-place edit) | exact |
| `my-app/public/locales/en/common.json` | config (content data) | transform (key rename) | `my-app/public/locales/es/common.json` (sibling, same shape) | exact — identical top-level shape, mirror edit |
| `my-app/public/locales/es/common.json` | config (content data) | transform (key rename) | `my-app/public/locales/en/common.json` (sibling, same shape) | exact |
| `my-app/src/app/i18n/client.ts`, `index.ts`, `__assert.ts`, `my-app/src/app/ui/LangLoader.tsx` | utility/component (DELETE) | n/a | n/a | n/a — deletion targets, no analog needed |
| `my-app/package.json` | config | n/a | n/a | n/a — dependency removal only |

## Pattern Assignments

### `my-app/src/app/i18n/getPortfolioData.ts` (utility, request-response — NEW FILE)

**Analog:** `my-app/src/app/i18n/usePortfolioData.ts` (full file, 16 lines — read in full)

**Full analog source** (`my-app/src/app/i18n/usePortfolioData.ts`, lines 1-16):
```typescript
"use client";

import en from "../../../public/locales/en/common.json";
import es from "../../../public/locales/es/common.json";
import type { PortfolioData } from "./portfolio.types";

const LOCALES: Record<string, PortfolioData> = {
  en: en as unknown as PortfolioData,
  es: es as unknown as PortfolioData,
};

export function usePortfolioData(lng: string) {
  const data = LOCALES[lng] ?? LOCALES.en;
  return { data, ready: true };
}
```

**Target — `getPortfolioData.ts` (complete new file)**, copy the import block and `LOCALES` map verbatim; the ONLY differences from the analog are: (1) drop line 1 (`"use client";`), (2) the export is a plain function returning `PortfolioData` directly (no `{ data, ready }` wrapper — `ready` is always `true` so callers don't need it):

```typescript
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

**Verification check (per RESEARCH.md SSR-02):** first line of the file must NOT be `"use client";` — this is what makes it importable from future Server Components (`generateMetadata`, JSON-LD, `opengraph-image.tsx` in phases 11-16).

**Relative import path note:** both the analog and the new file live in `my-app/src/app/i18n/`, so `../../../public/locales/{en,es}/common.json` resolves identically (`my-app/public/locales/{en,es}/common.json`) — no path adjustment needed when copying.

---

### `my-app/src/app/i18n/portfolio.types.ts` (model, transform — MODIFIED)

**Analog:** itself — additive change to the existing `PortfolioData` interface (lines 222-235, full interface read).

**Current `PortfolioData` interface** (lines 222-235):
```typescript
export interface PortfolioData {
  identity: Identity;
  hero: HeroCopy;
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

**Target — add `cv: string` as a top-level field** (matches the JSON's actual top-level shape — `"CV"`/`"cv"` sits as a sibling of `"identity"` in `common.json`, NOT nested inside it):
```typescript
export interface PortfolioData {
  identity: Identity;
  hero: HeroCopy;
  cv: string;                    // NEW — top-level, matches JSON "cv" key (renamed from "CV")
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

**Coupled JSON edit (must land in the same change):** rename `"CV"` → `"cv"` in both locale files.

`my-app/public/locales/en/common.json` line 7 (verified via direct read, sits between `"nav": {...}` block ending and `"form": {...}` block — top-level sibling of `identity`):
```diff
- "CV": "/cv/FULLSTACK-TOMAS_PEREZ_en.pdf",
+ "cv": "/cv/FULLSTACK-TOMAS_PEREZ_en.pdf",
```

`my-app/public/locales/es/common.json` line 7 (same position, mirror the en file's structure):
```diff
- "CV": "/cv/FULLSTACK-TOMAS_PEREZ_es.pdf",
+ "cv": "/cv/FULLSTACK-TOMAS_PEREZ_es.pdf",
```

**Why this ordering matters:** both `usePortfolioData.ts` and `getPortfolioData.ts` use `as unknown as PortfolioData` — a type ASSERTION that does NOT structurally validate the JSON against the interface. If `cv: string` is added to the interface but the JSON key remains `"CV"`, `data.cv` will be `undefined` at runtime with NO TypeScript error. The interface edit and the JSON key rename must land together.

---

### `my-app/src/app/[lang]/ClientPage.tsx` (component, request-response — MODIFIED)

**Analog:** itself, full file (39 lines, read in full).

**Current full file** (lines 1-39):
```tsx
"use client";

import LangLoader from "../ui/LangLoader";
import { useTranslation } from "../i18n/client";
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
  const { ready } = useTranslation(lang, "common");
  if (!ready) return <LangLoader />;
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

**Target — complete file** (3 edits: remove lines 3-4 imports, remove the `useTranslation`/`ready`/spinner-gate lines 20-21, everything else byte-identical):
```tsx
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

**Critical:** keep `"use client"` on line 1 — it remains the correct boundary for Hero's voxel animation, framer-motion, and theme context consumers. Do NOT remove it (Anti-Pattern 1 in RESEARCH.md).

---

### `my-app/src/app/components/Hero.tsx` (component, request-response — MODIFIED)

**Analog:** itself, full file read (413 lines) — only the top-level `Hero` function (lines 1-38) changes; `HeroSection` and everything below (lines 40-413) are untouched.

**Current `Hero` function** (lines 1-38):
```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Identity, HeroCopy } from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { useTranslation } from "../i18n/client";
import { VOXEL_STATES } from "./voxel-states";


const SHUFFLE_DURATION_MS = 600;
const VOXEL_INFLUENCE_RADIUS = 520;

interface Tilt {
  x: number;
  y: number;
}

interface HeroSectionProps {
  data: Pick<Identity, "statusLine" | "statusLineShort" | "location" | "timezone" | "tagline" | "tagHighlight" | "tagTrailing">;
  hero: HeroCopy;
  cvLink?: string;
  showStatus?: boolean;
}

export default function Hero({ lang, showStatus = true }: { lang: string; showStatus?: boolean }) {
  const { data, ready } = usePortfolioData(lang);
  const { t } = useTranslation(lang, "common");
  if (!ready || !data) return null;
  const { statusLine, statusLineShort, location, timezone, tagline, tagHighlight, tagTrailing } = data.identity;
  return (
    <HeroSection
      data={{ statusLine, statusLineShort, location, timezone, tagline, tagHighlight, tagTrailing }}
      hero={data.hero}
      cvLink={t("CV")}
      showStatus={showStatus}
    />
  );
}
```

**Target — replace lines 6 (`useTranslation` import) and lines 25-38 (`Hero` function body)**, leave lines 1-5, 7-24, and 40+ unchanged:

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Identity, HeroCopy } from "../i18n/portfolio.types";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { VOXEL_STATES } from "./voxel-states";


const SHUFFLE_DURATION_MS = 600;
const VOXEL_INFLUENCE_RADIUS = 520;

interface Tilt {
  x: number;
  y: number;
}

interface HeroSectionProps {
  data: Pick<Identity, "statusLine" | "statusLineShort" | "location" | "timezone" | "tagline" | "tagHighlight" | "tagTrailing">;
  hero: HeroCopy;
  cvLink?: string;
  showStatus?: boolean;
}

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

**Diff summary:**
1. DELETE line 6: `import { useTranslation } from "../i18n/client";`
2. DELETE the line `const { t } = useTranslation(lang, "common");` (was line 27)
3. CHANGE `cvLink={t("CV")}` → `cvLink={data.cv}`

`HeroSection` itself (lines 40-413, including the `cvLink={cvLink ?? "#"}` consumer at line 169 of the original) is NOT touched — it already accepts `cvLink?: string` as a prop and falls back to `"#"`, which continues to work with `data.cv` (now a guaranteed `string`).

---

### `my-app/src/app/components/Footer.tsx` (component, request-response — MODIFIED)

**Analog:** itself, full file read (67 lines).

**Current full file** (lines 1-67):
```tsx
"use client";

import { m, useReducedMotion } from "framer-motion";
import { usePortfolioData } from "../i18n/usePortfolioData";
import { useTranslation } from "../i18n/client";
import { noMotion, sectionReveal } from "./_animations";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const GITHUB_URL = "https://github.com/Pelucheado";
const FALLBACK_LINKS: readonly FooterLink[] = [
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Email", href: "#" },
  { label: "CV", href: "#" },
];

export default function Footer({ lang }: { lang: string }) {
  const { data, ready } = usePortfolioData(lang);
  const { t } = useTranslation(lang, "common");
  const reduce = useReducedMotion();
  const links: readonly FooterLink[] = !ready || !data
    ? FALLBACK_LINKS
    : [
        { label: "GitHub", href: GITHUB_URL, external: true },
        { label: "LinkedIn", href: `https://${data.identity.linkedin}`, external: true },
        { label: "Email", href: `mailto:${data.identity.email}` },
        { label: "CV", href: t("CV"), external: true },
      ];
  return (
    <m.footer
      className="px-[clamp(20px,5vw,96px)] py-14 border-t border-line flex flex-col gap-8"
      variants={reduce ? noMotion : sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex flex-wrap justify-between items-end gap-6">
        <div className="display text-[clamp(48px,9vw,140px)] tracking-tightest leading-[.9]">
          tperez<span className="text-spark">.</span>dev
        </div>
        <div className="flex flex-wrap gap-2.5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="btn h-[38px] px-3.5 text-[13px] bg-transparent"
            >
              {link.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" /></svg>
            </a>
          ))}
        </div>
      </div>
      <div className="h-px w-full bg-line" />
      <div className="flex flex-wrap justify-between gap-3 font-mono text-xs text-fg-soft">
        <span>© 2026 Tomás Pérez · Built with Next.js, Tailwind, Framer Motion & 🧉☕</span>
      </div>
    </m.footer>
  );
}
```

**Target — only the header block (lines 1-33) changes**; the entire JSX return (lines 34-67) is byte-identical and NOT reproduced again here — copy it unchanged:

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
  return (
    /* ... rest of JSX (lines 34-67 above) — UNCHANGED, copy verbatim ... */
```

**Diff summary:**
1. DELETE line 5: `import { useTranslation } from "../i18n/client";`
2. DELETE lines 15-20 (`const FALLBACK_LINKS: readonly FooterLink[] = [...]` block) — dead code per RESEARCH.md (Open Question 1, recommended bundled into this edit)
3. DELETE `const { t } = useTranslation(lang, "common");`
4. ADD `if (!ready || !data) return null;` — mirrors `Hero.tsx`'s early-return pattern (this branch is unreachable in practice since `usePortfolioData` always returns `ready: true` and non-null `data`, but keeps the function's type signature simple and consistent with `Hero.tsx`)
5. CHANGE the conditional `links` ternary → a plain array literal, and `href: t("CV")` → `href: data.cv`

---

## Shared Patterns

### Static JSON import + `LOCALES` map (data accessor pattern)
**Source:** `my-app/src/app/i18n/usePortfolioData.ts` lines 3-10
**Apply to:** `getPortfolioData.ts` (new file)
```typescript
import en from "../../../public/locales/en/common.json";
import es from "../../../public/locales/es/common.json";
import type { PortfolioData } from "./portfolio.types";

const LOCALES: Record<string, PortfolioData> = {
  en: en as unknown as PortfolioData,
  es: es as unknown as PortfolioData,
};
```
This is the SINGLE canonical pattern for locale-aware static data access in this codebase. `getPortfolioData.ts` is a near-duplicate, differing only in: no `"use client"` directive, and the exported function returns `PortfolioData` directly instead of `{ data, ready }`.

### `!ready || !data` early-return guard (defensive null-check, now dead-but-kept-for-consistency)
**Source:** `my-app/src/app/components/Hero.tsx` line 26 (`if (!ready || !data) return null;`)
**Apply to:** `Footer.tsx` (add this line — see Footer diff item 4 above)
Both `usePortfolioData` callers should use this identical guard for consistency, even though `usePortfolioData` never actually returns `ready: false` or `data: null` (`LOCALES[lng] ?? LOCALES.en` always resolves). This keeps `Hero.tsx` and `Footer.tsx` structurally symmetric.

### `t("CV")` → `data.cv` migration (the core content-source change)
**Source/Target pairs:**
- `Hero.tsx`: `cvLink={t("CV")}` → `cvLink={data.cv}` (HeroSection prop, consumed at the `<a href={cvLink ?? "#"}>` download button)
- `Footer.tsx`: `{ label: "CV", href: t("CV"), external: true }` → `{ label: "CV", href: data.cv, external: true }`

Both call sites read the SAME underlying value (`common.json`'s top-level `cv` key, renamed from `"CV"`), via the SAME `usePortfolioData(lang)` hook each component already calls. No new data-fetching is introduced — this is purely swapping the source of one string from the i18next translation table to the existing static-JSON object.

### `"use client"` retention (component boundary policy)
**Source:** `my-app/src/app/[lang]/ClientPage.tsx` line 1, `my-app/src/app/components/Hero.tsx` line 1, `my-app/src/app/components/Footer.tsx` line 1
**Apply to:** ALL THREE modified files — `"use client"` directive MUST remain on line 1 of each. None of this phase's edits remove or relocate this directive. Per RESEARCH.md Anti-Pattern 1: `"use client"` does not block SSR; these components are server-rendered for initial HTML regardless, and removing the directive would break framer-motion/voxel/theme-context interactivity for zero SEO benefit.

---

## Deletion Targets (no analog needed — pure removal)

| File | Reason for deletion | Pre-deletion check |
|------|---------------------|---------------------|
| `my-app/src/app/i18n/client.ts` | i18next `useTranslation` wrapper — superseded by `usePortfolioData`/`getPortfolioData` | grep confirms zero remaining imports AFTER Hero/Footer/ClientPage edits land |
| `my-app/src/app/i18n/index.ts` | i18next instance initializer — no longer needed | same grep |
| `my-app/src/app/ui/LangLoader.tsx` | Spinner component — no longer referenced after `ClientPage.tsx` gate removal | same grep |
| `my-app/src/app/i18n/__assert.ts` | Type-assertion-only file (`en as unknown as PortfolioData` / `es as unknown as PortfolioData`, `void _en; void _es;`) — its role is fully subsumed by `getPortfolioData.ts`, which performs the identical assertion on the same two JSON files as part of normal operation | none — `__assert.ts` has zero importers regardless (it was a standalone compile-time check); confirmed via full-file read (10 lines), does NOT import `client.ts`/`index.ts` |

**Ordering constraint (Pitfall 3 in RESEARCH.md):** these four deletions MUST happen AFTER Patterns above (type/JSON edit → Hero/Footer edit → ClientPage edit) and AFTER a grep verification step:
```bash
rg "i18n/client|i18n/index|LangLoader|i18next" my-app/src --type ts --type tsx
```
Expected: zero matches. Then delete, then `npm uninstall i18next react-i18next i18next-resources-to-backend`.

**Note:** `my-app/src/app/i18n-config.ts` (defines `i18n.locales`/`defaultLocale`/`fallbackLng`, consumed by `app/[lang]/page.tsx`'s `generateStaticParams`) is UNCHANGED and NOT a deletion target — it is unrelated to the i18next runtime being removed.

## No Analog Found

None — every file in scope either has a direct self-analog (in-place edit of a file already read in full) or a sibling-file analog (the `en`/`es` JSON pair mirror each other's structure). Deletion targets require no analog by definition.

## Metadata

**Analog search scope:** `my-app/src/app/i18n/`, `my-app/src/app/[lang]/`, `my-app/src/app/components/`, `my-app/src/app/ui/`, `my-app/public/locales/{en,es}/common.json` (line 1-10 only)
**Files scanned:** 9 (usePortfolioData.ts, portfolio.types.ts, ClientPage.tsx, Hero.tsx, Footer.tsx, __assert.ts, en/common.json, i18n directory listing, ui directory listing)
**Pattern extraction date:** 2026-06-14
