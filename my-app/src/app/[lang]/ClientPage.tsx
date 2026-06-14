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

interface ClientPageProps {
  lang?: string;
}

function ClientPage({ lang = "en" }: ClientPageProps) {
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Nav lang={lang} />
      <Hero lang={lang} />
      <StackTicker />
      <About lang={lang} />
      <FeaturedWork lang={lang} />
      {/* <ProjectsGrid lang={lang} /> */}
      <StackSection lang={lang} />
      <Experience lang={lang} />
      <Contact lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}

export default ClientPage;
