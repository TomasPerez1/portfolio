"use client";

import { useEffect } from "react";
import NavBar from "./ui/NavBar";
import Landing from "./(sections)/landing/landing/Landing";
import AboutMe from "./(sections)/landing/about-me/AboutMe";
import Proyects from "./(sections)/landing/proyects/Proyects";
import Contact from "./(sections)/landing/contact/Contact";
import SideBar from "./ui/SideBar";

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
      <section className="sm:hidden relative  p-0 ">
        <SideBar />
      </section>
      <section
        id="navigation"
        className="hidden sm:inline fixed sm:w-[15%] h-full min-h-screen mx-auto  top-0 z-50"
      >
        <NavBar />
      </section>
      <section
        className="w-full h-[400vh] sm:ml-[15%] bg-grid-small-white/[0.2] "
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
