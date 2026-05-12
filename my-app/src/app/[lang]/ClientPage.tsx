"use client";

import LangLoader from "../ui/LangLoader";
import { useTranslation } from "../i18n/client";
import Nav from "../components/redesign/Nav";
import Hero from "../components/redesign/Hero";
import FeaturedWork, { StackTicker } from "../components/redesign/FeaturedWork";
import ProjectsGrid from "../components/redesign/ProjectsGrid";
import StackSection from "../components/redesign/StackSection";
import Experience from "../components/redesign/Experience";
import About from "../components/redesign/About";
import Contact from "../components/redesign/Contact";
import Footer from "../components/redesign/Footer";

interface ClientPageProps {
  lang?: string;
}

function ClientPage({ lang = "en" }: ClientPageProps) {
  const { ready } = useTranslation(lang, "common");
  if (!ready) return <LangLoader />;
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Nav lang={lang} />
      <Hero lang={lang} />
      <StackTicker />
      <FeaturedWork lang={lang} />
      <ProjectsGrid lang={lang} />
      <StackSection lang={lang} />
      <Experience lang={lang} />
      <About lang={lang} />
      <Contact lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}

export default ClientPage;
