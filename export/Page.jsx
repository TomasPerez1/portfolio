"use client";
import { useEffect, useState } from "react";

import Nav           from "./components/Nav";
import Hero          from "./components/Hero";
import { StackTicker } from "./components/FeaturedWork";
import FeaturedWork  from "./components/FeaturedWork";
import ProjectsGrid  from "./components/ProjectsGrid";
import StackSection  from "./components/StackSection";
import Experience    from "./components/Experience";
import About         from "./components/About";
import Contact       from "./components/Contact";
import Footer        from "./components/Footer";

import { PORTFOLIO_DATA } from "./lib/portfolio-data";

export default function Page() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const data = PORTFOLIO_DATA;

  return (
    <div id="top" className="font-body bg-bg text-fg">
      <Nav theme={theme} onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
      <Hero data={data.identity} showStatus />
      <StackTicker />
      <FeaturedWork items={data.featured} />
      <ProjectsGrid items={data.more} />
      <StackSection stack={data.stack} />
      <Experience items={data.experience} />
      <About identity={data.identity} />
      <Contact identity={data.identity} />
      <Footer />
    </div>
  );
}
