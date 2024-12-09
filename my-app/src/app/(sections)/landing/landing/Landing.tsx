"use client";

import Spline from "@splinetool/react-spline";
import {
  RiArrowGoForwardFill,
  RiArrowGoBackFill,
  RiArrowDownDoubleFill,
} from "@remixicon/react";

export default function Landing() {
  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center ">
      <div className="w-[80%] mt-16 grid grid-cols-2 justify-center items-center flex-shrink-0 ">
        <span className="w-fit">
          <h1 className="text-8xl font-sans">
            TOMAS <br /> PEREZ
          </h1>
          <h2 className="text-[2rem] px-2 text-[#cda3ff]">
            FULLSTACK DEVELOPER
          </h2>
        </span>
        <div className="  w-fit relative">
          <Spline scene="https://prod.spline.design/OoBR4Z3NWKxkJac9/scene.splinecode" />
          <span className="flex gap-2 p-1  items-center justify-center rounded-lg w-[150px] h-[37px] bg-gray-900 text-white absolute z-50 right-5 bottom-[20px]">
            <RiArrowGoForwardFill className="w-4" />
            <p>Rotame!</p>
            <RiArrowGoBackFill className="w-4" />
          </span>
        </div>
      </div>

      <div className="w-fit mx-auto mb-1 animate-[bounce_2s_infinite] mt-auto">
        <RiArrowDownDoubleFill className="w-20 h-20" />
      </div>
    </section>
  );
}
