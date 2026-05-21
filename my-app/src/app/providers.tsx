"use client";

import { HeroUIProvider } from "@heroui/react";
import { LazyMotion, domAnimation } from "framer-motion";
import React, { FC, ReactNode } from "react";
import ThemeProvider from "./theme/ThemeProvider";

export const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeroUIProvider>
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </HeroUIProvider>
    </ThemeProvider>
  );
};
