"use client";

import Spline from "@splinetool/react-spline";
import { RiArrowGoForwardFill, RiArrowGoBackFill } from "@remixicon/react";

export default function Landing() {
  return (
    <section
      id="about-me"
      className="min-h-screen w-full border-2 border-yellow-400 flex flex-col justify-between"
    >
      <div className="border-2 border-green-500  w-fit mx-auto relative">
        <Spline scene="https://prod.spline.design/OoBR4Z3NWKxkJac9/scene.splinecode" />
        <span className="flex gap-2 p-1  items-center justify-center rounded-lg w-[150px] h-[37px] bg-gray-900 text-white absolute z-50 right-5 bottom-[20px]">
          <RiArrowGoForwardFill className="w-4" />
          <p>Rotame!</p>
          <RiArrowGoBackFill className="w-4" />
        </span>
      </div>

      {/* <div className="w-fit mx-auto mb-8 animate-bounce ">
        <p className="text-5xl ">👇</p>
      </div> */}
    </section>
  );
}
