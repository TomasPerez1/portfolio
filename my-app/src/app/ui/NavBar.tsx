"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/client";

export default function NavBar({ lang }: { lang: string }) {
  const { t } = useTranslation(lang, "common");
  const navlinks = [
    { label: t("nav.about-me"), id: "about-me" },
    { label: t("nav.proyects"), id: "proyects" },
    { label: t("nav.contact"), id: "contact" },
  ];

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
    <div className=" h-screen">
      <nav className=" w-full h-full flex flex-col justify-center items-center">
        <div className="gap-14 flex flex-col items-center h-fit ">
          {navlinks.map((link, index) => (
            <div
              key={index}
              className={`w-full text-center text-xl border-b-[1.5px] ${
                activeSection === link.id
                  ? "border-[#b52eeb] font-bold text-[#b52eeb] "
                  : ""
              }`}
            >
              <Link
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(link.id);
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <button className="md:text-2xl ">{link.label}</button>
              </Link>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
