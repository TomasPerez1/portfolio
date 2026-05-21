/** Tailwind config — drop-in for Next.js / Vite + Tailwind v3 or v4 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{js,jsx,ts,tsx,html,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg:       "var(--c-bg)",
        fg:       "var(--c-fg)",
        "fg-soft":  "var(--c-fg-soft)",
        "fg-faint": "var(--c-fg-faint)",
        line:     "var(--c-line)",
        "line-2": "var(--c-line-2)",
        card:     "var(--c-card)",
        "card-2": "var(--c-card-2)",
        purple:   "#22014d",
        spark:    "var(--c-spark)",
        "spark-2":"var(--c-spark-2)",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        body:    ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tightish: "-0.03em",
        tightish2: "-0.02em",
      },
      animation: {
        "ticker": "tickerFlow 38s linear infinite",
        "scroll-line": "scrollLine 2s ease-in-out infinite",
        "spin-slow": "spinSlow 30s linear infinite",
      },
      keyframes: {
        tickerFlow: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-33.333%)" } },
        scrollLine: { "0%,100%": { transform: "scaleY(.4)", transformOrigin: "top" }, "50%": { transform: "scaleY(1)", transformOrigin: "top" } },
        spinSlow: { to: { transform: "rotate(360deg)" } },
      },
    },
  },
  plugins: [],
};
