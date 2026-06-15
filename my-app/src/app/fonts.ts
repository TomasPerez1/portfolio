import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  // "optional" instead of "swap": on a cold first visit, if Bricolage isn't ready
  // within ~100ms the browser keeps the (metric-adjusted) fallback and does NOT swap
  // it later — eliminating the layout shift on the huge clamp(80px,…,275px) headline
  // (main CLS source). adjustFontFallback (default true) keeps the fallback metrics
  // close to Bricolage so the difference is barely noticeable; the real font is used
  // on subsequent navigations once cached.
  display: "optional",
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
