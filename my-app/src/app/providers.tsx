"use client";

import { HeroUIProvider } from "@heroui/react";
import React, { FC, ReactNode } from "react";

export const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  return <HeroUIProvider>{children}</HeroUIProvider>;
};
