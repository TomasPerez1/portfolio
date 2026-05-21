"use client";

import { useEffect, useState } from "react";
import { initI18next } from "./index";
import type { PortfolioData } from "./portfolio.types";

export function usePortfolioData(lng: string) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initI18next(lng, "common").then((i18nInstance) => {
      if (cancelled) return;
      const bundle = i18nInstance.getResourceBundle(lng, "common") as PortfolioData;
      setData(bundle);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [lng]);

  return { data, ready };
}
