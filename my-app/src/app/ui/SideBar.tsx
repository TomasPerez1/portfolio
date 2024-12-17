import {
  Navbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarItem,
  NavbarBrand,
  Button,
} from "@nextui-org/react";
import { useState } from "react";
import { Ri24HoursFill, RiLinkedinBoxFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import github_icon from "@public/skills/github-icon.svg";
import { navlinks } from "./NavBar";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

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

      <NavbarMenu className="border-[#23034e] border-2 ml-1 mt-1 !max-h-fit  rounded-lg  py-8 w-[150px] flex flex-col gap-4 ">
        {navlinks.map((item, index) => (
          <NavbarMenuItem className="border-b-[1.5px] text-center" key={index}>
            <Link href={`#${item.id}`}>
              <button className="md:text-2xl ">{item.label}</button>
            </Link>
          </NavbarMenuItem>
        ))}
        <a
          target="_blank"
          href="https://www.linkedin.com/in/tomas-perez-developer/"
          className="w-fit mx-auto border-0 p-0 rounded-lg bg-white hover:bg-blue-400"
        >
          <RiLinkedinBoxFill className="w-14 h-14 text-blue-400 hover:text-white transition-colors" />
        </a>
        <a
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
              // fill={true}
            />
          </span>
        </a>
        {/* <span className="flex gap-0 border-2 justify-between">
          <a
            target="_blank"
            href="https://github.com/TomasPerez1"
            className="w-fit border-0 p-0 rounded-lg bg-white hover:bg-blue-400"
          >
            <RiLinkedinBoxFill className="w-14 h-14 text-blue-400 hover:text-white transition-colors" />
          </a>
          <a
            target="_blank"
            href="https://github.com/TomasPerez1"
            className="w-fit p-0.5 rounded-full bg-white text-center "
          >
            <span className="transition-colors hover:text-black">
              <Image
                alt="Proyect img"
                className="rounded-xl mx-auto transition-all hover:opacity-80 "
                src={github_icon}
                width={56}
                height={56}
                // fill={true}
              />
            </span>
          </a>
        </span> */}
      </NavbarMenu>
    </Navbar>
  );
}
