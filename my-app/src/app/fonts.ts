import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  // "swap" keeps the signature stroked headline rendering in Bricolage (the brand
  // font) — "optional" was dropping it to the fallback on cold cache, which looked
  // wrong on the -webkit-text-stroke surname. The font is preloaded and the routes are
  // static (fast edge delivery), so the swap lands quickly; adjustFontFallback +
  // the size-matched fallback below keep any residual layout shift minimal.
  display: "swap",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

// Geist is distributed by Vercel via the `geist` package (NOT next/font/google).
// Re-aliased so the variable matches the design token contract (--font-body).
export const geist = GeistSans;

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
