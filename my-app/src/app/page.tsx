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
        className="w-[30%] sm:w-[15%] h-full min-h-screen mx-auto fixed top-0 z-50"
      >
        <NavBar />
      </section>
      <section
        className="ml-[30%] w-full h-[400vh] sm:w-[85%] sm:ml-[15%] bg-grid-small-white/[0.2] border-2"
        id="content"
      >
        <h1 className="mt-20">Soy el section</h1>
        {/* <Landing />
        <AboutMe />
        <Proyects />
        <Contact /> */}
      </section>
    </main>
  );
}
