# Portfolio — Tailwind JSX Components

Drop-in React + Tailwind components for Tomás Pérez's portfolio. Works with **Next.js 14+ (App Router)**, **Vite + React**, or any React 18 setup with Tailwind.

## Structure

```
export/
├── Page.jsx                     # Composes everything — your page entry
├── tailwind.config.js           # Theme tokens (colors, fonts, animations)
├── styles/
│   └── globals.css              # CSS variables + reusable @apply atoms
├── lib/
│   ├── portfolio-data.js        # All copy, projects, stack, experience
│   └── data-loader.js           # ES module wrapper (see notes)
└── components/
    ├── Nav.jsx
    ├── Hero.jsx                 # Voxel art motif, status, CTAs
    ├── FeaturedWork.jsx         # 3 case-study cards + StackTicker + SectionHeader
    ├── ProjectsGrid.jsx         # The other 6 projects
    ├── StackSection.jsx         # 5-column stack matrix
    ├── Experience.jsx           # Timeline with hover-to-expand bullets
    ├── About.jsx                # Bento grid
    ├── Contact.jsx              # Form + calendar preview
    └── Footer.jsx
```

## Setup (Next.js)

1. Install Tailwind v3+:
   ```bash
   npm i -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
2. Replace `tailwind.config.js` with the one in this folder.
3. Import `styles/globals.css` once at the app root (e.g. `app/layout.jsx`).
4. **Important — fix the data import:**
   `lib/portfolio-data.js` is the original `data.js` that attached its object to `window`. For ES-module imports, change the top of that file from:
   ```js
   window.PORTFOLIO_DATA = { ... };
   ```
   to:
   ```js
   export const PORTFOLIO_DATA = { ... };
   ```
   Then update `Page.jsx` to `import { PORTFOLIO_DATA } from "./lib/portfolio-data";` (already done in this template).
5. Render `<Page />` from your route file.

## Setup (Vite + React)

```bash
npm create vite@latest my-portfolio -- --template react
cd my-portfolio
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then:
- Drop the `export/` files in `src/`.
- Import `globals.css` in `main.jsx`.
- Render `<Page />` from `App.jsx`.

## Theming

All colors are CSS variables. Toggle theme by setting `data-theme="light"` on `<html>` (the `Nav` component does this for you).

To change the accent color, edit `--c-spark` in `globals.css`:
```css
:root { --c-spark: #b521ff; --c-spark-2: #d946ef; }
```

## Fonts

Loaded from Google Fonts in `globals.css`:
- **Bricolage Grotesque** — display
- **Geist** — body
- **JetBrains Mono** — code / labels

For production, self-host them or use `next/font` for better performance.

## Assets

The Hero uses no external images. Featured cards reference `/assets/projects-current.jpg` and About references `/assets/about-current.jpg` — drop your real images at those paths in your `public/` folder, or update the paths in `lib/portfolio-data.js` and `components/About.jsx`.

## Notes

- All components are marked `"use client"` for Next.js App Router compatibility (they use hooks).
- The voxel hero is pure CSS 3D — no Three.js dependency.
- The contact form is non-functional out of the box — wire `onSubmit` to your endpoint.
