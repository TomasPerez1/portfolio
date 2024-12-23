import React from "react";
import { RiLinkedinBoxFill, RiFileDownloadLine } from "@remixicon/react";
import Image from "next/image";
import github_icon from "@public/skills/github-icon.svg";

export default function ExternalLinks() {
  return (
    <article className="flex gap-6 items-center justify-between pb-2 border-b-[1.5px] w-fit mx-auto mt-7">
      <a
        target="_blank"
        href="https://www.linkedin.com/in/tomas-perez-developer/"
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
          />
        </span>
      </a>
      <a
        download
        href="/CV_TOMAS_PEREZ_esp.pdf"
        className="w-fit text-center text-lg  px-1 py-0.5   border-[1px] hover:brightness-200 transition-colors bg-red-600 flex rounded-lg items-center"
      >
        <p className="text-xl">CV</p>

        <RiFileDownloadLine className="w-12 h-12 text-white" />
      </a>
    </article>
  );
}
