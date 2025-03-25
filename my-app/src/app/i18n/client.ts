"use client";

import { useEffect, useState } from "react";
import { initI18next } from "./index";

export function useTranslation(lng: string, ns = "common") {
  const [ready, setReady] = useState(false);
  const [t, setT] = useState<(key: string) => string>(() => (key) => key);

  useEffect(() => {
    initI18next(lng, ns).then((i18nInstance) => {
      setT(() => i18nInstance.getFixedT(lng, ns));
      setReady(true);
    });
  }, [lng, ns]);

  return { t, i18n: { language: lng }, ready };
}
