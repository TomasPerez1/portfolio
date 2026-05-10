import React from "react";
import { RiArrowDownDoubleFill } from "@remixicon/react";
import { useTranslation } from "../../../i18n/client";
import LangSwitcher from "../../../ui/LangSwitcher";

export default function Landing({ lang }: { lang: string }) {
  // i18n hook kept warm; phase 5 voxel will reuse it.
  useTranslation(lang, "common");

  return (
    <div>
      <div className="w-fit right-3 z-50 top-3 fixed">
        <LangSwitcher lang={lang} />
      </div>
      <section className="h-screen w-full  relative flex flex-col gap-2 items-center justify-center lg:flex-row lg:gap-5  xl:gap-10">
        <div className=" flex items-center flex-shrink-0 ">
          <span className="w-fit text-center mx-auto ">
            <h1 className="text-[5.5rem] sm:text-[6rem] lg:text-[7.7rem] xl:text-[8.5rem]  leading-none font-sans">
              TOMAS <br /> PEREZ
            </h1>
            <h2 className="text-[1.5rem] sm:text-2xl  px-2 text-[#cda3ff]">
              FULLSTACK DEVELOPER
            </h2>
          </span>
        </div>
        {/* TODO(phase-5): replace with voxel CSS 3D hero */}
        <div
          aria-hidden
          className="relative z-4 w-[220px] h-[250px] lg:w-[320px] lg:h-[350px] flex items-center justify-center border border-line-2 rounded-2xl text-fg-faint font-mono text-[10px] uppercase tracking-[.14em]"
        >
          [hero placeholder · phase 5 voxel]
        </div>

        <div className="w-fit mx-auto bottom-1  animate-[bounce_2s_infinite] mt-auto absolute z-50">
          <RiArrowDownDoubleFill className="w-20 h-20" />
        </div>
      </section>
    </div>
  );
}
