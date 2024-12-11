"use client";

import { useEffect, useState } from "react";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Imgs = {
  name: string;
  src: string;
};

export const ProfileCarroucel = ({
  imgs,
  autoplay = false,
}: {
  imgs: Imgs[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [rotationValues] = useState(() =>
    imgs.map(() => Math.floor(Math.random() * 21) - 10),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <div className="mx-auto antialiased font-sans px-4 md:px-8 lg:px-12 py-[4rem]">
        <div className="flex flex-col gap-10 w-fit">
          <picture>
            <div className="relative h-[20rem] w-[20rem]">
              {imgs.map((img) => (
                <div key={img.src} className="absolute inset-0">
                  <Image
                    src={img.src}
                    alt={img.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center"
                  />
                </div>
              ))}
            </div>
          </picture>
          <section
            id="buttons"
            className="flex justify-start gap-4 w-fit mx-auto "
          >
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
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto antialiased font-sans px-4 md:px-8 lg:px-12 py-[4rem]">
      <div className="flex flex-col gap-10 w-fit">
        <picture className="">
          <div className="relative h-[20rem] w-[20rem]">
            <AnimatePresence>
              {imgs.map((img, index) => (
                <motion.div
                  key={img.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: rotationValues[index],
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : rotationValues[index],
                    zIndex: isActive(index) ? 999 : imgs.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: rotationValues[index],
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <Image
                    src={img.src}
                    alt={img.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </picture>

        <section
          id="buttons"
          className="flex justify-start gap-4 w-fit mx-auto "
        >
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
      </div>
    </div>
  );
};
