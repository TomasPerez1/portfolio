import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { i18n } from "../i18n-config";

export async function initI18next(lng: string, ns: string) {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`../../../public/locales/${language}/${namespace}.json`),
      ),
    )
    .init({
      lng,
      fallbackLng: i18n.defaultLocale,
      ns: [ns],
      defaultNS: ns,
      interpolation: {
        escapeValue: false,
      },
    });
  return i18nInstance;
}
