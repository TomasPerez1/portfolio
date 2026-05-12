/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // v2 design tokens
        bg:         "var(--c-bg)",
        fg:         "var(--c-fg)",
        "fg-soft":  "var(--c-fg-soft)",
        "fg-faint": "var(--c-fg-faint)",
        line:       "var(--c-line)",
        "line-2":   "var(--c-line-2)",
        card:       "var(--c-card)",
        "card-2":   "var(--c-card-2)",
        spark:      "var(--c-spark)",
        "spark-2":  "var(--c-spark-2)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body:    ["var(--font-body)",    "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)",    "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest:  "-0.04em",
        tightish:  "-0.03em",
        tightish2: "-0.02em",
      },
      animation: {
        ticker:        "tickerFlow 38s linear infinite",
        "scroll-line": "scrollLine 2s ease-in-out infinite",
        "spin-slow":   "spinSlow 30s linear infinite",
      },
      keyframes: {
        tickerFlow: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-33.333%)" },
        },
        scrollLine: {
          "0%,100%": { transform: "scaleY(.4)", transformOrigin: "top" },
          "50%":     { transform: "scaleY(1)",  transformOrigin: "top" },
        },
        spinSlow: { to: { transform: "rotate(360deg)" } },
      },
      screens: {
        xs: "440px",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
