import React, { Suspense, useState } from "react";
const Spline = React.lazy(() => import("@splinetool/react-spline"));
import {
  RiArrowGoForwardFill,
  RiArrowGoBackFill,
  RiArrowDownDoubleFill,
} from "@remixicon/react";
import Loader from "../../../ui/Loader";
import { useTranslation } from "../../../i18n/client";
import LangSwitcher from "../../../ui/LangSwitcher";

export default function Landing({ lang }: { lang: string }) {
  const { t } = useTranslation(lang, "common");
  const [showBanner, setShowBanner] = useState(false);

  function manageBanner() {
    setShowBanner(true);
  }

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
        <div className="relative z-4  w-[220px] h-[250px] lg:w-[320px] lg:h-[350px]">
          <Suspense fallback={<Loader className="w-full h-full" />}>
            <div className="lg:hidden">
              <Spline
                onLoad={manageBanner}
                scene="https://prod.spline.design/C9mC3iFFASk9TjnB/scene.splinecode"
              />
              <span
                className={`${showBanner ? "flex " : "hidden"} gap-2 p-1  items-center justify-center rounded-lg w-[140px]  h-[40px] bg-gray-900 text-center text-white absolute z-40 right-4 bottom-[15px] `}
              >
                <RiArrowGoForwardFill className="w-4" />
                <p className="text-xs">{t("spline.rotate-mobile")}!</p>
                <RiArrowGoBackFill className="w-4" />
              </span>
            </div>
            <div className="hidden lg:inline">
              <Spline scene="https://prod.spline.design/OoBR4Z3NWKxkJac9/scene.splinecode" />
              <span className="flex gap-2 p-1  items-center justify-center rounded-lg w-[150px]  h-[45px] bg-gray-900 text-white absolute z-40 right-4 bottom-[18px]">
                <RiArrowGoForwardFill className="w-4" />
                <p>{t("spline.rotate")}</p>
                <RiArrowGoBackFill className="w-4" />
              </span>
            </div>
          </Suspense>
        </div>

        <div className="w-fit mx-auto bottom-1  animate-[bounce_2s_infinite] mt-auto absolute z-50">
          <RiArrowDownDoubleFill className="w-20 h-20" />
        </div>
      </section>
    </div>
  );
}
