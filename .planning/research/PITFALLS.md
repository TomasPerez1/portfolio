# Domain Pitfalls — SEO & AI Discoverability (v2.1.0)

**Domain:** Adding per-locale metadata, JSON-LD, OG images, robots/llms.txt, and SSR fix (i18next removal) to an existing Next.js ^16.2.6 App Router bilingual portfolio
**Researched:** 2026-06-13
**Codebase reviewed:** `my-app/src/app/layout.tsx`, `middleware.ts`, `page.tsx`, `sitemap.ts`, `public/robots.txt`, `[lang]/ClientPage.tsx`, `[lang]/layout.tsx`, `[lang]/page.tsx`, `i18n/usePortfolioData.ts`, `i18n/client.ts`, `theme/ThemeProvider.tsx`, `providers.tsx`

---

## Critical Pitfalls

### Pitfall 1: `<html lang>` from cookie diverges from route locale → hydration mismatch + wrong SEO signal

**What goes wrong:** `layout.tsx` currently does:

```tsx
const lang = (await cookies()).get("NEXT_LOCALE")?.value || "en";
return <html lang={lang} suppressHydrationWarning ...>
```

`RootLayout` is OUTSIDE `[lang]/layout.tsx`, so it has no access to the route param — it can only read the `NEXT_LOCALE` cookie. Two failure modes:

1. **SEO**: A first-time visitor to `/es` with no cookie gets `<html lang="en">` while the page content is Spanish. Google associates the wrong language with the page; screen readers mispronounce Spanish content with English phonetics. This directly contradicts the hreflang/canonical work you're about to do — you'd be telling Google "this is the `es` alternate of the `en` page" via `<link hreflang>` while the document itself self-identifies as `lang="en"`.
2. **Hydration**: A returning visitor who switches language has a stale `NEXT_LOCALE=es` cookie but requests `/en`. Server renders `<html lang="es">`. If any client code reads `document.documentElement.lang` (or you later add a component that does), you get a mismatch. `suppressHydrationWarning` on `<html>` only suppresses the *attribute diff warning* — it does NOT make the value correct for crawlers or assistive tech, which read the SSR'd HTML as-is.

**Why it happens:** The cookie was a reasonable proxy back when content was rendered client-side after i18next loaded (the cookie told `useTranslation` which bundle to fetch). Once content SSRs from `[lang]` route params, the cookie is the wrong source of truth — the URL is.

**Consequences:** Mismatched `lang` attribute = Google may apply wrong language classification to the page in search results (wrong snippet language, wrong hreflang validation), and Lighthouse/axe will flag it as an accessibility issue (`html-has-lang` / `html-lang-valid`).

**Prevention:**
- Move the `<html lang>` decision into `[lang]/layout.tsx` (or read `params` in `RootLayout` if you restructure so `RootLayout` is itself under `[lang]`). Since `RootLayout` currently sits above `[lang]`, the cleanest fix given Next 16's nested layout model is either:
  - (a) Make `[lang]/layout.tsx` the *de facto* root by moving `<html>`/`<body>` there (requires `[lang]` to wrap everything, including the redirect page) — bigger refactor, OR
  - (b) Keep `RootLayout` as-is for `<html>`/`<body>` shell, but have it read the locale from the **URL pathname via middleware-injected header** (set `x-locale` header in `middleware.ts`, read via `headers()` in `RootLayout`) rather than the cookie. This is surgical and keeps the existing structure.
- Either way: **stop using the cookie for `<html lang>`**. The cookie can remain for the language *switcher's remembered preference* (redirect target on `/`), but the rendered `lang` attribute must reflect the URL that was actually served.
- Verify with `curl -sI https://.../es | grep -i lang` is wrong (that's a header, not HTML) — instead, view-source the SSR'd HTML for `/es` and confirm `<html lang="es">`.

**Detection:** axe DevTools / Lighthouse accessibility audit flags `html-lang-valid`; manually view-source `/es` and `/en` and diff the `<html>` tag.

**Owning phase:** The `<html lang>` fix phase (explicitly listed in PROJECT.md target features). Must land in the SAME phase as, or before, the hreflang/canonical phase — hreflang correctness depends on this.

---

### Pitfall 2: Spinner-gate removal exposes latent hydration mismatches that were previously hidden

**What goes wrong:** Today, `ClientPage.tsx` does:

```tsx
const { ready } = useTranslation(lang, "common");
if (!ready) return <LangLoader />;
return <main>...</main>;
```

This means: **server renders `<LangLoader />`, client immediately replaces it with the full tree on mount**. Any hydration mismatch inside `Nav`, `Hero`, `About`, `Contact`, etc. is currently INVISIBLE because those components never exist in the server-rendered HTML — they only render after `ready` flips to `true` on the client (a pure client-side re-render, not a hydration diff).

Once you switch to `usePortfolioData` (synchronous, SSR-capable) and remove the `!ready` gate, **the full component tree renders on the server for the first time**. Any `useState`/`useEffect` pattern that produces different output between server and first client render will now surface as a real hydration error (React 19 logs these and, in dev, throws/highlights mismatches; in prod it forces a client re-render of the mismatched subtree, which is a perf and CLS hit).

**Specific risks found in this codebase:**
- `theme/ThemeProvider.tsx`: `useState<Theme>("dark")` initial state, then `useEffect` reads `localStorage`/`matchMedia` and calls `applyTheme` (sets `data-theme` attribute on `<html>`, via `document.documentElement`). This is fine AS LONG AS no component branches its **render output** on `theme` from context before `ready` is true — check `ThemeContext` consumers. If any component does `theme === "dark" ? <A/> : <B/>` synchronously during render (not just CSS), server renders with `theme="dark"` (the initial state) and client may immediately re-render with `"light"` post-effect — that's a content swap, not strictly a "hydration error" (React won't warn because the mismatch happens AFTER hydration, in a `useEffect`), but it IS a visible flash/layout shift now that content is visible from frame one.
- `Nav.tsx`, `Hero.tsx`, `Contact.tsx`: all `window.*`/`Date.now()`/`localStorage` usages found are correctly inside `useEffect` — **good**, these are not hydration risks as written. Keep this pattern for any new SEO-related client code (e.g., a "copy email" button, cooldown timers).
- The pre-hydration `<script dangerouslySetInnerHTML>` in `layout.tsx` sets `data-theme` on `<html>` BEFORE React hydrates. This is correct and intentional (FART/FOUC fix per D-14) — but it means `<html data-theme="...">` will differ between SSR output (no `data-theme` attribute at all, since the script runs client-side only) and the post-script DOM. **This is fine for React hydration** (React doesn't manage the `<html>` element's `data-theme` attribute, so there's nothing for it to "mismatch" against) but `suppressHydrationWarning` on `<html>` is REQUIRED to stay — removing it once content is visible could surface a spurious warning if React ever starts diffing that attribute.

**Why it happens:** Removing a loading gate is the single highest-risk operation for surfacing hydration bugs, because it's the first time the "real" tree hits `hydrateRoot` instead of a placeholder.

**Consequences:** Console hydration errors in production (React 19 still logs them even though it recovers), visible content flashes/CLS on load, and — worse for THIS milestone — **a hydration error that forces React to discard SSR output and re-render client-side defeats the entire purpose of the SSR fix** (crawlers that don't execute JS, or execute it with a timeout, would still see the pre-mismatch SSR content, which is actually fine for SEO, but real users get the flash).

**Prevention:**
- Before removing the gate, grep EVERY component under `src/app/components/` for `useState` initial values that could differ from `localStorage`/`matchMedia`-derived values, and confirm all such reads are inside `useEffect` (not `useMemo`, not render body, not `useState(() => window.matchMedia(...))` lazy initializers — lazy initializers run during render and WILL cause SSR crash since `window` is undefined on server).
- Run a production build (`next build && next start`, not `next dev` — dev mode hides some mismatches) and check browser console for `Hydration failed because the server rendered HTML didn't match the client` warnings on both `/en` and `/es`.
- For theme-dependent UI: prefer CSS (`[data-theme="dark"] .foo { ... }`) over JS branching wherever possible — CSS naturally "catches up" once the pre-hydration script sets `data-theme`, with zero hydration cost.
- If any component genuinely needs to know theme during render (not just CSS), the correct pattern is: render a theme-agnostic default on server + first client paint, then update via `useEffect` + `useState` — accept the one-frame "flash" as a CSS transition rather than a structural DOM mismatch.

**Detection:** Browser console warnings (`next build && next start`, test both locales); React DevTools "Highlight updates" showing post-hydration re-renders of large subtrees; visual flash/CLS in Lighthouse on first load.

**Owning phase:** The SSR content fix phase (i18next/spinner removal) — this is the phase's core risk, not a side effect. Budget explicit verification time (build + console check on both locales) as an exit criterion for this phase, before metadata/JSON-LD phases build on top of it.

---

### Pitfall 3: `usePortfolioData` is marked `"use client"` but is the new SSR data source — module-level JSON import cost and "use client" boundary confusion

**What goes wrong:** `i18n/usePortfolioData.ts` currently has `"use client"` at the top and statically imports both `en/common.json` and `es/common.json`, picking one at call time. Two issues for the SSR migration:

1. **`"use client"` on a data hook used by Server Components**: If `[lang]/page.tsx` (a Server Component, per `async function Page`) wants to call `usePortfolioData` directly to pass props to a Server Component tree (for `generateMetadata` reuse, e.g.), it CAN'T — `"use client"` hooks can only be called from Client Components. PROJECT.md says "Components stay 'use client' but get data synchronously" — so `ClientPage` (already `"use client"`) calling `usePortfolioData` is fine. But `generateMetadata` (which runs server-side, no `"use client"`) needs its OWN data access — it cannot import the `"use client"` hook. You'll need a plain (non-hook, non-"use client") data accessor function (e.g., `getPortfolioData(lang)`) that both the client hook AND `generateMetadata`/JSON-LD can call, to avoid duplicating the JSON-loading logic or accidentally creating a client-only data path that `generateMetadata` can't reach.
2. **Both locale JSON files are bundled regardless of route**: `usePortfolioData.ts` imports BOTH `en/common.json` and `es/common.json` unconditionally (`LOCALES = { en, es }`). Since this module is `"use client"`, both JSON payloads ship in the client bundle for EVERY locale page — `/en` ships ES copy too, and vice versa. This was presumably acceptable when the hook just returned static data, but now that you're SSR'ing real content (likely larger as you expand for SEO — more headings, longer bios, JSON-LD-friendly fields), this doubles the JSON payload shipped to the client unnecessarily.

**Why it happens:** The hook was a stand-in shim (`ready: true` always) written to unblock other work, not designed as the final data layer.

**Consequences:** Larger client bundles (works against the "perf is non-negotiable" goal and the bundle-reduction success metric from v2.0.0), and an architectural dead-end where `generateMetadata`/JSON-LD can't reuse the same data source cleanly, leading to copy-pasted/duplicated locale data access (drift risk between visible content and JSON-LD claims — see Pitfall 5).

**Prevention:**
- Split into: (a) a plain server-safe function `getPortfolioData(lang: Locale): PortfolioData` (no `"use client"`, imports only the requested locale's JSON via dynamic resolution or a switch — NOT both unconditionally), and (b) keep `usePortfolioData` as a thin `"use client"` wrapper that calls it, OR have Server Components call (a) directly and pass data down as props/`data-*` to Client Components.
- For per-locale JSON, prefer `import(`...${lang}.json`)` (dynamic) inside a server function so bundlers can code-split per route, OR keep static imports but ensure the file with BOTH imports is never imported from a Client Component bundle for a single-locale page — i.e., do the locale selection in a server module and pass only the resolved object to client components as props.
- This single data-access function becomes the source of truth for: page content, `generateMetadata` (title/description), JSON-LD `Person` fields, and OG image text — eliminating drift.

**Detection:** `next build` bundle analyzer (`npm run analyze`, already configured) — check that `/en` and `/es` client chunks don't both contain the full content of `en/common.json` + `es/common.json`.

**Owning phase:** SSR content fix phase. This is the foundational data-layer decision that the metadata/JSON-LD/OG phases all depend on — get the shape right here or refactor twice.

---

## Moderate Pitfalls

### Pitfall 4: `/` → `/en` redirect creates canonical/hreflang ambiguity and a redirect chain for crawlers

**What goes wrong:** `page.tsx` (root) does `redirect("/en")` (a Next.js `redirect()` — 307 by default in App Router for `redirect()` calls, NOT 308/permanent unless `permanentRedirect` is used). Meanwhile `middleware.ts` ALSO intercepts `/` and issues `NextResponse.redirect` to `/${locale}` based on cookie/Accept-Language — so `page.tsx`'s redirect is likely dead code (middleware runs first and the matcher includes `/`), but it's worth confirming which one actually fires in production, because:

1. **If middleware redirects `/` → `/es` for Spanish-speaking visitors (Accept-Language based)**, and your `sitemap.ts` lists `https://tomasperezdev.space/en` and `/es` as separate canonical entries with `alternates.languages` pointing at each other — that's fine. BUT if anything (social share, backlink, old bookmark) points at the bare domain `https://tomasperezdev.space/`, crawlers hitting `/` get a 307 to a locale-specific URL based on the CRAWLER's Accept-Language header (likely `en` or none → default `en`). Googlebot generally crawls with no/minimal Accept-Language, so it'll consistently land on `/en` — but other crawlers (and ESPECIALLY AI bots like GPTBot/ClaudeBot, whose Accept-Language behavior is less documented) may get inconsistent redirect targets, fragmenting link equity to `/`.
2. **307 (temporary) vs 308 (permanent)**: `redirect()` in Next.js App Router uses 307 for the default case in Server Components/Route Handlers. A temporary redirect tells Google "don't transfer ranking signals to the target, the source URL is still canonical." For a permanent root→locale redirect that will NEVER change, this is the wrong signal — Google may keep `/` in its index as a separate (empty/redirect) entity. Use `permanentRedirect()` (308) for the App Router redirect, or configure the redirect in `next.config` with `permanent: true`, OR handle it in middleware with an explicit 308.
3. **No canonical for `/` itself**: Since `/` 30x-redirects, it has no `<head>`, so no canonical tag exists for it — that's actually correct (redirects don't need canonicals), but make sure `sitemap.ts` and `robots.txt` never reference the bare `/` as a crawlable URL (currently they don't — `sitemap.ts` only lists `/en` and `/es`, good).

**Why it happens:** Two redirect mechanisms (middleware + page-level `redirect()`) for the same path is a leftover from incremental development; nobody audited which one wins or what status code it returns.

**Consequences:** Minor — but for a portfolio where the bare domain is the most-shared URL (business cards, LinkedIn, resume), getting this wrong means the canonical "front door" URL never gets indexed/ranked directly, and any link equity pointing at `https://tomasperezdev.space/` (no path) doesn't cleanly consolidate into `/en`.

**Prevention:**
- Remove the dead `page.tsx` redirect OR confirm via `curl -sI https://tomasperezdev.space/` in production which one fires, and which status code is returned.
- Switch to a 308 (permanent) redirect for `/` → `/en` (or locale-matched), since this mapping is structural and permanent.
- Confirm `sitemap.ts` never lists bare `/` (already correct as read).
- Decide explicitly: does `/` always go to `/en` (simplicity, EN-canonical strategy mentioned in PROJECT.md), or does it locale-match via Accept-Language (current middleware behavior)? PROJECT.md says "EN canonical, ES support" — for SEO consistency, redirecting bare `/` ALWAYS to `/en` (regardless of Accept-Language) may actually be simpler and more predictable for crawlers, while keeping the in-app language switcher for human visitors. This is a product decision, not just technical — flag for the roadmap.

**Detection:** `curl -sI https://tomasperezdev.space/` (check status code: 307 vs 308, and `Location` header); test with different `Accept-Language` headers via `curl -H "Accept-Language: es"`.

**Owning phase:** Canonical/hreflang phase. Should be resolved before or alongside sitemap finalization.

---

### Pitfall 5: hreflang return-link asymmetry and self-referencing canonical errors

**What goes wrong:** `sitemap.ts` already does `alternates.languages` correctly for the sitemap (both `en` and `es` list both languages, symmetric — good baseline). The risk is in `generateMetadata` for `[lang]/page.tsx`, which is net-new work:

1. **Self-referencing canonical**: Every locale page MUST set its OWN canonical to ITSELF (`/en` → canonical `/en`, `/es` → canonical `/es`). A common mistake (confirmed by research — see sources) is setting canonical on `/es` to point at `/en` "because EN is canonical for the site." That's WRONG for hreflang — "EN canonical" in PROJECT.md means EN is the *primary/default* market, NOT that `/es`'s `<link rel="canonical">` should point at `/en`. If `/es` canonicalizes to `/en`, Google will likely drop `/es` from its index entirely (treating it as a duplicate), defeating the entire ES-support goal.
2. **hreflang return-link symmetry**: If `/en`'s `alternates.languages` lists `{ es: '.../es', 'x-default': '.../en' }` but `/es`'s `alternates.languages` does NOT list `en` back (or lists a different URL), Google treats the hreflang annotations as invalid/unconfirmed and may ignore them. Both pages must reference each other AND themselves (self-reference in hreflang is recommended practice, alongside the alternate).
3. **`x-default` used more than once or on the wrong page**: Only ONE entry across the whole hreflang set should be `x-default` (typically pointing at the EN version, matching "EN canonical"). Don't add `x-default` separately on both `/en` and `/es` — it's a single shared annotation value, present once per page's alternate-set, pointing at the same target page everywhere.
4. **Cross-locale `metadataBase` resolution**: Next.js resolves relative `alternates.canonical`/`languages` paths against `metadataBase` (must be set, e.g., `new URL('https://tomasperezdev.space')`, in root layout metadata or per-page). If `metadataBase` is missing, Next.js falls back to `http://localhost:3000` in some configurations and LOGS A WARNING in production builds — easy to miss, results in canonical/og:url pointing at localhost in production HTML.

**Why it happens:** hreflang is inherently a "graph" (every page must agree about every other page in the set) — easy to implement asymmetrically when each locale page generates its `alternates` independently without a shared source of truth.

**Prevention:**
- Centralize hreflang generation: one function `getAlternates(currentLang: Locale)` that, given the CURRENT locale, returns `{ canonical: '/{currentLang}', languages: { en: '/en', es: '/es', 'x-default': '/en' } }` — called identically from both `/en` and `/es` `generateMetadata`, with only `currentLang` (hence `canonical`) varying.
- Set `metadataBase` ONCE in root layout metadata (`metadataBase: new URL('https://tomasperezdev.space')`) so all per-locale pages can use relative paths and avoid hardcoding the domain in 2+ places (drift risk if domain ever changes).
- After implementation, validate with: view-source on both `/en` and `/es`, confirm canonical is self-referencing on each, and hreflang sets are identical (modulo which one is "self" vs "alternate") on both pages. Google Search Console's "International Targeting" report (if available) or a third-party hreflang validator (e.g., merkle/sistrix hreflang tag testing tools) can confirm.

**Detection:** View-source both locale pages and diff `<link rel="canonical">` and `<link rel="alternate" hreflang="...">` tags; check for `localhost` in any URL; run a hreflang validator tool against the live sitemap.

**Owning phase:** Per-locale metadata / canonical-hreflang phase. This is the highest-value, highest-risk-of-silent-failure phase — silent because Google doesn't error, it just quietly ignores bad hreflang.

---

### Pitfall 6: JSON-LD `Person` schema — claiming things not visible on page, invalid/ignored fields, and drift from real content

**What goes wrong:** PROJECT.md explicitly frames AI-protagonist positioning as "grounded in real existing content... must NOT keyword-stuff or fabricate." JSON-LD `Person` schema has several failure modes specific to this constraint:

1. **Content-schema mismatch**: Google's structured data guidelines state markup must reflect content "visible to users on the page" (not necessarily literally, but it must be truthful and substantiated). If the JSON-LD `Person.jobTitle` says "AI/Agentic Development Engineer" but the visible page copy (hero, about) primarily talks about "Full-stack Developer" with AI as one bullet point, that's a mismatch Google can detect (they've stated they may ignore or, in egregious cases, take manual action on markup that doesn't match page content). The keyword strategy and the JSON-LD must be written FROM THE SAME SOURCE — likely the same `getPortfolioData()` function from Pitfall 3.
2. **`sameAs` requires REAL, owned profile URLs**: `sameAs` should link to LinkedIn, GitHub, etc. that are genuinely Tomás's profiles and ideally cross-link back (LinkedIn "Featured" section linking to the portfolio strengthens entity association). Don't include placeholder/example URLs.
3. **Fields Google's Rich Results don't visually surface for `Person` on a portfolio**: Unlike `Article`, `Product`, or `JobPosting`, a bare `Person` schema on a personal site typically does NOT produce a "rich result" (no special SERP snippet) — its value is for the Knowledge Graph / entity disambiguation and for AI crawlers/LLMs parsing structured data, NOT for a visual SERP feature. Don't over-invest expecting a rich snippet; the Rich Results Test may report "no eligible enhancements" for `Person` alone, which is EXPECTED and not a failure. Combining with `ProfilePage` (via `mainEntity`) or `WebSite`/`Organization` (for the site itself) is more likely to be validated as "valid" by the test, even if no rich result renders.
4. **Comments inside JSON-LD `<script>` blocks**: If hand-writing/templating the JSON-LD string, any `//` or `/* */` comments inside the JSON break the Rich Results Test parser (and strict JSON-LD parsers) even though some tools silently strip them — JSON itself has NO comment syntax. Generate via `JSON.stringify(object)`, never via hand-written template strings with comments.
5. **Invalid/unrecognized properties silently ignored**: Properties like `knowsAbout`, `knowsLanguage` (note: singular `knowsLanguage` not `knowsLanguages`), `award`, `alumniOf` are valid `Person` properties — but inventing properties (e.g., a custom `aiExpertise` field) will be silently ignored by Google (not an error, just dead weight). Stick to actual schema.org `Person` vocabulary: `name`, `jobTitle`, `description`, `url`, `image`, `sameAs`, `worksFor`, `knowsAbout`, `knowsLanguage`, `nationality`/`address` (use cautiously — can expose more location detail than intended), `alumniOf`.
6. **Duplicate/conflicting `Person` entities across pages**: If both `/en` and `/es` emit a `Person` JSON-LD block, they should describe the SAME entity (same `@id` if using `@id`/`url` for entity linking) with localized `description`/`jobTitle` text — not two different "people." Use the canonical URL (`/en`, since EN is canonical) as the stable `@id` if you choose to set one, or omit `@id` and rely on `url` + `sameAs` for identity (simpler, lower risk of inconsistency).

**Prevention:**
- Derive ALL JSON-LD field values from the SAME `getPortfolioData(lang)` function used for visible content (Pitfall 3) — never hand-author separate "SEO copy" that diverges from on-page copy.
- Validate every locale's JSON-LD with Google's Rich Results Test (https://search.google.com/test/rich-results) AND the schema.org validator (https://validator.schema.org/) — Rich Results Test focuses on Google-eligible rich results (may say "no enhancements" for plain `Person`, which is fine); schema.org validator checks raw vocabulary correctness — use BOTH.
- Keep the `Person` claims conservative and verifiable: "AI-driven/agentic development" framing should appear in `description`/`jobTitle`/`knowsAbout` ONLY in proportion to how prominently it appears in visible hero/about copy. If the keyword strategy phase decides to make AI-protagonist messaging MORE prominent in visible copy, do that FIRST, then let JSON-LD follow — never the reverse.
- Render JSON-LD via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />` in a Server Component (zero client cost, as PROJECT.md specifies) — never via a client-side library that injects it post-hydration (bots/crawlers with limited JS execution may miss it).

**Detection:** Google Rich Results Test + schema.org validator on both `/en` and `/es`; manual side-by-side read of visible hero/about copy vs JSON-LD `description`/`jobTitle`/`knowsAbout` to confirm no overclaiming.

**Owning phase:** JSON-LD Person schema phase — but content/wording must be FINALIZED in the keyword-strategy phase first (dependency: keyword strategy → JSON-LD, not parallel).

---

### Pitfall 7: next/og `ImageResponse` — edge runtime, font loading, and per-locale OG image cost on Vercel

**What goes wrong:** Several gotchas specific to `next/og` `ImageResponse` (App Router file convention `opengraph-image.tsx`) on Vercel + Next 16:

1. **Font loading requires manual `fs.readFile`**: `ImageResponse` does NOT automatically inherit `next/font` (Bricolage Grotesque/Geist/JetBrains Mono used elsewhere in this project). Fonts must be explicitly loaded via `readFile(join(process.cwd(), 'assets/Font.ttf'))` and passed via the `fonts` option — `next/font`'s CSS-variable approach doesn't work inside the Satori-based image renderer. This means you need a SEPARATE copy of font files (TTF/OTF, NOT WOFF2 — Satori has limited WOFF2 support; TTF/OTF are safest) bundled specifically for OG image generation, increasing repo size and requiring a decision about which weight/family to ship for the OG image (likely just the display font, not all three).
2. **Edge vs Node runtime**: `ImageResponse` works in both, but if other parts of the app (API routes for contact form, per D-10 Nodemailer) are Node runtime and you want OG generation on Edge for speed, confirm the `runtime` export doesn't conflict with shared utilities — `getPortfolioData()` (Pitfall 3) must be Edge-compatible if `opengraph-image.tsx` sets `export const runtime = 'edge'` (static JSON imports are fine on Edge; just verify no Node-only APIs like `fs` outside the font-loading `readFile`, which IS supported on Edge via `node:fs/promises` in recent Next versions — but verify on your exact Vercel deployment).
3. **8MB file size limit for STATIC `opengraph-image.(png|jpg)`** — not directly relevant since you're using dynamic `ImageResponse`, but if you ALSO add a static fallback image, it must stay under 8MB or the build fails.
4. **Caching of dynamically generated OG images**: Dynamic `ImageResponse` routes are functions — by default on Vercel they may run on EVERY social-share crawl unless cached. For a portfolio where the OG image content (name, title, tagline) is essentially STATIC per locale (doesn't change per-request), generating it dynamically on every request is wasted compute. Since the content comes from static JSON (not a database), strongly prefer making `opengraph-image.tsx` effectively static — Next.js will attempt to statically render `ImageResponse` routes during build if there's no per-request dynamic data (no `searchParams`, no `cookies()`/`headers()` calls) — verify this happens (check build output for the OG image route being marked static/SSG) rather than assuming.
5. **Per-locale variants = 2x generation + 2x font-loading overhead**: With `[lang]/opengraph-image.tsx` (one per locale via the `[lang]` segment), each locale gets its own image — correct for SEO (localized OG title/description in the image itself) but doubles build-time image generation work and font file reads. Keep the OG template SIMPLE (text + brand colors, no complex layouts/gradients) to keep Satori render time low — complex flexbox/gradient layouts in `ImageResponse` are noticeably slower to render than simple text-on-solid-background.
6. **`size` export must match `openGraph.images` dimensions expectations**: Standard is 1200x630 (1.91:1) for `summary_large_image` Twitter cards (already configured in `layout.tsx` metadata) — if `opengraph-image.tsx`'s `size` export doesn't match, Twitter/LinkedIn previews may crop awkwardly.

**Prevention:**
- Use the SAME `getPortfolioData(lang)` (Pitfall 3) to source OG image text — no separate copy.
- Load 1-2 font weights MAX (e.g., Bricolage Grotesque Bold for the name/title), as TTF, stored in a dedicated `assets/og/` directory.
- Keep the OG template minimal: solid/gradient background (CSS gradient, cheap), name + role + tagline text, maybe a small accent shape. Avoid images-within-images (nested `<img>` in the ImageResponse tree adds fetch latency).
- Confirm in `next build` output whether `[lang]/opengraph-image` is prerendered (static) — if it shows as dynamic (ƒ), investigate whether `cookies()`/`headers()`/`searchParams` are inadvertently used.
- Test actual rendered output via Vercel's OG image debugging (`/en/opengraph-image` direct URL hit) on a preview deployment before relying on social platform caches (Facebook/LinkedIn/Twitter cache OG images aggressively — use their respective debuggers — Facebook Sharing Debugger, Twitter Card Validator, LinkedIn Post Inspector — to force re-scrape during testing).

**Detection:** `next build` output (static vs dynamic route marking); manual hit on `/en/opengraph-image` and `/es/opengraph-image` to inspect render time and visual output; social platform debugger tools.

**Owning phase:** OG image phase. Should come AFTER the keyword-strategy/copy phase (image text should match finalized title/description) and AFTER `getPortfolioData()` exists (Pitfall 3 dependency).

---

### Pitfall 8: robots.txt / llms.txt — accidentally blocking AI crawlers via middleware, or sitemap/robots inconsistency

**What goes wrong:**

1. **Middleware matcher could intercept crawler requests to `/en`/`/es` unexpectedly**: Current `middleware.ts` matcher is `["/", "/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)"]`. Requests to `/en` and `/es` already "have a locale" (per `pathHasLocale` check) so middleware passes them through via `NextResponse.next()` — this is CORRECT and crawler-safe today. The risk is if FUTURE changes to middleware (e.g., bot-detection, A/B testing, geo-redirects) add logic that runs BEFORE the `pathHasLocale` check and could redirect/block based on User-Agent. AI crawlers (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Claude-SearchBot) typically send IDENTIFIABLE User-Agent strings AND often DO NOT send a typical browser `Accept-Language` header — if `getLocale()`'s Accept-Language parsing ever becomes the basis for a redirect that ALSO applies to already-localized paths, malformed/missing Accept-Language from bots could produce unexpected redirects. Currently this is NOT an issue (localized paths skip the locale-detection logic entirely) — but flag it as a regression risk for ANY future middleware changes.
2. **`robots.txt` currently allows everything (`User-agent: * / Allow: /`)** — good baseline, AI crawlers that respect `robots.txt` (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, OAI-SearchBot, Claude-SearchBot, Claude-User, ChatGPT-User, Perplexity-User) are all currently allowed by the wildcard. The risk when "tuning for AI crawlers" is OVER-SPECIFYING: adding explicit `User-agent: GPTBot` blocks (e.g., copy-pasted from a "protect your content from AI training" article) WITHOUT realizing that:
   - `Google-Extended` controls whether Google's Gemini/AI features can use content for training — separate from regular Googlebot indexing. Blocking `Google-Extended` does NOT affect normal Search ranking, but DOES affect whether the portfolio surfaces in AI Overviews/Gemini answers about "who is Tomás Pérez" — for a portfolio explicitly trying to be AI-discoverable, you likely WANT `Google-Extended` allowed.
   - If the goal is "AI agents/recruiters using AI search tools should find this portfolio," you want `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, and the `-User`/`-SearchBot` variants ALL allowed — the only reason to block any of them would be bandwidth/cost concerns on a high-traffic site, which doesn't apply to a portfolio.
   - A subtle mistake: blocking `CCBot` (Common Crawl) thinking it's unrelated, when several AI training pipelines (including some used by smaller AI labs) source from Common Crawl — if the goal is maximum AI discoverability, don't block it either.
3. **llms.txt is NOT a recognized standard by major crawlers** (as of current information) — it's a proposed convention with no confirmed adoption by GPTBot/ClaudeBot/Googlebot for crawl-control purposes (unlike `robots.txt`, which IS universally respected). Treat `llms.txt` as a NICE-TO-HAVE "for-humans-and-future-bots" curated summary file (a `/llms.txt` static file with a clean Markdown overview of the site/person), NOT as something that affects crawling/indexing decisions. Don't over-invest engineering time here, and don't let its presence create a false sense that "AI crawler config is done" — `robots.txt` + structured data + actual SSR'd content are what matter for current AI crawler behavior.
4. **Sitemap URL correctness with trailing slashes / locale paths**: `sitemap.ts` generates `${BASE_URL}/${locale}` = `https://tomasperezdev.space/en` and `/es` — no trailing slash. Confirm this EXACTLY matches the canonical URLs set in `generateMetadata` (Pitfall 5) — a sitemap entry for `/en` while canonical says `/en/` (or vice versa) is a (minor but avoidable) inconsistency signal.
5. **`robots.txt` `Sitemap:` directive vs `sitemap.ts` file convention**: Current static `public/robots.txt` hardcodes `Sitemap: https://tomasperezdev.space/sitemap.xml`. If you migrate `robots.txt` itself to the `app/robots.ts` file convention (recommended for consistency with `sitemap.ts` and to use `MetadataRoute.Robots`), make sure the static `public/robots.txt` is REMOVED — Next.js will warn or behave unpredictably if both a static file AND a route convention exist for the same path (`public/` files are served as-is and may take precedence, silently making your `app/robots.ts` dead code).

**Prevention:**
- For robots.txt: keep it SIMPLE. `Allow: /` for `*` is already correct for AI discoverability. If adding explicit AI-bot rules, ADD explicit `Allow` rules for `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `OAI-SearchBot`, `Claude-SearchBot`, `ChatGPT-User`, `Claude-User`, `Perplexity-User` (redundant with the wildcard `Allow: /`, but EXPLICIT allows communicate intent clearly to anyone auditing the file, and protect against a future blanket-disallow being added without re-checking AI bot impact).
- If migrating to `app/robots.ts`, DELETE `public/robots.txt` in the same change, and verify `https://tomasperezdev.space/robots.txt` serves the NEW generated content post-deploy (not a cached static file).
- Treat `/llms.txt` as a content/curation task (write a clean Markdown summary of who Tomás is, what he does, links to key pages) — low engineering risk, but sequence it AFTER the keyword-strategy phase so its content matches the finalized positioning.
- Double-check sitemap URLs vs canonical URLs for trailing-slash consistency (Next.js's default `trailingSlash: false` should make both consistent — verify `next.config` doesn't override this).

**Detection:** `curl https://tomasperezdev.space/robots.txt` post-deploy (confirm it's the NEW content, not stale `public/` file); test middleware with bot User-Agents (`curl -A "GPTBot" https://.../en`) to confirm no unexpected redirects/blocks; Google Search Console "Sitemaps" report for indexing status of both locale URLs.

**Owning phase:** robots.txt/llms.txt phase. Sitemap consistency check should be a cross-cutting verification step at the end of the canonical/hreflang phase AND the robots phase.

---

## Minor Pitfalls

### Pitfall 9: Keyword/SEO anti-patterns — title/H1/content mismatch and AI-protagonist over-optimization

**What goes wrong:**
- `layout.tsx` currently sets a GLOBAL `metadata.title`/`description`/`keywords` ("Full-stack Developer... Node.js, React, Next.js... Argentina, Buenos Aires") that applies to BOTH `/en` and `/es` unless overridden by `[lang]/page.tsx`'s `generateMetadata`. Once per-locale `generateMetadata` is added, the GLOBAL metadata becomes the FALLBACK/PARENT — Next.js metadata MERGES parent and child (objects merge, but `title`/`description` typically get REPLACED by the child if set, not merged). Verify per-locale `generateMetadata` actually OVERRIDES title/description (test by viewing source) — if it only ADDS fields, you could end up with English title text on the `/es` page if the child doesn't explicitly set `title`.
- The `keywords` meta tag (`metadata.keywords` → `<meta name="keywords">`) has been IGNORED by Google for ranking purposes for over a decade. It's not harmful, but spending keyword-strategy effort stuffing this field is wasted effort relative to spending it on visible H1/hero copy, `description`, and JSON-LD `description`/`knowsAbout`. Don't over-index on this field — a short, accurate list is fine; a long "keyword soup" list (signal of over-optimization to a human reviewer/recruiter who views source) is actively bad for the "senior dev, not keyword-stuffer" impression.
- **AI-protagonist positioning risk**: if the keyword-strategy phase pushes terms like "agentic development," "LLM orchestration," "Claude Code" heavily into `<title>`/`<meta description>`/JSON-LD `knowsAbout` but the H1/hero/about VISIBLE copy still leads with "Full-stack Developer... Node.js, React" (current copy, per `layout.tsx`), that's a title-vs-H1-vs-content mismatch — both an SEO weak signal (Google may rewrite the `<title>` in SERPs if it doesn't match page content/H1) AND exactly the "fabricating" risk PROJECT.md explicitly wants to avoid. The fix is sequencing: update the VISIBLE hero/about copy (via `getPortfolioData` JSON) to genuinely foreground AI/agentic work FIRST (this is a content/copy task, likely belongs to the keyword-strategy phase itself, not a separate "SEO metadata" phase), THEN derive title/description/JSON-LD from that updated copy.

**Prevention:**
- Sequence: keyword research → UPDATE VISIBLE COPY (hero tagline, about section) in `public/locales/{en,es}/common.json` → THEN write `generateMetadata`/JSON-LD that reflects the updated copy. Never write metadata that "leads" content that doesn't exist yet.
- Verify per-locale `generateMetadata` title/description actually override (not just extend) the root layout's, via view-source on both `/en` and `/es`.
- Keep `keywords` array short (5-10 terms) and accurate — treat it as a minor/legacy field, not a strategy surface.

**Owning phase:** Keyword strategy phase (copy updates) MUST precede or be bundled with the per-locale metadata phase.

---

### Pitfall 10: Performance regressions from metadata/JSON-LD/OG work — async work in `generateMetadata`, duplicated data parsing, render-blocking script tags

**What goes wrong:**
- `generateMetadata` functions that do `await fetch(...)` or other async I/O for STATIC data (which this portfolio's content is — local JSON) ADD LATENCY to the response if not memoized — Next.js DOES dedupe identical `fetch()` calls within a request via the fetch cache, but a hand-written `await readFile(...)` for, say, OG image fonts or JSON-LD data, called separately in `generateMetadata`, the page component, AND `opengraph-image.tsx`, each re-reads/re-parses if not using Next's `fetch`/`cache()` dedup. Since the data here is static JSON already in the bundle (via `getPortfolioData`, Pitfall 3), this is mostly a non-issue IF you centralize on that one synchronous function — but if someone "helpfully" adds an `await` around a synchronous JSON read (cargo-culting the `generateMetadata` async signature), it adds unnecessary microtask overhead per request (small, but the principle matters: don't make synchronous data async without reason).
- **`generateStaticParams` + `dynamicParams` interaction**: `[lang]/page.tsx` already has `generateStaticParams` returning `["en", "es"]`. Confirm `generateMetadata` for these routes is ALSO statically generated (it should be, since it depends only on `params.lang` which is one of two known values, and static JSON data) — if `generateMetadata` accidentally references `cookies()`/`headers()` (e.g., copy-pasting the `RootLayout` cookie-reading pattern from Pitfall 1 into the new metadata function), it FORCES the route to be dynamically rendered at request time (opts out of static generation), which is a real performance regression for a route that should be fully static/ISR.
- **JSON-LD `<script>` tag placement and size**: A large `Person` JSON-LD blob (especially if it includes long bio text duplicated from the page) inlined in `<head>` adds to initial HTML payload — for a `Person` schema this is typically small (a few KB), so not a major concern, but avoid duplicating VERY long content (e.g., the full `longBio` array) into JSON-LD `description` if it's already substantial visible text — a shorter, focused `description` (1-2 sentences) is both schema-appropriate and lighter.
- **Theme script + new SSR content interaction**: The pre-hydration `<script>` in `layout.tsx` runs synchronously in `<head>` BEFORE body content paints — this is correct and already accounted for (D-14). Just confirm that NOW that real content renders immediately (post spinner-gate removal), this script doesn't become a LARGER relative blocker — it's tiny (a few lines), so this is low-risk, but worth a quick Lighthouse "Render-blocking resources" check after the SSR fix lands, since LCP-relevant content now appears much earlier and any render-blocking resource has proportionally more impact on the LCP metric.

**Prevention:**
- Keep `getPortfolioData(lang)` fully SYNCHRONOUS (no `await`, no `fetch`) — it's reading bundled JSON, there's no I/O.
- After implementing `generateMetadata` for `[lang]/page.tsx` and `opengraph-image.tsx`, run `next build` and confirm the route segments show as static/SSG (●  or similar static indicator in build output), not `ƒ` (dynamic).
- Keep JSON-LD `description` concise; don't dump entire bio arrays into structured data.
- Run Lighthouse on `/en` and `/es` AFTER the full milestone (SSR fix + metadata + JSON-LD + OG) and compare LCP/CLS/INP against the v2.0.0 baseline — the success metrics table in PROJECT.md gives concrete targets (LCP<2.5s, CLS<0.1, INP<200ms, Lighthouse ≥90/≥80) that should be RE-VERIFIED, not assumed to "still pass" because the SSR fix is "perf-positive" in isolation — cumulative additions (JSON-LD size, OG image route, additional `<link>` tags for hreflang) all add (small) overhead that should be measured, not assumed negligible.

**Detection:** `next build` output (static vs dynamic route markers); Lighthouse CI run on both locales post-implementation; compare bundle analyzer output before/after.

**Owning phase:** Cross-cutting — each phase that touches `generateMetadata`/JSON-LD/OG should verify static generation isn't broken; a final "performance verification" pass (likely the last phase of the milestone) should re-run Lighthouse against the success metrics table for both `/en` and `/es`.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| SSR content fix (remove i18next/spinner) | Hydration mismatches surface for the first time (Pitfall 2); `usePortfolioData` data-layer shape (Pitfall 3) | `next build && next start`, check console on `/en` and `/es`; refactor data access into a shared sync server function BEFORE building metadata/JSON-LD on top |
| `<html lang>` fix | Cookie-derived lang diverges from route locale (Pitfall 1) | Source `lang` from URL/middleware header, not `NEXT_LOCALE` cookie; verify via view-source |
| Per-locale `generateMetadata` (canonical/hreflang) | Self-referencing canonical errors, hreflang asymmetry, `x-default` misuse, `metadataBase` missing (Pitfall 5); title/description override vs merge with root layout (Pitfall 9) | Centralized `getAlternates(lang)` helper; set `metadataBase` once; view-source diff both locales |
| `/` → `/en` redirect | 307 vs 308, dead redirect code path, crawler Accept-Language inconsistency (Pitfall 4) | Audit which redirect mechanism actually fires; use 308 for permanent locale redirect |
| JSON-LD `Person` schema | Content/schema mismatch ("fabrication" risk), invalid/ignored properties, comments-in-JSON, expecting a rich-result that won't render (Pitfall 6) | Derive from same data source as visible copy; validate with Rich Results Test AND schema.org validator; sequence AFTER keyword/copy phase |
| OG image (`next/og`) | Font loading (TTF not WOFF2, manual `readFile`), per-locale generation cost, static-vs-dynamic route (Pitfall 7) | Minimal template, 1-2 font weights, verify static generation in build output |
| robots.txt / llms.txt | Over-blocking AI crawlers (or under-allowing `Google-Extended`), static `public/robots.txt` vs `app/robots.ts` collision (Pitfall 8) | Explicit `Allow` for AI bot user-agents; remove static file if migrating to route convention; treat llms.txt as content task |
| Keyword strategy / AI-protagonist copy | Title/H1/content mismatch, keyword stuffing, fabricated claims (Pitfall 9) | Update visible copy FIRST, derive metadata/JSON-LD from updated copy SECOND |
| Final performance verification | Cumulative small regressions (JSON-LD size, extra `<link>` tags, OG route) breaking LCP/CLS/INP targets (Pitfall 10) | Lighthouse re-run on both locales against PROJECT.md success metrics table as an explicit milestone exit criterion |

---

## Sources

- Next.js v16.2.2 official docs (via Context7 `/vercel/next.js/v16.2.2`):
  - `generate-metadata.mdx` — `alternates` (canonical/languages/x-default resolution), `metadataBase`, OpenGraph absolute URL requirement (HIGH confidence)
  - `image-response.mdx` / `opengraph-image.mdx` / `app-icons.mdx` — `ImageResponse` font loading via `readFile`, 8MB static image limit, size/contentType exports (HIGH confidence)
  - `robots.mdx` — `MetadataRoute.Robots` shape, caching behavior of `robots.ts` (HIGH confidence)
  - `version-15.mdx` / `version-16.mdx` upgrade guides — async `params`/`cookies()`/`headers()`, `PageProps` helper, fetch caching defaults (not cached by default) (HIGH confidence)
- Codebase inspection (HIGH confidence, direct read):
  - `my-app/src/app/layout.tsx`, `middleware.ts`, `page.tsx`, `sitemap.ts`, `public/robots.txt`, `[lang]/{layout,page,ClientPage}.tsx`, `i18n/{usePortfolioData,client,index}.ts`, `theme/ThemeProvider.tsx`, `providers.tsx`, `i18n-config.ts`
- WebSearch (MEDIUM confidence — multiple sources agree, cross-check against official docs recommended at implementation time):
  - hreflang/canonical self-referencing and `x-default` mistakes — Search Engine Journal "Ask An SEO," SEOClarity self-referencing hreflang guide, SearchViu hreflang/canonical conflict guide
  - AI crawler user-agent names (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, OAI-SearchBot, Claude-SearchBot, ChatGPT-User, Claude-User, Perplexity-User) — Anagram.ai, Fokal AI crawler access guide (2026)
  - JSON-LD content/schema mismatch and `sameAs` guidance — SALT.agency JSON-LD beginners guide, Google Search Central structured data intro (referenced, not directly fetched)
- Note: `Person` schema rich-result eligibility (no standalone rich result for plain `Person`) is based on general schema.org/Google structured-data knowledge (MEDIUM confidence) — recommend a quick direct check of Google's "Person" structured data page (developers.google.com/search/docs/appearance/structured-data) during the JSON-LD phase to confirm current eligibility rules haven't changed.
