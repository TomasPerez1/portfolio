"use client";

import { useEffect } from "react";
import NavBar from "./ui/NavBar";
import Landing from "./(sections)/landing/landing/Landing";
import AboutMe from "./(sections)/landing/about-me/AboutMe";
import Proyects from "./(sections)/landing/proyects/Proyects";
import Contact from "./(sections)/landing/contact/Contact";

export default function Home() {
  // useEffect(() => {
  //   window.scrollTo({
  //     top: 0,
  //     left: 0,
  //     behavior: "smooth",
  //   });
  // }, []);

  return (
    <main className="bg-violet-950 min-h-screen flex">
      <section
        id="navigation"
        className="w-[15%] h-full min-h-screen items-center fixed"
      >
        <NavBar />
      </section>
      <section
        className="ml-[15%] w-[85%] bg-grid-small-white/[0.2]"
        id="content"
      >
        <Landing />
        <AboutMe />
        <Proyects />
        <Contact />
      </section>
    </main>
  );
}
