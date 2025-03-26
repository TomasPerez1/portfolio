import ClientPage from "./ClientPage";
import { i18n } from "../i18n-config";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default function Page({ params }: { params: { lang: string } }) {
  return <ClientPage lang={params.lang} />;
}
