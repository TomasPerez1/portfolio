# Architecture Research

**Domain:** Next.js 16 App Router — SEO/AI Discoverability integration into existing portfolio (v2.1.0)
**Researched:** 2026-06-13
**Confidence:** HIGH (verified against current codebase + Next.js v16.1.6 docs via Context7)

## Standard Architecture

### System Overview — Current vs Target

```
CURRENT (broken)                          TARGET (v2.1.0)
┌──────────────────────────────┐         ┌──────────────────────────────┐
│ app/layout.tsx  (ROOT)        │         │ app/layout.tsx  (ROOT)        │
│  <html lang={cookie||"en"}>   │         │  <html> NOT HERE ANYMORE      │
│  - fonts, theme script        │         │  - becomes a thin passthrough │
│  - metadata (single-locale)   │         │    OR is removed/merged       │
├──────────────────────────────┤         ├──────────────────────────────┤
│ app/[lang]/layout.tsx         │         │ app/[lang]/layout.tsx         │
│  - empty passthrough <>{}</>  │         │  - BECOMES THE ROOT LAYOUT     │
├──────────────────────────────┤         │  - owns <html lang={lang}>,   │
│ app/[lang]/page.tsx           │         │    <body>, fonts, theme script│
│  - generateStaticParams       │         │  - generateMetadata (i18n)    │
│  - renders <ClientPage>       │         │  - injects JSON-LD <script>   │
├──────────────────────────────┤         ├──────────────────────────────┤
│ ClientPage.tsx "use client"   │         │ app/[lang]/page.tsx           │
│  - useTranslation() gate      │         │  - generateStaticParams       │
│  - if (!ready) <LangLoader/>  │         │  - renders <ClientPage>       │
│  - SSR = spinner only ✗       │         │  (unchanged otherwise)        │
└──────────────────────────────┘         ├──────────────────────────────┤
                                          │ ClientPage.tsx "use client"   │
                                          │  - NO gate, renders directly  │
                                          │  - SSR = full content ✓       │
                                          ├──────────────────────────────┤
                                          │ app/[lang]/opengraph-image.tsx│
                                          │  - per-locale OG image (new)  │
                                          └──────────────────────────────┘
```

### Component Responsibilities (target state)

| Component | Responsibility | New/Modified |
|-----------|----------------|--------------|
| `app/[lang]/layout.tsx` | Becomes the **effective root layout**: owns `<html lang>`, `<body>`, fonts, theme pre-hydration script, `generateMetadata` (per-locale title/description/OG/hreflang/canonical), JSON-LD `<script type="application/ld+json">` for `Person` schema | MODIFIED (major) |
| `app/layout.tsx` | Either removed, or kept as an empty pure passthrough (Next.js requires exactly one root layout defining `<html>`/`<body>` — see Q5 below for the resolution) | MODIFIED (major) — likely deleted |
| `app/[lang]/page.tsx` | Unchanged: `generateStaticParams` for en/es, renders `<ClientPage lang={lang}>` | UNCHANGED |
| `app/[lang]/ClientPage.tsx` | Remove `useTranslation` import + `if (!ready) return <LangLoader/>` gate. Renders the `<main>` tree directly and synchronously using data already available via `usePortfolioData` | MODIFIED (surgical) |
| `app/i18n/usePortfolioData.ts` | Unchanged — already does static JSON import, already SSR-safe | UNCHANGED |
| `app/components/Hero.tsx` | Remove `useTranslation` import + `t("CV")`; read `data.identity` CV link (or equivalent) from `usePortfolioData` static JSON instead | MODIFIED (surgical) |
| `app/components/Footer.tsx` | Same as Hero — remove `useTranslation`, read CV link from static JSON | MODIFIED (surgical) |
| `app/i18n/client.ts`, `app/i18n/index.ts` | Deleted entirely (i18next, react-i18next, i18next-resources-to-backend removed from `package.json`) | DELETED |
| `app/ui/LangLoader.tsx` | Deleted (no longer referenced anywhere) | DELETED |
| `app/[lang]/opengraph-image.tsx` | New per-locale OG image route, generated via `next/og` `ImageResponse` | NEW |
| `app/middleware.ts` | Unchanged for routing; locale detection logic stays — **but stop relying on `NEXT_LOCALE` cookie for `<html lang>`** (see Q5) | UNCHANGED (functionally) |

## Recommended Project Structure (delta only)

```
my-app/src/app/
├── layout.tsx                  # Either DELETED or reduced to a trivial
│                                #   pass-through (no <html>/<body> — see Q5)
├── [lang]/
│   ├── layout.tsx               # PROMOTED to root layout: <html lang>, <body>,
│   │                             #   fonts, theme script, generateMetadata,
│   │                             #   JSON-LD <script> for Person schema
│   ├── page.tsx                  # unchanged
│   ├── ClientPage.tsx            # gate removed
│   └── opengraph-image.tsx       # NEW — per-locale OG image (ImageResponse)
├── components/
│   ├── Hero.tsx                  # t("CV") → usePortfolioData read
│   └── Footer.tsx                # t("CV") → usePortfolioData read
├── i18n/
│   ├── usePortfolioData.ts       # unchanged (already SSR-safe static import)
│   ├── portfolio.types.ts        # unchanged
│   ├── client.ts                 # DELETED
│   ├── index.ts                  # DELETED
│   └── __assert.ts                # check — may also depend on i18next, verify before delete
├── ui/
│   └── LangLoader.tsx            # DELETED
└── sitemap.ts                    # unchanged (already correct, en/es with hreflang alternates)
```

### Structure Rationale

- Next.js App Router has **one hard rule relevant here**: `<html>` and `<body>` must be defined in **the root layout** — i.e., the top-most `layout.tsx` in `app/`. There is no per-segment override of `<html>`. This is why the official Next.js i18n example (`examples/i18n-routing`) makes `app/[lang]/layout.tsx` the root layout directly (no separate `app/layout.tsx` above it).
- This project currently violates that pattern's spirit by keeping `app/layout.tsx` as the actual root (with `<html>`) and `app/[lang]/layout.tsx` as a no-op passthrough below it — which is *structurally legal* (Next.js doesn't forbid this nesting) but semantically wrong for i18n: the segment that knows the locale (`[lang]`) is NOT the one rendering `<html>`. That mismatch is the root cause of the cookie hack.
- Fix: invert the responsibility. `[lang]/layout.tsx` becomes the file that owns `<html lang={lang}>`. `app/layout.tsx` either disappears or becomes a tiny pure pass-through with no `<html>`/`<body>` (only valid if `[lang]/layout.tsx` is then the *true* root layout, i.e. `app/layout.tsx` is deleted — Next.js requires the **root** `app/layout.tsx` to contain `<html>`/`<body>`, it cannot delegate that down). See Q5 for the two concrete options and recommendation.

## Architectural Patterns

### Pattern 1: Promote `[lang]/layout.tsx` to Root Layout (resolves Q2, Q3, Q5)

**What:** Delete `app/layout.tsx`. Move its entire content (fonts, theme pre-hydration script, `<Provider>`, `<Toaster>`, `<SpeedInsights>`, viewport export) into `app/[lang]/layout.tsx`, which now also receives `params: Promise<{ lang: string }>` and sets `<html lang={lang}>`.

**When to use:** Always, for any Next.js App Router i18n project using `[lang]` segment routing — this is the pattern Vercel's own `examples/i18n-routing` uses.

**Trade-offs:**
- Pro: `<html lang>` is now derived from the actual route parameter — correct for every request, works with SSG (`generateStaticParams` produces one fully-resolved `<html lang="en">` page and one `<html lang="es">` page at build time), no runtime cookie dependency.
- Pro: `generateMetadata` can live in the same file and access the same `params`, so title/description/OG/JSON-LD are colocated with the `<html lang>` decision — one source of truth per locale.
- Con: `app/page.tsx` (the `/` → `/en` redirect) and `app/middleware.ts` are **outside** any `[lang]` segment, so they have no `layout.tsx` of their own once `app/layout.tsx` is deleted — Next.js requires `app/layout.tsx` to exist as the root. **This is the actual constraint that forces a choice — see Q5 below.**

**Example:**
```tsx
// app/[lang]/layout.tsx — NEW root layout
import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Provider } from "../providers";
import { Toaster } from "sonner";
import { bricolage, geist, jetbrainsMono } from "../fonts";
import { usePortfolioDataServer } from "../i18n/getPortfolioData"; // server-safe helper, see Pattern 3
import "../globals.css";

export const viewport: Viewport = { /* ...unchanged... */ };

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const data = getPortfolioData(lang); // sync static JSON read, server-safe
  return {
    title: data.identity.metaTitle ?? `${data.identity.name} — ${data.identity.role}`,
    description: data.identity.tagline,
    alternates: {
      canonical: `https://tomasperezdev.space/${lang}`,
      languages: {
        en: "https://tomasperezdev.space/en",
        es: "https://tomasperezdev.space/es",
        "x-default": "https://tomasperezdev.space/en",
      },
    },
    openGraph: { locale: lang === "es" ? "es_AR" : "en_US", alternateLocale: lang === "es" ? "en_US" : "es_AR" },
  };
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export default async function RootLayout({
  children,
  params,
}: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const data = getPortfolioData(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.identity.name,
    jobTitle: data.identity.role,
    url: `https://tomasperezdev.space/${lang}`,
    email: `mailto:${data.identity.email}`,
    sameAs: [`https://${data.identity.linkedin}`, "https://github.com/Pelucheado"],
  };

  return (
    <html lang={lang} suppressHydrationWarning className={`${bricolage.variable} ${geist.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: /* theme pre-hydration script, unchanged */ "" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <Provider>
          <>
            {children}
            <Toaster duration={3000} style={{ backgroundColor: "#D9D9D9" }} richColors gap={2} />
            <SpeedInsights />
          </>
        </Provider>
      </body>
    </html>
  );
}
```

### Pattern 2: Surgical removal of the spinner gate + i18next (resolves Q1)

**What:** Remove the async-translation dependency chain entirely. `ClientPage.tsx` no longer imports `useTranslation` or `LangLoader`, and no longer early-returns. `Hero.tsx` and `Footer.tsx` stop calling `useTranslation` and instead read the CV path from `usePortfolioData`.

**When to use:** Now — this is the core SSR fix, and it must land BEFORE or ALONGSIDE the layout promotion (Pattern 1), but the two are independent in terms of merge risk (different files).

**Exact sequence (no broken intermediate state):**

1. **Add the CV field to `usePortfolioData`'s shape** (it's already in the static JSON as `"CV": "/cv/FULLSTACK-TOMAS_PEREZ_en.pdf"` at the top level of `common.json`, OUTSIDE the `PortfolioData` interface in `portfolio.types.ts`). Two options:
   - (a) Add `cv: string` to the `Identity` interface (or a new top-level `cv` field on `PortfolioData`) and to both `common.json` files if not already structured that way — confirm current JSON shape includes `CV` as a sibling of `identity`, not nested inside it. Type must be updated to match.
   - (b) Simpler: read it via a small typed accessor that pulls the raw JSON's `CV` key directly (since `usePortfolioData` already imports the full JSON modules `en`/`es`).
   - **Recommendation:** (a) — extend `PortfolioData`/`Identity` properly so it's typed, not an escape hatch. This is a 2-line type change plus confirming the JSON key location.

2. **Edit `Hero.tsx`:**
   - Remove `import { useTranslation } from "../i18n/client";`
   - Remove `const { t } = useTranslation(lang, "common");`
   - Change `cvLink={t("CV")}` → `cvLink={data.cv}` (or wherever the CV path now lives on `data`)

3. **Edit `Footer.tsx`:**
   - Remove `import { useTranslation } from "../i18n/client";`
   - Remove `const { t } = useTranslation(lang, "common");`
   - Change `{ label: "CV", href: t("CV"), external: true }` → `{ label: "CV", href: data.cv, external: true }`
   - Note: `Footer.tsx` currently computes `links` conditionally on `!ready || !data` from `usePortfolioData` (which is *always* `ready: true` and `data` is never null because `LOCALES[lng] ?? LOCALES.en` always resolves) — the `FALLBACK_LINKS` branch is dead code already. Can be simplified but not required for the SSR fix; flag as cleanup.

4. **Edit `ClientPage.tsx`:**
   - Remove `import LangLoader from "../ui/LangLoader";`
   - Remove `import { useTranslation } from "../i18n/client";`
   - Remove `const { ready } = useTranslation(lang, "common"); if (!ready) return <LangLoader />;`
   - The component body becomes a plain render of the `<main>` tree — no hooks needed at this level at all (it could even become non-`"use client"` in principle, but **keep `"use client"`** because it's the parent boundary for client-only children like Hero's voxel animation, ThemeProvider consumers, etc. — removing `"use client"` here is NOT required and adds risk for zero SEO benefit, since content is already in the static import chain regardless of server/client component type).

5. **Delete dead files** (after confirming zero remaining imports):
   - `app/i18n/client.ts`
   - `app/i18n/index.ts`
   - `app/ui/LangLoader.tsx`
   - Check `app/i18n/__assert.ts` — read it before deleting; if it imports from `client.ts`/`index.ts`, it must be deleted or updated too.

6. **Remove npm dependencies:** `i18next`, `react-i18next`, `i18next-resources-to-backend` from `package.json` (run `npm uninstall` — but per global rule, do not build; just edit `package.json`/lockfile via the package manager command, no build step).

**Trade-offs:**
- Pro: Eliminates the only client-side `useEffect` + `useState` pair that gated the entire page's render — this is the entire SEO blocker, removed in ~5 small file edits.
- Pro: Removes 3 npm packages (i18next, react-i18next, i18next-resources-to-backend) — direct bundle reduction, supports the "perf-positive" requirement.
- Con/Risk: None functionally — `usePortfolioData` was *already* the source of truth for 9 of 11 components; only `Hero`/`Footer`'s `t("CV")` calls and `ClientPage`'s gate depended on i18next. This is genuinely surgical.

### Pattern 3: Hydration-safety analysis for `usePortfolioData` in `"use client"` components (resolves Q1's hydration question)

**What:** Confirm that `usePortfolioData(lang)` — a synchronous static JSON import returning `{ data, ready: true }` — produces **identical output on server and first client render**, with NO hydration mismatch risk.

**Why it's safe:**
- `usePortfolioData` is not a "hook" in the stateful sense — it has no `useState`/`useEffect`/`useRef`. It's a plain function (despite being marked `"use client"` and named with a `use` prefix) that does `LOCALES[lng] ?? LOCALES.en` where `LOCALES` is built from **static ES module imports** (`import en from ".../en/common.json"`, `import es from ".../es/common.json"`).
- Static JSON imports are bundled at build time and are part of the module graph for BOTH the server bundle (RSC/SSR render) and the client bundle (hydration). The `lang` argument comes from `params` (route segment), which is identical on server and client (it's encoded in the URL/route, not derived from `window`, `Date.now()`, `Math.random()`, or `localStorage`).
- Therefore: `usePortfolioData("en")` returns the exact same `data` object shape and values whether called during SSR or during the client's first render pass. **No mismatch possible** — this is why marking these components `"use client"` was never actually a barrier to SSR'd content; only the `useTranslation` gate was.

**`"use client"` + static import + SSR — does it actually run on the server?** YES, confirmed: in the App Router, a `"use client"` component is still **rendered to HTML on the server** for the initial response (that's how SSR/RSC streaming works for client components — they're not excluded from SSR, only from being *Server Components* with server-only APIs). The directive controls where the component's JS bundle is loaded for *interactivity*, not whether it participates in the initial server render. So `Hero.tsx`, `Footer.tsx`, `ClientPage.tsx` — all `"use client"` — already execute `usePortfolioData` during SSR today; the only reason their *content* doesn't show up server-side currently is the early-return on `!ready` from the *different*, async `useTranslation` hook, which legitimately cannot resolve during SSR (it's `useEffect`-based).

**Where hydration mismatches COULD still arise (audit each):**

| Source | Risk | Status after this change |
|--------|------|---------------------------|
| `usePortfolioData` static JSON | None — same value SSR and CSR (see above) | Safe, unchanged |
| `Hero.tsx` `useState({x:-22,y:28})`, `useState(0)`, `useState(false)` x2 | None — all initial values are hardcoded literals, identical SSR/CSR. The `voxelMounted` state starts `false` on both; the voxel only mounts client-side via `requestAnimationFrame` in `useEffect` (already guarded — `{voxelMounted && <VoxelArt .../>}` renders nothing on server AND nothing on client's first paint, then mounts after RAF). This is the CORRECT pattern already in place — no change needed. | Safe, unchanged |
| `ThemeProvider` `useState<Theme>("dark")`, `ready: false` initially | The `data-theme` attribute is set via the pre-hydration `<script>` in `<head>` (reads `localStorage`/`prefers-color-scheme` and calls `setAttribute` directly on `document.documentElement` BEFORE React hydrates) combined with `suppressHydrationWarning` on `<html>`. React's `useState("dark")` default and the actual DOM attribute MAY differ — this is the FART-fix pattern (D-14, already implemented) and `suppressHydrationWarning` is the documented mitigation. Not introduced by this change; pre-existing and correctly handled. | Safe, unchanged — verify `suppressHydrationWarning` carries over to whichever file ends up with `<html>` |
| `t("CV")` removal → `data.cv` | None — `data.cv` (or `data.identity.cv`) comes from the same static JSON, same SSR/CSR guarantee as the rest of `usePortfolioData` | New code path, but same safety guarantee |
| `<html lang={lang}>` after Pattern 1 | `lang` comes from route `params`, identical on server (render) and client (hydration reads from the already-rendered DOM, no client-side recomputation) | Safe — this is strictly MORE correct than the current cookie-based value, which could differ between users/requests |

**Net assessment:** There is **no new hydration risk** introduced by removing the spinner gate. The static-data components were always hydration-safe; the only non-hydration-safe piece (`useTranslation`'s `ready`/`t` state, which legitimately differs SSR vs CSR by design — `useState(false)` → `true` after `useEffect`) is precisely what's being deleted. Removing it makes hydration STRICTLY safer (one less stateful client-only gate to reconcile).

## Data Flow

### Request Flow (target state)

```
GET /en  (or /es)
    ↓
middleware.ts — locale already in path, NextResponse.next() (no rewrite needed for /en, /es)
    ↓
app/[lang]/layout.tsx  (NEW root layout — Server Component)
    ├─ generateMetadata({params}) → reads getPortfolioData(lang) → <title>, <meta>, hreflang, OG tags
    ├─ renders <html lang={lang}> ... <script type="application/ld+json"> (Person schema, server-rendered)
    └─ children → app/[lang]/page.tsx (Server Component)
                       ├─ generateStaticParams (build-time, en/es)
                       └─ renders <ClientPage lang={lang}>  ("use client", but SSR'd)
                              ├─ usePortfolioData(lang) → sync static JSON read (SSR-safe)
                              ├─ Nav, Hero, About, FeaturedWork, StackSection, Experience, Contact, Footer
                              │     each: usePortfolioData(lang) → full content in initial HTML
                              └─ Hero's voxel mounts client-side post-RAF (unchanged, already deferred)
    ↓
Initial HTML response: FULL content (title, meta, JSON-LD, all section text) — crawlable, no spinner
    ↓
Client hydration: identical tree, framer-motion/voxel/theme become interactive
```

### Key Data Flows

1. **Locale resolution:** URL path segment `[lang]` (`en`|`es`) is the single source of truth, threaded via `params` into `generateStaticParams`, `generateMetadata`, `<html lang>`, and `usePortfolioData(lang)` — all four now derive from the SAME value. Currently `<html lang>` is the ONLY one of these four that derives from a different source (the unset `NEXT_LOCALE` cookie, always falling back to `"en"`).

2. **Content flow (already correct, just unblocked):** `public/locales/{lang}/common.json` → static ES module import in `usePortfolioData.ts` → `{data, ready:true}` → consumed synchronously by 9 components (soon 11, once Hero/Footer migrate off `t("CV")`) → rendered in initial SSR HTML once the `ClientPage` gate is removed.

3. **Metadata/JSON-LD flow (new):** `public/locales/{lang}/common.json` → a small server-safe accessor (can reuse the same static-import map, just without the `"use client"` directive — see "OG image" section below for why a separate non-client module may be cleaner) → `generateMetadata` (title/description/OG/alternates) and inline `<script type="application/ld+json">` in `[lang]/layout.tsx`, both rendered server-side into `<head>`/`<body>` of the initial HTML.

## Detailed Answers to Research Questions

### Q1 — Surgical SSR fix sequence + hydration

Covered fully in **Pattern 2** (sequence) and **Pattern 3** (hydration audit). Summary:
- Sequence: type fix for CV field → edit Hero.tsx → edit Footer.tsx → edit ClientPage.tsx → delete i18n/client.ts, i18n/index.ts, ui/LangLoader.tsx (verify `__assert.ts`) → remove 3 npm deps.
- Hydration: NO new risk. `usePortfolioData` was always SSR-safe; static JSON import in a `"use client"` component DOES execute during SSR (confirmed — `"use client"` does not exclude a component from the initial server render, it only marks it for client-side bundling/interactivity). `useState` initial values in `Hero.tsx` (tilt, voxelStateIndex, shuffling, voxelMounted) are all hardcoded literals — identical SSR/CSR by construction, already correctly deferred via `useEffect`+RAF for the voxel.

### Q2 — Where per-locale metadata lives

**Recommendation: `app/[lang]/layout.tsx`** (the promoted root layout), NOT `app/[lang]/page.tsx`.

**Why layout, not page:**
- This portfolio is a single-page-per-locale site (`/en` and `/es`, each rendering the full `ClientPage`). There is no per-route metadata variation beyond locale — `generateMetadata` in the layout covers both `/en` and `/es` with one function, parameterized by `params.lang`.
- Per-segment metadata in Next.js is **shallow-merged** down the tree (child overrides parent per top-level key, nested objects like `openGraph` are fully replaced, not deep-merged — confirmed in Next.js docs). Since there's no `page.tsx`-level override needed (no distinct sub-pages), defining everything once in `[lang]/layout.tsx` avoids any merge ambiguity entirely.
- `generateMetadata` in the layout receives the same `params: Promise<{lang: string}>` as `generateStaticParams` — reads `lang`, then reads `getPortfolioData(lang)` (the server-safe static JSON accessor) for `title`, `description`, `og:title`, `og:description`, plus builds `alternates.canonical` and `alternates.languages` (hreflang) from the known `["en","es"]` locale list + `BASE_URL` (already a constant in `sitemap.ts` — `https://tomasperezdev.space`, consider extracting to a shared constant).
- If a future milestone adds distinct routes (e.g. `/en/projects/[slug]`), THOSE pages would add their own `generateMetadata` for page-specific overrides — but for v2.1.0's single-page-per-locale scope, layout-level is correct and sufficient.

**How it reads locale + static JSON:**
```tsx
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const data = getPortfolioData(lang); // same LOCALES map pattern as usePortfolioData, sans "use client"
  const base = "https://tomasperezdev.space";
  return {
    title: `${data.identity.name} — ${data.identity.role}`,
    description: data.identity.tagline + " " + data.identity.tagHighlight,
    alternates: {
      canonical: `${base}/${lang}`,
      languages: { en: `${base}/en`, es: `${base}/es`, "x-default": `${base}/en` },
    },
    openGraph: {
      title: `${data.identity.name} — ${data.identity.role}`,
      description: data.identity.tagline,
      url: `${base}/${lang}`,
      locale: lang === "es" ? "es_AR" : "en_US",
      alternateLocale: lang === "es" ? "en_US" : "es_AR",
      images: [`${base}/${lang}/opengraph-image`], // see Q4
    },
  };
}
```

### Q3 — Where JSON-LD `Person` schema is injected

**Recommendation: `app/[lang]/layout.tsx`**, as an inline `<script type="application/ld+json">` inside `<head>`, rendered by the SAME (promoted root) layout Server Component that owns `<html lang>` and `generateMetadata`.

**Why layout, not a separate wrapper component:**
- `ClientPage.tsx` is `"use client"` and is the content root — but it does NOT need to be where JSON-LD lives. JSON-LD is `<head>`-scoped metadata, conceptually identical to `generateMetadata`'s output, and `[lang]/layout.tsx` is already a Server Component with access to `params.lang` and `getPortfolioData(lang)`.
- Per Next.js's official JSON-LD guide (confirmed via Context7, `docs/01-app/02-guides/json-ld.mdx`), the pattern is: build a plain object, `JSON.stringify` it, escape `<` to `<` (XSS hardening — Next's own example does `.replace(/</g, '<')` but the safer escape is `<`), and render `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: ...}} />` directly from a Server Component. No client boundary needed — `dangerouslySetInnerHTML` on a plain `<script>` works identically in a Server Component.
- Putting it in `[lang]/layout.tsx` means it's emitted once per locale page, server-rendered into the initial HTML `<head>` (or `<body>` start — Next.js will hoist/dedupe `<script>` tags from layouts appropriately), with ZERO client JS cost — exactly the "zero runtime cost" requirement from PROJECT.md.
- A separate server-component wrapper (e.g., `<PersonSchema lang={lang} />`) is a viable micro-organization choice if you want to keep `layout.tsx` lean, but it's NOT required by any technical constraint — it's purely a code-organization preference. **Recommendation: start inline in `layout.tsx`; extract to `app/components/seo/PersonSchema.tsx` (a Server Component, no `"use client"`) only if `layout.tsx` becomes cluttered.** Either way, it's rendered from the SAME server boundary as `<html>`, so it lands in the initial HTML regardless.

**Concretely:** the `<script type="application/ld+json">` does NOT go inside `ClientPage.tsx` or any of its children. It goes in `[lang]/layout.tsx`'s returned JSX, as a sibling to `{children}` (which is `page.tsx` → `ClientPage`), most naturally inside `<head>`.

### Q4 — OG image route placement

**Recommendation: per-locale file convention, `app/[lang]/opengraph-image.tsx`** (one file, parameterized by the existing `[lang]` segment — NOT two separate hardcoded files, NOT a shared non-localized route).

**Why per-`[lang]` file convention over a shared API route:**
- Next.js's file-convention OG images (`opengraph-image.tsx` inside a route segment) are automatically picked up by `generateMetadata`'s `openGraph.images` resolution AND are statically optimized at build time when there's no `generateImageMetadata`/dynamic fetch — confirmed via Context7 (`docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.mdx`).
- Placing it at `app/[lang]/opengraph-image.tsx` means Next.js generates it once per static param (`en` and `es`, from the SAME `generateStaticParams` already defined in `[lang]/layout.tsx` or `page.tsx`) — i.e., two pre-rendered images at build time, `/en/opengraph-image` and `/es/opengraph-image`, each can show locale-specific text (name/role string in EN vs ES) via `getPortfolioData(lang)`.
- A shared non-localized route (e.g. `app/opengraph-image.tsx` outside `[lang]`) would produce ONE image for both locales — acceptable only if the OG image is purely a logo/visual with no text. Given PROJECT.md's framing ("professional share preview... primary real-world use case: sharing the URL with a person"), a locale-aware image (name + role + tagline, in EN or ES) is more valuable and is "free" given the `[lang]` segment already exists.
- **Recommendation: `app/[lang]/opengraph-image.tsx`**, using `ImageResponse` from `next/og`, reading `getPortfolioData(lang)` for `data.identity.name`/`role`/`tagline`, with `export const size = {width:1200, height:630}` and `export const contentType = 'image/png'` (the standard 1200x630 OG dimensions). Build-time static generation (no `fetch`, no dynamic params beyond `lang` which is already enumerable) keeps it zero-runtime-cost.

**How metadata references it:** Next.js auto-detects `opengraph-image.tsx` in the same segment as the page using it and injects the resolved URL into `openGraph.images` automatically — **no manual reference needed** in `generateMetadata` for the basic case. If `[lang]/layout.tsx` is the root layout and `opengraph-image.tsx` sits in `app/[lang]/`, it applies to `app/[lang]/page.tsx` (the only page in that segment) automatically. Optionally, `generateMetadata` can still explicitly set `openGraph.images: [\`${base}/${lang}/opengraph-image\`]` for clarity/Twitter card fallback (`twitter.images` does NOT auto-inherit from `opengraph-image.tsx` — Twitter card images may need an explicit `twitter-image.tsx` or explicit `twitter.images` metadata field; verify this during implementation if Twitter/X preview is a priority).

### Q5 — `<html lang>`: cookie vs route locale (CRITICAL ARCHITECTURAL DECISION)

**Current state (verified):**
- `app/layout.tsx` (the actual root layout, contains `<html>`/`<body>`) reads `(await cookies()).get("NEXT_LOCALE")?.value || "en"`.
- **The `NEXT_LOCALE` cookie is NEVER SET anywhere in the codebase** — `middleware.ts` reads it (as one of several locale-detection inputs) but never writes/sets it, and no client code sets it either. Grep across `src/` found only 2 occurrences, both reads.
- **Practical consequence: `<html lang>` is ALWAYS `"en"`** for every request, including `/es` pages, because `cookies().get("NEXT_LOCALE")` is always `undefined` and the fallback `|| "en"` always wins. This is a real, currently-shipping bug — `/es` pages have `<html lang="en">`, which is incorrect for accessibility AND for search engines (Google uses `lang`/hreflang as a strong locale signal).
- Root cause: `app/layout.tsx` sits ABOVE `app/[lang]/`, so it has NO access to the `lang` route param — `params` is not passed to `app/layout.tsx` because it's outside the dynamic segment. Cookie-reading was a workaround for this structural gap, and the workaround doesn't even work because nothing sets the cookie.

**Options:**

| Option | Description | Verdict |
|--------|-------------|---------|
| **A. Promote `[lang]/layout.tsx` to root layout** (move `<html>`/`<body>`, fonts, theme script, providers, viewport, metadata into `app/[lang]/layout.tsx`; delete or trivially-reduce `app/layout.tsx`) | `[lang]/layout.tsx` receives `params: Promise<{lang:string}>` directly — `<html lang={(await params).lang}>` is exact, build-time-correct for SSG, zero runtime cost, matches Vercel's own `examples/i18n-routing` reference implementation (confirmed via Context7) | **RECOMMENDED** |
| **B. Keep `app/layout.tsx` as root, make middleware SET the `NEXT_LOCALE` cookie on every locale-prefixed request** | Middleware would need to detect `/en`/`/es` in the path and `response.cookies.set("NEXT_LOCALE", locale)` on every response; root layout reads it. Fixes the immediate symptom (cookie now set) but: (1) cookies are per-request/response, not guaranteed to be present on the FIRST SSR pass of a fresh visit before the cookie round-trips back — there's a real risk of a one-request lag where `<html lang>` is still wrong on first load; (2) couples correctness to middleware execution order and cookie propagation timing, which is fragile and non-obvious; (3) doesn't fix the deeper structural issue that `app/layout.tsx` is the wrong place for locale-dependent `<html>` | NOT RECOMMENDED — fragile, doesn't address root cause, adds a request-timing dependency for a value that's available synchronously from the URL |

**Recommendation: Option A.** This is not just "the fix for `<html lang>`" — it's the SAME structural change (Pattern 1) that also cleanly enables `generateMetadata` (Q2) and JSON-LD (Q3) to live colocated with the locale they describe. Doing Option A once addresses Q2, Q3, AND Q5 simultaneously, because all three need `params.lang` at the SAME boundary.

**Remaining structural question after Option A:** what happens to `app/layout.tsx` itself, given Next.js requires exactly one root layout with `<html>`/`<body>`, and `app/page.tsx` (the `/` → `/en` redirect) lives OUTSIDE `app/[lang]/`?

- `app/page.tsx` does `redirect("/en")` — this is a Server Component that calls `next/navigation`'s `redirect()`, which throws a special exception caught by Next.js to issue an HTTP redirect BEFORE any layout renders meaningfully. It still needs to be wrapped by *some* root layout to be valid (Next.js requires `app/layout.tsx` to exist with `<html>`/`<body>` at the `app/` root — this is non-negotiable per the docs).
- **Resolution:** `app/layout.tsx` MUST continue to exist and MUST continue to define `<html>`/`<body>` (Next.js requirement — cannot be deleted). But it becomes a **minimal, locale-agnostic shell**: `<html lang="en">` (a safe static default — this layout ONLY ever wraps `app/page.tsx`, which immediately redirects to `/en` or `/es` and renders nothing else), `<body>{children}</body>`, no fonts/providers/theme-script/metadata (all of that moves to `[lang]/layout.tsx`). Since `app/page.tsx` renders nothing visible (instant redirect), this root shell's `<html lang>` value is never actually seen by a user or crawler in practice — crawlers follow the redirect to `/en` or `/es`, where `[lang]/layout.tsx`'s correct `<html lang={lang}>` applies.
- Practically: `app/layout.tsx` shrinks to ~10 lines (just `<html lang="en"><body>{children}</body></html>`, importing `globals.css` if needed for the redirect to not flash unstyled content — though since it redirects instantly server-side, even that may be unnecessary). All the real content — fonts, theme script, `<Provider>`, `<Toaster>`, `<SpeedInsights>`, viewport, metadata, JSON-LD — lives in `[lang]/layout.tsx`.

**Net result:** TWO layouts both define `<html>`/`<body>` (Next.js allows this — only the OUTERMOST root layout's `<html>`/`<body>` actually renders for any given route; nested layouts below `app/page.tsx` vs `app/[lang]/...` are on DIFFERENT branches of the route tree, so there's no double-`<html>` conflict — `app/page.tsx` uses `app/layout.tsx`'s `<html>`, while `app/[lang]/page.tsx` uses `app/[lang]/layout.tsx`'s `<html>` and does NOT also render `app/layout.tsx`'s `<html>`, because `app/[lang]/layout.tsx` becoming a root-defining layout for its subtree... 

**IMPORTANT CAVEAT — verify before implementation:** Next.js's root layout requirement is specifically that `app/layout.tsx` (the top-level file) must define `<html>`/`<body>`, and ALL routes pass through it as the outermost layout — layouts NEST, they don't replace each other. A `[lang]/layout.tsx` that ALSO renders `<html>`/`<body>` would, if nested under `app/layout.tsx` which ALSO renders `<html>`/`<body>`, produce NESTED `<html>` tags (invalid HTML) for every `/[lang]/*` route. **This means Option A as "two root layouts on different branches" is NOT how Next.js routing/layout nesting works** — `app/layout.tsx` always wraps everything, including `app/[lang]/...`.

**Therefore, the ACTUAL correct resolution is:**
- `app/layout.tsx` (true, single root layout) keeps `<html>`/`<body>` but becomes locale-agnostic: drop the cookie-based `lang` entirely, use a static `lang="en"` OR omit `lang` (defaults handled by browser) at this level — but ALSO move fonts/providers/theme-script here since they're genuinely global (used by both `/` redirect, which renders nothing, and `/[lang]/*`).
- `app/[lang]/layout.tsx` (nested, NOT a root layout — cannot redefine `<html>`/`<body>`) CANNOT set `<html lang>` directly. Instead, it must communicate the locale to the root layout some other way.

**The only mechanisms that get `params.lang` into `app/layout.tsx`'s `<html lang>` without cookies, given `app/layout.tsx` has no access to `[lang]` params:**
1. **`next/headers` `headers()` + middleware sets a request header** (not a cookie) with the resolved locale, read via `headers()` in `app/layout.tsx`. Middleware already computes `locale` — add `requestHeaders.set('x-locale', locale)` and pass via `NextResponse.next({request:{headers: requestHeaders}})`. `app/layout.tsx` then does `const lang = (await headers()).get('x-locale') ?? 'en'`. This works because middleware runs on EVERY request (matcher already covers all paths) and the header is set on the SAME request/response cycle — no round-trip lag like the cookie approach. **This is the recommended mechanism.**
2. Accept `lang="en"` as a static default on `<html>` in `app/layout.tsx` and rely on `hreflang`/`generateMetadata` (per-locale, correctly scoped to `[lang]/layout.tsx` which CAN be a normal nested layout with its OWN `generateMetadata`) for locale signaling to search engines — `<html lang>` would still be wrong for `/es` but `hreflang` alternates would be correct. **Not recommended** — `<html lang>` mismatch is a known accessibility issue (screen readers mispronounce content) and a real (if secondary) SEO signal.

**FINAL RECOMMENDATION for Q5:** Use **middleware-set request header** (mechanism 1 above): middleware computes `locale` (already does, for path rewriting) and ALSO sets it as a request header `x-locale`; `app/layout.tsx` reads `headers().get('x-locale')` for `<html lang>`. This:
- Requires NO restructuring of the layout tree (no promotion needed for THIS specific concern — `app/[lang]/layout.tsx` stays a normal nested layout and gets its OWN `generateMetadata`/JSON-LD using `params.lang` directly, which IS available to nested layouts).
- Fixes the bug with a ~3-line middleware change + ~1-line `app/layout.tsx` change.
- Has zero request-timing lag (same request, not a cookie round-trip).
- Is the documented Next.js pattern for "pass computed value from middleware to layouts/pages" (headers, not cookies, for read-once-per-request server-side values).

**This changes the overall integration shape:** `[lang]/layout.tsx` does NOT need to become the root layout. It remains nested, gains `generateMetadata` + JSON-LD `<script>` (both fully supported in nested layouts — `params.lang` is available), while `app/layout.tsx` gains a tiny middleware-header read for `<html lang>` only. This is LOWER RISK than Pattern 1's full promotion (smaller diff, no risk of the `app/page.tsx` redirect path losing its root-layout wrapper) while solving Q2, Q3, AND Q5 fully.

**Revised Pattern 1 (supersedes the earlier "promotion" framing):**
```
app/layout.tsx (root, UNCHANGED structurally — still has <html>/<body>, fonts, providers, theme script)
  + <html lang={(await headers()).get('x-locale') ?? 'en'}>   // ONLY this line changes
       ↑ reads header set by middleware

app/middleware.ts
  + sets request header 'x-locale' = computed locale, for ALL requests (including /en, /es, and /)

app/[lang]/layout.tsx (nested, still a thin file but now ALSO carries:)
  + generateMetadata({params}) → per-locale title/description/OG/hreflang/canonical (Q2)
  + <script type="application/ld+json"> Person schema, using params.lang (Q3)
  (still renders {children} = page.tsx → ClientPage, no <html>/<body> here — nested layouts can't define those)
```

This is a SMALLER, SAFER change than full root-layout promotion, achieves identical SEO outcomes for Q2/Q3/Q5, and leaves `app/page.tsx`'s redirect path (which only passes through `app/layout.tsx`, never `[lang]/layout.tsx`) completely undisturbed.

### Q4 revisited under this revised shape

`app/[lang]/opengraph-image.tsx` placement recommendation is UNCHANGED — it's a file-convention sibling to `app/[lang]/page.tsx` and `app/[lang]/layout.tsx`, works identically whether `[lang]/layout.tsx` is root or nested, since `opengraph-image.tsx` resolution is scoped to its containing segment regardless.

## Anti-Patterns

### Anti-Pattern 1: Removing `"use client"` from ClientPage/Hero/Footer to "make them SSR"

**What people do:** Assume `"use client"` is the reason content doesn't appear in SSR HTML, and try to convert `ClientPage.tsx`/`Hero.tsx`/`Footer.tsx` to Server Components.

**Why it's wrong:** `"use client"` does NOT prevent SSR — client components ARE server-rendered for the initial HTML (confirmed, Pattern 3). The actual blocker is the `useTranslation` async gate (a `useState`+`useEffect` pair that's `false` until a `.then()` resolves, which never happens during SSR). These components ALSO genuinely need client-side interactivity (framer-motion `m.div`, voxel mouse-tracking, theme context) — converting them to Server Components would break those features entirely while not being necessary to fix SEO.

**Do this instead:** Keep `"use client"`. Remove only the `useTranslation` gate and its dependencies (Pattern 2). The static `usePortfolioData` import already makes these components SSR-content-complete.

### Anti-Pattern 2: Setting `<html lang>` via client-side `useEffect`

**What people do:** `useEffect(() => { document.documentElement.lang = lang }, [lang])` in a client component.

**Why it's wrong:** Runs AFTER hydration — the initial server-rendered HTML still has the wrong/default `lang`, which is exactly what crawlers and screen readers see first. Defeats the purpose entirely (SEO/AI crawlers don't execute JS reliably, and even when they do, the "time to correct lang" is the whole problem).

**Do this instead:** `<html lang>` must be set during the server render — either via `params.lang` in a layout that has access to it (if it's the actual root layout, per Vercel's i18n example), or via a middleware-set header read in `app/layout.tsx` with `headers()` (the recommended approach here, Q5).

### Anti-Pattern 3: Cookie-based locale state for anything server-rendered on first request

**What people do:** Store the "current locale" in a cookie and read it in layouts for SSR decisions (the CURRENT, broken implementation).

**Why it's wrong:** Cookies require a round trip — a cookie set by middleware on response N is only available to the SERVER on request N+1. On a user's FIRST visit (no cookie yet), or whenever the cookie is absent/stale (as is PERMANENTLY the case here, since nothing sets `NEXT_LOCALE`), the fallback value is used — which is exactly the bug. Cookies are appropriate for PERSISTING a user's override across sessions/navigations, not for deriving same-request state that's ALREADY encoded in the URL.

**Do this instead:** For same-request server-side values derivable from the URL/route (locale from `[lang]` segment), use `params` (if the consuming layout/page is inside that segment) or a middleware-set request header read via `headers()` (if it's outside the segment, like `app/layout.tsx`). Reserve cookies for cross-request user PREFERENCES (e.g., a future "remember my language choice when I visit `/`" feature — which this codebase doesn't currently implement either, since nothing sets `NEXT_LOCALE`).

## Build Order / Dependency Graph

```
                         ┌─────────────────────────────────┐
                         │  STEP 0 (prerequisite, isolated) │
                         │  Confirm CV field location in    │
                         │  common.json + portfolio.types   │
                         │  (en + es) — add `cv` to Identity│
                         │  or PortfolioData type if needed │
                         └────────────────┬──────────────────┘
                                           │
            ┌──────────────────────────────┼──────────────────────────────┐
            ▼                              ▼                              ▼
┌───────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────────┐
│ STEP 1A — SSR FIX       │   │ STEP 1B — <html lang> FIX │   │ STEP 1C — getPortfolioData    │
│ (Pattern 2)             │   │ (Pattern 1 revised, Q5)   │   │ server-safe accessor (NEW)    │
│                         │   │                           │   │                                │
│ - Hero.tsx: drop        │   │ - middleware.ts: set      │   │ - New file, e.g.               │
│   useTranslation,       │   │   x-locale request header │   │   app/i18n/getPortfolioData.ts │
│   use data.cv           │   │ - app/layout.tsx: read    │   │   (same LOCALES map as         │
│ - Footer.tsx: same       │   │   headers().get(          │   │   usePortfolioData but NO      │
│ - ClientPage.tsx: drop   │   │   'x-locale') for         │   │   "use client" — usable from   │
│   useTranslation +       │   │   <html lang>             │   │   generateMetadata / layout /  │
│   LangLoader gate        │   │                           │   │   opengraph-image)             │
│ - Delete i18n/client.ts, │   │ INDEPENDENT of 1A — touch │   │                                │
│   i18n/index.ts,         │   │ different files           │   │ Needed by 2A, 2B, 2C below     │
│   ui/LangLoader.tsx      │   │                           │   │                                │
│   (check __assert.ts)    │   │                           │   │                                │
│ - Remove i18next,         │   │                           │   │                                │
│   react-i18next,          │   │                           │   │                                │
│   i18next-resources-to-   │   │                           │   │                                │
│   backend from package.json│  │                           │   │                                │
└────────────┬────────────┘   └──────────────┬────────────┘   └──────────────┬─────────────────┘
             │                                │                                │
             │   (1A and 1B are independent — can run in parallel;            │
             │    both depend on Step 0 only)                                 │
             │                                │                                │
             └───────────────┬────────────────┘                                │
                              │                                                 │
                              ▼                                                 ▼
                  ┌───────────────────────────────────────────────────────────────────┐
                  │ STEP 2 — METADATA + JSON-LD + OG (depends on 1C; benefits from      │
                  │          1A/1B being done first so content/lang are correct, but    │
                  │          not strictly blocked by them)                              │
                  │                                                                     │
                  │ 2A. app/[lang]/layout.tsx: add generateMetadata()                   │
                  │     (Q2) — title/description/OG/alternates via getPortfolioData    │
                  │                                                                     │
                  │ 2B. app/[lang]/layout.tsx: add <script type="application/ld+json">  │
                  │     Person schema (Q3) — same file, same params.lang               │
                  │                                                                     │
                  │ 2C. app/[lang]/opengraph-image.tsx — NEW file (Q4), uses            │
                  │     getPortfolioData(lang) for locale-aware OG image text           │
                  └───────────────────────────────┬─────────────────────────────────────┘
                                                    │
                                                    ▼
                                  ┌─────────────────────────────────────┐
                                  │ STEP 3 — robots.txt / llms.txt /      │
                                  │ keyword strategy content updates      │
                                  │ (separate workstream, content-only,   │
                                  │ no code-architecture dependency —     │
                                  │ can run any time after Step 0,        │
                                  │ informs the TEXT used in Step 2's     │
                                  │ titles/descriptions/JSON-LD)          │
                                  └─────────────────────────────────────┘
```

**Collision risks to flag for the roadmapper:**

- **Step 1A and 2A/2B both touch files in `app/[lang]/`** — but DIFFERENT files (1A touches `ClientPage.tsx`, `Hero.tsx`, `Footer.tsx`; 2A/2B touch `layout.tsx`). No file-level collision, but if sequenced in the same phase, ensure 1A's deletions (i18n/client.ts etc.) are committed before 2A's new code is written, so there's no accidental re-import of deleted modules.
- **Step 1B touches `app/layout.tsx` and `middleware.ts`** — neither file is touched by 1A or 2A/2B/2C. Fully independent; could even be its OWN phase before everything else, since it's the smallest, most isolated, and unblocks nothing but itself.
- **Step 1C (`getPortfolioData` server-safe accessor) is a NEW small file with no dependents until Step 2** — could be created as part of Step 0 or as the first sub-task of Step 2; either ordering works. Recommend creating it alongside Step 0 since it's trivial (copy `usePortfolioData`'s `LOCALES` map pattern, drop `"use client"` and the `ready` field).
- **Step 2C (OG image) depends on 1C but NOT on 1A/1B** — could theoretically run in parallel with 1A/1B once 1C exists. However, grouping 2A+2B+2C together (all "metadata phase," all touching `[lang]/layout.tsx` + new `opengraph-image.tsx`) is cleaner for review than splitting them.
- **Recommended phase grouping for the roadmap:**
  - **Phase N: SSR Content Fix** = Step 0 + Step 1A (the "surgical fix" — highest priority, directly unblocks crawler-visible content; this alone is the biggest SEO win)
  - **Phase N+1: Locale Correctness** = Step 1B (`<html lang>` fix) — small, isolated, can even be folded into Phase N if convenient since it touches none of the same files
  - **Phase N+2: Metadata & Structured Data** = Step 1C + Step 2A + 2B + 2C (per-locale metadata, JSON-LD, OG image) — depends on Phase N for "correct content to describe" being conceptually true, though not file-level blocked
  - **Phase N+3: Crawler Directives & Keywords** = Step 3 (robots.txt/llms.txt + keyword-informed copy in titles/descriptions, feeding back into Phase N+2's `generateMetadata` strings)

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Search engines / AI crawlers (Googlebot, GPTBot, ClaudeBot, etc.) | Read initial SSR HTML — no JS execution assumed | This entire milestone exists because these crawlers currently see only `<LangLoader/>`'s spinner markup, zero text content |
| Vercel (hosting) | Static generation via `generateStaticParams` (en/es) — `opengraph-image.tsx` also statically generated per locale at build time | No new infra; `next/og`'s `ImageResponse` runs at build time for static params, zero runtime cost per PROJECT.md requirement |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `middleware.ts` ↔ `app/layout.tsx` | Request header (`x-locale`, NEW) | Replaces the dead `NEXT_LOCALE` cookie read for `<html lang>` purposes. Middleware already computes locale for path rewriting — reuse that computation, additionally write it to a request header. |
| `app/[lang]/layout.tsx` ↔ `getPortfolioData(lang)` (NEW server-safe module) | Direct sync function call, `params.lang` → locale key | New module mirrors `usePortfolioData`'s `LOCALES` map but without `"use client"`, usable in `generateMetadata`, JSON-LD script, and `opengraph-image.tsx` |
| `ClientPage.tsx`/`Hero.tsx`/`Footer.tsx` ↔ `usePortfolioData(lang)` | Existing sync static-import pattern, UNCHANGED | Already SSR-safe; only the CV-link read changes from `t("CV")` to `data.cv` |
| `app/[lang]/page.tsx` ↔ `ClientPage.tsx` | Existing prop pass (`lang`), UNCHANGED | No change to this boundary |

## Sources

- Codebase (read directly, HIGH confidence): `my-app/src/app/layout.tsx`, `my-app/src/app/[lang]/layout.tsx`, `my-app/src/app/[lang]/page.tsx`, `my-app/src/app/[lang]/ClientPage.tsx`, `my-app/src/app/page.tsx`, `my-app/src/app/middleware.ts`, `my-app/src/app/i18n/usePortfolioData.ts`, `my-app/src/app/i18n/client.ts`, `my-app/src/app/i18n/index.ts`, `my-app/src/app/i18n-config.ts`, `my-app/src/app/i18n/portfolio.types.ts`, `my-app/src/app/components/Hero.tsx`, `my-app/src/app/components/Footer.tsx`, `my-app/src/app/providers.tsx`, `my-app/src/app/theme/ThemeProvider.tsx`, `my-app/src/app/ui/LangSwitch.tsx`, `my-app/src/app/ui/LangLoader.tsx`, `my-app/src/app/sitemap.ts`, `my-app/package.json`
- Next.js v16.1.6 official docs via Context7 (`/vercel/next.js/v16.1.6`), HIGH confidence:
  - `docs/01-app/03-api-reference/03-file-conventions/layout.mdx` — root layout `<html>`/`<body>` requirement
  - `docs/01-app/02-guides/internationalization.mdx` — `generateStaticParams` + `<html lang={(await params).lang}>` pattern
  - `examples/i18n-routing/app/[lang]/layout.tsx` — reference implementation of `[lang]` as root layout
  - `docs/01-app/03-api-reference/04-functions/generate-metadata.mdx` — metadata merging rules across segments
  - `docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.mdx` — `opengraph-image.tsx` convention, `ImageResponse`, static optimization
  - `docs/01-app/02-guides/json-ld.mdx` — JSON-LD `<script type="application/ld+json">` pattern from a Server Component

---
*Architecture research for: Next.js 16 App Router SEO/AI Discoverability integration (v2.1.0)*
*Researched: 2026-06-13*
