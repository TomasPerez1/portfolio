// import Spline from "@splinetool/react-spline/next";
import React, { Suspense } from "react";
const Spline = React.lazy(() => import("@splinetool/react-spline"));
import {
  RiArrowGoForwardFill,
  RiArrowGoBackFill,
  RiArrowDownDoubleFill,
} from "@remixicon/react";
import Loading from "../../../ui/loading";

export default function Landing() {
  return (
    <section className="border-2  border-yellow-300 h-screen w-full gap-1 relative flex flex-col items-center justify-center ">
      <div className="border-2 sm:w-[80%] flex items-center flex-shrink-0 ">
        <span className="w-fit text-center  mx-auto ">
          <h1 className="text-[5.5rem] leading-none sm:text-8xl font-sans">
            TOMAS <br /> PEREZ
          </h1>
          <h2 className="text-[1.5rem] text-xl sm:text-[2rem] px-2 text-[#cda3ff]">
            FULLSTACK DEVELOPER
          </h2>
        </span>

        {/* <div className="w-fit relative z-50 ">
          <Spline scene="https://prod.spline.design/OoBR4Z3NWKxkJac9/scene.splinecode" />
          <span className="flex gap-2 p-1  items-center justify-center rounded-lg w-[150px] h-[37px] bg-gray-900 text-white absolute z-50 right-5 bottom-[20px]">
            <RiArrowGoForwardFill className="w-4" />
            <p>Rotame!</p>
            <RiArrowGoBackFill className="w-4" />
          </span>
        </div> */}
      </div>
      <div className="relative z-50  border-2 w-[220px] h-[250px]">
        <Suspense fallback={<Loading />}>
          <Spline scene="https://prod.spline.design/C9mC3iFFASk9TjnB/scene.splinecode" />
          <span className="hidden sm:flex gap-2 p-1  items-center justify-center rounded-lg w-[150px]  h-[37px] bg-gray-900 text-white absolute z-50 right-5 bottom-[20px]">
            <RiArrowGoForwardFill className="w-4" />
            <p>Rotame!</p>
            <RiArrowGoBackFill className="w-4" />
          </span>
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
