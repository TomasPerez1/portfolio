// lib/portfolio-data.js — re-export the data as ES modules for Next/Vite
import "./portfolio-data.js";
export const PORTFOLIO_DATA = (typeof window !== "undefined" ? window.PORTFOLIO_DATA : null);
// Note: the bundled data.js attaches to `window`. In a Next.js / Vite project,
// either move the object to a default export, or re-paste the data here.
