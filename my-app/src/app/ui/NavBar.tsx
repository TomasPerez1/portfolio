"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const navlinks = [
  { label: "About me", id: "about-me" },
  { label: "Proyects", id: "proyects" },
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

  return (
    <div className="border-2 border-orange-600 h-screen">
      <nav className="border-2 w-full h-full flex flex-col items-center">
        <div className="gap-7 flex flex-col items-center h-fit border-2  border-yellow-500">
          {navlinks.map((link, index) => (
            <div
              key={index}
              className={`w-full text-center ${
                activeSection === link.id
                  ? "border-b-2 border-[#6a2984] font-bold text-[#6a2984] "
                  : "border-2 "
              }`}
            >
              <Link href={`#${link.id}`}>
                <button className="md:text-2xl ">{link.label}</button>
              </Link>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
