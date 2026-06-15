"use client";

import { createContext, useContext } from "react";
import type { PortfolioData } from "./portfolio.types";

/**
 * Holds the active locale's portfolio data, injected once by the server via
 * `<PortfolioDataProvider>` (data from `getPortfolioData(lang)`). Reading from
 * context instead of statically importing both locale JSONs means the client
 * bundle ships ONLY the active locale's data (PERF-03), not both.
 */
export const PortfolioDataContext = createContext<PortfolioData | null>(null);

export const PortfolioDataProvider = PortfolioDataContext.Provider;

/**
 * Returns the active locale's portfolio data from context.
 * The `lng` argument is accepted for backward compatibility with existing call
 * sites but is no longer used to select data — the server already resolved the
 * locale via `getPortfolioData(lang)` and injected it.
 */
export function usePortfolioData(_lng?: string) {
  const data = useContext(PortfolioDataContext);
  if (!data) {
    throw new Error(
      "usePortfolioData must be used within <PortfolioDataProvider>",
    );
  }
  return { data, ready: true };
}
