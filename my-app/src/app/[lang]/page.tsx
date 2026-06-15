import ClientPage from "./ClientPage";
import { i18n } from "../i18n-config";
import { getPortfolioData } from "../i18n/getPortfolioData";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // Resolve the active locale's data on the server and inject it; the client
  // bundle no longer imports both locale JSONs (PERF-03).
  const data = getPortfolioData(lang);
  return <ClientPage lang={lang} data={data} />;
}
