import {
  Navbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarMenuItem,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { RiLinkedinBoxFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import github_icon from "@public/skills/github-icon.svg";
import { navlinks } from "./NavBar";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <Navbar
      isBlurred={true}
      className=" h-fit w-[50px] top-0 left-0 fixed z-50 "
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        wrapper: "p-0 m-0 ",
      }}
    >
      <NavbarContent className="border-1 w-[40px] rounded-sm">
        <NavbarMenuToggle className="w-[40px] mx-auto" />
      </NavbarContent>

      <NavbarMenu className="border-[#23034e] border-2 ml-1 mt-1 !max-h-fit rounded-lg py-8 w-[150px] flex flex-col gap-4 overflow-hidden">
        {navlinks.map((item, index) => (
          <NavbarMenuItem
            onClick={() => setIsMenuOpen(false)}
            className={`border-b-[1.5px] text-center ${
              activeSection === item.id &&
              "border-[#ce70f3] font-bold text-[#ce70f3] "
            }`}
            key={index}
          >
            <Link href={`#${item.id}`}>
              <button className="md:text-2xl ">{item.label}</button>
            </Link>
          </NavbarMenuItem>
        ))}
        <a
          onClick={() => setIsMenuOpen(false)}
          target="_blank"
          href="https://www.linkedin.com/in/tomas-perez-developer/"
          className="w-fit mx-auto border-0 p-0 rounded-lg bg-white hover:bg-blue-400"
        >
          <RiLinkedinBoxFill className="w-14 h-14 text-blue-400 hover:text-white transition-colors" />
        </a>
        <a
          onClick={() => setIsMenuOpen(false)}
          target="_blank"
          href="https://github.com/TomasPerez1"
          className="w-fit mx-auto p-0.5 rounded-full bg-white text-center "
        >
          <span className="transition-colors hover:text-black">
            <Image
              alt="Proyect img"
              className="rounded-xl mx-auto transition-all hover:opacity-80 "
              src={github_icon}
              width={56}
              height={56}
            />
          </span>
        </a>
      </NavbarMenu>
    </Navbar>
  );
}
