"use client";

import { useEffect, useState } from "react";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { motion, AnimatePresence } from "framer-motion";
import ExternalLinks from "./ExternalLinks";
import Image from "next/image";

type Imgs = {
  name: string;
  src: string;
};

const ProfileCarroucel = ({
  imgs,
  autoplay = false,
}: {
  imgs: Imgs[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);
  const [rotationValues] = useState(() =>
    imgs.map(() => Math.floor(Math.random() * 21) - 10),
  );

  const handleNext = () => {
    setActive((prev) => (prev + 1) % imgs.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + imgs.length) % imgs.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  return (
    <div className=" mx-auto antialiased font-sans px-4 md:px-8 py-[2.5rem] lg:p-0 lg:gap-4 w-[85%] ">
      <div className="flex flex-col gap-10 w-[90%]  mx-auto h-[14.5rem] sm:h-[17.5rem] md:h-[19.5rem]">
        <picture className="relative z-30">
          <AnimatePresence>
            {imgs.map((img, index) => (
              <motion.div
                className="absolute z-20 inset-0 origin-bottom h-[13rem] w-[13rem] sm:h-[16rem] sm:w-[16rem] md:h-[18rem] md:w-[18rem]    mx-auto"
                key={img.src}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  z: -100,
                  rotate: rotationValues[index],
                  x: isActive(index) ? 0 : index % 2 === 0 ? -20 : 20,
                  y: isActive(index) ? 0 : 10,
                }}
                animate={{
                  opacity: isActive(index) ? 1 : 0.7,
                  scale: isActive(index) ? 1 : 0.95,
                  z: isActive(index) ? 0 : -100,
                  rotate: isActive(index) ? 0 : rotationValues[index],
                  zIndex: isActive(index) ? 999 : imgs.length + 2 - index,
                  y: isActive(index) ? [0, -80, 0] : 0,
                  x: isActive(index) ? 0 : index % 2 === 0 ? -20 : 20,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  z: 100,
                  rotate: rotationValues[index],
                  x: isActive(index) ? 0 : index % 2 === 0 ? -20 : 20,
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={img.src}
                  alt={img.name}
                  fill={true}
                  draggable={false}
                  className="rounded-3xl object-cover object-center"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </picture>
      </div>
      <section id="buttons" className="flex  gap-4 w-fit mx-auto ">
        <button
          onClick={handlePrev}
          className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center group/button hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <RiArrowLeftLine className="h-7 w-7 text-black dark:text-neutral-400 group-hover/button:text-white" />
        </button>
        <button
          onClick={handleNext}
          className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center group/button hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <RiArrowRightLine className="h-7 w-7 text-black dark:text-neutral-400 group-hover/button:text-white" />
        </button>
      </section>
      <ExternalLinks />
    </div>
  );
};

export default ProfileCarroucel;
