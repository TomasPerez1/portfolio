"use client";

import { HeroUIProvider } from "@heroui/react";
import React, { FC, ReactNode } from "react";
import ThemeProvider from "./theme/ThemeProvider";

export const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeroUIProvider>{children}</HeroUIProvider>
    </ThemeProvider>
  );
};
