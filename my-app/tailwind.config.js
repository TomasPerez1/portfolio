/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
// const { keyframes } = require("framer-motion");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const svgToDataUri = require("mini-svg-data-uri");
const colors = require("tailwindcss/colors");


module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flyonui/dist/js/*.js",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // v2 design tokens
        bg:        "var(--c-bg)",
        fg:        "var(--c-fg)",
        "fg-soft":  "var(--c-fg-soft)",
        "fg-faint": "var(--c-fg-faint)",
        line:      "var(--c-line)",
        "line-2":  "var(--c-line-2)",
        card:      "var(--c-card)",
        "card-2":  "var(--c-card-2)",
        purple:    "#22014d",
        spark:     "var(--c-spark)",
        "spark-2": "var(--c-spark-2)",
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)',    'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)',    'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest:  "-0.04em",
        tightish:  "-0.03em",
        tightish2: "-0.02em",
      },
      animation: {
        "ticker":      "tickerFlow 38s linear infinite",
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
        xs: '440px',
      },
    },
  },
  darkMode: "class",
  plugins: [nextui(), function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-grid": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-grid-small": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-dot": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },],
};


