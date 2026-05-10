# Context

> Source: `.planning_docs/REDESIGN-SPEC.md` [SPEC] § 3, § 6
> Describes the current state of the codebase and the migration mapping.

---

## Current Stack (v1)

- **Framework:** Next.js 14.2.16, App Router, TypeScript
- **UI Lib:** NextUI 2.4 (to be replaced)
- **Styling:** TailwindCSS 3.3
- **3D:** `@splinetool/react-spline` — two cloud-hosted scenes (to be removed)
- **Animation:** Framer Motion 11
- **i18n:** i18next + react-i18next + next-i18next, `[lang]` route segment, locales at `public/locales/{en,es}/common.json`
- **Email:** Nodemailer + custom EmailTemplate
- **Calendar:** react-calendly
- **Toasts:** sonner
- **Analytics:** @vercel/speed-insights

## Current File Structure (relevant)

```
my-app/src/app/
├── (sections)/landing/
│   ├── about-me/          → replaced by About.tsx (bento)
│   ├── contact/           → Contact.tsx restyled, logic preserved
│   ├── landing/           → replaced by Hero.tsx (voxel)
│   └── proyects/          → split into FeaturedWork.tsx + ProjectsGrid.tsx
├── ui/
│   ├── NavBar.tsx + SideBar.tsx  → merged into Nav.tsx (floating pill)
│   ├── LangSwitcher.tsx   → integrated into Nav.tsx
│   └── Loader.tsx / LangLoader.tsx  → audit in Phase 4
├── [lang]/                → preserved, App Router i18n
├── i18n/                  → preserved
├── api/                   → preserved
└── providers.tsx          → NextUIProvider → HeroUIProvider

my-app/public/locales/
├── en/common.json         → extended with new i18n keys
└── es/common.json         → extended with new i18n keys
```

## Design Source

Pre-built by Claude Design at `.claude_design/export/`:
- `Page.jsx` — composition root
- `tailwind.config.js` — design token extension
- `styles/globals.css` — CSS variables + atoms
- `lib/portfolio-data.js` — flat copy object (to be split into i18n keys)
- `components/` — 9 components (all JSX, to be converted to TSX)

Reference screenshots (10 JPEGs) at `.claude_design/screenshots_designed/`.

## Visual Token System

```css
--c-bg: #0a0a0a        --c-fg: #ededed
--c-spark: #b521ff     --c-spark-2: #d946ef   /* signature purple */
--c-card: #111111      --c-card-2: #161616
--font-display: "Bricolage Grotesque"
--font-body: "Geist"
--font-mono: "JetBrains Mono"
```

Custom animations: `tickerFlow` (38s marquee), `scrollLine` (vertical pulse), `spinSlow` (30s rotation).

## Component Migration Map

| v1 | v2 | Action |
|----|----|----|
| NavBar.tsx + SideBar.tsx | Nav.tsx | Replace + merge |
| LangSwitcher.tsx | Into Nav.tsx | Move (keep logic) |
| Landing.tsx | Hero.tsx | Replace (Spline → voxel) |
| Proyects.tsx | FeaturedWork.tsx + ProjectsGrid.tsx | Split |
| ProyectCard.tsx | Internal ProjectsGrid | Replace |
| Carousel.tsx | (removed) | Drop |
| AboutMe.tsx + siblings | About.tsx | Replace (bento) |
| Contact.tsx | Contact.tsx | Restyle (keep logic) |
| SendEmail.tsx | Into Contact | Adapt |
| Adress.tsx | Into Contact | Merge |
| EmailTemplate.tsx | EmailTemplate.tsx | Preserve as-is |
| — | StackSection.tsx | New |
| — | Experience.tsx | New |
| — | Footer.tsx | New |
| — | StackTicker (in FeaturedWork) | New |

## i18n Key Namespaces (new)

```
identity.{name, tagline, statusLine, location, timezone, role, available, english}
hero.{eyebrow, ctaPrimary, ctaSecondary, ctaCv}
sections.{featured, projects, stack, experience, about, contact}.{title, eyebrow, description}
featured.[].{title, role, stack, description, link}
projects.[].{title, year, stack, description}
stack.{frontend, backend, db, devops, tools}.[]
experience.[].{role, company, period, bullets[]}
about.{bio, bento[]}
contact.{form: {name, email, message, submit}, success, error}
footer.{copy, builtWith, version}
```

Obsolete keys removed: `spline.rotate`, `spline.rotate-mobile`.

## Deployment Target

Vercel. Branch: `v2.0.0`. Merges: `v2.0.0` → `develop` → production after Phase 9.
