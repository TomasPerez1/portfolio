"use client";

import NavBar from "../ui/NavBar";
import Landing from "../(sections)/landing/landing/Landing";
import AboutMe from "../(sections)/landing/about-me/AboutMe";
import Proyects from "../(sections)/landing/proyects/Proyects";
import Contact from "../(sections)/landing/contact/Contact";
import SideBar from "../ui/SideBar";
import LangLoader from "../ui/LangLoader";
import { useTranslation } from "../i18n/client";

interface ClientPageProps {
  lang?: string;
}

function ClientPage({ lang = "en" }: ClientPageProps) {
  const { ready } = useTranslation(lang, "common");
  return ready ? (
    <main className="bg-violet-950 min-h-screen flex overflow-hidden">
      <section className="sm:hidden relative p-0">
        <SideBar lang={lang} />
      </section>
      <section
        id="navigation"
        className="hidden sm:inline fixed sm:w-[20%] lg:w-[15%] h-full min-h-screen mx-auto top-0 z-50"
      >
        <NavBar lang={lang} />
      </section>
      <section
        className="w-full !max-w-full sm:ml-[20%] lg:ml-[15%] flex flex-col justify-between gap-8 bg-grid-small-white/[0.2]"
        id="content"
      >
        <Landing lang={lang} />
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
