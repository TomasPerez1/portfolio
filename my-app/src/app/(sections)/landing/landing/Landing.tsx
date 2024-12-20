// import Spline from "@splinetool/react-spline/next";
import React, { Suspense, useEffect, useRef, useState } from "react";
const Spline = React.lazy(() => import("@splinetool/react-spline"));
import type { SplineEventName } from "@splinetool/react-spline";
import {
  RiArrowGoForwardFill,
  RiArrowGoBackFill,
  RiArrowDownDoubleFill,
} from "@remixicon/react";
import Loading from "../../../ui/loading";

export default function Landing() {
  const spline = useRef(null);
  const [showBanner, setShowBanner] = useState(false);

  function manageBanner() {
    setShowBanner(true);
  }

  return (
    <section className="border-2  border-yellow-300 h-screen w-full gap-1 relative flex flex-col items-center justify-center lg:flex-row">
      <div className="border-2 flex items-center flex-shrink-0 ">
        <span className="w-fit text-center  mx-auto ">
          <h1 className="text-[5.5rem] lg:text-[7.7rem] leading-none font-sans">
            TOMAS <br /> PEREZ
          </h1>
          <h2 className="text-[1.5rem] text-xl   px-2 text-[#cda3ff]">
            FULLSTACK DEVELOPER
          </h2>
        </span>
      </div>
      <div className="relative z-50  border-2 w-[220px] h-[250px] lg:w-[320px] lg:h-[350px]">
        <Suspense fallback={<Loading />}>
          <div className="lg:hidden">
            <Spline
              onLoad={manageBanner}
              scene="https://prod.spline.design/C9mC3iFFASk9TjnB/scene.splinecode"
            />
            <span
              className={`${showBanner ? "flex " : "hidden"} gap-2 p-1  items-center justify-center rounded-lg w-[140px]  h-[40px] bg-gray-900 text-center text-white absolute z-50 right-4 bottom-[15px] `}
            >
              <RiArrowGoForwardFill className="w-4" />
              <p className="text-xs">Rotame con 2 dedos!</p>
              <RiArrowGoBackFill className="w-4" />
            </span>
          </div>
          <div className="hidden lg:inline">
            <Spline scene="https://prod.spline.design/OoBR4Z3NWKxkJac9/scene.splinecode" />
            <span className="flex gap-2 p-1  items-center justify-center rounded-lg w-[150px]  h-[40px] bg-gray-900 text-white absolute z-50 right-4 bottom-[15px]">
              <RiArrowGoForwardFill className="w-4" />
              <p>Rotame!</p>
              <RiArrowGoBackFill className="w-4" />
            </span>
          </div>
        </Suspense>
      </div>
      {/* <div className="hidden md:inline w-fit relative z-50  ">
        <Spline
          className="hidden"
          scene="https://prod.spline.design/OoBR4Z3NWKxkJac9/scene.splinecode"
        />
        <span className="flex gap-2 p-1  items-center justify-center rounded-lg w-[150px]  h-[37px] bg-gray-900 text-white absolute z-50 right-5 bottom-[20px]">
          <RiArrowGoForwardFill className="w-4" />
          <p>Rotame!</p>
          <RiArrowGoBackFill className="w-4" />
        </span>
      </div> */}
      <div className="w-fit mx-auto bottom-1  animate-[bounce_2s_infinite] mt-auto absolute">
        <RiArrowDownDoubleFill className="w-20 h-20" />
      </div>
    </section>
  );
}
// export default function Landing() {
//   return (
//     <section className=" min-h-screen w-full relative flex flex-col items-center justify-center ">
//       <div className="w-[80%] flex items-center flex-shrink-0 ">
//         <span className="w-fit  mx-auto ">
//           <h1 className="text-8xl font-sans">
//             TOMAS <br /> PEREZ
//           </h1>
//           <h2 className="text-[2rem] px-2 text-[#cda3ff]">
//             FULLSTACK DEVELOPER
//           </h2>
//         </span>

//         <div className="w-fit relative z-50 ">
//           <Spline scene="https://prod.spline.design/OoBR4Z3NWKxkJac9/scene.splinecode" />
//           <span className="flex gap-2 p-1  items-center justify-center rounded-lg w-[150px] h-[37px] bg-gray-900 text-white absolute z-50 right-5 bottom-[20px]">
//             <RiArrowGoForwardFill className="w-4" />
//             <p>Rotame!</p>
//             <RiArrowGoBackFill className="w-4" />
//           </span>
//         </div>
//       </div>

//       <div className="w-fit mx-auto bottom-1  animate-[bounce_2s_infinite] mt-auto absolute">
//         <RiArrowDownDoubleFill className="w-20 h-20" />
//       </div>
//     </section>
//   );
// }
