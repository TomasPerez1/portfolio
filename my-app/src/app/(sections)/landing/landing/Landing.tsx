// import Spline from "@splinetool/react-spline/next";
import React, { Suspense, useState } from "react";
const Spline = React.lazy(() => import("@splinetool/react-spline"));
import {
  RiArrowGoForwardFill,
  RiArrowGoBackFill,
  RiArrowDownDoubleFill,
} from "@remixicon/react";
import Loading from "../../../ui/loading";

export default function Landing() {
  const [showBanner, setShowBanner] = useState(false);

  function manageBanner() {
    setShowBanner(true);
  }

  return (
    <section className="border-2  border-yellow-300 h-screen w-full  relative flex flex-col gap-2 items-center justify-center lg:flex-row lg:gap-5  xl:gap-10">
      <div className="border-2 flex items-center flex-shrink-0 ">
        <span className="w-fit text-center  mx-auto ">
          <h1 className="text-[5.5rem] sm:text-[6rem] lg:text-[7.7rem] xl:text-[8.5rem]  leading-none font-sans">
            TOMAS <br /> PEREZ
          </h1>
          <h2 className="text-[1.5rem] sm:text-2xl  px-2 text-[#cda3ff]">
            FULLSTACK DEVELOPER
          </h2>
        </span>
      </div>
      <div className="relative z-4  0  border-2 w-[220px] h-[250px] lg:w-[320px] lg:h-[350px]">
        <Suspense fallback={<Loading />}>
          <div className="lg:hidden">
            <Spline
              onLoad={manageBanner}
              scene="https://prod.spline.design/C9mC3iFFASk9TjnB/scene.splinecode"
            />
            <span
              className={`${showBanner ? "flex " : "hidden"} gap-2 p-1  items-center justify-center rounded-lg w-[140px]  h-[40px] bg-gray-900 text-center text-white absolute z-40 right-4 bottom-[15px] `}
            >
              <RiArrowGoForwardFill className="w-4" />
              <p className="text-xs">Rotame con 2 dedos!</p>
              <RiArrowGoBackFill className="w-4" />
            </span>
          </div>
          <div className="hidden lg:inline">
            <Spline scene="https://prod.spline.design/OoBR4Z3NWKxkJac9/scene.splinecode" />
            <span className="flex gap-2 p-1  items-center justify-center rounded-lg w-[150px]  h-[40px] bg-gray-900 text-white absolute z-40 right-4 bottom-[15px]">
              <RiArrowGoForwardFill className="w-4" />
              <p>Rotame!</p>
              <RiArrowGoBackFill className="w-4" />
            </span>
          </div>
        </Suspense>
      </div>

      <div className="w-fit mx-auto bottom-1  animate-[bounce_2s_infinite] mt-auto absolute z-50">
        <RiArrowDownDoubleFill className="w-20 h-20" />
      </div>
    </section>
  );
}
