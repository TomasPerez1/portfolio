"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import React, { FC, ReactNode } from "react";
import ThemeProvider from "./theme/ThemeProvider";

export const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </ThemeProvider>
  );
};
