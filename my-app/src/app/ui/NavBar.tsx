"use client";

import { Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";
import { useEffect, useState } from "react";

const navlinks = [
  { label: "About me", id: "about-me" },
  { label: "Proyects", id: "proyects" },
  { label: "Skills", id: "skills" },
  { label: "Contact", id: "contact" },
];

export default function NavBar() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      let isAnySectionVisible = false;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          isAnySectionVisible = true;
        }
      });
      if (!isAnySectionVisible) {
        setActiveSection(null);
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    navlinks.forEach((link) => {
      const element = document.getElementById(link.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    console.log(activeSection);
  }, [activeSection]);

  return (
    <Navbar
      position="sticky"
      className="my-auto flex flex-col items-center"
      height="100vh"
      classNames={{
        item: ["data-[active=true]:after:border-b-2"],
      }}
    >
      <NavbarContent className="gap-7 flex flex-col items-center h-fit ">
        {navlinks.map((link, index) => (
          <NavbarItem
            key={index}
            className={
              activeSection === link.id
                ? "border-b-2 border-[#6a2984] font-bold text-[#6a2984]"
                : ""
            }
          >
            <button
              className="text-2xl"
              onClick={() => {
                document.querySelector(`#${link.id}`).scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              {link.label}
            </button>
          </NavbarItem>
        ))}
      </NavbarContent>
    </Navbar>
  );
}
