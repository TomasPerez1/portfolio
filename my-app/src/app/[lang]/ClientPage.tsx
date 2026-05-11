"use client";

import LangLoader from "../ui/LangLoader";
import { useTranslation } from "../i18n/client";
import NavWrapper from "../components/redesign/wrappers/NavWrapper";
import HeroWrapper from "../components/redesign/wrappers/HeroWrapper";
import FeaturedWorkWrapper from "../components/redesign/wrappers/FeaturedWorkWrapper";
import ProjectsGridWrapper from "../components/redesign/wrappers/ProjectsGridWrapper";
import StackSectionWrapper from "../components/redesign/wrappers/StackSectionWrapper";
import ExperienceWrapper from "../components/redesign/wrappers/ExperienceWrapper";
import AboutWrapper from "../components/redesign/wrappers/AboutWrapper";
import ContactWrapper from "../components/redesign/wrappers/ContactWrapper";
import FooterWrapper from "../components/redesign/wrappers/FooterWrapper";
import { StackTicker } from "../components/redesign/FeaturedWork";

interface ClientPageProps {
  lang?: string;
}

function ClientPage({ lang = "en" }: ClientPageProps) {
  const { ready } = useTranslation(lang, "common");
  if (!ready) return <LangLoader />;
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <NavWrapper lang={lang} />
      <HeroWrapper lang={lang} />
      <StackTicker />
      <FeaturedWorkWrapper lang={lang} />
      <ProjectsGridWrapper lang={lang} />
      <StackSectionWrapper lang={lang} />
      <ExperienceWrapper lang={lang} />
      <AboutWrapper lang={lang} />
      <ContactWrapper lang={lang} />
      <FooterWrapper lang={lang} />
    </main>
  );
}

export default ClientPage;
