"use client";
import React, { useEffect, useState, createContext } from "react";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

interface CarouselProps {
  imgs: string[];
  initialScroll?: number;
}

export const CarouselContext = createContext<{
  currentIndex: number;
}>({
  currentIndex: 0,
});

export const Carousel = ({ imgs, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(
        Math.ceil(scrollLeft) < Math.floor(scrollWidth - clientWidth),
      );
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <CarouselContext.Provider value={{ currentIndex }}>
      <div className="w-full relative  p-0">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto py-0 mt-16  scroll-smooth [scrollbar-width:none] "
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "flex flex-row justify-center items-center gap-4 px-4",
              "mx-auto",
            )}
          >
            {imgs.map((img, index) => (
              <motion.div
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                    once: true,
                  },
                }}
                key={"card" + index}
                className="rounded-3xl max-w-[90%]"
              >
                <div className=" w-[430px]">
                  <Image
                    alt="Proyect img"
                    className="rounded-xl mx-auto "
                    src={img}
                    width={430}
                    height={430}
                    // fill={true}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* //? Arrow handler  */}
        <div
          id="arrows"
          className="flex justify-between w-full px-1 absolute top-1/2 -translate-y-1/2"
        >
          <button
            className="relative z-40 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <RiArrowLeftLine className="h-5 w-5 text-gray-600" />
          </button>
          <button
            className="relative z-40 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <RiArrowRightLine className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};
