"use client";

import AboutMe from "../(sections)/landing/about-me/AboutMe";
import Proyects from "../(sections)/landing/proyects/Proyects";
import Contact from "../(sections)/landing/contact/Contact";
import LangLoader from "../ui/LangLoader";
import { useTranslation } from "../i18n/client";
import NavWrapper from "../components/redesign/wrappers/NavWrapper";
import HeroWrapper from "../components/redesign/wrappers/HeroWrapper";

interface ClientPageProps {
  lang?: string;
}

function ClientPage({ lang = "en" }: ClientPageProps) {
  const { ready } = useTranslation(lang, "common");
  return ready ? (
    <main className="bg-bg min-h-screen flex flex-col">
      <NavWrapper lang={lang} />
      <HeroWrapper lang={lang} />
      <section className="flex flex-col gap-8 bg-grid-small-white/[0.2]" id="content">
        <AboutMe lang={lang} />
        <Proyects lang={lang} />
        <Contact lang={lang} />
      </section>
    </main>
  ) : (
    <LangLoader />
  );
}

export default ClientPage;
