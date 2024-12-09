"use client";

import dynamic from "next/dynamic";
const Scene = dynamic(() => import("../../ui/Scene"), { ssr: false });

export default function Landing() {
  return (
    <section
      id="about-me"
      className="min-h-screen w-full border-2 border-yellow-400 flex flex-col justify-between"
    >
      {/* <article className="text-center">
        <span className="border-2">
          <h1 className="text-8xl">
            Tomas <br /> Perez
          </h1>
          <h2 className="text-2xl text-[#cda3ff]">FULL STACK DEVELOPER</h2>
        </span>
      </article> */}

      <div className="flex gap-10">
        <div className="w-fit border-2 border-red-500">
          <Scene />
        </div>
        <div className="border-2 border-red-500 w-[420px] h-[420px]"></div>
      </div>

      {/* <div className="w-fit mx-auto mb-8 animate-bounce ">
        <p className="text-5xl ">👇</p>
      </div> */}
    </section>
  );
}
