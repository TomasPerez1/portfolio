"use client";

import Nav from "../components/Nav";
import Hero from "../components/Hero";
import FeaturedWork, { StackTicker } from "../components/FeaturedWork";
import ProjectsGrid from "../components/ProjectsGrid";
import StackSection from "../components/StackSection";
import Experience from "../components/Experience";
import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { PortfolioDataProvider } from "../i18n/usePortfolioData";
import type { PortfolioData } from "../i18n/portfolio.types";

interface ClientPageProps {
  lang?: string;
  data: PortfolioData;
}

function ClientPage({ lang = "en", data }: ClientPageProps) {
  return (
    <PortfolioDataProvider value={data}>
      <main className="bg-bg min-h-screen flex flex-col">
        <Nav lang={lang} />
        <Hero lang={lang} />
        {/* <StackTicker /> */}
        <About lang={lang} />
        <FeaturedWork lang={lang} />
        {/* <ProjectsGrid lang={lang} /> */}
        <StackSection lang={lang} />
        <Experience lang={lang} />
        <Contact lang={lang} />
        <Footer lang={lang} />
      </main>
    </PortfolioDataProvider>
  );
}

export default ClientPage;
