import ClientPage from "./ClientPage";
import { i18n } from "../i18n-config";
import { useTranslation } from "../i18n/client"; // Nueva importación

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default function Page({ params }: { params: { lang: string } }) {
  // Opcional: Si necesitas traducciones en el servidor
  return <ClientPage lang={params.lang} />;
}
